import type { Metadata } from "next";
import { LanguageProvider } from "@/components/i18n/LanguageContext";
import ManageBooking from "@/components/booking/ManageBooking";

export const metadata: Metadata = {
  title: "Your Booking · Action Plan Barbershop",
  robots: { index: false }, // token URLs must never be indexed
};

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <LanguageProvider>
      <ManageBooking token={token} />
    </LanguageProvider>
  );
}
