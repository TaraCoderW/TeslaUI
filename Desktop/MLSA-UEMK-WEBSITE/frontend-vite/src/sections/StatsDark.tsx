
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GaugeConfig {
  id: string;
  value: number;
  maxValue: number;
  suffix: string;
  label: string;
  sublabel: string;
  unit: string;
  glow: string;
  glowRgb: string;
  glowSecondary: string;
  tickColor: string;
  size: "hero" | "large" | "medium";
  delay: number;
  detail: string;
  subdetail: string;
}

// ─── Stats Data ───────────────────────────────────────────────────────────────

const GAUGES: GaugeConfig[] = [
  {
    id: "impressions",
    value: 25000,
    maxValue: 30000,
    suffix: "+",
    label: "REACH",
    sublabel: "IMPRESSIONS",
    unit: "VIEWS",
    glow: "#00d4ff",
    glowRgb: "0,212,255",
    glowSecondary: "#0099ff",
    tickColor: "#00aaff",
    size: "hero",
    delay: 0,
    detail: "25,000+",
    subdetail: "Across All Platforms",
  },
  {
    id: "candidates",
    value: 200,
    maxValue: 250,
    suffix: "+",
    label: "MEMBERS",
    sublabel: "SELECTED",
    unit: "PEOPLE",
    glow: "#a78bfa",
    glowRgb: "167,139,250",
    glowSecondary: "#7c3aed",
    tickColor: "#9b72f8",
    size: "large",
    delay: 200,
    detail: "200+",
    subdetail: "Verified & Onboarded",
  },
  {
    id: "colleges",
    value: 50,
    maxValue: 60,
    suffix: "+",
    label: "NETWORK",
    sublabel: "COLLEGES",
    unit: "INST.",
    glow: "#00ff88",
    glowRgb: "0,255,136",
    glowSecondary: "#00cc66",
    tickColor: "#00ee77",
    size: "medium",
    delay: 350,
    detail: "50+",
    subdetail: "IITs · NITs · BITs",
  },
  {
    id: "uptime",
    value: 99.9,
    maxValue: 100,
    suffix: "%",
    label: "UPTIME",
    sublabel: "PLATFORM",
    unit: "SLA",
    glow: "#ffd700",
    glowRgb: "255,215,0",
    glowSecondary: "#ff9900",
    tickColor: "#ffcc00",
    size: "medium",
    delay: 500,
    detail: "99.9%",
    subdetail: "Guaranteed SLA",
  },
];

// ─── Easing ───────────────────────────────────────────────────────────────────

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function useCountUp(target: number, duration: number, active: boolean) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    start.current = null;
    const tick = (ts: number) => {
      if (!start.current) start.current = ts;
      const p = Math.min((ts - start.current) / duration, 1);
      setVal(easeOutExpo(p) * target);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [active, target, duration]);
  return val;
}

// ─── Speedometer SVG ─────────────────────────────────────────────────────────

