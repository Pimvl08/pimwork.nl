import Image from "next/image";
import { CreaseMark } from "@/components/ui/CreaseMark";
import { person } from "@/content/person";
import type { Locale } from "@/i18n/config";
import styles from "./about.module.css";

/**
 * The arched portrait frame. Once person.portrait is set the photo is masked
 * by the arch; until then the frame holds the crease mark as a monogram.
 */
export function Portrait({ lang }: { lang: Locale }) {
  const portrait = person.portrait;
  return (
    <figure className="mx-auto w-full max-w-[20rem] lg:mx-0 lg:max-w-[22rem]" aria-hidden={portrait ? undefined : true}>
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
          {portrait ? (
            <Image
              src={portrait.src}
              alt={portrait.alt[lang]}
              fill
              sizes="(min-width: 1024px) 22rem, 80vw"
              className="object-cover grayscale"
              priority
            />
          ) : (
            <div className={styles.monogram}>
              <CreaseMark size={160} className="h-auto w-[58%]" />
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}
