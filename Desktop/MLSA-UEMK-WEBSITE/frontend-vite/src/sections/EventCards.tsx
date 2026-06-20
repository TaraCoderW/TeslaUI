
import { useState, useRef, useCallback, useEffect } from "react";

interface EventData {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  tag: string;
  accent: string;
  accentSecondary: string;
  cardBg: string;
  cardBgDeep: string;
  notes: string[];
  status: "live" | "upcoming" | "tba";
  icon: "bolt" | "globe" | "code" | "shield";
}

const DEFAULT_EVENTS: EventData[] = [
  {
    id: "hackathon-01",
    category: "Hackathon",
    title: "BuildX",
    subtitle: "2025",
    date: "Aug 14 – 16, 2025",
    location: "IIT Delhi · Hybrid",
    tag: "48 HRS",
    accent: "#00C8FF",
    accentSecondary: "#0078D4",
    cardBg: "#0A1628",
    cardBgDeep: "#060E1C",
    notes: [
      "₹2L prize pool · 3 tracks",
      "Mentors from Microsoft & Google",
      "Teams of 2–4 eligible",
      "Hardware kits on-site",
    ],
    status: "upcoming",
    icon: "bolt",
  },
];

function Icon({ name, color, size = 28 }: { name: EventData["icon"]; color: string; size?: number }) {
  const s = { width: size, height: size };
  const props = { fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...s, viewBox: "0 0 24 24" };
  if (name === "bolt") return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
  if (name === "globe") return <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
  if (name === "code") return <svg {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
  if (name === "shield") return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  return null;
}

function CircuitSVG({ accent }: { accent: string }) {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.22 }} viewBox="0 0 280 420" fill="none">
      {/* TL corner */}
      <path d="M0 55 L35 55 L35 22 L75 22" stroke={accent} strokeWidth="1"/>
      <circle cx="35" cy="55" r="2.5" fill={accent}/>
      <circle cx="75" cy="22" r="2" fill={accent} fillOpacity="0.6"/>
      {/* TR corner */}
      <path d="M280 55 L245 55 L245 22 L205 22" stroke={accent} strokeWidth="1"/>
      <circle cx="245" cy="55" r="2.5" fill={accent}/>
      <circle cx="205" cy="22" r="2" fill={accent} fillOpacity="0.6"/>
      {/* BL corner */}
      <path d="M0 365 L35 365 L35 398 L75 398" stroke={accent} strokeWidth="1"/>
      <circle cx="35" cy="365" r="2.5" fill={accent}/>
      {/* BR corner */}
      <path d="M280 365 L245 365 L245 398 L205 398" stroke={accent} strokeWidth="1"/>
      <circle cx="245" cy="365" r="2.5" fill={accent}/>
      {/* Vertical side traces */}
      <path d="M15 80 L15 160" stroke={accent} strokeWidth="0.75" strokeDasharray="4 6"/>
      <path d="M265 80 L265 160" stroke={accent} strokeWidth="0.75" strokeDasharray="4 6"/>
      <path d="M15 260 L15 340" stroke={accent} strokeWidth="0.75" strokeDasharray="4 6"/>
      <path d="M265 260 L265 340" stroke={accent} strokeWidth="0.75" strokeDasharray="4 6"/>
      {/* Center top dash */}
      <path d="M115 10 L165 10" stroke={accent} strokeWidth="1"/>
      <path d="M125 6 L125 14" stroke={accent} strokeWidth="1"/>
      <path d="M155 6 L155 14" stroke={accent} strokeWidth="1"/>
      {/* Center bottom dash */}
      <path d="M115 410 L165 410" stroke={accent} strokeWidth="1"/>
      <path d="M125 406 L125 414" stroke={accent} strokeWidth="1"/>
      <path d="M155 406 L155 414" stroke={accent} strokeWidth="1"/>
      {/* Mid horizontal markers */}
      <path d="M0 200 L18 200" stroke={accent} strokeWidth="1"/>
      <path d="M0 210 L10 210" stroke={accent} strokeWidth="0.75"/>
      <path d="M280 200 L262 200" stroke={accent} strokeWidth="1"/>
      <path d="M280 210 L270 210" stroke={accent} strokeWidth="0.75"/>
    </svg>
  );
}

