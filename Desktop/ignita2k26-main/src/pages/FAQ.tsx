import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ParticleField from "@/components/ParticleField";
import AnimatedBlobs from "@/components/AnimatedBlobs";
import ScrollProgress from "@/components/ScrollProgress";

const faqs = [
  {
    q: "Who can participate in IGNITIA'26?",
    a: "IGNITIA'26 is open to all college students across India. Whether you're from UEM Kolkata or any other institution, you're welcome to register and participate.",
  },
  {
    q: "Is there a registration fee?",
    a: "Most events are free to participate. Some premium events like the Gaming Arena and Hackathon may have a nominal registration fee. Details will be provided on individual event pages.",
  },
  {
    q: "Can students from other colleges join?",
    a: "Absolutely! IGNITIA is an inter-college event and we encourage participation from students across Kolkata and beyond.",
  },
  {
    q: "How do teams register?",
    a: "The team leader registers the team through our registration portal. Team members are added during the registration process with their details.",
  },
  {
    q: "Will certificates be provided?",
    a: "Yes! All participants receive participation certificates. Winners receive special achievement certificates along with prizes.",
  },
  {
    q: "What should participants bring?",
    a: "Bring your college ID, laptop (for coding/hackathon events), and enthusiasm! Specific requirements will be communicated via email after registration.",
  },
  {
    q: "Can I participate in multiple events?",
    a: "Yes, as long as the event schedules don't overlap. Check the Schedule page to plan your participation.",
  },
  {
    q: "Is accommodation provided?",
    a: "Accommodation is not provided by default, but we can assist outstation students with nearby hostel and PG recommendations.",
  },
  {
    q: "What are the prizes?",
    a: "The total prize pool exceeds ₹2,00,000. Individual event prizes range from ₹10,000 to ₹35,000. Check each event page for specific prize details.",
  },
  {
    q: "How will I receive updates about the event?",
    a: "Follow us on social media and join our WhatsApp/Telegram groups (links shared after registration). Important updates will also be sent via email.",
  },
];

const FAQ = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background scanline-overlay">
        <ParticleField />
        <AnimatedBlobs />
        <ScrollProgress />
        <Navbar />

        <section className="relative min-h-[50vh] flex items-center justify-center pt-16">
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-heading text-5xl md:text-7xl font-bold mb-4"
            >
              <span className="gradient-text">FAQ</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground max-w-lg mx-auto"
            >
              Everything you need to know about IGNITIA'26.
            </motion.p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" }}
                  whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AccordionItem
                    value={`faq-${i}`}
                    className="glass-card bg-card/40 backdrop-blur-3xl px-6 border-glass-border shimmer-card hover:bg-card/70 hover:border-primary/30 transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left font-heading text-foreground hover:text-primary py-5">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 leading-relaxed overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default FAQ;
