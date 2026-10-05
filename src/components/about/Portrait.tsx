import Image from "next/image";
import type { person } from "@/content/person";
import type { Locale } from "@/i18n/config";
import styles from "./about.module.css";

type PortraitAsset = NonNullable<(typeof person)["portrait"]>;

/** The arched portrait frame: the photo masked by the arch. Rendered only when a portrait exists. */
export function Portrait({ portrait, lang }: { portrait: PortraitAsset; lang: Locale }) {
  return (
    <figure className="mx-auto w-full max-w-[20rem] lg:mx-0 lg:max-w-[22rem]">
      <div className={styles.arch}>
        <svg className={styles.ring} viewBox="0 0 200 100" aria-hidden="true" focusable="false">
          <path
            d="M 0.5 100 A 99.5 99.5 0 0 1 199.5 100"
            fill="none"
            stroke="currentColor"
            strokeWidth={0.55}
            pathLength={1}
            className="arc-draw"
          />
        </svg>
        <div className={styles.archMask}>
          <Image
            src={portrait.src}
            alt={portrait.alt[lang]}
            fill
            sizes="(min-width: 1024px) 22rem, 80vw"
            className="object-cover grayscale"
            priority
          />
        </div>
      </div>
    </figure>
  );
}
