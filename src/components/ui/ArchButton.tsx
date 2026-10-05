import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";
import styles from "./ArchButton.module.css";

type Variant = "primary" | "secondary";

interface BaseProps {
  variant?: Variant;
  icon?: IconName;
  size?: "md" | "lg";
  children: ReactNode;
  className?: string;
}

type ButtonProps = BaseProps & Omit<ComponentPropsWithoutRef<"button">, keyof BaseProps> & { href?: undefined };
type LinkProps = BaseProps & Omit<ComponentPropsWithoutRef<"a">, keyof BaseProps> & { href: string };

/**
 * The world's button: a sheet whose top edge is one compass arc.
 * Primary is filled with the crease ink; secondary is drawn as an outline.
 * Hover lifts a second arc above the first, like a crease being pressed.
 */
export function ArchButton(props: ButtonProps | LinkProps) {
  const { variant = "primary", icon, size = "md", children, className, ...rest } = props;
  const classes = cn(styles.arch, styles[variant], styles[size], className);
  const inner = (
    <>
      <svg className={styles.shape} viewBox="0 0 200 56" preserveAspectRatio="none" aria-hidden="true">
        <path className={styles.lift} d="M8 9 Q100 -9 192 9" vectorEffect="non-scaling-stroke" />
        <path className={styles.body} d="M0 56 V18 Q100 -6 200 18 V56 Z" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className={styles.label}>{children}</span>
      {icon ? <Icon name={icon} size={18} className={styles.icon} /> : null}
    </>
  );

  if (typeof rest.href === "string") {
    const { href, ...anchorRest } = rest as LinkProps;
    const external = /^https?:\/\//.test(href);
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...anchorRest}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {inner}
      </Link>
    );
  }
  const buttonRest = rest as Omit<ButtonProps, keyof BaseProps>;
  return (
    <button type={buttonRest.type ?? "button"} className={classes} {...buttonRest}>
      {inner}
    </button>
  );
}
