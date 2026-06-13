"use client";

import { useEffect, useState } from "react";
import { openStatus, type OpenStatus } from "@/lib/data";
import { useLang } from "./i18n/LanguageContext";

/**
 * Live open/closed pill computed from the published hours (shop-local time).
 * Client-only and refreshed each minute, so it's never stale or invented.
 */
export default function OpenStatusPill({ className = "" }: { className?: string }) {
  const { t } = useLang();
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(openStatus());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!status) return null; // avoid SSR/client clock mismatch

  const color = status.open ? "text-neon-yellow border-neon-yellow/40" : "text-neon-red border-neon-red/40";
  const dot = status.open ? "bg-neon-yellow" : "bg-neon-red";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-label text-[0.65rem] uppercase tracking-[0.2em] ${color} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status.open ? t("status.open") : t("status.closed")}
      {status.until && (
        <span className="normal-case tracking-normal text-cream-dim" dir="ltr">
          · {status.open ? t("status.until") : t("status.opensAt")} {status.until}
        </span>
      )}
    </span>
  );
}
