import Robot from "@/components/Robot";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   RESPONSIVE HOOK
   ───────────────────────────────────────────────────────────── */
function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

/* ─────────────────────────────────────────────────────────────
   3D HEX CLOUD CONFIG
   ───────────────────────────────────────────────────────────── */
const HEX_CFG = {
  R: 28,
  GAP: 4,
  ROWS: 11,
  ROWS_MOBILE: 6,
  PULSE_SPEED: 0.6,
  FLOAT_SPEED: 0.38,
};

/* ─────────────────────────────────────────────────────────────
   CARD DATA
   ───────────────────────────────────────────────────────────── */
interface CardData {
  badge: string;
  badgeColor: string;
  badgeBg: string;
  icon: string;
  title: string;
  sub: string;
  date: string;
  accent: [string, string];
  img: string;
  popup: {
    title: string;
    body: string;
    tag: string;
    tagColor: string;
    tagBg: string;
  };
}

const LEFT_CARDS: CardData[] = [
  {
    badge: "🔴 Live Now",
    badgeColor: "#1045c8",
    badgeBg: "rgba(16,69,200,0.08)",
    icon: "💡",
    title: "Hackathon 3.0",
    sub: "24-hr innovation sprint · Build, ship, win",
    date: "June 5–6, 2026",
    accent: ["#1557fc", "#00a8e8"],
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80",
    popup: {
      title: "Hackathon 3.0",
      body: "Compete across AI, Web3, and Open Innovation tracks. ₹50,000 prize pool over 24 hours.",
      tag: "Register Free →",
      tagColor: "#1045c8",
      tagBg: "rgba(16,69,200,0.10)",
    },
  },
  {
    badge: "Recruitment",
    badgeColor: "#0a8a42",
    badgeBg: "rgba(10,138,66,0.08)",
    icon: "🙋",
    title: "Open Applications",
    sub: "Join the MSS core team for Season II",
    date: "Closes June 15, 2026",
    accent: ["#22c55e", "#16a34a"],
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80",
    popup: {
      title: "Join the Core Team",
      body: "We're looking for designers, developers, and community managers. Get a response in 3 days.",
      tag: "Apply Now →",
      tagColor: "#0a8a42",
      tagBg: "rgba(10,138,66,0.10)",
    },
  },
];

const RIGHT_CARDS: CardData[] = [
  {
    badge: "Upcoming",
    badgeColor: "#6520c8",
    badgeBg: "rgba(101,32,200,0.08)",
    icon: "🤖",
    title: "Build with AI Workshop",
    sub: "Azure & Copilot deep dive · Hands-on",
    date: "July 12, 2026",
    accent: ["#8b5cf6", "#6366f1"],
    img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80",
    popup: {
      title: "AI Workshop",
      body: "Build production apps with Azure OpenAI, Copilot Studio, and Semantic Kernel. Certificates provided.",
      tag: "Save Seat →",
      tagColor: "#6520c8",
      tagBg: "rgba(101,32,200,0.10)",
    },
  },
  {
    badge: "Future",
    badgeColor: "#a04a00",
    badgeBg: "rgba(160,74,0,0.08)",
    icon: "🏆",
    title: "ICPC Qualifier Prep",
    sub: "Competitive programming bootcamp · 4 weeks",
    date: "August 2026",
    accent: ["#f97316", "#eab308"],
    img: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80",
    popup: {
      title: "ICPC Prep Camp",
      body: "4-week bootcamp covering data structures, algorithms, and contest strategy. Limited to 40 seats.",
      tag: "Notify Me →",
      tagColor: "#a04a00",
      tagBg: "rgba(160,74,0,0.10)",
    },
  },
];

const ALL_CARDS = [...LEFT_CARDS, ...RIGHT_CARDS];

/* ─────────────────────────────────────────────────────────────
   Microsoft 4-square logo
   ───────────────────────────────────────────────────────────── */
