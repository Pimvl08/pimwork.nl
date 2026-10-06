import { person } from "@/content/person";

/**
 * The brand name with a manual kern: Bodoni Moda has no pair for "Wo", which
 * leaves a visible gap in "PimWork". The W is pulled towards the o; the text
 * stays one word for search and assistive tech.
 */
export function BrandName() {
  const at = person.brand.indexOf("W");
  if (at < 0) return <>{person.brand}</>;
  return (
    <>
      {person.brand.slice(0, at)}
      <span style={{ marginRight: "-0.11em" }}>W</span>
      {person.brand.slice(at + 1)}
    </>
  );
}
