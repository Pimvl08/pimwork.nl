import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="plate grid min-h-[80svh] content-center gap-6">
      <h1 className="text-[length:var(--step-4)] italic">Deze plaat ontbreekt.</h1>
      <p className="measure text-ink-soft">This plate is missing from the book.</p>
      <p>
        <Link href="/">Terug naar de omslag · Back to the cover</Link>
      </p>
    </main>
  );
}
