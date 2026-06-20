
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface EventCardProps {
  badge: string;
  badgeVariant: "ongoing" | "upcoming" | "community" | "future";
  title: string;
  meta: string;
  date: string;
  accentGradient: string;
  placeholderBg: string;
  placeholderStroke: string;
  icon: React.ReactNode;
  direction?: "left" | "right";
  delay?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge styles (all inline to avoid Tailwind JIT purge issues)
// ─────────────────────────────────────────────────────────────────────────────

const badgeStyle: Record<EventCardProps["badgeVariant"], React.CSSProperties> = {
  ongoing: {
    background: "rgba(0,180,255,0.15)",
    color: "#00B4FF",
    border: "1px solid rgba(0,180,255,0.25)",
  },
  upcoming: {
    background: "rgba(170,68,255,0.15)",
    color: "#AA44FF",
    border: "1px solid rgba(170,68,255,0.25)",
  },
  community: {
    background: "rgba(127,186,0,0.15)",
    color: "#7FBA00",
    border: "1px solid rgba(127,186,0,0.25)",
  },
  future: {
    background: "rgba(255,185,0,0.12)",
    color: "#FFB900",
    border: "1px solid rgba(255,185,0,0.25)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────────────────────────────────────

const IconHackathon = ({ color }: { color: string }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} style={{ opacity: 0.5 }}>
    <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const IconTeam = ({ color }: { color: string }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} style={{ opacity: 0.5 }}>
    <path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
  </svg>
);

const IconWorkshop = ({ color }: { color: string }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} style={{ opacity: 0.5 }}>
    <path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
  </svg>
);

const IconICPC = ({ color }: { color: string }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} style={{ opacity: 0.5 }}>
    <path d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.496m0 0-.171.9M7.5 15.375l.43-2.587.171-.9m0 0A3.375 3.375 0 0 1 12 9c1.856 0 3.376 1.5 3.376 3.375" />
  </svg>
);

const IconDiscord = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.042.032.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
  </svg>
);

const IconDevfolio = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.5 2H2l3 7H2l7 13 3-7h3L8 2z" />
    <path d="M18 2h-4l-3 7h3l-7 13 7-4 3-7h-3z" opacity={0.6} />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Microsoft Logo
// ─────────────────────────────────────────────────────────────────────────────

const MicrosoftLogo = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "3px",
      width: "36px",
      height: "36px",
      flexShrink: 0,
    }}
  >
    <span style={{ borderRadius: "2px", background: "#F25022", display: "block" }} />
    <span style={{ borderRadius: "2px", background: "#7FBA00", display: "block" }} />
    <span style={{ borderRadius: "2px", background: "#00A4EF", display: "block" }} />
    <span style={{ borderRadius: "2px", background: "#FFB900", display: "block" }} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Particle Canvas
