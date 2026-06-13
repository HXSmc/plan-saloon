"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "../Logo";
import { Grid, Calendar, Scissors, Users, Chart, Menu, X } from "../icons";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: Grid, exact: true },
  { href: "/admin/calendar", label: "Calendar", Icon: Calendar },
  { href: "/admin/staff", label: "Staff", Icon: Users },
  { href: "/admin/services", label: "Services", Icon: Scissors },
  { href: "/admin/analytics", label: "Analytics", Icon: Chart },
];

export default function Sidebar({
  email,
  role,
  signOutAction,
}: {
  email: string;
  role: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Owners see all nav; barbers only their schedule-relevant views.
  const items = NAV.filter(
    (n) => role === "OWNER" || ["/admin", "/admin/calendar"].includes(n.href)
  );

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-charcoal px-5 py-3 lg:hidden">
        <Logo size={30} />
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-cream"
          aria-label="Toggle menu"
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/10 bg-charcoal transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <Logo size={34} />
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {items.map(({ href, label, Icon, exact }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(href, exact)
                    ? "bg-neon-yellow/10 text-neon-yellow"
                    : "text-cream-dim hover:bg-white/5 hover:text-cream"
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-white/10 px-4 py-4">
            <div className="mb-3">
              <p className="truncate text-xs text-cream">{email}</p>
              <span className="mt-1 inline-block rounded-full bg-neon-yellow/15 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-neon-yellow">
                {role}
              </span>
            </div>
            <form action={signOutAction}>
              <button className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-cream-dim transition-colors hover:border-neon-red/50 hover:text-neon-red">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
