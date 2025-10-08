import AboutSection from "../components/AboutSection";
import { FAQ } from "../components/FAQ";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { Navbar } from "../components/Navbar";
import { Pricing } from "../components/Pricing";
import { ProblemSolution } from "../components/ProblemSolution";
import { Reveal } from "../components/Reveal";
import { WhatsAppWidget } from "../components/WhatsAppWidget";

export default function InManagerLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 text-gray-900">
      <Navbar />
      {/* hero entra suave */}
      <Reveal as="div" y={8}>
        <Hero />
      </Reveal>

      {/* bloque problema/solución con delay */}
      <Reveal as="section" y={12} delay={60}>
        <ProblemSolution />
      </Reveal>

      {/* features con stagger en sus cards internas (ver más abajo) */}
      <Reveal as="section" y={12} delay={80}>
        <Features />
      </Reveal>

      <Reveal as="section" y={12} delay={100}>
        <Pricing />
      </Reveal>

      <Reveal as="section" y={12} delay={140}>
        <FAQ />
      </Reveal>

      <Reveal as="section" y={12} delay={160}>
        <AboutSection />
      </Reveal>

      <Footer />
      <WhatsAppWidget phone="573168878200" logoSrc="/whatsapp.png" />
    </div>
  );
}
