import Hero from "@/components/Hero";
import About from "@/components/About";
import ServicesPreview from "@/components/ServicesPreview";
import ContactCTA from "@/components/ContactCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Hero />
      <About />
      <ServicesPreview />
      <ContactCTA />
    </main>
  );
}
