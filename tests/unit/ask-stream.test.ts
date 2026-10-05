import { afterEach, describe, expect, it, vi } from "vitest";

/* The SDK is replaced by a tiny fake, so the streaming path and the error
   chain of /api/ask can be checked without a network or a key. */
const fake = vi.hoisted(() => {
  class APIError extends Error {
    status: number | undefined;
    constructor(status?: number) {
      super("api error");
      this.status = status;
    }
  }
  class APIConnectionError extends APIError {}
  class APIUserAbortError extends APIError {}
  class RateLimitError extends APIError {}
  class AuthenticationError extends APIError {}
  class PermissionDeniedError extends APIError {}

  const state: {
    events: unknown[];
    stopReason: string;
    failWith: Error | null;
    calls: { params: Record<string, unknown>; options: Record<string, unknown> }[];
  } = { events: [], stopReason: "end_turn", failWith: null, calls: [] };

  class Anthropic {
    static APIError = APIError;
    static APIConnectionError = APIConnectionError;
    static APIUserAbortError = APIUserAbortError;
    static RateLimitError = RateLimitError;
    static AuthenticationError = AuthenticationError;
    static PermissionDeniedError = PermissionDeniedError;
    beta = {
      messages: {
        stream: (params: Record<string, unknown>, options: Record<string, unknown>) => {
          state.calls.push({ params, options });
          return {
            async *[Symbol.asyncIterator]() {
              if (state.failWith) throw state.failWith;
              for (const event of state.events) yield event;
            },
            finalMessage: async () => ({ stop_reason: state.stopReason }),
          };
        },
      },
    };
  }
  return { Anthropic, RateLimitError, AuthenticationError, APIConnectionError, state };
});

vi.mock("@anthropic-ai/sdk", () => ({ default: fake.Anthropic }));

const delta = (text: string) => ({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text } });

let ip = 20;
const request = (body: unknown) =>
  new Request("http://localhost:3100/api/ask", {
    method: "POST",
    headers: { origin: "http://localhost:3100", host: "localhost:3100", "content-type": "application/json", "x-forwarded-for": `10.0.1.${ip++}` },
    body: JSON.stringify(body),
  });

describe("POST /api/ask with a key", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    fake.state.events = [];
    fake.state.stopReason = "end_turn";
    fake.state.failWith = null;
    fake.state.calls = [];
  });

  it("streams the text deltas as plain text, with the agreed request shape", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    fake.state.events = [{ type: "message_start" }, delta("TeamSync is "), { type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "hidden" } }, delta("een desktopapp.")];
    const { POST } = await import("@/app/api/ask/route");
    const res = await POST(request({ question: "  Wat is TeamSync?  ", lang: "nl" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.text()).toBe("TeamSync is een desktopapp.");

    const { params, options } = fake.state.calls[0];
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.max_tokens).toBe(2048);
    expect(params.output_config).toEqual({ effort: "low" });
    expect(params.betas).toEqual(["server-side-fallback-2026-07-01"]);
    expect(params.fallbacks).toBe("default");
    expect(params).not.toHaveProperty("thinking");
    expect(options.signal).toBeInstanceOf(AbortSignal);
    const system = params.system as { type: string; cache_control: unknown }[];
    expect(system[0].cache_control).toEqual({ type: "ephemeral" });
    const messages = params.messages as { role: string; content: string }[];
    expect(messages[0].content).toContain("Wat is TeamSync?");
    expect(messages[0].content).not.toContain("  Wat");
  });

  it("appends a polite note when the model refuses", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    fake.state.events = [delta("Liever niet.")];
    fake.state.stopReason = "refusal";
    const { POST } = await import("@/app/api/ask/route");
    const text = await (await POST(request({ question: "Iets vreemds?", lang: "nl" }))).text();
    expect(text.startsWith("Liever niet.")).toBe(true);
    expect(text.split("\n").filter(Boolean).length).toBe(2);
  });

  it("maps SDK errors, most specific first", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const { POST } = await import("@/app/api/ask/route");
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    fake.state.failWith = new fake.RateLimitError(429);
    let res = await POST(request({ question: "Wat is TeamSync?", lang: "nl" }));
    expect([res.status, await res.json()]).toEqual([503, { error: "busy" }]);

    fake.state.failWith = new fake.AuthenticationError(401);
    res = await POST(request({ question: "Wat is TeamSync?", lang: "nl" }));
    expect([res.status, await res.json()]).toEqual([503, { error: "not_configured" }]);

    fake.state.failWith = new fake.APIConnectionError();
    res = await POST(request({ question: "Wat is TeamSync?", lang: "en" }));
    expect([res.status, await res.json()]).toEqual([502, { error: "upstream" }]);

    // Nothing logged may contain the question or the key.
    const logged = spy.mock.calls.flat().map(String).join(" ");
    expect(logged).not.toContain("TeamSync");
    expect(logged).not.toContain("test-key");
  });
});
