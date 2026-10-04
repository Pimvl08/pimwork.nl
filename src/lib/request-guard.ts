/**
 * Small, framework-free guards for API route handlers.
 */

export class RequestError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

/** Best-effort client address for rate limiting. Never used for anything else. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const candidate = (forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip")) ?? "";
  const trimmed = candidate.trim();
  return /^[0-9a-fA-F:.]{2,45}$/.test(trimmed) ? trimmed : "anonymous";
}

/**
 * Accepts only requests whose Origin matches the host they were sent to.
 * Browsers always send Origin on POST, so a missing Origin is rejected too.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  return originHost === host;
}

/** Reads a JSON body with a hard size limit and a strict content type. */
export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) throw new RequestError(415, "unsupported_media_type");
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) throw new RequestError(413, "payload_too_large");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new RequestError(413, "payload_too_large");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new RequestError(400, "invalid_json");
  }
}

/** JSON response that is never cached and never sniffed. */
export function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}
