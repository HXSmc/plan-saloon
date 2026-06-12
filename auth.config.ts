import type { NextAuthConfig } from "next-auth";

// Edge-safe config (NO Prisma/bcrypt imports) — shared by middleware and the
// full server-side auth in auth.ts. Holds session shape + route-gating logic.
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [], // real Credentials provider added in auth.ts (needs Node runtime)
  callbacks: {
    // Persist role + barberId into the JWT on sign-in.
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.barberId = (user as { barberId?: string | null }).barberId ?? null;
      }
      return token;
    },
    // Expose them on the session.
    session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? "BARBER";
        session.user.barberId = (token.barberId as string | null) ?? null;
      }
      return session;
    },
    // Gate /admin and /api/admin. (Login page handled in middleware matcher.)
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isProtected =
        pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
      if (!isProtected) return true;
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
