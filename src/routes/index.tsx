import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { LoanCalculator } from "@/components/site/LoanCalculator";
import { Process } from "@/components/site/Process";
import { WhyUs } from "@/components/site/WhyUs";
import { Faq } from "@/components/site/Faq";
import { Footer } from "@/components/site/Footer";

const title = "Danaro — Pinjaman Online Cepat & Transparan";
const description =
  "Ajukan pinjaman online mulai Rp500 ribu hingga Rp25 juta. Proses cepat, syarat jelas, dan cicilan fleksibel.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <LoanCalculator />
        <Process />
        <WhyUs />
        <Faq />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