function MicrosoftLogo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", width: size, height: size, flexShrink: 0 }}>
      <span style={{ borderRadius: "1px", background: "#f25022", display: "block" }} />
      <span style={{ borderRadius: "1px", background: "#7fba00", display: "block" }} />
      <span style={{ borderRadius: "1px", background: "#00a4ef", display: "block" }} />
      <span style={{ borderRadius: "1px", background: "#ffb900", display: "block" }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SPLINE WATERMARK COVER — small hex tile that sits over it
   ───────────────────────────────────────────────────────────── */
function SplineWatermarkCover() {
  return (
    <div
      style={{
        position: "absolute",
        /* The "Built with Spline" badge sits bottom-center of the canvas */
        bottom: "5px",
        left: "92%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {/* SVG hexagon that blends into the background */}
      <svg
        width="270"
        height="72"
        viewBox="0 0 200 52"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Matches the hero background gradient colours */}
          <linearGradient id="hcov-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#b8d6ee" />
            <stop offset="50%"  stopColor="#a4cef0" />
            <stop offset="100%" stopColor="#bdd8f0" />
          </linearGradient>
          <linearGradient id="hcov-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.70)" />
            <stop offset="100%" stopColor="rgba(180,215,250,0.50)" />
          </linearGradient>
          {/* Inner top-face shimmer */}
          <radialGradient id="hcov-shine" cx="38%" cy="30%" r="62%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.62)" />
            <stop offset="55%"  stopColor="rgba(200,230,255,0.30)" />
            <stop offset="100%" stopColor="rgba(150,200,240,0.10)" />
          </radialGradient>
        </defs>

        {/* ── 3-D hex body — two side panels + top face ── */}

        {/* Bottom-right side panel (darker) */}
        <polygon
          points="115,14  148,26  148,42  115,30"
          fill="rgba(120,175,225,0.72)"
        />
        {/* Bottom-left side panel */}
        <polygon
          points="12,14  45,30  45,42  12,26"
          fill="rgba(140,195,235,0.60)"
        />
        {/* Bottom flat face */}
        <polygon
          points="45,30  115,30  115,42  45,42"
          fill="rgba(130,185,230,0.65)"
        />

        {/* Top hexagonal face */}
        <polygon
          points="12,26  45,14  115,14  148,26  115,38  45,38"
          fill="url(#hcov-grad)"
          stroke="url(#hcov-stroke)"
          strokeWidth="1.2"
        />

        {/* Specular shimmer on top face */}
        <polygon
          points="12,26  45,14  115,14  148,26  115,38  45,38"
          fill="url(#hcov-shine)"
        />

        {/* Edge glow line along top */}
        <polyline
          points="45,14  115,14  148,26"
          fill="none"
          stroke="rgba(255,255,255,0.82)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Small Microsoft-style 4-square in the centre of the top face */}
        <g transform="translate(72, 19)">
          <rect x="0"  y="0"  width="6" height="6" fill="#f25022" rx="0.5" />
          <rect x="7"  y="0"  width="6" height="6" fill="#7fba00" rx="0.5" />
          <rect x="0"  y="7"  width="6" height="6" fill="#00a4ef" rx="0.5" />
          <rect x="7"  y="7"  width="6" height="6" fill="#ffb900" rx="0.5" />
        </g>
      </svg>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────
   MOBILE CARD CAROUSEL
   ───────────────────────────────────────────────────────────── */
function MobileCardCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const CARD_COUNT = ALL_CARDS.length;

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cardEl = track.children[i] as HTMLElement;
    if (!cardEl) return;
    const trackW = track.offsetWidth;
    const cardW = cardEl.offsetWidth;
    const targetLeft = cardEl.offsetLeft - (trackW - cardW) / 2;
    track.scrollTo({ left: targetLeft, behavior: "smooth" });
    setActiveIdx(i);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const trackW = track.offsetWidth;
    let closest = 0;
    let minDist = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const viewCenter = track.scrollLeft + trackW / 2;
      const dist = Math.abs(cardCenter - viewCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIdx(closest);
  };

  return (
    <div style={{ position: "relative", zIndex: 25, width: "100%" }}>
      <button
        aria-label="Previous card"
        onClick={() => goTo(Math.max(0, activeIdx - 1))}
        style={{
          position: "absolute", left: "4px", top: "50%",
          transform: "translateY(-60%)", zIndex: 40,
          width: "36px", height: "36px", borderRadius: "50%",
          background: "rgba(255,255,255,0.88)",
          border: "1.5px solid rgba(21,87,252,0.18)",
          boxShadow: "0 4px 14px rgba(21,87,252,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          opacity: activeIdx === 0 ? 0.3 : 1,
          transition: "opacity 0.2s ease",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1557fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <button
        aria-label="Next card"
        onClick={() => goTo(Math.min(CARD_COUNT - 1, activeIdx + 1))}
        style={{
          position: "absolute", right: "4px", top: "50%",
          transform: "translateY(-60%)", zIndex: 40,
          width: "36px", height: "36px", borderRadius: "50%",
          background: "rgba(255,255,255,0.88)",
          border: "1.5px solid rgba(21,87,252,0.18)",
          boxShadow: "0 4px 14px rgba(21,87,252,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          opacity: activeIdx === CARD_COUNT - 1 ? 0.3 : 1,
          transition: "opacity 0.2s ease",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1557fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{
          display: "flex", gap: "12px", overflowX: "auto",
          padding: "8px 44px 16px",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none",
          scrollbarWidth: "none" as any,
        }}
      >
        {ALL_CARDS.map((card, i) => (
          <div
            key={card.title}
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              flex: "0 0 calc(100% - 88px)", maxWidth: "380px",
              scrollSnapAlign: "center", borderRadius: "20px",
              background: "linear-gradient(135deg, #ffffff 0%, #f0f7ff 60%, #ddeeff 100%)",
              border: "1.5px solid rgba(21,87,252,0.13)",
              boxShadow: activeIdx === i ? "0 8px 32px rgba(21,87,252,0.20)" : "0 4px 16px rgba(21,87,252,0.10)",
              overflow: "hidden", cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              transition: "box-shadow 0.25s ease, transform 0.18s ease",
              transform: expanded === i ? "scale(0.97)" : "scale(1)",
            }}
          >
            <div style={{ height: "4px", background: `linear-gradient(90deg, ${card.accent[0]}, ${card.accent[1]})` }} />
            <div style={{ position: "relative", height: "140px", overflow: "hidden", background: "rgba(21,87,252,0.06)" }}>
              <img src={card.img} alt={card.title} loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50px", background: "linear-gradient(to top, rgba(240,247,255,0.97), transparent)" }} />
              <span style={{
                position: "absolute", top: "10px", left: "12px",
                padding: "3px 10px", borderRadius: "20px",
                fontSize: "9px", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase",
                color: card.badgeColor, background: "rgba(255,255,255,0.92)",
                border: `1px solid ${card.badgeColor}30`, backdropFilter: "blur(6px)",
              }}>{card.badge}</span>
            </div>
            <div style={{ padding: "14px 18px 18px" }}>
              <div style={{ display: "flex", gap: "9px", alignItems: "flex-start", marginBottom: "6px" }}>
                <span style={{ fontSize: "22px", lineHeight: 1 }}>{card.icon}</span>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0d2a5c", lineHeight: 1.25 }}>{card.title}</div>
              </div>
              <div style={{ fontSize: "11px", color: "#4a6a98", lineHeight: 1.55, marginBottom: "10px" }}>{card.sub}</div>
              {expanded === i && (
                <div style={{
                  fontSize: "11px", color: "#4a6a9c", lineHeight: 1.65, marginBottom: "12px",
                  padding: "10px 12px", background: "rgba(21,87,252,0.04)", borderRadius: "10px",
                  border: "1px solid rgba(21,87,252,0.08)",
                }}>{card.popup.body}</div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid rgba(21,87,252,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: `linear-gradient(135deg, ${card.accent[0]}, ${card.accent[1]})` }} />
                  <span style={{ fontSize: "10px", fontWeight: 600, color: "#6a8ab0" }}>{card.date}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); window.open("#", "_blank"); }}
                  style={{
                    padding: "8px 16px", borderRadius: "20px", minHeight: "36px",
                    background: `linear-gradient(90deg, ${card.accent[0]}, ${card.accent[1]})`,
                    color: "#fff", fontSize: "10px", fontWeight: 800, letterSpacing: ".10em", textTransform: "uppercase",
                    border: "none", cursor: "pointer", boxShadow: `0 4px 14px ${card.accent[0]}44`,
                    WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
                  }}
                >{expanded === i ? card.popup.tag : "Details →"}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "7px", paddingTop: "4px", paddingBottom: "6px" }}>
        {ALL_CARDS.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Go to card ${i + 1}`}
            style={{
              width: activeIdx === i ? "22px" : "7px", height: "7px", borderRadius: "4px",
              background: activeIdx === i ? `linear-gradient(90deg, ${ALL_CARDS[i].accent[0]}, ${ALL_CARDS[i].accent[1]})` : "rgba(21,87,252,0.22)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "width 0.28s ease, background 0.28s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FLYCARD (desktop only)
   ───────────────────────────────────────────────────────────── */
interface FlyCardProps { card: CardData; direction: "left" | "right"; delay: number; }

function FlyCard({ card, direction, delay }: FlyCardProps) {
  const [hovered, setHovered] = useState(false);
  const popupSide = direction === "left"
    ? { left: "calc(100% + 14px)", right: "auto" }
    : { right: "calc(100% + 14px)", left: "auto" };

  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "left" ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.75, delay, ease: [0.4, 0, 0.2, 1] }}
      style={{ position: "relative", width: "230px", zIndex: 50 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={hovered ? { y: -10, scale: 1.03 } : { y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f0f7ff 60%, #ddeeff 100%)",
          borderRadius: "22px",
          border: "1.5px solid rgba(21,87,252,0.13)",
          boxShadow: hovered
            ? "0 20px 50px rgba(21,87,252,0.20), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)"
            : "0 4px 24px rgba(21,87,252,0.10), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
          overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.3s ease", position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "60%", background: "radial-gradient(ellipse at 110% 40%, rgba(21,87,252,0.10) 0%, rgba(100,180,255,0.06) 40%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ height: "3.5px", background: `linear-gradient(90deg, ${card.accent[0]}, ${card.accent[1]}, rgba(255,255,255,0))`, position: "relative", zIndex: 1 }} />
        <div style={{ position: "relative", height: "110px", overflow: "hidden", background: `linear-gradient(135deg, rgba(21,87,252,0.06), rgba(100,180,255,0.10))`, zIndex: 1 }}>
          <img src={card.img} alt={card.title} loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88, transition: "transform 0.5s ease, opacity 0.3s ease", transform: hovered ? "scale(1.06)" : "scale(1)" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45px", background: "linear-gradient(to top, rgba(240,247,255,0.95), transparent)", zIndex: 2 }} />
          <span style={{
            position: "absolute", top: "10px", left: "12px", zIndex: 3,
            display: "inline-flex", alignItems: "center", gap: "4px",
            padding: "3px 10px", borderRadius: "20px",
            fontSize: "9px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase",
            color: card.badgeColor, background: "rgba(255,255,255,0.90)",
            border: `1px solid ${card.badgeColor}30`, backdropFilter: "blur(8px)",
          }}>{card.badge}</span>
        </div>
        <div style={{ padding: "12px 16px 16px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "20px", lineHeight: 1, flexShrink: 0 }}>{card.icon}</span>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0d2a5c", lineHeight: 1.25, letterSpacing: "-.01em" }}>{card.title}</div>
          </div>
          <div style={{ fontSize: "10.5px", color: "#4a6a98", lineHeight: 1.5, marginBottom: "10px" }}>{card.sub}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid rgba(21,87,252,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: `linear-gradient(135deg, ${card.accent[0]}, ${card.accent[1]})` }} />
              <span style={{ fontSize: "9.5px", fontWeight: 600, color: "#6a8ab0" }}>{card.date}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); window.open("#", "_blank"); }}
              style={{
                position: "relative", zIndex: 200, padding: "5px 12px", borderRadius: "20px",
                background: `linear-gradient(90deg, ${card.accent[0]}, ${card.accent[1]})`,
                color: "#fff", fontSize: "9px", fontWeight: 800, letterSpacing: ".10em", textTransform: "uppercase",
                border: "none", cursor: "pointer", boxShadow: `0 3px 10px ${card.accent[0]}44`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 5px 16px ${card.accent[0]}66`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 3px 10px ${card.accent[0]}44`; }}
            >{card.popup.tag}</button>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={hovered ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: direction === "left" ? -8 : 8, scale: 0.97 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          position: "absolute", top: "50%", transform: "translateY(-50%)", ...popupSide,
          background: "#ffffff", borderRadius: "18px", padding: "18px 20px", width: "210px",
          boxShadow: "0 20px 60px rgba(21,87,252,0.22), 0 4px 16px rgba(0,0,0,0.10)",
          border: `1.5px solid ${card.accent[0]}25`, zIndex: 300,
          pointerEvents: hovered ? "auto" : "none",
          backgroundImage: "radial-gradient(ellipse at 120% 50%, rgba(21,87,252,0.07) 0%, transparent 60%)",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: "18px", bottom: "18px", width: "3.5px", borderRadius: "0 4px 4px 0", background: `linear-gradient(180deg, ${card.accent[0]}, ${card.accent[1]})` }} />
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#0d2a5c", marginBottom: "7px", lineHeight: 1.2 }}>{card.popup.title}</div>
        <div style={{ fontSize: "10.5px", color: "#4a6a9c", lineHeight: 1.65, marginBottom: "14px" }}>{card.popup.body}</div>
        <button
          onClick={(e) => { e.stopPropagation(); window.open("#", "_blank"); }}
          style={{
            display: "inline-block", padding: "6px 15px", borderRadius: "20px",
            fontSize: "9.5px", fontWeight: 800, letterSpacing: ".10em", textTransform: "uppercase",
            color: card.popup.tagColor, background: card.popup.tagBg,
            border: `1px solid ${card.popup.tagColor}30`, cursor: "pointer", transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = card.popup.tagColor; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = card.popup.tagBg; (e.currentTarget as HTMLButtonElement).style.color = card.popup.tagColor; }}
        >{card.popup.tag}</button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3D HEX CLOUD
   ───────────────────────────────────────────────────────────── */
function HexCloud({ isMobile }: { isMobile: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let hexes: Array<{ cx: number; cy: number; r: number; heightBase: number; phase: number; pulseOffset: number; floatAmp: number; depth: number; }> = [];
    let t = 0, raf = 0;
    const ROWS = isMobile ? HEX_CFG.ROWS_MOBILE : HEX_CFG.ROWS;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function drawHex3D(cx: number, cy: number, r: number, height: number, pulse: number, alpha: number) {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      const eI = pulse;
      const blueR = Math.round(30 + eI * 100);
      const blueG = Math.round(120 + eI * 135);

      if (!ctx) return;
      ctx.save();
      ctx.globalAlpha = alpha * 0.18;
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.4 + height, r * 0.85, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(80,160,255,0.4)`;
      ctx.fill();

      ctx.globalAlpha = alpha * 0.72;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.lineTo(pts[1].x, pts[1].y + height);
      ctx.lineTo(pts[0].x, pts[0].y + height);
      ctx.closePath();
      ctx.fillStyle = `rgb(${Math.round(180 + eI * 75)},${Math.round(210 + eI * 45)},255)`;
      ctx.fill();

      ctx.globalAlpha = alpha * 0.55;
      ctx.beginPath();
      ctx.moveTo(pts[1].x, pts[1].y);
      ctx.lineTo(pts[2].x, pts[2].y);
      ctx.lineTo(pts[2].x, pts[2].y + height);
      ctx.lineTo(pts[1].x, pts[1].y + height);
      ctx.closePath();
      ctx.fillStyle = `rgba(${Math.round(120 + eI * 60)},${Math.round(170 + eI * 70)},245,1)`;
      ctx.fill();

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        i === 0 ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.closePath();
      const topGrd = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 0, cx, cy, r * 1.15);
      topGrd.addColorStop(0, "rgba(255,255,255,1)");
      topGrd.addColorStop(0.35, "rgba(230,245,255,1)");
      topGrd.addColorStop(0.75, `rgba(${blueR + 120},${blueG + 60},255,1)`);
      topGrd.addColorStop(1, `rgba(${blueR},${blueG},255,1)`);
      ctx.fillStyle = topGrd;
      ctx.fill();

      ctx.globalAlpha = alpha * (0.25 + eI * 0.75);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        i === 0 ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${blueR},${blueG},255,1)`;
      ctx.lineWidth = 1.2 + eI * 1.8;
      ctx.stroke();

      if (!isMobile) {
        const ringPulse = (Math.sin(t * 9.0 + pulse * Math.PI) + 1) * 0.5;
        const ringAlpha = ringPulse * 0.7 * alpha;
        if (ringAlpha > 0.04) {
          ctx.globalAlpha = ringAlpha;
          ctx.beginPath();
          const rr = r * (0.42 + ringPulse * 0.3);
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 6;
            const x = cx + rr * Math.cos(a);
            const y = cy + rr * Math.sin(a);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(${blueR + 40},${blueG},255,1)`;
          ctx.lineWidth = 0.8 + ringPulse * 1.2;
          ctx.stroke();
        }

        const streamPulse = (Math.sin(t * 11.0 + pulse * Math.PI * 1.3) + 1) * 0.5;
        if (streamPulse > 0.3) {
          ctx.globalAlpha = (streamPulse - 0.3) * 1.4 * alpha;
          for (let i = 0; i < 6; i++) {
            const p1 = pts[i];
            const p2 = pts[(i + 1) % 6];
            const grd = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grd.addColorStop(0, "rgba(180,230,255,0)");
            grd.addColorStop(0.5, `rgba(${blueR + 80},${blueG + 20},255,${streamPulse * 0.9})`);
            grd.addColorStop(1, "rgba(180,230,255,0)");
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = grd;
            ctx.lineWidth = 1.5 + streamPulse * 2.5;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = (0.1 + eI * 0.3) * alpha;
      ctx.beginPath();
      ctx.moveTo(pts[4].x, pts[4].y);
      ctx.lineTo(pts[5].x, pts[5].y);
      ctx.lineTo(pts[0].x, pts[0].y);
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fill();
      ctx.restore();
    }

    function buildGrid() {
      hexes = [];
      const r = HEX_CFG.R, g = HEX_CFG.GAP;
      const colW = Math.sqrt(3) * (r + g);
      const rowH = 1.5 * (r + g);
      const cols = Math.ceil(W / colW) + 3;
      for (let row = 0; row < ROWS; row++) {
        const off = row % 2 === 0 ? 0 : colW / 2;
        for (let col = -1; col < cols; col++) {
          const cx = col * colW + off;
          const baseY = H - (ROWS - 1 - row) * rowH - r;
          const jitter = (Math.random() - 0.5) * r * 0.28;
          hexes.push({
            cx, cy: baseY + jitter,
            r: r * (0.76 + (row / (ROWS - 1)) * 0.24),
            heightBase: 6 + Math.random() * 14,
            phase: Math.random() * Math.PI * 2,
            pulseOffset: col * 0.4 + row * 0.7,
            floatAmp: isMobile ? 1.2 + Math.random() * 2.0 : 1.8 + Math.random() * 4.0,
            depth: row / (ROWS - 1),
          });
        }
      }
      hexes.sort((a, b) => a.cy - b.cy);
    }

    function resize() {
      if (!canvas) return;
      if (!ctx) return;
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.scale(DPR, DPR);
      buildGrid();
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      t += 0.016;
      hexes.forEach((h) => {
        const pulse = (Math.sin(t * HEX_CFG.PULSE_SPEED * 3.5 + h.phase + h.pulseOffset) * 0.5 + 0.5);
        const floatY = Math.sin(t * HEX_CFG.FLOAT_SPEED + h.phase) * h.floatAmp;
        const y = h.cy + floatY;
        const baseAlpha = 0.38 + h.depth * 0.55;
        const alpha = baseAlpha * (0.7 + pulse * 0.3);
        const height = h.heightBase * (0.55 + pulse * 0.75);
        drawHex3D(h.cx, y, h.r, height, pulse, alpha);
      });
    }

    function loop() { /* raf = requestAnimationFrame(loop); */ draw(); }
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 80); };
    window.addEventListener("resize", onResize);
    resize(); loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); clearTimeout(resizeTimer); };
  }, [isMobile]);

  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: isMobile ? "88%" : "76%", pointerEvents: "none", zIndex: 10 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3D MICROSOFT LOGO
   ───────────────────────────────────────────────────────────── */
