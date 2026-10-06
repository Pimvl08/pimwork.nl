"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArchButton } from "@/components/ui/ArchButton";
import { Icon } from "@/components/ui/Icon";
import { person } from "@/content/person";
import type { Locale } from "@/i18n/config";
import { CONTACT_LIMITS, validateContactFields, type ContactField, type FieldErrorCode, type FieldErrors } from "@/lib/contact-schema";
import { useReducedMotion } from "@/lib/hooks";
import { contactCopy as copy } from "./copy";
import styles from "./contact.module.css";

type Values = Record<ContactField, string>;
type NoticeKind = "not_configured" | "rate_limited" | "network" | "too_fast" | "expired" | "failed";
type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "notice"; notice: NoticeKind; retryAfter?: number };

const FIELDS: readonly ContactField[] = ["name", "email", "message"];
const EMPTY: Values = { name: "", email: "", message: "" };
const CLIENT_TIMEOUT_MS = 15_000;
const KNOWN_CODES: readonly string[] = ["required", "too_short", "too_long", "invalid"];

const fieldId = (field: ContactField) => `contact-${field}`;
const errorId = (field: ContactField) => `contact-${field}-error`;

/** Keeps only known field codes from a server response; never trusts other values. */
function serverFieldErrors(input: unknown): FieldErrors {
  const out: FieldErrors = {};
  if (!input || typeof input !== "object") return out;
  for (const field of FIELDS) {
    const code = (input as Record<string, unknown>)[field];
    if (typeof code === "string" && KNOWN_CODES.includes(code)) out[field] = code as FieldErrorCode;
  }
  return out;
}

/** Maps a server response to the next status, trusting only known codes. */
async function readOutcome(response: Response): Promise<{ status: Status; fields?: FieldErrors }> {
  let body: Record<string, unknown> = {};
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  if (response.ok && body.ok === true) return { status: { kind: "success" } };
  const error = typeof body.error === "string" ? body.error : "";
  if (response.status === 429) {
    const header = Number(response.headers.get("retry-after"));
    const fromBody = typeof body.retryAfter === "number" ? body.retryAfter : NaN;
    const seconds = Number.isFinite(header) && header > 0 ? header : Number.isFinite(fromBody) ? fromBody : 600;
    return { status: { kind: "notice", notice: "rate_limited", retryAfter: Math.max(1, Math.ceil(seconds)) } };
  }
  if (error === "not_configured") return { status: { kind: "notice", notice: "not_configured" } };
  if (error === "too_fast") return { status: { kind: "notice", notice: "too_fast" } };
  if (error === "expired") return { status: { kind: "notice", notice: "expired" } };
  if (error === "invalid") {
    const fields = serverFieldErrors(body.fields);
    if (Object.keys(fields).length > 0) return { status: { kind: "idle" }, fields };
  }
  return { status: { kind: "notice", notice: "failed" } };
}

