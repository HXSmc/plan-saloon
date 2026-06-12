"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-deep px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo size={48} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-charcoal p-8">
          <h1 className="font-display text-2xl font-extrabold text-cream">
            Admin Sign In
          </h1>
          <p className="mt-1 text-sm text-cream-dim">
            Staff &amp; owner access only.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-cream-dim">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-cream outline-none focus:border-neon-yellow focus:ring-1 focus:ring-neon-yellow"
                placeholder="owner@actionplan.sa"
              />
            </div>
            <div>
              <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-cream-dim">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-cream outline-none focus:border-neon-yellow focus:ring-1 focus:ring-neon-yellow"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-neon-red">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-neon-yellow px-6 py-3 text-sm font-semibold uppercase tracking-widest text-charcoal-deep shadow-glow-yellow transition-all hover:bg-neon-glow disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-cream-dim/60">
          Default owner: owner@actionplan.sa / changeme
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
