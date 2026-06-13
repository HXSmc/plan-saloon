import type { Metadata } from "next";
import { LanguageProvider } from "@/components/i18n/LanguageContext";
import BookingFlow from "@/components/booking/BookingFlow";

export const metadata: Metadata = {
  title: "Book · Action Plan Barbershop",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; barber?: string }>;
}) {
  const params = await searchParams;
  return (
    <LanguageProvider>
      <BookingFlow
        initialServiceId={params.service ?? null}
        initialBarberId={params.barber ?? null}
      />
    </LanguageProvider>
  );
}
