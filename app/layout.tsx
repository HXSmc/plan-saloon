import type { Metadata } from "next";
import { Archivo, Montserrat, Lora, Cairo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-lora",
  display: "swap",
});

// Arabic-capable font; appended as a fallback in the Tailwind font stacks so
// Arabic glyphs render correctly while Latin text keeps the display/serif fonts.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Action Plan Barbershop — Crafting Your Masterpiece, One Cut at a Time",
  description:
    "Premium barbershop experience. Signature cuts, beard sculpting, and hot-towel shaves. Book your appointment with Action Plan Barbershop today.",
  openGraph: {
    title: "Action Plan Barbershop",
    description: "Crafting Your Masterpiece, One Cut at a Time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${montserrat.variable} ${lora.variable} ${cairo.variable}`}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