function Speedometer({
  gauge,
  progress,
  animated,
  hovered,
  size,
}: {
  gauge: GaugeConfig;
  progress: number; // 0–1
  animated: boolean;
  hovered: boolean;
  size: number;
}) {
  const cx = size / 2;
  const cy = size / 2 + size * 0.08;
  const r = size * 0.38;

  // Arc spans 220 degrees (from -200deg to 40deg in SVG coords)
  const START_DEG = 220; // clockwise from right=0
  const SWEEP_DEG = 220;
  const startRad = ((START_DEG - 180) * Math.PI) / 180; // negate for SVG
  const sweepRad = (SWEEP_DEG * Math.PI) / 180;

  const polarToXY = (angleDeg: number, radius: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const arcPath = (startDeg: number, endDeg: number, rad: number) => {
    const s = polarToXY(startDeg, rad);
    const e = polarToXY(endDeg, rad);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${rad} ${rad} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const arcStartDeg = 130; // bottom-left
  const arcEndDeg = 410;   // bottom-right
  const totalSweep = arcEndDeg - arcStartDeg; // 280 deg

  const fillEnd = arcStartDeg + totalSweep * Math.min(progress, 1);
  const bgPath = arcPath(arcStartDeg, arcEndDeg, r);
  const fillPath = progress > 0.01 ? arcPath(arcStartDeg, fillEnd, r) : null;

  // Needle
  const needleDeg = arcStartDeg + totalSweep * Math.min(progress, 1);
  const needleTip = polarToXY(needleDeg, r * 0.85);
  const needleBase1 = polarToXY(needleDeg + 90, r * 0.08);
  const needleBase2 = polarToXY(needleDeg - 90, r * 0.08);
  const centerBack = polarToXY(needleDeg + 180, r * 0.22);

  // Tick marks
  const ticks = [];
  const majorCount = 10;
  const minorCount = 5;
  for (let i = 0; i <= majorCount * minorCount; i++) {
    const frac = i / (majorCount * minorCount);
    const deg = arcStartDeg + totalSweep * frac;
    const isMajor = i % minorCount === 0;
    const outerR = r + (isMajor ? size * 0.035 : size * 0.02);
    const innerR = r - (isMajor ? size * 0.065 : size * 0.035);
    const outer = polarToXY(deg, outerR);
    const inner = polarToXY(deg, innerR);
    const isFilled = frac <= progress;
    ticks.push({ outer, inner, isMajor, isFilled, deg, frac });
  }

  // Major tick labels (0, 25, 50, 75, 100 percent of maxValue)
  const labels = [];
  for (let i = 0; i <= majorCount; i++) {
    const frac = i / majorCount;
    const deg = arcStartDeg + totalSweep * frac;
    const pos = polarToXY(deg, r - size * 0.15);
    const val = Math.round((gauge.maxValue * frac) / 100) * 100;
    // for small values keep it clean
    const displayVal = gauge.maxValue <= 100
      ? Math.round(gauge.maxValue * frac)
      : gauge.maxValue >= 1000
        ? `${Math.round((gauge.maxValue * frac) / 1000)}k`
        : Math.round(gauge.maxValue * frac);
    if (i % 2 === 0) labels.push({ pos, val: displayVal, frac });
  }

  const glowId = `glow-${gauge.id}`;
  const arcGradId = `arcgrad-${gauge.id}`;
  const bgGradId = `bgrad-${gauge.id}`;
  const needleGradId = `ngrad-${gauge.id}`;
  const innerGlowId = `iglow-${gauge.id}`;

  return (
    <svg
      width={size}
      height={size * 0.78}
      viewBox={`0 0 ${size} ${size * 0.78}`}
      style={{ overflow: "visible", display: "block" }}
    >
      <defs>
        {/* Arc glow filter */}
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={hovered ? "5" : "3"} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Arc fill gradient */}
        <linearGradient id={arcGradId} gradientUnits="userSpaceOnUse"
          x1={polarToXY(arcStartDeg, r).x} y1={polarToXY(arcStartDeg, r).y}
          x2={polarToXY(arcEndDeg, r).x} y2={polarToXY(arcEndDeg, r).y}
        >
          <stop offset="0%" stopColor={gauge.glowSecondary} stopOpacity="0.9" />
          <stop offset="60%" stopColor={gauge.glow} stopOpacity="1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
        </linearGradient>
        {/* Background arc gradient */}
        <linearGradient id={bgGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
        </linearGradient>
        {/* Needle gradient */}
        <linearGradient id={needleGradId} gradientUnits="userSpaceOnUse"
          x1={centerBack.x} y1={centerBack.y}
          x2={needleTip.x} y2={needleTip.y}
        >
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        {/* Inner glow for center circle */}
        <radialGradient id={innerGlowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={gauge.glow} stopOpacity="0.4" />
          <stop offset="100%" stopColor={gauge.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Outer decorative ring ── */}
      <circle
        cx={cx} cy={cy} r={r + size * 0.075}
        fill="none"
        stroke={`rgba(${gauge.glowRgb},${hovered ? 0.15 : 0.07})`}
        strokeWidth="1"
        strokeDasharray="4 6"
      />
      <circle
        cx={cx} cy={cy} r={r + size * 0.11}
        fill="none"
        stroke={`rgba(${gauge.glowRgb},${hovered ? 0.08 : 0.04})`}
        strokeWidth="0.5"
      />

      {/* ── Background arc ── */}
      <path
        d={bgPath}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={size * 0.045}
        strokeLinecap="round"
      />

      {/* ── Filled arc (the glowing energy bar) ── */}
      {fillPath && (
        <path
          d={fillPath}
          fill="none"
          stroke={`url(#${arcGradId})`}
          strokeWidth={size * 0.045}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          style={{ transition: "none" }}
        />
      )}

      {/* ── Tick marks ── */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.outer.x} y1={t.outer.y}
          x2={t.inner.x} y2={t.inner.y}
          stroke={
            t.isFilled
              ? t.frac > 0.85
                ? gauge.glow
                : `rgba(${gauge.glowRgb},0.7)`
              : "rgba(255,255,255,0.12)"
          }
          strokeWidth={t.isMajor ? size * 0.012 : size * 0.006}
          strokeLinecap="round"
          filter={t.isFilled && t.isMajor ? `url(#${glowId})` : undefined}
        />
      ))}

      {/* ── Tick labels ── */}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.pos.x} y={l.pos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill={l.frac <= progress ? `rgba(${gauge.glowRgb},0.85)` : "rgba(255,255,255,0.2)"}
          fontSize={size * 0.048}
          fontWeight="700"
          fontFamily="'Barlow Condensed', sans-serif"
          letterSpacing="0.5"
        >
          {l.val}
        </text>
      ))}

      {/* ── Needle glow halo ── */}
      <circle
        cx={needleTip.x} cy={needleTip.y}
        r={size * 0.03}
        fill={gauge.glow}
        filter={`url(#${glowId})`}
        opacity={0.6}
      />

      {/* ── Needle ── */}
      <polygon
        points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${centerBack.x},${centerBack.y} ${needleBase2.x},${needleBase2.y}`}
        fill={`url(#${needleGradId})`}
        filter={`url(#${glowId})`}
        opacity={0.92}
      />

      {/* ── Center hub ── */}
      <circle cx={cx} cy={cy} r={size * 0.065}
        fill={`url(#${innerGlowId})`}
        opacity={0.8}
      />
      <circle cx={cx} cy={cy} r={size * 0.04}
        fill="#0a0f1e"
        stroke={gauge.glow}
        strokeWidth="1.5"
        filter={`url(#${glowId})`}
      />
      <circle cx={cx} cy={cy} r={size * 0.018}
        fill={gauge.glow}
        filter={`url(#${glowId})`}
      />

      {/* ── Unit label arc bottom ── */}
      <text
        x={cx} y={cy + r * 0.35}
        textAnchor="middle"
        fill={`rgba(${gauge.glowRgb},0.55)`}
        fontSize={size * 0.038}
        fontWeight="800"
        fontFamily="'Barlow Condensed', sans-serif"
        letterSpacing="3"
      >
        {gauge.unit}
      </text>
    </svg>
  );
}

