import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      barberId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    barberId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    barberId?: string | null;
  }
}
