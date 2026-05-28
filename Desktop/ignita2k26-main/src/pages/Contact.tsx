import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Instagram,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ParticleField from "@/components/ParticleField";
import AnimatedBlobs from "@/components/AnimatedBlobs";
import ScrollProgress from "@/components/ScrollProgress";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "ignitia@uem.edu.in",
    href: "mailto:ignitia@uem.edu.in",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: MapPin,
    label: "Venue",
    value: "UEM Kolkata, New Town, Kolkata 700160",
    href: "#",
  },
];

const socials = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
];

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: formRef,
    offset: ["start end", "center center"],
  });
  const formScale = useSpring(
    useTransform(scrollYProgress, [0, 1], [0.85, 1]),
    { stiffness: 80, damping: 20 },
  );
  const formRotateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [12, 0]),
    { stiffness: 80, damping: 20 },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

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
              transition={{ type: "spring" }}
              className="font-heading text-5xl md:text-7xl font-bold mb-4"
            >
              Get in <span className="gradient-text">Touch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground"
            >
              Have questions? Reach out to us!
            </motion.p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact info */}
              <div className="space-y-6">
                {contactInfo.map((info, i) => (
                  <motion.a
                    key={info.label}
                    href={info.href}
                    initial={{ opacity: 0, x: -60, rotateY: -10 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.03, x: 8 }}
                    className="glass-card bg-card/75 backdrop-blur-2xl p-5 flex items-center gap-4 shimmer-card animated-border-glow block"
                    style={{ transformPerspective: 800 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <info.icon size={22} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {info.label}
                      </p>
                      <p className="text-sm text-foreground font-medium">
                        {info.value}
                      </p>
                    </div>
                  </motion.a>
                ))}

                {/* Socials */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex gap-3 pt-4"
                >
                  {socials.map((s, i) => (
                    <motion.a
                      key={s.label}
                      href={s.href}
                      whileHover={{ scale: 1.2, y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-11 h-11 rounded-lg glass-card bg-card/75 backdrop-blur-2xl flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    >
                      <s.icon size={18} />
                    </motion.a>
                  ))}
                </motion.div>

                {/* Map embed placeholder */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="glass-card bg-card/75 backdrop-blur-2xl overflow-hidden h-48 mt-4"
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.5!2d88.47!3d22.57!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDM0JzEyLjAiTiA4OMKwMjgnMTIuMCJF!5e0!3m2!1sen!2sin!4v1"
                    width="100%"
                    height="100%"
                    style={{
                      border: 0,
                      filter: "invert(90%) hue-rotate(180deg)",
                    }}
                    allowFullScreen
                    loading="lazy"
                    title="UEM Kolkata Location"
                  />
                </motion.div>
              </div>

              {/* Contact form */}
              <motion.div
                ref={formRef}
                style={{
                  scale: formScale,
                  rotateX: formRotateX,
                  transformPerspective: 1000,
                }}
                className="glass-card bg-card/75 backdrop-blur-2xl p-6 md:p-8 shimmer-card"
              >
                <h2 className="font-heading text-xl font-bold text-foreground mb-6">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { name: "name", label: "Full Name", type: "text" },
                    { name: "email", label: "Email Address", type: "email" },
                    { name: "subject", label: "Subject", type: "text" },
                  ].map((field, i) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <label className="text-xs text-muted-foreground mb-1 block">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        required
                        className="w-full bg-muted/50 border border-glass-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder={field.label}
                      />
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.24 }}
                  >
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full bg-muted/50 border border-glass-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                      placeholder="Your message..."
                    />
                  </motion.div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="glow-button w-full inline-flex items-center justify-center gap-2 ripple-button"
                  >
                    {submitted ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-sm"
                      >
                        ✓ Message Sent!
                      </motion.span>
                    ) : (
                      <>
                        <Send size={16} /> Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Contact;
