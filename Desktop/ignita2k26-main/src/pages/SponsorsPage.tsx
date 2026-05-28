import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Download, Mail, ArrowRight, Star, Gem, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ParticleField from "@/components/ParticleField";
import AnimatedBlobs from "@/components/AnimatedBlobs";
import ScrollProgress from "@/components/ScrollProgress";

const tiers = [
  {
    tier: "Title Sponsor",
    icon: Gem,
    color: "from-primary to-neon-cyan",
    benefits: [
      "Logo on all materials",
      "Main stage branding",
      "Dedicated booth",
      "Social media features",
      "Opening ceremony mention",
    ],
    sponsors: ["TechCorp Global"],
  },
  {
    tier: "Gold Sponsor",
    icon: Star,
    color: "from-secondary to-neon-pink",
    benefits: [
      "Logo on website & posters",
      "Booth space",
      "Social media mention",
      "Certificate branding",
    ],
    sponsors: ["InnovateTech", "CodeLabs India"],
  },
  {
    tier: "Community Partner",
    icon: Award,
    color: "from-neon-cyan to-secondary",
    benefits: [
      "Logo on website",
      "Social media shoutout",
      "Community engagement booth",
    ],
    sponsors: [
      "DevCommunity",
      "HackClub UEM",
      "CodeChef Chapter",
      "GDSC Kolkata",
    ],
  },
];

const SponsorsPage = () => {
  // Pinned horizontal scroll for benefits
  const horizontalRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: horizontalRef,
    offset: ["start start", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

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
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="font-heading text-5xl md:text-7xl font-bold mb-4"
            >
              Our <span className="gradient-text">Sponsors</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              The partners and organizations fueling IGNITIA'26.
            </motion.p>
          </div>
        </section>

        {/* Tier cards with scale-in on scroll */}
        <section className="section-padding">
          <div className="container mx-auto space-y-16">
            {tiers.map((tier, ti) => (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, scale: 0.7, rotateX: 12 }}
                whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: ti * 0.1 }}
                style={{ transformPerspective: 1000 }}
              >
                <div className="text-center mb-8">
                  <tier.icon size={32} className="text-primary mx-auto mb-2" />
                  <h2 className="font-heading text-2xl font-bold text-foreground">
                    {tier.tier}
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <div className="glass-card p-6 shimmer-card">
                    <h3 className="font-heading text-sm font-semibold text-primary mb-3">
                      Sponsors
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {tier.sponsors.map((s) => (
                        <motion.div
                          key={s}
                          whileHover={{ scale: 1.08, y: -3 }}
                          className="glass-card px-4 py-2 text-sm text-foreground font-medium cursor-pointer"
                        >
                          {s}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-6 shimmer-card">
                    <h3 className="font-heading text-sm font-semibold text-primary mb-3">
                      Benefits
                    </h3>
                    <ul className="space-y-2">
                      {tier.benefits.map((b, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-neon-cyan">✦</span> {b}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-12 max-w-2xl mx-auto shimmer-card"
            >
              <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
                Become a Sponsor
              </h2>
              <p className="text-muted-foreground mb-6">
                Partner with IGNITIA'26 and reach 1000+ student innovators.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glow-button inline-flex items-center gap-2 text-sm"
                >
                  <Download size={16} /> Download Brochure
                </motion.a>
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glow-button-secondary inline-flex items-center gap-2 text-sm"
                >
                  <Mail size={16} /> Contact Us
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default SponsorsPage;
