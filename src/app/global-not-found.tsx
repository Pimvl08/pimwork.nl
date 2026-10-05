import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 | Pim",
  description: "Deze pagina bestaat niet. This page does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="nl-NL" data-theme="dark">
      <body>
        <main className="plate grid min-h-svh content-center gap-6" style={{ fontFamily: "Georgia, serif" }}>
          <h1 className="text-[length:var(--step-4)] italic">404</h1>
          <p className="measure">Deze plaat is uit het boek gescheurd. This plate was torn out of the book.</p>
          <p>
            <Link href="/">Naar de omslag · To the cover</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
