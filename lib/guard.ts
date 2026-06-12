import { NextResponse } from "next/server";
import { auth } from "@/auth";

export type SessionUser = {
  id?: string;
  email?: string | null;
  role: string;
  barberId: string | null;
};

/**
 * Resolves the current admin user for API route handlers. Returns either the
 * user or a ready NextResponse to short-circuit (401/403). Middleware already
 * blocks anonymous access; this adds role checks + types inside handlers.
 */
export async function requireUser(opts?: {
  owner?: boolean;
}): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (opts?.owner && user.role !== "OWNER") {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}
