import Image from "next/image";
import { OpenSlot } from "@/components/ui/OpenSlot";
import { person } from "@/content/person";
import type { Locale } from "@/i18n/config";
import { aboutCopy } from "./copy";
import styles from "./about.module.css";

/**
 * The arched portrait frame. While person.portrait is null it holds an honest
 * open slot; once a portrait is set it is masked by the same arch.
 */
export function Portrait({ lang }: { lang: Locale }) {
  const portrait = person.portrait;
  return (
    <figure className="mx-auto w-full max-w-[22rem] lg:mx-0">
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
        {portrait ? (
          <div className={styles.archMask}>
            <Image
              src={portrait.src}
              alt={portrait.alt[lang]}
              fill
              sizes="(min-width: 1024px) 22rem, 80vw"
              className="object-cover grayscale"
            />
          </div>
        ) : (
          <OpenSlot lang={lang} what={aboutCopy.portrait.what[lang]} className="h-full w-full border-b-0" />
        )}
      </div>
      <figcaption className="label mt-4 text-ink-mute">{aboutCopy.portrait.caption[lang]}</figcaption>
    </figure>
  );
}