/** The outline behind a field: a shallow compass arc on top, square below. */
function Outline({ tall = false }: { tall?: boolean }) {
  const h = tall ? 240 : 64;
  return (
    <svg className={styles.outline} viewBox={`0 0 400 ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path className={styles.lift} d="M14 3 Q200 -11 386 3" vectorEffect="non-scaling-stroke" />
      <path className={styles.sheet} d={`M0.5 ${h - 0.5} V13 Q200 -1 399.5 13 V${h - 0.5} Z`} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** A notice sheet with an arched top, used for the summary and server outcomes. */
function NoticeSheet({ children, labelledBy, sheetRef, live }: { children: ReactNode; labelledBy: string; sheetRef?: React.Ref<HTMLDivElement>; live?: boolean }) {
  return (
    <div ref={sheetRef} tabIndex={-1} className={styles.notice} aria-labelledby={labelledBy} role={live ? "alert" : "region"}>
      <svg className={styles.outline} viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
        <path className={styles.sheet} d="M0.5 119.5 V12 Q200 -2 399.5 12 V119.5 Z" vectorEffect="non-scaling-stroke" />
      </svg>
      {children}
    </div>
  );
}

export function ContactForm({ lang, renderedAt }: { lang: Locale; renderedAt: number }) {
  const reduced = useReducedMotion();
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [focusTarget, setFocusTarget] = useState<{ to: "summary" | "notice" | "success" | "first"; n: number } | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const clientErrors = validateContactFields(values);
  const visible: FieldErrors = {};
  for (const field of FIELDS) {
    const shown = attempted || (touched[field] && values[field].trim().length > 0);
    const code = serverErrors[field] ?? (shown ? clientErrors[field] : undefined);
    if (code) visible[field] = code;
  }
  const summaryFields = attempted ? FIELDS.filter((f) => visible[f]) : [];
  const submitting = status.kind === "submitting";

  // Focus moves only after the element it targets is on screen.
  useEffect(() => {
    if (!focusTarget) return;
    const target =
      focusTarget.to === "summary"
        ? summaryRef.current
        : focusTarget.to === "notice"
          ? noticeRef.current
          : focusTarget.to === "success"
            ? successRef.current
            : firstFieldRef.current;
    target?.focus({ preventScroll: false });
  }, [focusTarget]);

  const update = (field: ContactField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (serverErrors[field]) setServerErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status.kind === "notice") setStatus({ kind: "idle" });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setAttempted(true);
    setServerErrors({});
    const errors = validateContactFields(values);
    if (Object.keys(errors).length > 0) {
      setStatus({ kind: "idle" });
      setFocusTarget((prev) => ({ to: "summary", n: (prev?.n ?? 0) + 1 }));
      return;
    }

    setStatus({ kind: "submitting" });
    let next: { status: Status; fields?: FieldErrors };
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypotRef.current?.value ?? "", renderedAt }),
        signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
        cache: "no-store",
      });
      next = await readOutcome(response);
    } catch {
      next = { status: { kind: "notice", notice: "network" } };
    }

    setStatus(next.status);
    if (next.fields) {
      setServerErrors(next.fields);
      setFocusTarget((prev) => ({ to: "summary", n: (prev?.n ?? 0) + 1 }));
    } else if (next.status.kind === "notice") {
      setFocusTarget((prev) => ({ to: "notice", n: (prev?.n ?? 0) + 1 }));
    } else if (next.status.kind === "success") {
      setFocusTarget((prev) => ({ to: "success", n: (prev?.n ?? 0) + 1 }));
    }
  };

  const reset = () => {
    setValues(EMPTY);
    setTouched({});
    setAttempted(false);
    setServerErrors({});
    setStatus({ kind: "idle" });
    setFocusTarget((prev) => ({ to: "first", n: (prev?.n ?? 0) + 1 }));
  };

  const fold = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, rotateX: 72, y: -12 },
        animate: { opacity: 1, rotateX: 0, y: 0 },
        exit: { opacity: 0, rotateX: -78, y: -18 },
      };
  const transition = { duration: reduced ? 0.16 : 0.7, ease: [0.16, 1, 0.3, 1] as const };

  const describedBy = (field: ContactField, extra?: string) =>
    [visible[field] ? errorId(field) : null, extra ?? null].filter(Boolean).join(" ") || undefined;

  const count = values.message.length;
  const notice = status.kind === "notice" ? status : null;

  return (
    <div className="[perspective:1400px]">
      <AnimatePresence mode="wait" initial={false}>
        {status.kind === "success" ? (
          <motion.div key="success" style={{ transformOrigin: "50% 0%" }} {...fold} transition={transition}>
            <NoticeSheet labelledBy="contact-success-title">
              <div className="flex flex-col items-start gap-5 px-1 pb-2 pt-2 md:px-4 md:pt-4">
                <Icon name="crease" size={40} className="text-ink" />
                <h2 id="contact-success-title" ref={successRef} tabIndex={-1} className="text-[length:var(--step-2)] leading-tight outline-none focus-visible:underline">
                  {copy.success.title[lang]}
                </h2>
                <p className="measure text-ink-soft">{copy.success.body[lang]}</p>
                <ArchButton variant="secondary" icon="reset" onClick={reset}>
                  {copy.success.again[lang]}
                </ArchButton>
              </div>
            </NoticeSheet>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            style={{ transformOrigin: "50% 0%" }}
            {...fold}
            transition={transition}
            method="post"
            action="/api/contact"
            noValidate
            aria-label={copy.formLabel[lang]}
            aria-busy={submitting || undefined}
            onSubmit={onSubmit}
            className="flex flex-col gap-7"
          >
            {summaryFields.length > 0 ? (
              <NoticeSheet labelledBy="contact-summary-title" sheetRef={summaryRef}>
                <h2 id="contact-summary-title" className="text-[length:var(--step-1)] ">
                  {copy.summary.title[lang](summaryFields.length)}
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {summaryFields.map((field) => (
                    <li key={field}>
                      <a className={styles.summaryLink} href={`#${fieldId(field)}`}>
                        {copy.fields[field].label[lang]}: {copy.errors[field][visible[field] as FieldErrorCode][lang]}
                      </a>
                    </li>
                  ))}
                </ul>
              </NoticeSheet>
            ) : null}

            <div className="grid gap-7 md:grid-cols-2">
              {(["name", "email"] as const).map((field) => (
                <div key={field} className={styles.field}>
                  <label htmlFor={fieldId(field)} className="label text-ink-mute">
                    {copy.fields[field].label[lang]}
                  </label>
                  <div className={styles.box} data-invalid={visible[field] ? "" : undefined}>
                    <Outline />
                    <input
                      ref={field === "name" ? firstFieldRef : undefined}
                      id={fieldId(field)}
                      name={field}
                      type={field === "email" ? "email" : "text"}
                      inputMode={field === "email" ? "email" : undefined}
                      autoComplete={field === "email" ? "email" : "name"}
                      autoCapitalize={field === "email" ? "off" : "words"}
                      spellCheck={false}
                      required
                      aria-required="true"
                      aria-invalid={visible[field] ? true : undefined}
                      aria-describedby={describedBy(field)}
                      placeholder={copy.fields[field].placeholder[lang]}
                      value={values[field]}
                      disabled={submitting}
                      onChange={(e) => update(field, e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, [field]: true }))}
                      className={styles.control}
                    />
                    <span className={styles.divider} aria-hidden="true" />
                    <span className={styles.arrow} aria-hidden="true">
                      <Icon name="arrowNE" size={18} />
                    </span>
                  </div>
                  {visible[field] ? (
                    <p id={errorId(field)} className={styles.error}>
                      {copy.errors[field][visible[field] as FieldErrorCode][lang]}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor={fieldId("message")} className="label text-ink-mute">
                  {copy.fields.message.label[lang]}
                </label>
                <span
                  id="contact-message-count"
                  className={`data text-[length:var(--step--1)] ${count > CONTACT_LIMITS.message.max ? "text-ink" : "text-ink-mute"}`}
                >
                  <span aria-hidden="true">
                    {count} / {CONTACT_LIMITS.message.max}
                  </span>
                  <span className="sr-only">{copy.counter[lang](count, CONTACT_LIMITS.message.max)}</span>
                </span>
              </div>
              <div className={styles.box} data-invalid={visible.message ? "" : undefined}>
                <Outline tall />
                <textarea
                  id={fieldId("message")}
                  name="message"
                  required
                  aria-required="true"
                  aria-invalid={visible.message ? true : undefined}
                  aria-describedby={describedBy("message", "contact-message-count")}
                  placeholder={copy.fields.message.placeholder[lang]}
                  value={values.message}
                  disabled={submitting}
                  rows={7}
                  onChange={(e) => update("message", e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, message: true }))}
                  className={`${styles.control} ${styles.textarea}`}
                />
              </div>
              {visible.message ? (
                <p id={errorId("message")} className={styles.error}>
                  {copy.errors.message[visible.message][lang]}
                </p>
              ) : null}
            </div>

            {/* Honeypot and render time: never shown, never focusable. */}
            <div className={styles.trap} aria-hidden="true">
              <label htmlFor="contact-website">{copy.honeypot[lang]}</label>
              <input ref={honeypotRef} id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
            </div>
            <input type="hidden" name="renderedAt" value={renderedAt} />

            {notice ? (
              <NoticeSheet labelledBy="contact-notice-title" sheetRef={noticeRef} live>
                <h2 id="contact-notice-title" className="text-[length:var(--step-1)] ">
                  {copy.notices[notice.notice].title[lang]}
                </h2>
                <p className="measure mt-2 text-ink-soft">
                  {notice.notice === "rate_limited"
                    ? copy.notices.rate_limited.body[lang](copy.wait[lang](notice.retryAfter ?? 600))
                    : copy.notices[notice.notice].body[lang]}
                </p>
                {notice.notice === "not_configured" || notice.notice === "failed" ? (
                  <div className="mt-5 flex flex-wrap gap-4">
                    <ArchButton variant="secondary" icon="phone" href={person.phone.href}>
                      {copy.offline.call[lang]}
                    </ArchButton>
                    <ArchButton variant="secondary" icon="mail" href={`mailto:${person.email}`}>
                      {copy.offline.mail[lang]}
                    </ArchButton>
                  </div>
                ) : null}
              </NoticeSheet>
            ) : null}

            <div className="flex flex-wrap items-center gap-5">
              <ArchButton variant="primary" size="lg" type="submit" icon={submitting ? undefined : "arrowRight"} disabled={submitting} aria-disabled={submitting || undefined}>
                {submitting ? (
                  <span className="inline-flex items-center gap-3">
                    <svg className={styles.spinner} viewBox="0 0 20 20" aria-hidden="true">
                      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
                      <path d="M10 2 A8 8 0 0 1 18 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {copy.submitting[lang]}
                  </span>
                ) : (
                  copy.submit[lang]
                )}
              </ArchButton>
              <p className="sr-only" role="status" aria-live="polite">
                {submitting ? copy.submitting[lang] : ""}
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