// ─── Individual Gauge Card ────────────────────────────────────────────────────

function GaugeCard({ gauge }: { gauge: GaugeConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const count = useCountUp(gauge.value, 2400, visible);
  const progress = useCountUp(1, 2600, visible); // 0→1 for arc

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), gauge.delay); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [gauge.delay]);

  const isHero = gauge.size === "hero";
  const isLarge = gauge.size === "large";
  const svgSize = isHero ? 280 : isLarge ? 220 : 180;

  const displayVal = gauge.suffix === "%"
    ? count.toFixed(1)
    : gauge.value >= 1000
      ? Math.floor(count).toLocaleString()
      : Math.floor(count).toString();

  const valueProgress = gauge.value / gauge.maxValue;
  const animProgress = progress * valueProgress;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: gauge.delay / 1000 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ height: "100%" }}
    >
      <div style={{
        position: "relative",
        height: "100%",
        borderRadius: "24px",
        background: hovered
          ? `radial-gradient(ellipse at 50% 0%, rgba(${gauge.glowRgb},0.12) 0%, rgba(6,10,26,0.96) 60%)`
          : "rgba(6,10,26,0.92)",
        border: `1px solid rgba(${gauge.glowRgb},${hovered ? 0.35 : 0.12})`,
        boxShadow: hovered
          ? `0 0 0 1px rgba(${gauge.glowRgb},0.2), 0 30px 80px rgba(0,0,0,0.7), 0 0 80px rgba(${gauge.glowRgb},0.08), inset 0 1px 0 rgba(${gauge.glowRgb},0.1)`
          : `0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)`,
        transition: "all 0.45s cubic-bezier(0.22,1,0.36,1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: isHero ? "32px 28px 28px" : "24px 20px 20px",
        overflow: "hidden",
        cursor: "default",
      }}>

        {/* Top accent glow line */}
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: "2px",
          background: `linear-gradient(90deg, transparent, ${gauge.glow}, transparent)`,
          opacity: hovered ? 1 : 0.4,
          transition: "opacity 0.4s ease",
          filter: `blur(1px)`,
        }} />

        {/* Corner bracket TL */}
        <div style={{ position: "absolute", top: 12, left: 12, width: 18, height: 18,
          borderTop: `1.5px solid rgba(${gauge.glowRgb},${hovered ? 0.7 : 0.25})`,
          borderLeft: `1.5px solid rgba(${gauge.glowRgb},${hovered ? 0.7 : 0.25})`,
          borderRadius: "3px 0 0 0", transition: "border-color 0.3s" }} />
        {/* Corner bracket TR */}
        <div style={{ position: "absolute", top: 12, right: 12, width: 18, height: 18,
          borderTop: `1.5px solid rgba(${gauge.glowRgb},${hovered ? 0.7 : 0.25})`,
          borderRight: `1.5px solid rgba(${gauge.glowRgb},${hovered ? 0.7 : 0.25})`,
          borderRadius: "0 3px 0 0", transition: "border-color 0.3s" }} />
        {/* Corner bracket BL */}
        <div style={{ position: "absolute", bottom: 12, left: 12, width: 18, height: 18,
          borderBottom: `1.5px solid rgba(${gauge.glowRgb},${hovered ? 0.7 : 0.25})`,
          borderLeft: `1.5px solid rgba(${gauge.glowRgb},${hovered ? 0.7 : 0.25})`,
          borderRadius: "0 0 0 3px", transition: "border-color 0.3s" }} />
        {/* Corner bracket BR */}
        <div style={{ position: "absolute", bottom: 12, right: 12, width: 18, height: 18,
          borderBottom: `1.5px solid rgba(${gauge.glowRgb},${hovered ? 0.7 : 0.25})`,
          borderRight: `1.5px solid rgba(${gauge.glowRgb},${hovered ? 0.7 : 0.25})`,
          borderRadius: "0 0 3px 0", transition: "border-color 0.3s" }} />

        {/* Ambient radial glow under meter */}
        <div style={{
          position: "absolute",
          bottom: "25%", left: "50%",
          transform: "translateX(-50%)",
          width: svgSize * 1.4,
          height: svgSize * 0.8,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(${gauge.glowRgb},${hovered ? 0.18 : 0.08}) 0%, transparent 70%)`,
          filter: "blur(20px)",
          transition: "opacity 0.5s ease",
          pointerEvents: "none",
        }} />

        {/* ── Label header ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: isHero ? 10 : 8,
          zIndex: 2,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: gauge.glow,
            boxShadow: `0 0 8px ${gauge.glow}, 0 0 16px rgba(${gauge.glowRgb},0.5)`,
            animation: "gaugePulse 2s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: isHero ? "11px" : "10px",
            fontWeight: 800,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: `rgba(${gauge.glowRgb},0.9)`,
          }}>
            {gauge.label}
          </span>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "9px", fontWeight: 700,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
          }}>
            / {gauge.sublabel}
          </span>
        </div>

        {/* ── Speedometer SVG ── */}
        <div style={{ position: "relative", zIndex: 2, marginBottom: isHero ? -8 : -4 }}>
          <Speedometer
            gauge={gauge}
            progress={animProgress}
            animated={visible}
            hovered={hovered}
            size={svgSize}
          />
        </div>

        {/* ── Big value display ── */}
        <div style={{
          position: "relative", zIndex: 2,
          textAlign: "center",
          marginTop: isHero ? 4 : 2,
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: isHero ? "clamp(52px,7vw,72px)" : isLarge ? "clamp(40px,5vw,54px)" : "clamp(32px,4vw,44px)",
            lineHeight: 1,
            letterSpacing: "-1px",
            color: "#ffffff",
            textShadow: hovered
              ? `0 0 30px rgba(${gauge.glowRgb},0.9), 0 0 60px rgba(${gauge.glowRgb},0.4), 0 0 100px rgba(${gauge.glowRgb},0.2)`
              : `0 0 20px rgba(${gauge.glowRgb},0.5)`,
            transition: "text-shadow 0.4s ease",
          }}>
            {displayVal}
            <span style={{
              fontSize: "55%",
              color: gauge.glow,
              marginLeft: "2px",
              textShadow: `0 0 15px rgba(${gauge.glowRgb},0.8)`,
            }}>{gauge.suffix}</span>
          </div>

          <div style={{
            marginTop: 6,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: isHero ? "13px" : "11px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
          }}>
            {gauge.subdetail}
          </div>
        </div>

        {/* ── Progress bar strip ── */}
        <div style={{
          position: "relative", zIndex: 2,
          width: "85%", height: "3px",
          borderRadius: "2px",
          background: "rgba(255,255,255,0.06)",
          marginTop: isHero ? 14 : 10,
          overflow: "hidden",
        }}>
          <motion.div
            initial={{ width: "0%" }}
            animate={visible ? { width: `${valueProgress * 100}%` } : {}}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay: (gauge.delay + 200) / 1000 }}
            style={{
              height: "100%",
              borderRadius: "2px",
              background: `linear-gradient(90deg, ${gauge.glowSecondary}, ${gauge.glow}, rgba(255,255,255,0.9))`,
              boxShadow: `0 0 8px rgba(${gauge.glowRgb},0.8)`,
            }}
          />
        </div>

        {/* Percentage fraction label */}
        <div style={{
          marginTop: 5, zIndex: 2,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "9px", fontWeight: 700,
          letterSpacing: "0.18em",
          color: `rgba(${gauge.glowRgb},0.5)`,
          textTransform: "uppercase",
        }}>
          {Math.round(valueProgress * 100)}% OF TARGET
        </div>
      </div>
    </motion.div>
  );
}

// ─── Cinematic Background ─────────────────────────────────────────────────────

function CinematicBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, raf = 0, t = 0;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.2,
      a: 0.1 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.008 + Math.random() * 0.015,
    }));

    // Scanning horizontal lines
    const scanlines = Array.from({ length: 5 }, (_, i) => ({
      y: Math.random(),
      speed: 0.0003 + Math.random() * 0.0005,
      alpha: 0.04 + Math.random() * 0.06,
      color: ["#00d4ff", "#a78bfa", "#00ff88", "#ffd700", "#0099ff"][i],
    }));

    function resize() {
      if (!canvas) return;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * Math.min(devicePixelRatio, 2);
      canvas.height = H * Math.min(devicePixelRatio, 2);
      ctx.scale(Math.min(devicePixelRatio, 2), Math.min(devicePixelRatio, 2));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      // Stars
      stars.forEach(s => {
        const a = s.a * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${a})`;
        ctx.fill();
      });

      // Scanning lines (horizontal streaks across the section)
      scanlines.forEach(sl => {
        sl.y = (sl.y + sl.speed) % 1;
        const y = sl.y * H;
        const grd = ctx.createLinearGradient(0, y, W, y);
        grd.addColorStop(0, "transparent");
        grd.addColorStop(0.3, sl.color + "00");
        grd.addColorStop(0.5, sl.color + Math.round(sl.alpha * 255).toString(16).padStart(2, "0"));
        grd.addColorStop(0.7, sl.color + "00");
        grd.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // raf = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function Header({ visible }: { visible: boolean }) {
  return (
    <div style={{
      textAlign: "center",
      marginBottom: "60px",
      position: "relative", zIndex: 2,
    }}>
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "6px 20px", borderRadius: "50px",
          background: "rgba(0,212,255,0.07)",
          border: "1px solid rgba(0,212,255,0.2)",
          marginBottom: 20,
        }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#00d4ff",
          boxShadow: "0 0 8px #00d4ff",
          display: "inline-block",
          animation: "gaugePulse 2s ease-in-out infinite",
        }} />
        <span style={{
          fontSize: "10px", fontWeight: 800,
          letterSpacing: "0.26em", textTransform: "uppercase",
          color: "#00d4ff",
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          MLSA UEMK · LIVE METRICS
        </span>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#00d4ff",
          boxShadow: "0 0 8px #00d4ff",
          display: "inline-block",
          animation: "gaugePulse 2s ease-in-out infinite",
          animationDelay: "1s",
        }} />
      </motion.div>

      {/* Main title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{
          margin: "0 0 12px",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(52px, 8vw, 96px)",
          letterSpacing: "0.06em",
          lineHeight: 0.92,
          textTransform: "uppercase",
          color: "#ffffff",
          textShadow: "0 0 40px rgba(0,212,255,0.3)",
        }}
      >
        OUR{" "}
        <span style={{
          background: "linear-gradient(90deg, #00d4ff 0%, #0099ff 40%, #a78bfa 80%, #00d4ff 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmerText 4s linear infinite",
          display: "inline-block",
        }}>
          IMPACT
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "14px",
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Real-time Platform Data · Season 2025–26
      </motion.p>
    </div>
  );
}

// ─── Status Strip ─────────────────────────────────────────────────────────────

function StatusStrip({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={visible ? { opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: 1.2 }}
      style={{
        marginTop: 40,
        padding: "12px 28px",
        borderRadius: 8,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", gap: 14,
        width: "100%", maxWidth: 900,
        position: "relative", zIndex: 2,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {[
        { label: "PLATFORM", ok: true, color: "#00ff88" },
        { label: "API", ok: true, color: "#00d4ff" },
        { label: "DATABASE", ok: true, color: "#a78bfa" },
      ].map(({ label, ok, color }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 5, height: 5, borderRadius: "50%",
            background: color,
            boxShadow: `0 0 6px ${color}`,
            animation: "gaugePulse 2s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "10px", fontWeight: 700,
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
          }}>
            {label} <span style={{ color }}>ONLINE</span>
          </span>
        </div>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "10px", letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.2)", textTransform: "uppercase",
        }}>
          © MLSA UEMK · 2025–26 · ALL SYSTEMS GO
        </span>
      </div>
    </motion.div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function StatsDark() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [sectionVisible, setSectionVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setSectionVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const hero = GAUGES[0];
  const rest = GAUGES.slice(1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&display=swap');

        @keyframes gaugePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(0.85); }
        }
        @keyframes shimmerText {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes scanDown {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }

        .stats-dark * { box-sizing: border-box; }

        /* ── Responsive grid ── */
        .gauge-grid-hero {
          display: grid;
          grid-template-columns: 1.1fr 1fr 1fr 1fr;
          gap: 20px;
          width: 100%;
          max-width: 1080px;
        }
        .gauge-hero-cell { grid-column: 1; grid-row: 1; }
        .gauge-right-col {
          grid-column: 2 / 5;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 900px) {
          .gauge-grid-hero {
            grid-template-columns: 1fr 1fr;
          }
          .gauge-hero-cell { grid-column: 1 / 3; }
          .gauge-right-col {
            grid-column: 1 / 3;
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
        @media (max-width: 600px) {
          .gauge-grid-hero {
            grid-template-columns: 1fr;
          }
          .gauge-hero-cell { grid-column: 1; }
          .gauge-right-col {
            grid-column: 1;
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="stats-dark"
        style={{
          position: "relative",
          background: "linear-gradient(160deg, #010308 0%, #030b1a 35%, #040d20 65%, #010308 100%)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px 80px",
          overflow: "hidden",
          fontFamily: "'Barlow Condensed', sans-serif",
        }}
      >
        {/* Cinematic canvas bg */}
        <CinematicBg />

        {/* Grid lines overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: [
            "linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)",
          ].join(","),
          backgroundSize: "60px 60px",
        }} />

        {/* Vignette */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }} />

        {/* Big ambient orbs */}
        <div style={{
          position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)",
          width: 800, height: 500, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,150,255,0.06) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", left: "15%",
          width: 400, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(167,139,250,0.06) 0%, transparent 70%)",
          filter: "blur(50px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", right: "10%",
          width: 350, height: 280, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,255,136,0.04) 0%, transparent 70%)",
          filter: "blur(50px)", pointerEvents: "none",
        }} />

        <Header visible={sectionVisible} />

        {/* ── Main gauge layout ── */}
        <div className="gauge-grid-hero" style={{ position: "relative", zIndex: 2 }}>
          {/* Hero gauge */}
          <div className="gauge-hero-cell">
            <GaugeCard gauge={hero} />
          </div>
          {/* 3 smaller gauges */}
          <div className="gauge-right-col">
            {rest.map(g => (
              <GaugeCard key={g.id} gauge={g} />
            ))}
          </div>
        </div>

        <StatusStrip visible={sectionVisible} />
      </section>
    </>
  );
}