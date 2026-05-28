import { motion } from "framer-motion";

const badges = [
  { text: "🏆 ₹2L+ Prize Pool", x: "5%", y: "20%", delay: 0 },
  { text: "🎓 1000+ Participants", x: "80%", y: "15%", delay: 1.5 },
  { text: "🌐 Open for All Colleges", x: "70%", y: "75%", delay: 3 },
];

const FloatingBadges = () => (
  <>
    {badges.map((b) => (
      <motion.div
        key={b.text}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: b.delay + 1, duration: 0.6 }}
        className="absolute hidden lg:block glass-card px-3 py-1.5 text-xs text-muted-foreground z-20 pointer-events-none"
        style={{ left: b.x, top: b.y, animation: `float ${6 + b.delay}s ease-in-out infinite` }}
      >
        {b.text}
      </motion.div>
    ))}
  </>
);

export default FloatingBadges;
