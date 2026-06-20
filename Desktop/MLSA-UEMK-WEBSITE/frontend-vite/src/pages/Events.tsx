/**
 * EventsPage.tsx — MSS UEMK Events Page (v2)
 *
 * Changes from v1:
 *  - Removed Microsoft 4-square logo from hero
 *  - Full-page hexagon background (large flat light-blue cells, Image 1 style)
 *  - Fonts: ultra-bold condensed mixed-weight headlines (Image 2 / Image 3 style)
 *    dark-navy + vivid-blue gradient treatment on key words
 *  - Section headers redesigned: numbered dark-blue square + bold condensed label
 *    + lighter subtitle, member-count pill on right (Image 3 style)
 *  - Bot placeholder box removed entirely
 *  - Ongoing carousel title & upcoming card titles use condensed bold font
 *
 * Sections:
 *  1. Hero — hexagon bg, big mixed-weight headline, subtitle
 *  2. ONGOING EVENTS — full-width auto-sliding carousel with LIVE badge
 *  3. UPCOMING EVENTS — 3-card horizontal slider
 *  4. PAST EVENTS (Events Accomplished) — 3-col grid, expandable
 *  5. Footer
 *
 * Mobile: fully responsive via injected @media rules.
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Google Fonts import (Barlow Condensed for headlines) ─────────────────────
// Add this to your index.html <head> for full effect:
// <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600;700;800&display=swap" rel="stylesheet">

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#eef4fb",           // light blue-white page bg — matches Image 1
  white: "#ffffff",
  blue: "#0078d4",
  blueMid: "#1a6bbf",
  blueDark: "#003a8c",     // deep navy-blue for "MICROSOFT" weight
  blueVivid: "#0ea5e9",    // cyan accent for "AMBASSADOR"-style words
  blueLight: "#dbeafe",
  bluePale: "#f0f7ff",
  navy: "#0f2d4a",
  text: "#0f172a",
  muted: "#5a7a9a",
  border: "#d4e4f2",
  live: "#22c55e",
  liveLight: "#dcfce7",
  hexStroke: "#b8d4ec",    // soft hex cell stroke colour matching Image 1
  hexFill: "#e4eff9",      // very subtle hex fill
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface OngoingEvent {
  id: number;
  title: string;
  dateRange: string;
  duration: string;
  location: string;
  image: string; // leave "" for gradient
  gradientFrom: string;
  gradientTo: string;
}

interface UpcomingEvent {
  id: number;
  category: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  image: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
}

interface PastEvent {
  id: number;
  month: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  image: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
}

const DEFAULT_ONGOING: OngoingEvent[] = [
  {
    id: 0,
    title: "AZURE AI INNOVATION HACKATHON",
    dateRange: "Oct 24 – Oct 26",
    duration: "48 Hours",
    location: "Main Innovation Lab",
    image: "",
    gradientFrom: "#0a1f3d",
    gradientTo: "#0057a8",
  }
];

const DEFAULT_UPCOMING: UpcomingEvent[] = [
  {
    id: 0, category: "WORKSHOP",
    title: "Mastering React & Framer Motion",
    date: "NOV 12", time: "14:00 – 16:00", venue: "Seminar Hall B",
    image: "", gradientFrom: "#0c3d6b", gradientTo: "#0ea5e9", icon: "</>",
  }
];

const DEFAULT_PAST: PastEvent[] = [
  {
    id: 0, month: "SEPT 2024", title: "Web3 Fundamentals",
    date: "Sept 14, 2024", time: "10:00 – 13:00", venue: "Seminar Hall C",
    image: "", gradientFrom: "#0f172a", gradientTo: "#334155", icon: "{;}",
  }
];

// ─── Full-page Hexagon Background (Image 1 style) ─────────────────────────────
// Large flat hex cells, very light blue fill + visible stroke, covers entire page
function HexPageBackground() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden",
    }}>
      <svg
        width="100%" height="100%"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          {/*
            Flat-top hexagon: width=90, height=78
            Each hex is drawn with a light fill + clear stroke to match Image 1
          */}
          <pattern id="hexFull" x="0" y="0" width="90" height="78" patternUnits="userSpaceOnUse">
            {/* Row 1 hex */}
            <polygon
              points="45,2 88,24 88,68 45,90 2,68 2,24"
              fill={C.hexFill}
              stroke={C.hexStroke}
              strokeWidth="1.2"
            />
            {/* Row 2 hex (offset) */}
            <polygon
              points="90,41 133,63 133,107 90,129 47,107 47,63"
              fill={C.hexFill}
              stroke={C.hexStroke}
              strokeWidth="1.2"
            />
          </pattern>
        </defs>
        <rect width="1400" height="900" fill={`url(#hexFull)`} />
      </svg>
    </div>
  );
}

