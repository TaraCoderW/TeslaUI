import { useLayoutEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Trophy, Users, School, Gamepad2, Code } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Gamepad2, value: "7+", label: "Competitions", color: "text-primary" },
  {
    icon: Users,
    value: "5000+",
    label: "Expected Footfall",
    color: "text-neon-cyan",
  },
  {
    icon: School,
    value: "50+",
    label: "Colleges Invited",
    color: "text-secondary",
  },
  {
    icon: Trophy,
    value: "200000+",
    rawDisplay: "₹2L+",
    label: "Prize Pool",
    color: "text-neon-pink",
  },
  {
    icon: Code,
    value: "10+",
    label: "Societies Involved",
    color: "text-primary",
  },
];

const StatCard = ({ stat }: { stat: (typeof stats)[0] }) => {
  const { ref, display } = useCountUp(stat.value);

  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -5 }}
      className="highlight-card glass-card p-6 text-center group hover:border-primary/30 transition-all duration-300 shimmer-card animated-border-glow cursor-pointer"
    >
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.4 }}
      >
        <stat.icon
          className={`mx-auto mb-3 ${stat.color} group-hover:scale-110 transition-transform`}
          size={28}
        />
      </motion.div>
      <p
        ref={ref}
        className={`font-heading text-2xl md:text-3xl font-bold ${stat.rawDisplay ? "gradient-text" : "text-foreground"}`}
      >
        {stat.rawDisplay || display}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
    </motion.div>
  );
};

const Highlights = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const gridY = useTransform(scrollYProgress, [0, 1], [40, -20]);
  const gridScale = useTransform(scrollYProgress, [0, 0.6], [0.96, 1]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".highlight-card",
        { autoAlpha: 0, y: 50, scale: 0.9 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 78%",
            end: "top 35%",
            scrub: 0.9,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding">
      <div className="container mx-auto">
        <motion.div
          ref={gridRef}
          style={{ y: gridY, scale: gridScale }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6"
        >
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Highlights;
