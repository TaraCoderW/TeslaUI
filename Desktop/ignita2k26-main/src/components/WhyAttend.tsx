import { useLayoutEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Network, Zap, Award, Handshake, PartyPopper } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reasons = [
  {
    icon: Network,
    title: "Networking",
    description:
      "Connect with students, mentors, and industry professionals from 50+ colleges.",
  },
  {
    icon: Zap,
    title: "Skill Development",
    description:
      "Sharpen your coding, design, and problem-solving skills through real challenges.",
  },
  {
    icon: Award,
    title: "Certificates & Prizes",
    description:
      "Win from a prize pool of ₹2L+ and earn certificates for participation.",
  },
  {
    icon: Handshake,
    title: "Industry Exposure",
    description:
      "Get noticed by sponsors and partners looking for fresh talent.",
  },
  {
    icon: PartyPopper,
    title: "Fun & Collaboration",
    description:
      "Two days of music, games, culture, and unforgettable memories.",
  },
];

const WhyAttend = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [-40, 80]);
  const headingScale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".why-attend-card",
        { autoAlpha: 0, y: 45, scale: 0.94 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            end: "top 30%",
            scrub: 0.8,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
    >
      <motion.div
        style={{ y: orbY }}
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[150px]"
      />
      <div className="container mx-auto relative z-10">
        <motion.div
          style={{ scale: headingScale }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm text-secondary uppercase tracking-widest mb-2">
            Don't Miss Out
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
            Why <span className="gradient-text glitch-text">Attend?</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              whileHover={{ scale: 1.03 }}
              className="why-attend-card flex gap-4 glass-card p-5 hover:border-secondary/30 transition-all duration-300 shimmer-card"
            >
              <r.icon size={24} className="text-secondary shrink-0 mt-1" />
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  {r.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {r.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyAttend;