// ─── LIVE Badge ───────────────────────────────────────────────────────────────
function LiveBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: C.liveLight, color: C.live,
      fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
      padding: "5px 14px", borderRadius: 20,
      border: `1px solid ${C.live}44`,
      fontFamily: "'Barlow', 'Segoe UI', sans-serif",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%", background: C.live,
        animation: "livePulse 1.4s ease-in-out infinite",
        display: "inline-block", flexShrink: 0,
      }} />
      LIVE NOW
    </span>
  );
}

// ─── Section Header — Image 3 style ──────────────────────────────────────────
// Numbered dark-blue square + BOLD CONDENSED title + subtitle line + pill count
function SectionHeader({
  number, label, subtitle, count, cta,
}: {
  number: number;
  label: string;
  subtitle: string;
  count?: string;
  cta?: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center",
      gap: 0, marginBottom: 28,
      padding: "18px 22px",
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(10px)",
      borderRadius: 14,
      border: `1px solid ${C.border}`,
      boxShadow: "0 2px 12px rgba(0,80,180,0.07)",
    }}>
      {/* Numbered box */}
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: `linear-gradient(145deg, ${C.blueDark}, ${C.blue})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginRight: 14,
        boxShadow: "0 3px 10px rgba(0,60,140,0.28)",
      }}>
        <span style={{
          color: "white", fontSize: 15, fontWeight: 900,
          fontFamily: "'Barlow Condensed', 'Segoe UI', sans-serif",
        }}>{number}</span>
      </div>

      {/* Labels */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "clamp(17px, 2.5vw, 22px)",
          fontWeight: 900,
          fontFamily: "'Barlow Condensed', 'Segoe UI Semibold', sans-serif",
          color: C.navy,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          lineHeight: 1.1,
        }}>{label}</div>
        <div style={{
          fontSize: 11, fontWeight: 700, color: C.blue,
          letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2,
        }}>{subtitle}</div>
      </div>

      {/* Divider line */}
      <div style={{
        flex: 1, height: 1,
        background: `linear-gradient(to right, ${C.border}, transparent)`,
        marginLeft: 18, marginRight: 18,
      }} />

      {/* CTA or count pill */}
      {cta && (
        <button
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 700, color: hov ? C.blueDark : C.blue,
            letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 4,
            transform: hov ? "translateX(3px)" : "translateX(0)",
            transition: "all 0.2s ease",
            fontFamily: "'Barlow', 'Segoe UI', sans-serif",
          }}
        >{cta} →</button>
      )}
      {count && (
        <span style={{
          background: C.blueLight, color: C.blueDark,
          fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 20,
          letterSpacing: "0.04em", border: `1px solid ${C.border}`,
          fontFamily: "'Barlow', 'Segoe UI', sans-serif",
        }}>{count}</span>
      )}
    </div>
  );
}

// ─── Ongoing Carousel Slide ───────────────────────────────────────────────────
function OngoingSlide({ ev }: { ev: OngoingEvent }) {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      borderRadius: 20, overflow: "hidden",
      background: ev.image
        ? `url(${ev.image}) center/cover no-repeat`
        : `linear-gradient(145deg, ${ev.gradientFrom}, ${ev.gradientTo})`,
      flexShrink: 0,
    }}>
      {/* Decorative hex pattern inside slide */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="slideHex" x="0" y="0" width="70" height="60" patternUnits="userSpaceOnUse">
              <polygon points="35,2 68,19 68,53 35,70 2,53 2,19"
                fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#slideHex)" />
        </svg>
      </div>
      {/* Geometric orbs */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 380, height: 380, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ position: "absolute", bottom: -60, left: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      {/* Dark gradient */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(6,12,28,0.82) 0%, rgba(6,12,28,0.4) 55%, transparent 100%)" }} />

      {/* Content */}
      <div style={{ position: "absolute", bottom: 44, left: 44, zIndex: 2, maxWidth: 560 }}>
        <LiveBadge />
        {/*
          Title styled like Image 2: two lines, first in regular bold white,
          second (key word) in larger condensed bright-blue/cyan
        */}
        <h2 style={{
          marginTop: 18, marginBottom: 16,
          fontFamily: "'Barlow Condensed', 'Segoe UI', sans-serif",
          fontSize: "clamp(28px, 4.5vw, 52px)",
          fontWeight: 900, color: "white",
          letterSpacing: "-0.5px", lineHeight: 1.0,
          textTransform: "uppercase",
        }}>
          {ev.title}
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {[
            { icon: "📅", label: ev.dateRange },
            { icon: "⏱", label: ev.duration },
            { icon: "📍", label: ev.location },
          ].map((chip, i) => (
            <span key={i} style={{
              display: "flex", alignItems: "center", gap: 7,
              fontSize: 13, color: "rgba(255,255,255,0.88)", fontWeight: 600,
              fontFamily: "'Barlow', 'Segoe UI', sans-serif",
            }}>
              <span>{chip.icon}</span> {chip.label}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            style={{
              background: C.blue, color: "white",
              border: "none", borderRadius: 30,
              padding: "12px 30px", fontSize: 12, fontWeight: 800,
              letterSpacing: "0.08em", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,120,212,0.45)",
              transition: "all 0.2s ease",
              fontFamily: "'Barlow', 'Segoe UI', sans-serif",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(0,120,212,0.55)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,120,212,0.45)"; }}
          >JOIN NOW</button>
          <button
            style={{
              background: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)",
              color: "white", border: "1.5px solid rgba(255,255,255,0.32)",
              borderRadius: 30, padding: "12px 30px", fontSize: 12, fontWeight: 800,
              letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.2s ease",
              fontFamily: "'Barlow', 'Segoe UI', sans-serif",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.24)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)"; }}
          >DETAILS</button>
        </div>
      </div>
    </div>
  );
}

// ─── Ongoing Carousel ─────────────────────────────────────────────────────────
function OngoingCarousel({ events }: { events: OngoingEvent[] }) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [dir, setDir] = useState<"l" | "r">("l");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number, d: "l" | "r") => {
    if (transitioning || events.length === 0) return;
    setDir(d);
    setTransitioning(true);
    setTimeout(() => { setCurrent(idx); setTransitioning(false); }, 380);
  }, [transitioning, events.length]);

  const next = useCallback(() => goTo((current + 1) % events.length, "l"), [current, goTo, events.length]);
  const prev = useCallback(() => goTo((current - 1 + events.length) % events.length, "r"), [current, goTo, events.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  }, [next]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  return (
    <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", height: "clamp(280px, 44vw, 440px)" }}>
      <div style={{
        width: "100%", height: "100%",
        transform: transitioning ? (dir === "l" ? "translateX(-55px)" : "translateX(55px)") : "translateX(0)",
        opacity: transitioning ? 0 : 1,
        transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.38s ease",
      }}>
        {events.length > 0 && <OngoingSlide ev={events[current]} />}
      </div>

      {/* Prev */}
      <button
        onClick={() => { prev(); resetTimer(); }}
        style={{
          position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)",
          width: 42, height: 42, borderRadius: "50%",
          background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)",
          border: "1.5px solid rgba(255,255,255,0.3)",
          color: "white", fontSize: 22, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10, transition: "background 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.3)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)"; }}
      >‹</button>

      {/* Next */}
      <button
        onClick={() => { next(); resetTimer(); }}
        style={{
          position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)",
          width: 42, height: 42, borderRadius: "50%",
          background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)",
          border: "1.5px solid rgba(255,255,255,0.3)",
          color: "white", fontSize: 22, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10, transition: "background 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.3)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)"; }}
      >›</button>

      {/* Dots */}
      <div style={{
        position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 8, zIndex: 10,
      }}>
        {events.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i, i > current ? "l" : "r"); resetTimer(); }}
            style={{
              width: i === current ? 26 : 8, height: 8, borderRadius: 4,
              background: i === current ? C.blue : "rgba(255,255,255,0.5)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Upcoming Event Card ──────────────────────────────────────────────────────
function UpcomingCard({ ev, index }: { ev: UpcomingEvent; index: number }) {
  const [hov, setHov] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const catColor: Record<string, { bg: string; color: string }> = {
    WORKSHOP:    { bg: "#dbeafe", color: "#1d4ed8" },
    SEMINAR:     { bg: "#fef3c7", color: "#b45309" },
    NETWORKING:  { bg: "#dcfce7", color: "#15803d" },
    COMPETITION: { bg: "#ffe4e6", color: "#be123c" },
  };
  const badge = catColor[ev.category] ?? { bg: C.blueLight, color: C.blue };

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(10px)",
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${hov ? "rgba(0,120,212,0.22)" : "rgba(180,210,240,0.7)"}`,
        boxShadow: hov
          ? "0 18px 50px rgba(0,120,212,0.16), 0 2px 8px rgba(0,0,0,0.04)"
          : "0 2px 14px rgba(0,100,200,0.08)",
        transform: visible ? (hov ? "translateY(-6px) scale(1.01)" : "translateY(0)") : "translateY(26px)",
        opacity: visible ? 1 : 0,
        transition: `transform 0.42s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.08}s,
                     opacity 0.5s ease ${index * 0.08}s, box-shadow 0.3s ease`,
        cursor: "pointer",
        minWidth: 0, flexShrink: 0,
      }}
    >
      {/* Image area */}
      <div style={{
        height: 158,
        background: ev.image
          ? `url(${ev.image}) center/cover`
          : `linear-gradient(145deg, ${ev.gradientFrom}, ${ev.gradientTo})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -28, right: -28, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.08)", transform: hov ? "scale(1.22)" : "scale(1)", transition: "transform 0.5s ease" }} />
        <div style={{ position: "absolute", bottom: -18, left: -18, width: 75, height: 75, borderRadius: "50%", background: "rgba(255,255,255,0.08)", transform: hov ? "scale(1.22)" : "scale(1)", transition: "transform 0.5s ease 0.05s" }} />
        {/* Date badge */}
        <span style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(255,255,255,0.95)", color: C.navy,
          fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 10,
          letterSpacing: "0.08em", fontFamily: "'Barlow', 'Segoe UI', sans-serif",
        }}>{ev.date}</span>
        <span style={{
          fontSize: 36, position: "relative", zIndex: 1,
          transform: hov ? "scale(1.14) translateY(-4px)" : "scale(1) translateY(0)",
          transition: "transform 0.36s cubic-bezier(0.34,1.56,0.64,1)",
          display: "block",
        }}>{ev.icon}</span>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px" }}>
        <span style={{
          display: "inline-block", fontSize: 9, fontWeight: 800,
          padding: "3px 10px", borderRadius: 10, marginBottom: 9,
          letterSpacing: "0.1em", textTransform: "uppercase",
          background: badge.bg, color: badge.color,
          fontFamily: "'Barlow', 'Segoe UI', sans-serif",
        }}>{ev.category}</span>
        {/* Title — condensed bold like Image 2/3 */}
        <div style={{
          fontSize: 16, fontWeight: 800, color: C.navy, lineHeight: 1.2, marginBottom: 11,
          fontFamily: "'Barlow Condensed', 'Segoe UI Semibold', sans-serif",
          textTransform: "uppercase", letterSpacing: "0.01em",
        }}>{ev.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <span style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontFamily: "'Barlow', 'Segoe UI', sans-serif" }}>
            <span>⏰</span> {ev.time}
          </span>
          <span style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontFamily: "'Barlow', 'Segoe UI', sans-serif" }}>
            <span>📍</span> {ev.venue}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Upcoming Slider ──────────────────────────────────────────────────────────
function UpcomingSlider({ events }: { events: UpcomingEvent[] }) {
  const [offset, setOffset] = useState(0);
  const CARD_W = 300;
  const GAP = 18;
  const maxOffset = Math.max(0, events.length - 3);

  const prev = () => setOffset(o => Math.max(0, o - 1));
  const next = () => setOffset(o => Math.min(maxOffset, o + 1));

  return (
    <div>
      <div style={{ overflow: "hidden" }}>
        <div style={{
          display: "flex", gap: GAP,
          transform: `translateX(calc(-${offset} * (${CARD_W}px + ${GAP}px)))`,
          transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
        }}>
          {events.map((ev, i) => (
            <div key={ev.id} style={{ width: CARD_W, flexShrink: 0 }} className="upcoming-card-wrap">
              <UpcomingCard ev={ev} index={i} />
            </div>
          ))}
        </div>
      </div>
      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
        <div style={{ display: "flex", gap: 7 }}>
          {Array.from({ length: maxOffset + 1 }).map((_, i) => (
            <button key={i} onClick={() => setOffset(i)} style={{
              width: i === offset ? 24 : 8, height: 8, borderRadius: 4,
              border: "none", cursor: "pointer", padding: 0,
              background: i === offset ? C.blue : C.border,
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          {[
            { action: prev, label: "‹", disabled: offset === 0 },
            { action: next, label: "›", disabled: offset === maxOffset },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} disabled={btn.disabled} style={{
              width: 38, height: 38, borderRadius: "50%",
              background: btn.disabled ? "#f1f5f9" : C.bluePale,
              border: `1.5px solid ${btn.disabled ? C.border : "rgba(0,120,212,0.22)"}`,
              color: btn.disabled ? C.muted : C.blue,
              fontSize: 20, cursor: btn.disabled ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s ease",
            }}>{btn.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Past Event Card ──────────────────────────────────────────────────────────
function PastCard({ ev, index }: { ev: PastEvent; index: number }) {
  const [hov, setHov] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
        borderRadius: 16, overflow: "hidden",
        border: `1px solid ${hov ? "rgba(0,120,212,0.18)" : "rgba(180,210,240,0.65)"}`,
        boxShadow: hov ? "0 12px 36px rgba(0,0,0,0.1)" : "0 2px 10px rgba(0,80,180,0.06)",
        transform: visible ? (hov ? "translateY(-5px)" : "translateY(0)") : "translateY(22px)",
        opacity: visible ? 1 : 0,
        transition: `transform 0.42s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.06}s, opacity 0.5s ease ${index * 0.06}s, box-shadow 0.3s ease`,
        cursor: "pointer",
      }}
    >
      <div style={{
        height: 128,
        background: ev.image
          ? `url(${ev.image}) center/cover`
          : `linear-gradient(145deg, ${ev.gradientFrom}, ${ev.gradientTo})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <span style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(255,255,255,0.92)", color: C.navy,
          fontSize: 9, fontWeight: 800, padding: "3px 9px", borderRadius: 8, letterSpacing: "0.08em",
          fontFamily: "'Barlow', 'Segoe UI', sans-serif",
        }}>{ev.month}</span>
        <span style={{
          position: "absolute", top: 10, left: 10,
          background: "#f1f5f9", color: C.muted,
          fontSize: 9, fontWeight: 800, padding: "3px 9px", borderRadius: 8, letterSpacing: "0.08em",
          fontFamily: "'Barlow', 'Segoe UI', sans-serif",
        }}>COMPLETED</span>
        <span style={{
          fontSize: 30, position: "relative", zIndex: 1, opacity: 0.75,
          transform: hov ? "scale(1.1)" : "scale(1)", transition: "transform 0.3s ease", display: "block",
        }}>{ev.icon}</span>
      </div>
      <div style={{ padding: "13px 15px 15px" }}>
        {/* Title — condensed bold */}
        <div style={{
          fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 9,
          fontFamily: "'Barlow Condensed', 'Segoe UI Semibold', sans-serif",
          textTransform: "uppercase", letterSpacing: "0.02em",
        }}>{ev.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { icon: "📅", label: ev.date },
            { icon: "⏰", label: ev.time },
            { icon: "📍", label: ev.venue },
          ].map((row, i) => (
            <span key={i} style={{
              fontSize: 11, color: C.muted,
              display: "flex", alignItems: "center", gap: 5, fontWeight: 600,
              fontFamily: "'Barlow', 'Segoe UI', sans-serif",
            }}><span>{row.icon}</span> {row.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Past Events Grid ─────────────────────────────────────────────────────────
function PastEventsGrid({ events }: { events: PastEvent[] }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? events : events.slice(0, 3);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="past-grid">
        {shown.map((ev, i) => <PastCard key={ev.id} ev={ev} index={i} />)}
      </div>
      <div style={{ textAlign: "center", marginTop: 38 }}>
        <button
          onClick={() => setShowAll(s => !s)}
          style={{
            background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)",
            border: `1.5px solid ${C.border}`, borderRadius: 30,
            padding: "12px 40px", fontSize: 11, fontWeight: 800, color: C.blue,
            letterSpacing: "0.12em", cursor: "pointer", transition: "all 0.25s ease",
            fontFamily: "'Barlow', 'Segoe UI', sans-serif",
          }}
          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = C.blue; b.style.background = C.bluePale; }}
          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = C.border; b.style.background = "rgba(255,255,255,0.8)"; }}
        >
          {showAll ? "SHOW LESS" : "VIEW FULL ARCHIVE"}
        </button>
      </div>
    </div>
  );
}

