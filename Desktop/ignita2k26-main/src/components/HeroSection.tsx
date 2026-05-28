import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CountdownTimer from "./CountdownTimer";
import FloatingBadges from "./FloatingBadges";
import RAOneScene from "./RAOneCharacter";

gsap.registerPlugin(ScrollTrigger);

const tagline = "Igniting Innovation, Creativity & Competition";

const HeroSection = () => {
  const [typedText, setTypedText] = useState("");
  const pinRef = useRef<HTMLDivElement>(null);
  const revealLayerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ringInnerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const centerTextRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (
      !pinRef.current ||
      !revealLayerRef.current ||
      !ringRef.current ||
      !ringInnerRef.current ||
      !heroContentRef.current ||
      !centerTextRef.current
    )
      return;

    // GSAP needs the pinned element to be overflow: visible
    // The clip-path / ring elements inside handle their own clipping
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=1000",
          pin: true,          // pins pinRef in place
          pinSpacing: true,   // adds scroll distance after the pin
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      // ① Ring + clip-path expand together
      tl.to(
        revealLayerRef.current,
        {
          clipPath: "circle(150% at 50% 50%)",
          ease: "power2.inOut",
        },
        0
      )
        .to(
          ringRef.current,
          { scale: 9, opacity: 0, ease: "power2.inOut" },
          0
        )
        .to(
          ringInnerRef.current,
          { scale: 7.5, opacity: 0, ease: "power2.inOut" },
          0
        )
        // ② Center text (inside ring) fades out quickly
        .to(
          centerTextRef.current,
          { opacity: 0, scale: 1.3, ease: "power1.in", duration: 0.15 },
          0
        )
        // ③ Full hero content fades in as circle opens
        .fromTo(
          heroContentRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.25 },
          0.2
        );
    });

    return () => ctx.revert();
  }, []);

  // Typewriter for tagline
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= tagline.length) {
        setTypedText(tagline.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 15);
    return () => clearInterval(timer);
  }, []);

  return (
    /*
     * pinRef — this div is what GSAP pins.
     * CRITICAL: must NOT have overflow:hidden, GSAP needs free flow.
     * Height = 100vh so it fills the viewport when pinned.
     */
    <div
      ref={pinRef}
      style={{ position: "relative", width: "100%", height: "100vh" }}
    >
      {/* ── STATIC BG (always shown, behind everything) ── */}
      <div
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
        className="bg-background"
      >
        <RAOneScene />
        {/* Arc Reactor orb behind heading */}
        <div
          className="arc-reactor"
          style={{ width: 700, height: 700, top: "50%", left: "50%", transform: "translate(-50%, -55%)" }}
        />
        <div
          className="arc-reactor-core"
          style={{ width: 160, height: 160 }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-[140px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/8 blur-[120px] animate-pulse-glow"
          style={{ animationDelay: "1.2s" }}
        />
      </div>

      {/* ── NEON OUTER RING ── */}
      <div
        ref={ringRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "clamp(280px, 36vw, 420px)",
          height: "clamp(280px, 36vw, 420px)",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: "2px solid hsl(0 95% 60% / 0.95)",
          boxShadow:
            "0 0 24px hsl(0 95% 60% / 0.8), 0 0 70px hsl(0 95% 60% / 0.4), 0 0 140px hsl(0 95% 60% / 0.15), inset 0 0 24px hsl(0 95% 60% / 0.08)",
          zIndex: 15,
          pointerEvents: "none",
          transformOrigin: "center center",
          willChange: "transform, opacity",
        }}
      />

      {/* ── NEON INNER RING ── */}
      <div
        ref={ringInnerRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "clamp(210px, 27vw, 315px)",
          height: "clamp(210px, 27vw, 315px)",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: "1px solid hsl(15 85% 55% / 0.55)",
          boxShadow:
            "0 0 16px hsl(15 85% 55% / 0.45), 0 0 50px hsl(15 85% 55% / 0.2)",
          zIndex: 15,
          pointerEvents: "none",
          transformOrigin: "center center",
          willChange: "transform, opacity",
        }}
      />

      {/* ── CENTER TEXT (IGNITIA 2K26 — visible inside ring before scroll) ── */}
      <div
        ref={centerTextRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 20,
          textAlign: "center",
          pointerEvents: "auto",
          cursor: "default",
          willChange: "opacity, transform",
          width: "max-content",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.65 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-2"
        >
          <div className="inline-flex items-center gap-2 text-[10px] text-white/45 uppercase tracking-[0.28em]">
            <Sparkles size={10} className="text-primary" />
            <span>Scroll to Reveal</span>
          </div>
          <motion.h1
            className="font-heading font-bold leading-[1.05] tracking-tight select-none"
            style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}
            whileHover={{ 
              scale: 1.08,
              rotate: [0, -1, 1, -1, 0],
              transition: { duration: 0.3 }
            }}
          >
            <span
              className="gradient-text block relative"
              style={{
                filter:
                  "drop-shadow(0 0 18px hsl(0 95% 60% / 0.85))",
              }}
            >
              IGNITIA
            </span>
            <span className="text-white/90 block">2K26</span>
          </motion.h1>
          <p className="text-white/35 text-[11px] tracking-[0.22em] uppercase mt-1">
            Aug 1–2 · UEM Kolkata
          </p>
        </motion.div>
      </div>

      {/* ── REVEAL LAYER: clip-path circle that expands on scroll ── */}
      <div
        ref={revealLayerRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          clipPath: "circle(18vw at 50% 50%)",
          willChange: "clip-path",
        }}
      >
        {/* Rich bg inside the clip */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/12 blur-[180px] animate-pulse-glow" />
          <div
            className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-secondary/12 blur-[150px] animate-pulse-glow"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <FloatingBadges />

        {/* Full hero content — fades in as circle expands */}
        <div
          ref={heroContentRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            willChange: "opacity, transform",
          }}
        >
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="flex flex-col items-center gap-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm text-muted-foreground">
                <Sparkles
                  size={14}
                  className="text-primary animate-spin"
                  style={{ animationDuration: "3s" }}
                />
                <span>IEM-UEM groups × UEM Kolkata</span>
              </div>

              {/* Main Title */}
              <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-bold tracking-tight leading-none">
                <span className="gradient-text text-glow-blue">IGNITIA</span>{" "}
                <span className="text-foreground">2K26</span>
              </h1>

              {/* Typewriter tagline */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl h-8">
                {typedText}
                <span className="animate-blink ml-0.5 text-primary">|</span>
              </p>

              {/* Date & Location */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="glass-card px-3 py-1 shimmer-card">
                  📅 1st &amp; 2nd August 2026
                </span>
                <span className="glass-card px-3 py-1 shimmer-card">
                  📍 UEM Kolkata
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <a
                  href="#register"
                  className="glow-button pulse-cta cta-sweep inline-flex items-center gap-2 ripple-button"
                >
                  Register Now <ArrowRight size={18} />
                </a>
                <a
                  href="#events"
                  className="glow-button-secondary inline-flex items-center gap-2 ripple-button"
                >
                  Explore Events
                </a>
              </div>

              {/* Countdown Timer */}
              <div className="w-full">
                <CountdownTimer embedded />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "8rem",
          background:
            "linear-gradient(to top, hsl(var(--background)), transparent)",
          zIndex: 30,
          pointerEvents: "none",
        }}
      />

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 35,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          pointerEvents: "none",
        }}
        className="text-white/30 text-[10px] uppercase tracking-widest"
      >
        <span>scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ width: "1px", height: "24px", background: "hsl(0 0% 100% / 0.2)" }}
        />
      </motion.div>
    </div>
  );
};

export default HeroSection;
