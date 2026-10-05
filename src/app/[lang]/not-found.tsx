import { ArchButton } from "@/components/ui/ArchButton";

/**
 * A page that does not exist. The locale layout has no params here, so the
 * text is in both languages and the way back goes to the root, which sends
 * the visitor to their own language.
 */
export default function NotFound() {
  return (
    <main id="main" className="plate grid min-h-[80svh] content-center justify-items-start gap-6">
      <h1 className="text-[length:var(--step-4)] italic leading-tight text-ink">Deze pagina bestaat niet.</h1>
      <p className="measure text-[length:var(--step-1)] text-ink-soft">
        Misschien is de link verouderd. <span lang="en">This page does not exist, the link may be out of date.</span>
      </p>
      <ArchButton variant="primary" icon="arrowLeft" href="/">
        Naar de homepagina · Home
      </ArchButton>
    </main>
  );
}