import { getData } from "@/lib/api";

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [ongoing, setOngoing] = useState<OngoingEvent[]>(DEFAULT_ONGOING);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>(DEFAULT_UPCOMING);
  const [past, setPast] = useState<PastEvent[]>(DEFAULT_PAST);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await getData();
        const data: any = res.data;
        if (data && data.events && data.events.length > 0) {
            const fetchedUpcoming = data.events.filter((e: any) => e.isUpcoming);
            const fetchedPast = data.events.filter((e: any) => !e.isUpcoming);
            
            if (fetchedUpcoming.length > 0) {
              setOngoing([{
                id: fetchedUpcoming[0].id || 0,
                title: fetchedUpcoming[0].name || "Upcoming Event",
                dateRange: fetchedUpcoming[0].date || "",
                duration: fetchedUpcoming[0].time || "",
                location: fetchedUpcoming[0].location || "TBA",
                image: fetchedUpcoming[0].image || "",
                gradientFrom: "#0a1f3d", gradientTo: "#0057a8",
              }]);
              
              setUpcoming(fetchedUpcoming.map((e: any, i: number) => ({
                id: e.id || i,
                category: e.tags?.[0] || "EVENT",
                title: e.name || "",
                date: e.date || "",
                time: e.time || "",
                venue: e.location || "",
                image: e.image || "",
                gradientFrom: "#0c3d6b", gradientTo: "#0ea5e9", icon: "</>"
              })));
            }

            if (fetchedPast.length > 0) {
              setPast(fetchedPast.map((e: any, i: number) => ({
                id: e.id || i,
                month: e.date ? e.date.substring(0, 8) : "PAST",
                title: e.name || "",
                date: e.date || "",
                time: e.time || "",
                venue: e.location || "",
                image: e.image || "",
                gradientFrom: "#0f172a", gradientTo: "#334155", icon: "{;}"
              })));
            }
          }
        } catch (err: any) {
          console.error("Failed to fetch events:", err);
          setError(err.message || "Failed to load events");
        } finally {
          setLoading(false);
        }
      }
      fetchEvents();
    }, []);

  return (
    <>
      {/* ─── Global keyframes + responsive overrides ───────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600;700;800;900&display=swap');

        @keyframes livePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.6); opacity: 0.55; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .events-section   { padding: 0 14px !important; }
          .past-grid        { grid-template-columns: 1fr !important; }
          .upcoming-card-wrap { width: 78vw !important; }
        }
        @media (max-width: 900px) {
          .past-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* ─── Page wrapper ── */}
      <div style={{
        fontFamily: "'Barlow', 'Segoe UI', system-ui, sans-serif",
        background: C.bg,
        minHeight: "100vh",
        color: C.text,
        position: "relative",
        overflowX: "hidden",
      }}>
        {/* ── Full-page hex background ── */}
        <HexPageBackground />

        {/* ── Soft ambient blobs (depth) ── */}
        <div style={{ position: "fixed", top: -120, right: -80, width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,120,212,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: -120, left: -80, width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        {/* ── Main content ── */}
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ══════════════════════════════════════════════════════════════
              HERO — "Get in Touch" font style from Image 1
              Mixed weight: thin "EVENTS &" + bold gradient "EXPERIENCES"
          ══════════════════════════════════════════════════════════════ */}
          <div style={{
            textAlign: "center",
            padding: "120px 40px 52px",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            {/* Pill — "MICROSOFT STUDENT SOCIETY — UEMK" style from Image 1 */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)",
              border: `1.5px solid ${C.border}`, borderRadius: 30,
              padding: "7px 22px", marginBottom: 28,
              fontSize: 11, fontWeight: 700, color: C.blueDark,
              letterSpacing: "0.12em",
              boxShadow: "0 2px 12px rgba(0,100,200,0.1)",
              fontFamily: "'Barlow', 'Segoe UI', sans-serif",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.blue, display: "inline-block" }} />
              MICROSOFT STUDENT SOCIETY — UEMK
            </div>

            {/*
              Headline — Image 2 inspired:
              Line 1: "EVENTS" — dark navy, heavy condensed (like "MICROSOFT" in img 2)
              Line 2: "& EXPERIENCES" — lighter weight label (like "LEARN STUDENT")
              Line 3: would be the key word — here we echo Image 2's "AMBASSADOR" style
              We keep it as two lines for events context
            */}
            <h1 style={{
              margin: "0 0 20px 0",
              lineHeight: 0.92,
              letterSpacing: "-1px",
              textTransform: "uppercase",
            }}>
              {/* "EVENTS" — ultra-bold condensed dark navy (Image 2 "MICROSOFT" style) */}
              <span style={{
                display: "block",
                fontSize: "clamp(54px, 9vw, 96px)",
                fontWeight: 900,
                fontFamily: "'Barlow Condensed', 'Segoe UI', sans-serif",
                color: C.navy,
                letterSpacing: "-2px",
              }}>EVENTS</span>
              {/* "& EXPERIENCES" — mid-weight smaller (Image 2 "LEARN STUDENT" style) */}
              <span style={{
                display: "block",
                fontSize: "clamp(18px, 3vw, 32px)",
                fontWeight: 700,
                fontFamily: "'Barlow Condensed', 'Segoe UI', sans-serif",
                color: C.blueMid,
                letterSpacing: "0.18em",
                marginTop: 4,
              }}>&amp; EXPERIENCES</span>
              {/* Season label — Image 2 "AMBASSADOR" style — vivid blue gradient */}
              <span style={{
                display: "block",
                fontSize: "clamp(38px, 6.5vw, 72px)",
                fontWeight: 900,
                fontFamily: "'Barlow Condensed', 'Segoe UI', sans-serif",
                background: `linear-gradient(100deg, ${C.blue} 0%, ${C.blueVivid} 60%, #38bdf8 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                letterSpacing: "-1px",
                marginTop: 6,
              }}>SEASON II — 2024</span>
            </h1>

            <p style={{
              fontSize: 15, color: C.muted, lineHeight: 1.75,
              maxWidth: 460, margin: "0 auto",
              fontWeight: 500,
              fontFamily: "'Barlow', 'Segoe UI', sans-serif",
            }}>
              Discover cutting-edge workshops, hackathons, and tech summits designed to elevate
              your academic and professional journey.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "100px 0", color: "#8aabcc" }}>Loading events...</div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "100px 0", color: "#ff6b6b" }}>{error}</div>
          ) : (
            <>
              {/* ══════════════════════════════════════════════════════════════
                  SECTION 1 — ONGOING EVENTS
              ══════════════════════════════════════════════════════════════ */}
              <section className="events-section" style={{ padding: "0 40px 56px", maxWidth: 1200, margin: "0 auto" }}>
                <SectionHeader
                  number={1}
                  label="Ongoing Events"
                  subtitle="Live &amp; Happening Now"
                  count={`${ongoing.length} Active`}
                />
                <OngoingCarousel events={ongoing} />
              </section>

              {/* ══════════════════════════════════════════════════════════════
                  SECTION 2 — UPCOMING EVENTS
              ══════════════════════════════════════════════════════════════ */}
              <section className="events-section" style={{ padding: "0 40px 64px", maxWidth: 1200, margin: "0 auto" }}>
                <SectionHeader
                  number={2}
                  label="Upcoming Events"
                  subtitle="Scheduled &amp; Confirmed"
                  cta="View Calendar"
                />
                <UpcomingSlider events={upcoming} />
              </section>

              {/* ══════════════════════════════════════════════════════════════
                  SECTION 3 — EVENTS ACCOMPLISHED
              ══════════════════════════════════════════════════════════════ */}
              <section className="events-section" style={{ padding: "0 40px 80px", maxWidth: 1200, margin: "0 auto" }}>
                <SectionHeader
                  number={3}
                  label="Events Accomplished"
                  subtitle="Leadership &amp; Archive"
                  cta="Full Archive"
                />
                <PastEventsGrid events={past} />
              </section>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════
              FOOTER
          ══════════════════════════════════════════════════════════════ */}
          <footer style={{
            position: "relative", zIndex: 1,
            padding: "40px 40px 32px",
            display: "flex", flexWrap: "wrap",
            alignItems: "flex-end", justifyContent: "space-between",
            gap: 20,
            borderTop: `1px solid ${C.border}`,
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(12px)",
          }}>
            <div>
              <div style={{
                fontSize: 18, fontWeight: 900, color: C.navy, letterSpacing: "-0.3px",
                fontFamily: "'Barlow Condensed', 'Segoe UI', sans-serif",
                textTransform: "uppercase",
              }}>MICROSOFT SOCIETY</div>
              <div style={{
                fontSize: 13, fontWeight: 700, color: C.blue,
                fontFamily: "'Barlow Condensed', 'Segoe UI', sans-serif",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>UEMK</div>
              <p style={{ fontSize: 11, color: C.muted, maxWidth: 260, lineHeight: 1.6, marginTop: 6 }}>
                © 2024 Microsoft Society UEMK. Engineered for Academic Excellence.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>
              {["Privacy Policy","Code of Conduct","Contact Us","Sponsorships"].map(link => (
                <a key={link} href="#" style={{ fontSize: 11, fontWeight: 600, color: C.muted, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.blue; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.muted; }}
                >{link}</a>
              ))}
            </div>
          </footer>

        </div>{/* /zIndex wrapper */}
      </div>{/* /page */}
    </>
  );
}