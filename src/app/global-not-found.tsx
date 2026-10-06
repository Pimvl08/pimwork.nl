import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 | PimWork",
  description: "Deze pagina bestaat niet. This page does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="nl-NL" data-theme="dark">
      <body>
        <main className="plate grid min-h-svh content-center gap-6" style={{ fontFamily: "Georgia, serif" }}>
          <h1 className="text-[length:var(--step-4)] text-ink">Deze pagina bestaat niet.</h1>
          <p className="measure text-ink-soft">
            Misschien is de link verouderd. <span lang="en">This page does not exist, the link may be out of date.</span>
          </p>
          <p>
            <Link href="/" className="underline decoration-[var(--rule-strong)] underline-offset-4 hover:decoration-[var(--ink)]">
              Naar de homepagina · Home
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
