import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Who can participate in IGNITIA'26?",
    a: "Any college student from across India can participate. Some events are open to individual participants while others require teams.",
  },
  {
    q: "Is there any registration fee?",
    a: "Most events are free to register. A few premium competitions may have a nominal fee. Details will be on each event page.",
  },
  {
    q: "Can students from other colleges join?",
    a: "Absolutely! IGNITIA'26 welcomes students from all colleges. We have 50+ colleges invited.",
  },
  {
    q: "How do teams register?",
    a: "Team leaders can register their team through the registration form. Each member's details will be collected during registration.",
  },
  {
    q: "Will certificates be provided?",
    a: "Yes! All participants will receive participation certificates. Winners get special certificates along with prizes.",
  },
  {
    q: "What should participants bring?",
    a: "Bring your college ID, laptop (for coding/hackathon events), and enthusiasm! Specific requirements will be mentioned on event pages.",
  },
];

const FAQSection = () => (
  <section id="faq" className="section-padding">
    <div className="container mx-auto max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-sm text-neon-pink uppercase tracking-widest mb-2">
          Got Questions?
        </p>
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <AccordionItem
                value={`faq-${i}`}
                className="glass-card px-6 border-glass-border"
              >
                <AccordionTrigger className="text-left font-heading text-sm md:text-base text-foreground hover:text-primary hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
);

export default FAQSection;