function Microsoft3DLogo({ size = 120 }: { size?: number }) {
  const s = size, h = s * 0.12, g = s * 0.04, sq = (s - g) / 2;
  const quads = [
    { x: 0, y: 0, top: "#f25022", right: "#a01800", bottom: "#c73a10" },
    { x: sq + g, y: 0, top: "#7fba00", right: "#3d6600", bottom: "#5a8a00" },
    { x: 0, y: sq + g, top: "#00a4ef", right: "#004f80", bottom: "#0078d4" },
    { x: sq + g, y: sq + g, top: "#ffb900", right: "#8a5e00", bottom: "#d08800" },
  ];
  return (
    <svg width={s + h} height={s + h} viewBox={`0 0 ${s + h} ${s + h}`} xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.22)) drop-shadow(0 2px 6px rgba(0,0,0,0.14))" }}>
      {quads.map((q, i) => (
        <g key={i}>
          <rect x={q.x + h * 0.3} y={q.y + sq} width={sq} height={h * 0.7} fill={q.bottom} rx="1" />
          <rect x={q.x + sq} y={q.y + h * 0.3} width={h * 0.7} height={sq} fill={q.right} rx="1" />
          <rect x={q.x} y={q.y} width={sq} height={sq} fill={q.top} rx="2" />
          <rect x={q.x} y={q.y} width={sq * 0.35} height={sq * 0.35} fill="rgba(255,255,255,0.18)" rx="2" />
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO — main export
   ───────────────────────────────────────────────────────────── */
export default function Hero() {
  const isMobile = useIsMobile();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .mss-hero { font-family: 'Outfit', sans-serif; }
        .mss-hero * { box-sizing: border-box; }
        .btn-primary {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 32px; border-radius: 50px;
          background: #1557fc; color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
          border: 2px solid #1557fc; cursor: pointer;
          transition: all .28s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 4px 22px rgba(21,87,252,0.42), inset 0 1px 0 rgba(255,255,255,0.18);
          min-height: 48px; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
        }
        .btn-primary:hover { background: #fff; color: #1557fc; box-shadow: 0 10px 36px rgba(21,87,252,0.30); transform: translateY(-3px); }
        .btn-secondary {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 32px; border-radius: 50px;
          background: rgba(255,255,255,0.65); color: #0d2a5c;
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
          border: 2px solid rgba(255,255,255,0.90); cursor: pointer;
          transition: all .28s cubic-bezier(.4,0,.2,1);
          backdrop-filter: blur(12px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.90);
          min-height: 48px; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
        }
        .btn-secondary:hover { background: linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888); color: #fff; border-color: transparent; box-shadow: 0 10px 32px rgba(193,53,132,0.45); transform: translateY(-3px); }
        .mss-snap-scroll::-webkit-scrollbar { display: none; }
        @keyframes mss-blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.2;transform:scale(.6)} }
        .blink-dot  { animation: mss-blink 2.2s ease-in-out infinite; }
        .blink-dot2 { animation: mss-blink 2.2s ease-in-out infinite; animation-delay: .9s; }
        @keyframes mss-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        .robot-float { animation: mss-float 4.2s ease-in-out infinite; }
        .title-gradient {
          display: block;
          background: linear-gradient(92deg, #1557fc 0%, #0091ff 55%, #00c4ff 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        @keyframes ringPulse {
          0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.18}
          50%{transform:translate(-50%,-50%) scale(1.08);opacity:.30}
        }
        .light-ring { animation: ringPulse 4.2s ease-in-out infinite; }

        /* ── Watermark cover — subtle pulse so it feels alive ── */
        @keyframes hex-cover-pulse {
          0%,100% { opacity: 0.92; }
          50%      { opacity: 1; }
        }
        .spline-cover { animation: hex-cover-pulse 3.5s ease-in-out infinite; }

        @keyframes floatIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatHover {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        .floating-hackathon-card {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          z-index: 50;
          animation: floatIn 0.6s ease 0.4s both, floatHover 3s ease-in-out 1s infinite;
        }
        @media (max-width: 767px) {
          .floating-hackathon-card {
            display: none !important;
          }
        }

        @media (max-width: 1023px) {
          .mss-desktop-cards { display: none !important; }
          .mss-desktop-grid { display: flex !important; flex-direction: column !important; padding: 0 0 40px !important; gap: 0 !important; }
          .mss-centre-col { margin-top: 0px !important; padding: 0 20px !important; }
          .mss-robot-inner { width: 520px !important; height: 560px !important; margin: 0 auto !important; }
          .mss-title { font-size: clamp(56px, 14vw, 88px) !important; }
          .mss-title-sub { font-size: clamp(26px, 7vw, 40px) !important; }
          .mss-title-ambassador { font-size: clamp(44px, 12vw, 72px) !important; }
          .mss-eyebrow span[style] { font-size: 10px !important; letter-spacing: .16em !important; }
          .mss-cta-row { margin-top: -120px !important; flex-direction: column !important; align-items: center !important; gap: 10px !important; }
          .btn-primary, .btn-secondary { width: 100%; max-width: 280px; justify-content: center; }
          .mss-tagline { display: none !important; }
        }
        @media (min-width: 1024px) { .mss-mobile-cards { display: none !important; } }
      `}</style>

      <section
        className="mss-hero"
        style={{
          position: "relative", width: "100%", minHeight: "100vh",
          display: "flex", flexDirection: "column", overflow: "hidden",
          background: "linear-gradient(160deg, #bdd8f0 0%, #9ec8ea 20%, #88bce6 44%, #a4cef0 68%, #c2dff7 100%)",
          paddingTop: "120px",
        }}
      >
        {/* Sky glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          background: [
            "radial-gradient(ellipse 70% 50% at 50% -8%, rgba(255,255,255,0.60) 0%, transparent 70%)",
            "radial-gradient(ellipse 30% 20% at 15% 0%, rgba(255,255,255,0.30) 0%, transparent 60%)",
            "radial-gradient(ellipse 24% 16% at 85% 0%, rgba(255,255,255,0.22) 0%, transparent 60%)",
          ].join(","),
        }} />
        {/* Noise */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, opacity: 0.032,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }} />

        <HexCloud isMobile={isMobile} />

        <div
          className="mss-desktop-grid"
          style={{
            position: "relative", zIndex: 20,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", textAlign: "center",
            flex: 1, padding: "0 20px 140px",
          }}
        >
          {/* Floating Hackathon 3.0 Card */}
          <div className="floating-hackathon-card">
            <FlyCard card={LEFT_CARDS[0]} direction="left" delay={0.4} />
          </div>

          {/* Centre column */}
          <motion.div
            className="mss-centre-col"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.05 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
          >
            {/* Eyebrow pill */}
            <div className="mss-eyebrow" style={{
              display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px",
              padding: "6px 18px", borderRadius: "50px",
              background: "rgba(255,255,255,0.52)", backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.80)",
              maxWidth: "100%", flexWrap: "wrap", justifyContent: "center",
            }}>
              <span className="blink-dot" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#1557fc", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", color: "#2a5a8c" }}>
                Microsoft Student Society UEMK
              </span>
              <span className="blink-dot2" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#1557fc", display: "inline-block", flexShrink: 0 }} />
            </div>

            {/* Title */}
            <h1 className="mss-title" style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(72px, 10vw, 130px)",
              lineHeight: 0.90, letterSpacing: ".09em", textTransform: "uppercase",
              margin: "0px 0 10px", color: "#0a2250", fontWeight: 900,
            }}>
              Microsoft{" "}
              <span className="mss-title-sub" style={{
                fontSize: "clamp(36px, 5.5vw, 55px)", fontWeight: 700,
                display: "block", color: "#1a3a6c", letterSpacing: ".12em", marginBottom: "2px",
              }}>Learn Student</span>
              <span className="mss-title-ambassador title-gradient" style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(60px, 10vw, 100px)",
                fontWeight: 900, letterSpacing: ".01em",
              }}>Ambassador</span>
            </h1>

            {isMobile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ marginBottom: "0px", marginTop: "18px" }}
              >
                <Microsoft3DLogo size={90} />
              </motion.div>
            )}

            <p className="mss-tagline" style={{
              fontSize: "10.5px", fontWeight: 600, letterSpacing: ".28em",
              textTransform: "uppercase", color: "#4a7aa8", marginBottom: "-400px",
            }}>
              UEMK &nbsp;·&nbsp; Kolkata &nbsp;·&nbsp; Excellence &amp; Innovation
            </p>

            {/* Robot — with watermark cover inside the same relative container */}
            <div style={{ position: "relative", marginBottom: "30px" }}>
              <div className="light-ring" style={{
                position: "absolute", width: "200px", height: "200px", borderRadius: "50%",
                left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, rgba(21,87,252,0.16) 0%, transparent 70%)",
                pointerEvents: "none", zIndex: 0,
              }} />

              <div className="mss-robot-inner" style={{ position: "relative", width: "1100px", height: "1200px", zIndex: 14 }}>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", justifyContent: "center", alignItems: "center",
                  pointerEvents: "none",
                }}>
                  <div style={{
                    width: "300px", height: "300px", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(21,87,252,0.25), transparent 70%)",
                    filter: "blur(50px)",
                  }} />
                </div>

                <Robot />

                {/* ── Hex cover over "Built with Spline" watermark ── */}
                <SplineWatermarkCover />
              </div>
            </div>

            {/* CTAs */}
            <div className="mss-cta-row" style={{
              display: "flex", gap: "12px", flexWrap: "wrap",
              justifyContent: "center", marginTop: "-150px", zIndex: 50,
            }}>
              <button className="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8zm7.5 0h3.78v2.2h.05c.53-1 1.82-2.2 3.75-2.2 4.01 0 4.75 2.64 4.75 6.07V24h-4V14.3c0-2.3-.04-5.26-3.2-5.26-3.2 0-3.69 2.5-3.69 5.1V24h-4V8z" />
                </svg>
                LinkedIn
              </button>
              <button className="btn-secondary" onClick={() => window.open("https://www.instagram.com/mssuemk", "_blank")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
                Instagram
              </button>
            </div>

            {/* Mobile event cards */}
            <div className="mss-mobile-cards" style={{ width: "100%", marginTop: "32px" }}>
              <MobileCardCarousel />
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}