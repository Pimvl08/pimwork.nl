import { checkFormAge, parseContactRequest } from "@/lib/contact-schema";
import { mailConfig, missingMailSettings, sendContactMail } from "@/lib/mail";
import { createRateLimiter } from "@/lib/rate-limit";
import { RequestError, clientKey, isSameOrigin, json, readJsonBody } from "@/lib/request-guard";

export const runtime = "nodejs";

/**
 * Contact form endpoint: validates, filters bots and sends one email through
 * Resend. Nothing is stored. Logs only status codes and missing setting names,
 * never content or addresses.
 */

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });
const MAX_BODY_BYTES = 8192;

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: "forbidden" }, 403);

  const gate = limiter.check(clientKey(request));
  if (!gate.ok) {
    const seconds = Math.max(1, Math.ceil(gate.retryAfterMs / 1000));
    return json({ error: "rate_limited", retryAfter: seconds }, 429, { "retry-after": String(seconds) });
  }

  let body: unknown;
  try {
    body = await readJsonBody(request, MAX_BODY_BYTES);
  } catch (error) {
    if (error instanceof RequestError) return json({ error: error.code }, error.status);
    return json({ error: "invalid_json" }, 400);
  }

  const parsed = parseContactRequest(body);
  if (!parsed.ok) {
    // Only short codes per field go back, never the submitted values.
    return json({ error: "invalid", fields: parsed.fields }, 400);
  }

  // Honeypot filled, or sent faster than a person can type: answer like a
  // success so a bot learns nothing, and send nothing.
  if (parsed.data.website.trim().length > 0) return json({ ok: true }, 200);
  const age = checkFormAge(parsed.data.renderedAt);
  if (age === "too_fast") return json({ ok: true }, 200);
  if (age === "expired") return json({ error: "expired" }, 400);

  const config = mailConfig();
  if (!config) {
    console.error(
      `[api/contact] Mail is not configured: missing ${missingMailSettings().join(", ")}. ` +
        "Set these environment variables in the Vercel project and redeploy.",
    );
    return json({ error: "server_error" }, 500);
  }

  const { name, email, message } = parsed.data;
  const result = await sendContactMail({ name, email, message }, config);
  if (result.ok) return json({ ok: true }, 200);

  console.error(`[api/contact] Resend did not accept the message (status ${result.status}, ${result.reason}).`);
  return json({ error: "server_error" }, 500);
}

const notAllowed = () => json({ error: "method_not_allowed" }, 405, { allow: "POST" });
export const GET = notAllowed;
export const PUT = notAllowed;
export const PATCH = notAllowed;
export const DELETE = notAllowed;
