import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const announcements = [
  "⚡ IGNITIA'26 is LIVE — Register Now Before Seats Fill Up!",
  "🏆 Prize Pool: ₹2L+ across 6 events — Hackathon, Gaming, Quiz, Debates & more!",
  "📅 Aug 1–2, 2026 · UEM Kolkata · IEM-UEM groups",
  "🎮 Blind Coding, Guess Who & Gaming Tournament — Day 2 Events Registration Open!",
  "🧠 Debates & Quiz happening on Day 1 — Don't miss out!",
];

const CornerDecor = () => (
  <>
    {/* Top-left energy bracket */}
    <span className="pointer-events-none absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-red-500/70" />
    {/* Top-right energy bracket */}
    <span className="pointer-events-none absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-red-500/70" />
  </>
);

const AnnouncementBar = () => {
  const [dismissed, setDismissed] = useState(false);
  const doubled = [...announcements, ...announcements];

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="announcement-bar"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <CornerDecor />

        {/* Left: badge */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="relative">
            <div className="w-7 h-7 rounded-full border border-red-500/60 flex items-center justify-center">
              <Zap size={13} className="text-red-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          </div>
          <span className="text-red-400 text-xs font-bold tracking-widest uppercase">
            LIVE
          </span>
        </div>

        {/* Ticker */}
        <div className="announcement-ticker min-w-0 flex-1">
          <span className="announcement-ticker-inner text-sm text-white/80 font-medium">
            {doubled.map((a, i) => (
              <span key={i} className="mr-16">
                {a}
              </span>
            ))}
          </span>
        </div>

        {/* Right: CTA + close */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/events"
            className="hidden sm:inline-flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
            style={{ boxShadow: "0 0 14px hsl(0 95% 55% / 0.5)" }}
          >
            Register <ChevronRight size={12} />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/40 hover:text-white/80 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementBar;
