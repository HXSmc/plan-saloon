"use client";

import { useState } from "react";
import { useBooking } from "./BookingContext";
import { useLang } from "../i18n/LanguageContext";
import GlowButton from "../GlowButton";

// Validation returns translation keys; the component resolves them via t().
type Errors = Partial<Record<"name" | "phone" | "email", string>>;

function validate(c: { name: string; phone: string; email: string }): Errors {
  const e: Errors = {};
  if (c.name.trim().length < 2) e.name = "book.err.name";
  if (c.phone.replace(/\D/g, "").length < 7) e.phone = "book.err.phone";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) e.email = "book.err.email";
  return e;
}

export default function StepInfo() {
  const { state, set, next, back } = useBooking();
  const { t } = useLang();
  const [errors, setErrors] = useState<Errors>({});

  const update = (field: keyof typeof state.contact, value: string) =>
    set({ contact: { ...state.contact, [field]: value } });

  const submit = () => {
    const e = validate(state.contact);
    setErrors(e);
    if (Object.keys(e).length === 0) next();
  };

  const field = (
    label: string,
    key: keyof typeof state.contact,
    type: string,
    placeholder: string
  ) => (
    <div>
      <label className="font-label text-[0.65rem] uppercase tracking-widest text-cream-dim">
        {label}
      </label>
      <input
        type={type}
        value={state.contact[key]}
        placeholder={placeholder}
        onChange={(ev) => update(key, ev.target.value)}
        className={`mt-1 w-full rounded-md border bg-white/[0.03] px-4 py-3 font-body text-cream placeholder:text-cream-dim/50 focus:outline-none focus:ring-1 ${
          errors[key]
            ? "border-neon-red focus:ring-neon-red"
            : "border-white/10 focus:border-neon-yellow focus:ring-neon-yellow"
        }`}
      />
      {errors[key] && (
        <p className="mt-1 font-body text-xs text-neon-red">
          {t(errors[key] as string)}
        </p>
      )}
    </div>
  );

  return (
    <div className="animate-fade-up">
      <h3 className="font-display text-2xl font-extrabold text-cream">
        {t("book.info.title")}
      </h3>
      <p className="mt-1 font-body text-sm text-cream-dim">
        {t("book.info.subcopy")}
      </p>

      <div className="mt-6 space-y-4">
        {field(t("book.info.name"), "name", "text", "Jordan Smith")}
        {field(t("book.info.phone"), "phone", "tel", "(555) 123-4567")}
        {field(t("book.info.email"), "email", "email", "you@example.com")}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <GlowButton variant="ghost" size="sm" onClick={back}>
          <span className="rtl:hidden">←</span>
          <span className="hidden rtl:inline">→</span> {t("booking.back")}
        </GlowButton>
        <GlowButton size="sm" onClick={submit}>
          {t("book.info.confirm")}
        </GlowButton>
      </div>
    </div>
  );
}
