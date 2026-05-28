import { motion } from "framer-motion";

const blobs = [
  { color: "bg-[#e8000d]/10", size: "w-[520px] h-[520px]", x: "-8%", y: "18%", duration: 22 },
  { color: "bg-[#00f5ff]/8", size: "w-[440px] h-[440px]", x: "72%", y: "48%", duration: 26 },
  { color: "bg-[#e8000d]/6", size: "w-[380px] h-[380px]", x: "28%", y: "68%", duration: 24 },
  { color: "bg-[#00f5ff]/7", size: "w-[320px] h-[320px]", x: "58%", y: "8%", duration: 20 },
];

const AnimatedBlobs = () => (
  <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
    {blobs.map((blob, i) => (
      <motion.div
        key={i}
        className={`absolute rounded-full ${blob.color} ${blob.size} blur-[140px]`}
        style={{ left: blob.x, top: blob.y }}
        animate={{
          x: [0, 50, -35, 18, 0],
          y: [0, -45, 28, -18, 0],
          scale: [1, 1.12, 0.92, 1.06, 1],
          opacity: [0.6, 0.9, 0.7, 0.85, 0.6],
        }}
        transition={{
          duration: blob.duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

export default AnimatedBlobs;
