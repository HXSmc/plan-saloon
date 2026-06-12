"use client";

import { useState } from "react";
import { useBooking } from "./BookingContext";
import { useLang } from "../i18n/LanguageContext";
import GlowButton from "../GlowButton";
import { ChevronLeft } from "../icons";

// Validation returns translation keys; the component resolves them via t().
type Errors = Partial<Record<"name" | "phone" | "email", string>>;

function validate(c: { name: string; phone: string; email: string }): Errors {
  const e: Errors = {};
  if (c.name.trim().length < 2) e.name = "book.err.name";
  // Mirrors the server normalization (digits + optional leading "+", 7–15 digits).
  const digits = c.phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) e.phone = "book.err.phone";
  // Email is optional — phone is the primary contact for the shop.
  if (c.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))
    e.email = "book.err.email";
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
    placeholder: string,
    inputDir?: "ltr"
  ) => (
    <div>
      <label className="font-label text-[0.68rem] uppercase tracking-widest text-cream-dim">
        {label}
      </label>
      <input
        type={type}
        value={state.contact[key]}
        placeholder={placeholder}
        dir={inputDir}
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
        {field(t("book.info.name"), "name", "text", "")}
        {field(t("book.info.phone"), "phone", "tel", "05X XXX XXXX", "ltr")}
        {field(t("book.info.email"), "email", "email", "", "ltr")}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <GlowButton variant="ghost" size="sm" onClick={back}>
          <ChevronLeft size={14} className="rtl:-scale-x-100" />
          {t("booking.back")}
        </GlowButton>
        <GlowButton size="sm" onClick={submit}>
          {t("book.info.confirm")}
        </GlowButton>
      </div>
    </div>
  );
}