function StatusBadge({ status, accent }: { status: EventData["status"]; accent: string }) {
  const isLive = status === "live";
  const color = isLive ? "#00E87A" : status === "upcoming" ? accent : "#6B7280";
  const label = isLive ? "LIVE NOW" : status === "upcoming" ? "UPCOMING" : "TBA";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 7, height: 7, borderRadius: "50%",
        background: color,
        boxShadow: isLive ? `0 0 0 3px ${color}30, 0 0 10px ${color}` : "none",
        animation: isLive ? "livePulse 1.8s ease-in-out infinite" : "none",
        flexShrink: 0,
      }}/>
      <span style={{
        fontSize: 10, fontWeight: 700, color,
        letterSpacing: "0.16em",
        fontFamily: "'Courier New', monospace",
      }}>{label}</span>
    </div>
  );
}

function EventCard({ event }: { event: EventData }) {
  const [hovered, setHovered] = useState(false);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  }, []);

  const tX = hovered ? (mouse.y - 0.5) * -9 : 0;
  const tY = hovered ? (mouse.x - 0.5) * 9 : 0;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMouse({ x: 0.5, y: 0.5 }); }}
      onMouseMove={onMove}
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        minHeight: 420,
        display: "flex",
        flexDirection: "column",
        transform: hovered
          ? `perspective(1000px) rotateX(${tX}deg) rotateY(${tY}deg) translateY(-8px) scale(1.025)`
          : `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)`,
        transition: hovered
          ? "transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease"
          : "transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease",
        boxShadow: hovered
          ? `0 0 0 1.5px ${event.accent}, 0 0 60px ${event.accent}40, 0 32px 64px rgba(0,0,0,0.8)`
          : `0 0 0 1px ${event.accent}30, 0 12px 32px rgba(0,0,0,0.6)`,
        willChange: "transform",
      }}
    >
      {/* Solid card background — NO transparency */}
      <div style={{
        position: "absolute", inset: 0,
        background: event.cardBg,
        zIndex: 0,
      }}/>

      {/* Mouse-tracked inner glow — subtle, on solid bg */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: hovered
          ? `radial-gradient(ellipse 60% 50% at ${mouse.x * 100}% ${mouse.y * 100}%, ${event.accent}18 0%, transparent 70%)`
          : "none",
        transition: "background 0.1s ease",
      }}/>

      {/* Scanline texture */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px)",
        borderRadius: "inherit",
      }}/>

      {/* Circuit SVG */}
      <div style={{ position: "absolute", inset: 0, zIndex: 3 }}>
        <CircuitSVG accent={event.accent}/>
      </div>

      {/* TOP edge glow bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 10,
        background: hovered
          ? `linear-gradient(90deg, transparent 5%, ${event.accent} 35%, ${event.accentSecondary} 65%, transparent 95%)`
          : `linear-gradient(90deg, transparent 20%, ${event.accent}50 50%, transparent 80%)`,
        transition: "background 0.4s ease",
      }}/>

      {/* BOTTOM edge glow bar */}
      <div style={{
        position: "absolute", bottom: 0, left: "10%", right: "10%", height: 1, zIndex: 10,
        background: hovered ? `${event.accent}80` : `${event.accent}20`,
        transition: "background 0.4s ease",
        borderRadius: "0 0 16px 16px",
      }}/>

      {/* Corner brackets */}
      {(["tl","tr","bl","br"] as const).map(p => {
        const t = p[0] === "t"; const l = p[1] === "l";
        return (
          <div key={p} style={{
            position: "absolute", width: 22, height: 22, zIndex: 11,
            top: t ? 12 : undefined, bottom: !t ? 12 : undefined,
            left: l ? 12 : undefined, right: !l ? 12 : undefined,
            pointerEvents: "none",
          }}>
            <div style={{ position: "absolute", top: 0, [l?"left":"right"]: 0, width: "100%", height: 2, background: hovered ? event.accent : event.accent+"60", transition: "background 0.35s" }}/>
            <div style={{ position: "absolute", [t?"top":"bottom"]: 0, [l?"left":"right"]: 0, width: 2, height: "100%", background: hovered ? event.accent : event.accent+"60", transition: "background 0.35s" }}/>
          </div>
        );
      })}

      {/* ─── CARD CONTENT (centered column) ─── */}
      <div style={{
        position: "relative", zIndex: 12,
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        padding: "28px 24px 26px",
        textAlign: "center",
      }}>

        {/* TOP ROW: status + tag */}
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <StatusBadge status={event.status} accent={event.accent}/>
          <div style={{
            padding: "4px 10px", borderRadius: 5,
            background: `${event.accent}18`,
            border: `1px solid ${event.accent}55`,
            fontSize: 9, fontWeight: 800, color: event.accent,
            letterSpacing: "0.18em", fontFamily: "'Courier New', monospace",
          }}>
            {event.tag}
          </div>
        </div>

        {/* CATEGORY */}
        <div style={{
          marginTop: 24,
          fontSize: 10, fontWeight: 700,
          color: event.accent+"99",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontFamily: "'Courier New', monospace",
        }}>
          ── {event.category} ──
        </div>

        {/* ICON RING */}
        <div style={{ position: "relative", margin: "18px 0 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Outer ring */}
          <div style={{
            width: 110, height: 110, borderRadius: "50%",
            border: `1px solid ${event.accent}${hovered ? "55" : "25"}`,
            position: "absolute",
            transition: "border-color 0.4s",
            boxShadow: hovered ? `0 0 30px ${event.accent}25` : "none",
          }}/>
          {/* Middle ring — dashed, rotates on hover */}
          <div style={{
            width: 82, height: 82, borderRadius: "50%",
            border: `1px dashed ${event.accent}${hovered ? "80" : "35"}`,
            position: "absolute",
            transition: "border-color 0.4s",
            animation: hovered ? "spinSlow 6s linear infinite" : "none",
          }}/>
          {/* Icon container solid */}
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: hovered ? event.cardBg : event.cardBgDeep,
            border: `1.5px solid ${event.accent}${hovered ? "DD" : "55"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
            boxShadow: hovered ? `0 0 24px ${event.accent}50, inset 0 0 16px ${event.accent}15` : `inset 0 0 12px rgba(0,0,0,0.5)`,
            transition: "all 0.4s ease",
          }}>
            <Icon name={event.icon} color={event.accent} size={26}/>
          </div>
          {/* Orbit dot */}
          {hovered && (
            <div style={{
              position: "absolute", width: 6, height: 6, borderRadius: "50%",
              background: event.accent,
              boxShadow: `0 0 8px ${event.accent}, 0 0 16px ${event.accent}`,
              animation: "orbitDot 2.5s linear infinite",
              transformOrigin: "center",
            }}/>
          )}
        </div>

        {/* TITLE — big display font, centered */}
        <div>
          <div style={{
            fontSize: "clamp(36px, 4vw, 48px)",
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: "-2px",
            fontFamily: "'Segoe UI', 'SF Pro Display', system-ui, sans-serif",
            color: "#FFFFFF",
            textShadow: hovered ? `0 0 30px ${event.accent}70` : "none",
            transition: "text-shadow 0.4s ease",
          }}>
            {event.title}
          </div>
          <div style={{
            fontSize: "clamp(36px, 4vw, 48px)",
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: "-2px",
            fontFamily: "'Segoe UI', 'SF Pro Display', system-ui, sans-serif",
            color: event.accent,
            textShadow: hovered ? `0 0 40px ${event.accent}90` : "none",
            transition: "text-shadow 0.4s ease",
          }}>
            {event.subtitle}
          </div>
        </div>

        {/* DATE + LOCATION — centered mono */}
        <div style={{ marginTop: 20, width: "100%" }}>
          <div style={{
            width: "80%", height: 1, margin: "0 auto 16px",
            background: `linear-gradient(90deg, transparent, ${event.accent}40, transparent)`,
          }}/>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={event.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontFamily: "'Courier New', monospace", letterSpacing: "0.06em" }}>
                {event.date}
              </span>
            </div>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={event.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontFamily: "'Courier New', monospace", letterSpacing: "0.06em" }}>
                {event.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── HOVER PANEL — pops up from bottom ─── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: event.cardBgDeep,
        borderTop: `1.5px solid ${event.accent}`,
        padding: "22px 22px 26px",
        transform: hovered ? "translateY(0%)" : "translateY(101%)",
        transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
        zIndex: 20,
        borderRadius: "0 0 16px 16px",
      }}>
        {/* Panel header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${event.accent}80, transparent)` }}/>
          <span style={{ fontSize: 9, fontWeight: 700, color: event.accent, fontFamily: "'Courier New', monospace", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            // Event Notes
          </span>
          <div style={{ height: 1, flex: 1, background: `linear-gradient(270deg, ${event.accent}80, transparent)` }}/>
        </div>

        {/* Notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {event.notes.map((note, i) => (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                background: event.accent,
                boxShadow: `0 0 6px ${event.accent}`,
              }}/>
              <span style={{
                fontSize: 12, fontWeight: 500,
                color: "rgba(255,255,255,0.85)",
                fontFamily: "'Segoe UI', system-ui, sans-serif",
                letterSpacing: "0.02em",
                lineHeight: 1.4,
              }}>
                {note}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div style={{
          marginTop: 18,
          padding: "11px 0",
          borderRadius: 8,
          background: `${event.accent}`,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          cursor: "pointer",
          boxShadow: `0 4px 20px ${event.accent}50`,
          transition: "transform 0.15s ease",
        }}>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: "#000",
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            Register Now
          </span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

import { getData } from "@/lib/api";

export default function EventsSection() {
  const [events, setEvents] = useState<EventData[]>(DEFAULT_EVENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await getData();
        const data: any = res.data;
        if (data && data.events && data.events.length > 0) {
          setEvents(data.events.slice(0, 4).map((e: any, i: number) => ({
            id: e.id || String(i),
            category: "Event",
            title: e.name || "Event",
            subtitle: "2025",
            date: e.date || "TBA",
            location: e.venue || e.location || "TBA",
            tag: e.isUpcoming ? "Upcoming" : "Past",
            accent: ["#00C8FF", "#A855F7", "#00E87A", "#FF6B35"][i % 4],
            accentSecondary: ["#0078D4", "#7C3AED", "#00A854", "#E03E00"][i % 4],
            cardBg: ["#0A1628", "#120A28", "#061A10", "#1A0A06"][i % 4],
            cardBgDeep: ["#060E1C", "#0A0618", "#030E09", "#0F0502"][i % 4],
            notes: e.description ? e.description.split('.').slice(0, 3) : ["Join us for this exciting event!"],
            status: e.isUpcoming ? "upcoming" : "tba",
            icon: ["bolt", "globe", "code", "shield"][i % 4] as any,
          })));
        }
      } catch (err: any) {
        console.error("Failed to fetch events:", err);
        setError(err.message || "Failed to load events.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

        @keyframes livePulse {
          0%,100% { opacity:1; box-shadow: 0 0 0 3px rgba(0,232,122,0.3), 0 0 10px #00E87A; }
          50% { opacity:0.6; box-shadow: 0 0 0 6px rgba(0,232,122,0.08), 0 0 4px #00E87A; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbitDot {
          0%   { transform: rotate(0deg)   translateX(44px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(44px) rotate(-360deg); }
        }

        .ev-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          width: 100%;
        }
        
        .ev-section {
          padding: 72px 36px 80px;
        }

        @media(max-width:1024px){ 
          .ev-grid { grid-template-columns: repeat(2,1fr); } 
        }
        @media(max-width:768px){ 
          .ev-grid { grid-template-columns: 1fr; gap: 24px; } 
          .ev-section { padding: 60px 16px 70px; }
        }
        @media(max-width:425px){
          .ev-section { padding: 40px 12px 60px; }
        }
      `}</style>

      <section className="ev-section" style={{
        background: "#05080F",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Dot grid bg */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}/>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)",
          width: 800, height: 400, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,120,212,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>

        {/* ── Header ── */}
        <div style={{ maxWidth: 1120, margin: "0 auto 48px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 3, height: 22, background: "#0078D4", borderRadius: 2 }}/>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "#0078D4", textTransform: "uppercase", fontFamily: "'Courier New', monospace" }}>
              What&apos;s Coming Up
            </span>
          </div>
          <h2 style={{
            margin: "0 0 8px",
            fontSize: "clamp(34px,5vw,54px)", fontWeight: 800,
            color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.08,
            fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}>
            Exciting <span style={{ color: "#0078D4" }}>Events</span> Await !!
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em", fontFamily: "'Courier New', monospace" }}>
            [ HOVER CARD TO REVEAL · CLICK TO REGISTER ]
          </p>
        </div>

        {/* ── Cards ── */}
        <div className="ev-grid" style={{ maxWidth: 1120, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {loading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0", color: "#8aabcc" }}>Loading events...</div>
          ) : error ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0", color: "#ff6b6b" }}>{error}</div>
          ) : (
            events.map((ev, idx) => <EventCard key={ev.id || idx} event={ev}/>)
          )}
        </div>
      </section>
    </>
  );
}
