import { useEffect, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Code,
  Brain,
  Gamepad2,
  HelpCircle,
  Cpu,
  ArrowRight,
  Users,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import VanillaTilt from "vanilla-tilt";
import { HelmCorner } from "./FloatingTechElements";

gsap.registerPlugin(ScrollTrigger);

const events = [
  {
    icon: Cpu,
    title: "Hackathon",
    description: "Build innovative software from scratch in 10 intense hours.",
    prize: "₹35,000",
    day: "Day 1",
    color: "from-red-900/30 to-red-700/10",
  },
  {
    icon: Code,
    title: "Blind Coding",
    description: "Code without screen visibility. Pure logic and memory.",
    prize: "₹15,000",
    day: "Day 2",
    color: "from-orange-900/30 to-red-700/10",
  },
  {
    icon: Brain,
    title: "Quiz",
    description: "Test your knowledge across tech, science, pop culture.",
    prize: "₹15,000",
    day: "Day 1",
    color: "from-red-900/30 to-orange-700/10",
  },
  {
    icon: Gamepad2,
    title: "Gaming Tournament",
    description: "Compete in intense esports battles. Valorant, BGMI & more.",
    prize: "₹30,000",
    day: "Day 2",
    color: "from-red-800/30 to-red-900/10",
  },
  {
    icon: HelpCircle,
    title: "Guess Who",
    description: "A mystery event full of surprises. Can you decode the clues?",
    prize: "₹10,000",
    day: "Day 2",
    color: "from-orange-900/30 to-red-800/10",
  },
  {
    icon: Users,
    title: "Debates",
    description: "Argue for or against trending tech topics under timed pressure.",
    prize: "₹15,000",
    day: "Day 1",
    color: "from-red-900/30 to-orange-900/10",
  },
];

// RA.One corner SVG bracket
const RaCornerBracket = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <path d="M22 0 L22 8 L18 8 L18 4 L14 4 L14 0 Z" fill="hsl(0 95% 60% / 0.7)" />
  </svg>
);

const TiltCard = ({ event }: { event: (typeof events)[0] }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    VanillaTilt.init(ref.current, {
      max: 12,
      speed: 400,
      scale: 1.04,
      glare: true,
      "max-glare": 0.22,
      perspective: 900,
    });
    return () => { ref.current?.vanillaTilt?.destroy(); };
  }, []);

  return (
    <div
      ref={ref}
      className="featured-event-card hologram-card corner-energy group p-6 cursor-pointer relative"
    >
      {/* RA.One corner decorations */}
      <HelmCorner className="absolute top-0 left-0 opacity-40 group-hover:opacity-90 transition-opacity duration-300" />
      <svg width="40" height="40" viewBox="0 0 60 60" fill="none"
        className="absolute top-0 right-0 opacity-40 group-hover:opacity-90 transition-opacity duration-300"
        style={{ transform: "scaleX(-1)" }}>
        <path d="M2 2 L28 2 L28 6 L6 6 L6 28 L2 28 Z"
          fill="hsl(0 95% 60% / 0.5)" stroke="hsl(0 95% 60%)" strokeWidth="1" />
        <path d="M6 6 L22 6 L22 10 L10 10 L10 22 L6 22 Z"
          fill="none" stroke="hsl(15 90% 60% / 0.6)" strokeWidth="0.8" />
        <circle cx="28" cy="28" r="3" fill="hsl(0 95% 60%)" opacity="0.7" />
      </svg>

      {/* Day badge */}
      <span className="absolute top-2 right-12 text-[10px] font-bold tracking-widest uppercase text-red-400 bg-red-950/60 border border-red-800/50 px-2 py-0.5 rounded">
        {event.day}
      </span>

      {/* Scanline overlay handled by CSS */}
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${event.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-red-800/30`}>
        <event.icon size={24} className="text-red-300" />
      </div>

      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
        {event.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {event.description}
      </p>

      <div className="flex items-center justify-between relative z-10">
        <span className="text-sm font-semibold text-red-400">
          🏆 {event.prize}
        </span>
        <span className="text-xs text-muted-foreground group-hover:text-red-400 transition-colors inline-flex items-center gap-1">
          Learn More <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </div>
  );
};

const FeaturedEvents = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".featured-event-card",
        { autoAlpha: 0, y: 60, scale: 0.9, rotateX: 10 },
        {
          autoAlpha: 1, y: 0, scale: 1, rotateX: 0,
          duration: 0.95, ease: "power3.out", stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%", end: "top 28%", scrub: 1,
          },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="events" className="section-padding relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-red-900/5 blur-[120px]" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm text-primary uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <span className="inline-block w-6 h-[1px] bg-red-500/60" />
            Compete &amp; Create
            <span className="inline-block w-6 h-[1px] bg-red-500/60" />
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
            Featured <span className="gradient-text glitch-text">Events</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <TiltCard key={event.title} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
