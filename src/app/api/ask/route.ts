import Anthropic from "@anthropic-ai/sdk";
import { systemPrompt } from "@/lib/ai/prompt";
import { INTERRUPTED_NOTE, REFUSAL_NOTE, parseAsk } from "@/lib/ai/schema";
import { createRateLimiter } from "@/lib/rate-limit";
import { RequestError, clientKey, isSameOrigin, json, readJsonBody } from "@/lib/request-guard";

export const runtime = "nodejs";

const limiter = createRateLimiter({ limit: 8, windowMs: 10 * 60_000 });
const TIMEOUT_MS = 25_000;

/** Maps an SDK error to a response, most specific first. Never logs the question. */
function errorResponse(error: unknown): Response {
  if (error instanceof Anthropic.RateLimitError) return json({ error: "busy" }, 503);
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    console.error(`[api/ask] Anthropic rejected the server credentials (status ${error.status}).`);
    return json({ error: "not_configured" }, 503);
  }
  if (error instanceof Anthropic.APIConnectionError) return json({ error: "upstream" }, 502);
  if (error instanceof Anthropic.APIError) {
    console.error(`[api/ask] Anthropic API error (status ${error.status ?? "none"}).`);
    return json({ error: "upstream" }, 502);
  }
  console.error("[api/ask] Unexpected error.", error instanceof Error ? error.name : typeof error);
  return json({ error: "internal" }, 500);
}

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: "forbidden" }, 403);

  const limit = limiter.check(clientKey(request));
  if (!limit.ok) {
    const seconds = Math.max(1, Math.ceil(limit.retryAfterMs / 1000));
    return json({ error: "rate_limited", retryAfter: seconds }, 429, { "retry-after": String(seconds) });
  }

  let body: unknown;
  try {
    body = await readJsonBody(request, 4096);
  } catch (error) {
    if (error instanceof RequestError) return json({ error: error.code }, error.status);
    return json({ error: "invalid_body" }, 400);
  }

  const parsed = parseAsk(body);
  if (!parsed.ok) return json({ error: "invalid", fields: parsed.fields }, 400);
  const { question, lang } = parsed.data;

  if (!process.env.ANTHROPIC_API_KEY) return json({ error: "not_configured" }, 503);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onClientGone = () => controller.abort();
  request.signal.addEventListener("abort", onClientGone, { once: true });
  const cleanup = () => {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", onClientGone);
  };

  const client = new Anthropic();
  const stream = client.beta.messages.stream(
    {
      model: "claude-opus-5-5",
      max_tokens: 2048,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: systemPrompt(), cache_control: { type: "ephemeral" } }],
      // The language travels with the question; the system prompt stays identical for every request.
      messages: [{ role: "user", content: `Language: ${lang}\nQuestion: ${question}` }],
    },
    { signal: controller.signal },
  );

  // Wait for the first event before answering, so HTTP errors (auth, rate
  // limit) still become a proper status code instead of a broken stream.
  const iterator = stream[Symbol.asyncIterator]();
  let first: IteratorResult<Anthropic.Beta.Messages.BetaRawMessageStreamEvent>;
  try {
    first = await iterator.next();
  } catch (error) {
    cleanup();
    return errorResponse(error);
  }

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(out) {
      const emit = (event: Anthropic.Beta.Messages.BetaRawMessageStreamEvent) => {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") out.enqueue(encoder.encode(event.delta.text));
      };
      try {
        if (!first.done) emit(first.value);
        for (;;) {
          const next = await iterator.next();
          if (next.done) break;
          emit(next.value);
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") out.enqueue(encoder.encode(`\n\n${REFUSAL_NOTE[lang]}`));
      } catch (error) {
        if (!(error instanceof Anthropic.APIUserAbortError)) {
          console.error("[api/ask] Stream interrupted.", error instanceof Anthropic.APIError ? `status ${error.status ?? "none"}` : "");
        }
        try {
          out.enqueue(encoder.encode(`\n\n${INTERRUPTED_NOTE[lang]}`));
        } catch {
          /* client already gone */
        }
      } finally {
        cleanup();
        try {
          out.close();
        } catch {
          /* already closed */
        }
      }
    },
    cancel() {
      controller.abort();
      cleanup();
    },
  });

  return new Response(body$, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "x-ask-mode": "live",
    },
  });
}

const notAllowed = () => json({ error: "method_not_allowed" }, 405, { allow: "POST" });
export const GET = notAllowed;
export const PUT = notAllowed;
export const PATCH = notAllowed;
export const DELETE = notAllowed;
