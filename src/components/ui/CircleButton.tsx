import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";
import styles from "./CircleButton.module.css";

interface Common {
  icon: IconName;
  /** Accessible name; required because the button shows only an icon. */
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  pressed?: boolean;
}

type AsButton = Common & Omit<ComponentPropsWithoutRef<"button">, keyof Common | "children"> & { href?: undefined };
type AsLink = Common & Omit<ComponentPropsWithoutRef<"a">, keyof Common | "children"> & { href: string };

/** Round control with a single drawn icon, as on the quality board. */
export function CircleButton(props: AsButton | AsLink) {
  const { icon, label, size = "md", className, pressed, ...rest } = props;
  const classes = cn(styles.circle, styles[size], className);
  const content = <Icon name={icon} size={size === "sm" ? 16 : size === "lg" ? 24 : 20} />;
  if (typeof rest.href === "string") {
    const { href, ...anchor } = rest as AsLink;
    const external = /^https?:\/\//.test(href);
    if (external) {
      return (
        <a href={href} aria-label={label} title={label} className={classes} target="_blank" rel="noopener noreferrer" {...anchor}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} aria-label={label} title={label} className={classes} {...anchor}>
        {content}
      </Link>
    );
  }
  const button = rest as Omit<AsButton, keyof Common>;
  return (
    <button
      type={button.type ?? "button"}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={classes}
     
      {...button}
    >
      {content}
    </button>
  );
}
