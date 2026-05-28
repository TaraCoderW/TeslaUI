import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import NeonFlicker from "./NeonFlicker";

const CTABanner = () => (
  <section id="register" className="section-padding relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-neon-pink/10" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] animate-pulse-glow" />

    {/* Animated neon rings */}
    <motion.div
      animate={{ rotate: 360, scale: [1, 1.1, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-primary/10 pointer-events-none"
    />
    <motion.div
      animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-secondary/10 pointer-events-none"
    />

    <div className="container mx-auto relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: 15 }}
        whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card p-10 md:p-16 max-w-3xl mx-auto shimmer-card animated-border-glow"
        style={{ transformPerspective: 1000 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 glass-card px-3 py-1 text-xs text-primary mb-6"
        >
          <Zap size={12} /> Limited Spots Available
        </motion.div>

        <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">
          Ready to <NeonFlicker className="gradient-text">Ignite?</NeonFlicker>
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Join thousands of students competing, creating, and connecting at the
          biggest multi-domain event of 2026.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glow-button pulse-cta cta-sweep inline-flex items-center justify-center gap-2 ripple-button"
          >
            Register Now <ArrowRight size={18} />
          </motion.a>
          <motion.a
            href="#events"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glow-button-secondary inline-flex items-center justify-center gap-2 ripple-button"
          >
            Explore Events
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default CTABanner;
