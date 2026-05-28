import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// RA.One-inspired SVG Energy Symbol
const EnergySymbol = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <polygon
      points="32,4 60,20 60,44 32,60 4,44 4,20"
      stroke="hsl(0 95% 60%)"
      strokeWidth="1.5"
      fill="none"
      opacity="0.7"
    />
    <polygon
      points="32,14 52,25 52,39 32,50 12,39 12,25"
      stroke="hsl(15 90% 60%)"
      strokeWidth="1"
      fill="none"
      opacity="0.5"
    />
    <circle cx="32" cy="32" r="6" fill="hsl(0 95% 60%)" opacity="0.8" />
    <circle cx="32" cy="32" r="3" fill="white" opacity="0.9" />
    {/* Radial lines */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const x1 = 32 + 8 * Math.cos(rad);
      const y1 = 32 + 8 * Math.sin(rad);
      const x2 = 32 + 18 * Math.cos(rad);
      const y2 = 32 + 18 * Math.sin(rad);
      return (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="hsl(0 95% 60%)" strokeWidth="1" opacity="0.5" />
      );
    })}
  </svg>
);

// RA.One Mask / Helmet Corner
const HelmCorner = ({ className = "" }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 60 60" fill="none" className={className}>
    <path d="M2 2 L28 2 L28 6 L6 6 L6 28 L2 28 Z"
      fill="hsl(0 95% 60% / 0.5)" stroke="hsl(0 95% 60%)" strokeWidth="1" />
    <path d="M6 6 L22 6 L22 10 L10 10 L10 22 L6 22 Z"
      fill="none" stroke="hsl(15 90% 60% / 0.6)" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="3" fill="hsl(0 95% 60%)" opacity="0.7" />
  </svg>
);

const shapes = [
  { type: "hex", x: "8%", y: "15%", size: 55, delay: 0, duration: 9 },
  { type: "ring", x: "90%", y: "20%", size: 45, delay: 1.5, duration: 7 },
  { type: "diamond", x: "5%", y: "55%", size: 38, delay: 3, duration: 11 },
  { type: "hex", x: "92%", y: "60%", size: 50, delay: 2, duration: 8 },
  { type: "energy", x: "15%", y: "80%", size: 42, delay: 0.5, duration: 10 },
  { type: "ring", x: "80%", y: "85%", size: 35, delay: 4, duration: 6 },
  { type: "diamond", x: "50%", y: "5%", size: 30, delay: 2.5, duration: 9 },
  { type: "hex", x: "45%", y: "90%", size: 48, delay: 1, duration: 12 },
];

const Shape = ({ s }: { s: (typeof shapes)[0] }) => {
  const style: React.CSSProperties = {
    position: "absolute",
    left: s.x,
    top: s.y,
    pointerEvents: "none",
  };

  const animate = {
    y: [0, -22, 8, -14, 0],
    rotate: [0, 20, -10, 15, 0],
    opacity: [0.15, 0.35, 0.2, 0.30, 0.15],
  };

  const transition = {
    duration: s.duration,
    delay: s.delay,
    repeat: Infinity,
    ease: "easeInOut",
  };

  if (s.type === "energy") {
    return (
      <motion.div style={style} animate={{ y: [0, -18, 0], rotate: [0, 360] }}
        transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "linear" }}>
        <EnergySymbol size={s.size} className="opacity-30" />
      </motion.div>
    );
  }
  if (s.type === "hex") {
    return (
      <motion.div style={{ ...style, width: s.size, height: s.size }} animate={animate} transition={transition}>
        <div className="tech-hexagon w-full h-full" />
      </motion.div>
    );
  }
  if (s.type === "ring") {
    return (
      <motion.div style={{ ...style, width: s.size, height: s.size }} animate={animate} transition={transition}>
        <div className="tech-ring w-full h-full" />
      </motion.div>
    );
  }
  return (
    <motion.div style={{ ...style, width: s.size, height: s.size }} animate={animate} transition={transition}>
      <div className="tech-diamond w-full h-full" />
    </motion.div>
  );
};

const FloatingTechElements = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    {shapes.map((s, i) => <Shape key={i} s={s} />)}
  </div>
);

export { EnergySymbol, HelmCorner, FloatingTechElements };
export default FloatingTechElements;
