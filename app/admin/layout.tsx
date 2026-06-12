import type { Metadata } from "next";
import { auth, signOut } from "@/auth";
import Sidebar from "@/components/admin/Sidebar";
import { ToastProvider } from "@/components/admin/Toast";

export const metadata: Metadata = {
  title: "Admin · Action Plan Barbershop",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Login page (no session) renders bare — middleware guards everything else.
  if (!session?.user) {
    return <div className="min-h-screen bg-charcoal-deep font-sans">{children}</div>;
  }

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div className="min-h-screen bg-charcoal-deep font-sans text-cream" dir="ltr">
      <ToastProvider>
        <Sidebar
          email={session.user.email ?? ""}
          role={session.user.role}
          signOutAction={doSignOut}
        />
        <main className="lg:pl-64">
          <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10">{children}</div>
        </main>
      </ToastProvider>
    </div>
  );
}
