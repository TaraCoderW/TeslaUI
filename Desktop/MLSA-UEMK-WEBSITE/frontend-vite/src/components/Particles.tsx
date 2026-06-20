
import { motion } from "framer-motion";

export default function Particles() {
  const particles = Array.from({ length: 40 });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-400"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: 4 + (i % 5),
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}