// ─────────────────────────────────────────────────────────────────────────────

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Particle = { x: number; y: number; size: number; speed: number; color: string };
    const colors = ["#00B4FF", "#0066FF", "#AA44FF", "#7FBA00"];
    const particles: Particle[] = Array.from({ length: 20 }, () => ({
      x: Math.random() * (canvas.width || 1440),
      y: Math.random() * (canvas.height || 900),
      size: 1 + Math.random() * 2,
      speed: 0.3 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "99";
        ctx.fill();
      });
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bot Zone
// ─────────────────────────────────────────────────────────────────────────────

function BotZone({ children }: { children?: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: "200px",
        height: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 32px",
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "1px dashed rgba(0,180,255,0.2)",
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          inset: "10px",
          borderRadius: "50%",
          border: "1px dashed rgba(0,180,255,0.1)",
        }}
      />
      <div
        style={{
          width: "130px",
          height: "130px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,100,255,0.18) 0%, transparent 70%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children ?? (
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(0,180,255,0.35)",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Your Bot Here
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Card
// ─────────────────────────────────────────────────────────────────────────────

function EventCard({
  badge,
  badgeVariant,
  title,
  meta,
  date,
  accentGradient,
  placeholderBg,
  placeholderStroke,
  icon,
  direction = "left",
  delay = 0,
}: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "left" ? -24 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      style={{
        width: "210px",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(16px)",
        transition: "border-color 0.3s, background 0.3s, box-shadow 0.3s",
        flexShrink: 0,
      }}
    >
      {/* Accent line */}
      <div style={{ height: "2px", width: "100%", background: accentGradient }} />

      {/* Image placeholder */}
      <div
        style={{
          width: "100%",
          height: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background: placeholderBg,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Re-render icon with stroke from placeholderStroke */}
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={placeholderStroke} strokeWidth={1.5} style={{ opacity: 0.55 }}>
            {icon}
          </svg>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px 14px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: "20px",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "8px",
            ...badgeStyle[badgeVariant],
          }}
        >
          {badge}
        </span>
        <p style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1.3, marginBottom: "3px", margin: "0 0 3px" }}>
          {title}
        </p>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", lineHeight: 1.4, margin: 0 }}>{meta}</p>
        <p style={{ marginTop: "8px", fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.28)", letterSpacing: "0.05em", margin: "8px 0 0" }}>
          {date}
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Nav items config
// ─────────────────────────────────────────────────────────────────────────────

const navItems = [
  { label: "Team",     color: "#00B4FF", bg: "rgba(0,180,255,0.08)",   border: "rgba(0,180,255,0.35)",   shadow: "rgba(0,180,255,0.15)" },
  { label: "Events",   color: "#7FBA00", bg: "rgba(127,186,0,0.08)",   border: "rgba(127,186,0,0.35)",   shadow: "rgba(127,186,0,0.15)" },
  { label: "Gallery",  color: "#FFB900", bg: "rgba(255,185,0,0.08)",   border: "rgba(255,185,0,0.35)",   shadow: "rgba(255,185,0,0.15)" },
  { label: "Projects", color: "#F25022", bg: "rgba(242,80,34,0.08)",   border: "rgba(242,80,34,0.35)",   shadow: "rgba(242,80,34,0.15)" },
  { label: "Contact",  color: "#AA44FF", bg: "rgba(170,68,255,0.08)",  border: "rgba(170,68,255,0.35)",  shadow: "rgba(170,68,255,0.15)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Hero (main export)
// ─────────────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <>
      {/* ── Font import — put this in your layout.tsx <head> instead ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap');
        .mss-hero { font-family: 'Barlow', sans-serif; }
        .mss-hero * { box-sizing: border-box; }
        .mss-navlink { text-decoration: none; }
        .mss-navlink:hover { text-decoration: none; }
        .mss-card-hover:hover {
          border-color: rgba(255,255,255,0.2) !important;
          background: rgba(255,255,255,0.06) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5) !important;
        }
      `}</style>

      <section
        className="mss-hero"
        style={{
          position: "relative",
          width: "100%",
          minHeight: "85vh",
          background: "#050A12",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Background: grid ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,120,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,120,255,0.04) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
            pointerEvents: "none",
          }}
        />

        {/* ── Background: glows ── */}
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px", height: "800px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,100,255,0.13) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-10%", right: "5%",
            width: "480px", height: "480px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,180,255,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%", left: "5%",
            width: "380px", height: "380px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(100,0,255,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Scanlines ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.012) 2px, rgba(0,0,0,0.012) 4px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* ── Particles ── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
          <ParticleField />
        </div>

        {/* ══════════════════════════════════════════
            NAVBAR
        ══════════════════════════════════════════ */}
        <nav
          style={{
            position: "relative",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 48px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}
          >
            <MicrosoftLogo />
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1 }}>
                MSS UEMK
              </p>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(0,180,255,0.7)", margin: "3px 0 0", lineHeight: 1 }}>
                UEM Kolkata
              </p>
            </div>
          </motion.div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {navItems.map((item, i) => (
              <motion.a
                key={item.label}
                href="#"
                className="mss-navlink"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
                whileHover={{
                  color: item.color,
                  backgroundColor: item.bg,
                  borderColor: item.border,
                  boxShadow: `0 0 14px ${item.shadow}`,
                }}
                style={{
                  display: "block",
                  padding: "8px 16px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  borderRadius: "6px",
                  border: "1px solid transparent",
                  transition: "all 0.22s ease",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </motion.a>
            ))}
          </div>

          {/* Season tag */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 600, flexShrink: 0 }}
          >
            Season II
          </motion.span>
        </nav>

        {/* ══════════════════════════════════════════
            3-COLUMN MAIN AREA
        ══════════════════════════════════════════ */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "grid",
            gridTemplateColumns: "1fr 2fr 1fr",
            flex: 1,
            alignItems: "center",
            padding: "40px 0",
            minHeight: 0,
          }}
        >
          {/* ── LEFT column ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              paddingLeft: "48px",
              paddingRight: "20px",
              alignItems: "flex-start",
            }}
          >
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{ fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(0,180,255,0.4)", fontWeight: 700, margin: 0 }}
            >
              ● Live Now
            </motion.p>

            <EventCard
              badge="Ongoing"
              badgeVariant="ongoing"
              title="Hackathon 3.0"
              meta="24-hr innovation sprint"
              date="June 5–6, 2026"
              accentGradient="linear-gradient(90deg, #00B4FF, #0066FF)"
              placeholderBg="linear-gradient(135deg, rgba(0,100,255,0.3), rgba(0,180,255,0.12))"
              placeholderStroke="#00B4FF"
              icon={<path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />}
              direction="left"
              delay={0.4}
            />

            <EventCard
              badge="Recruitment"
              badgeVariant="community"
              title="Open Applications"
              meta="Join the core team"
              date="Closes June 15, 2026"
              accentGradient="linear-gradient(90deg, #7FBA00, #00B4FF)"
              placeholderBg="linear-gradient(135deg, rgba(0,150,0,0.28), rgba(127,186,0,0.12))"
              placeholderStroke="#7FBA00"
              icon={<path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />}
              direction="left"
              delay={0.55}
            />
          </div>

          {/* ── CENTRE column ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 24px",
            }}
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "center" }}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00B4FF", display: "inline-block", flexShrink: 0 }}
              />
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(0,180,255,0.6)" }}>
                UEM Kolkata Society
              </span>
              <span style={{ color: "rgba(0,180,255,0.4)", fontSize: "10px" }}>·</span>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(0,180,255,0.6)" }}>
                Excellence &amp; Intelligence
              </span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00B4FF", display: "inline-block", flexShrink: 0 }}
              />
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "80px",
                lineHeight: 0.92,
                letterSpacing: "0.02em",
                margin: "0 0 10px",
                padding: 0,
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#ffffff",
                  textShadow: "0 0 60px rgba(0,100,255,0.3)",
                }}
              >
                MICROSOFT STUDENT
              </span>
              <span
                style={{
                  display: "block",
                  background: "linear-gradient(90deg, #00B4FF 0%, #0066FF 40%, #AA44FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                SOCIETY CHAPTER
              </span>
            </motion.h1>

            {/* Sub-label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", fontWeight: 600, margin: "0 0 28px" }}
            >
              UEMK · Kolkata · Est. 2021
            </motion.p>

            {/* Bot zone */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.8 }}
              style={{ width: "100%" }}
            >
              <BotZone />
              {/*
                To use your bot, replace <BotZone /> with:
                <BotZone>
                  <YourBotComponent />
                </BotZone>
              */}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}
            >
              <motion.button
                whileHover={{ y: -2, boxShadow: "0 0 40px rgba(0,100,255,0.5)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 28px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #0066FF, #00B4FF)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 24px rgba(0,100,255,0.35)",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                <IconDevfolio />
                Apply on Devfolio
              </motion.button>

              <motion.button
                whileHover={{
                  y: -2,
                  backgroundColor: "rgba(88,101,242,0.28)",
                  borderColor: "rgba(88,101,242,0.6)",
                  boxShadow: "0 0 20px rgba(88,101,242,0.25)",
                  color: "#fff",
                }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 28px",
                  borderRadius: "8px",
                  background: "rgba(88,101,242,0.15)",
                  color: "#8B9BFF",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  border: "1px solid rgba(88,101,242,0.3)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                <IconDiscord />
                Join Discord
              </motion.button>
            </motion.div>
          </div>

          {/* ── RIGHT column ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              paddingRight: "48px",
              paddingLeft: "20px",
              alignItems: "flex-end",
            }}
          >
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{ fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(170,68,255,0.4)", fontWeight: 700, margin: 0 }}
            >
              Coming Up ●
            </motion.p>

            <EventCard
              badge="Upcoming"
              badgeVariant="upcoming"
              title="Build with AI Workshop"
              meta="Azure & Copilot deep-dive"
              date="July 12, 2026"
              accentGradient="linear-gradient(90deg, #AA44FF, #FF44AA)"
              placeholderBg="linear-gradient(135deg, rgba(120,0,255,0.28), rgba(170,68,255,0.12))"
              placeholderStroke="#AA44FF"
              icon={<path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />}
              direction="right"
              delay={0.4}
            />

            <EventCard
              badge="Future Event"
              badgeVariant="future"
              title="ICPC Qualifier Prep"
              meta="Competitive programming bootcamp"
              date="August 2026"
              accentGradient="linear-gradient(90deg, #FF6400, #FFB900)"
              placeholderBg="linear-gradient(135deg, rgba(255,100,0,0.24), rgba(255,185,0,0.1))"
              placeholderStroke="#FFB900"
              icon={<path d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.496m0 0-.171.9M7.5 15.375l.43-2.587.171-.9m0 0A3.375 3.375 0 0 1 12 9c1.856 0 3.376 1.5 3.376 3.375" />}
              direction="right"
              delay={0.55}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════
            BOTTOM STATS BAR
        ══════════════════════════════════════════ */}
        
      </section>
    </>
  );
}