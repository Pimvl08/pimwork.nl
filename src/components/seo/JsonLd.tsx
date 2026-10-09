import { serializeJsonLd } from "@/lib/structured-data";

/**
 * Structured data for search engines. A JSON data block is never executed,
 * so it needs no CSP nonce.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
