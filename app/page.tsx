import { LanguageProvider } from "@/components/i18n/LanguageContext";
import { BookingProvider } from "@/components/booking/BookingContext";
import BookingModal from "@/components/booking/BookingModal";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Team from "@/components/Team";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <LanguageProvider>
      <BookingProvider>
        <Header />
        <main>
          <Hero />
          <Services />
          <About />
          <Team />
        </main>
        <Footer />
        <BookingModal />
      </BookingProvider>
    </LanguageProvider>
  );
}
