import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { Benefits } from "../components/landing/Benefits";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Pricing } from "../components/landing/Pricing";
import { SocialProof } from "../components/landing/SocialProof";
import { FAQ } from "../components/landing/FAQ";
import { CTA } from "../components/landing/CTA";
import { Footer } from "../components/landing/Footer";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar />
      <Hero />
      <Benefits />
      <HowItWorks />
      <SocialProof />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}