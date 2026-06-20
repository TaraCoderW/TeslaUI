import { useState, useEffect, useRef } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Category = "all" | "hackathon" | "workshop" | "event" | "recruitment" | "award";

interface GalleryItem {
  id: number;
  emoji: string;
  c1: string;
  c2: string;
  badge: string;
  badgeText: string;
  category: Category;
  date: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  stat: string;
  statIcon: string;
  ctaText: string;
  large?: boolean;
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const DEFAULT_ITEMS: GalleryItem[] = [
  {
    id: 0, emoji: "⚡", c1: "#1a7dc4", c2: "#0c3d6b",
    badge: "live", badgeText: "LIVE NOW", category: "hackathon",
    date: "JUNE 5–6, 2025", title: "Hackathon 3.0 — Build. Ship. Win.",
    shortDesc: "24-hr innovation sprint. Teams competing to build impactful products using Azure & GitHub Copilot, judged by industry mentors.",
    longDesc: "A 24-hour innovation sprint where teams of 2–4 competed to build real products using Azure, GitHub Copilot, and Power Platform. Solutions were judged by industry mentors. Over 48 teams from across UEM competed for prizes and internship opportunities.",
    stat: "48 Teams", statIcon: "👥", ctaText: "VIEW GALLERY", large: true,
  },
  {
    id: 1, emoji: "🤖", c1: "#7c3aed", c2: "#4c1d95",
    badge: "workshop", badgeText: "UPCOMING", category: "workshop",
    date: "JULY 11, 2026", title: "Build with AI Workshop",
    shortDesc: "Azure & Copilot deep-dive. Hands-on AI development for students.",
    longDesc: "A full-day deep dive into Azure AI Studio and Microsoft Copilot. Participants build real AI-powered apps from scratch. Seats are limited — register now to secure your spot.",
    stat: "Full Day", statIcon: "🕐", ctaText: "SAVE SEAT",
  },
  {
    id: 2, emoji: "🧑‍💻", c1: "#059669", c2: "#064e3b",
    badge: "recruit", badgeText: "RECRUITMENT", category: "recruitment",
    date: "CLOSES JUNE 13, 2025", title: "Open Applications — Season II",
    shortDesc: "Join the MSS core team for Season II! Designers, devs, managers welcome.",
    longDesc: "We are expanding the MSS UEMK core team for Season II. Roles in design, development, event management, content, and outreach. Over 200+ students applied in Season I.",
    stat: "200+ Applied", statIcon: "👥", ctaText: "APPLY NOW",
  },
  {
    id: 3, emoji: "🏆", c1: "#d97706", c2: "#92400e",
    badge: "event", badgeText: "EVENT", category: "event",
    date: "ICPC QUALIFIER PREP", title: "Competitive Programming Bootcamp",
    shortDesc: "6-week intensive ICPC qualifier training with top competitive coders.",
    longDesc: "A 6-week intensive preparation program for ICPC qualifying rounds. Topics include advanced algorithms, competitive data structures, and mock contests with real ICPC-style problems.",
    stat: "August 2026", statIcon: "📅", ctaText: "NOTIFY ME",
  },
  {
    id: 4, emoji: "☁️", c1: "#0ea5e9", c2: "#075985",
    badge: "workshop", badgeText: "WORKSHOP", category: "workshop",
    date: "APRIL 2025", title: "Microsoft Azure Cloud Fundamentals Bootcamp",
    shortDesc: "Hands-on Azure session with certified trainers. 60+ participants earned free AZ-900 exam vouchers.",
    longDesc: "A full-day Azure bootcamp led by Microsoft certified trainers. 60+ students participated and received free AZ-900 exam vouchers courtesy of the Microsoft Learn Student Ambassadors program.",
    stat: "60 Attendees", statIcon: "👥", ctaText: "VIEW PHOTOS", large: true,
  },
  {
    id: 5, emoji: "🎖️", c1: "#9333ea", c2: "#581c87",
    badge: "award", badgeText: "AWARD", category: "award",
    date: "SEASON I AWARDS", title: "MSS Chapter Excellence Awards",
    shortDesc: "Celebrating outstanding contributors and top performers of Season I.",
    longDesc: "Recognizing extraordinary contributions across the year. 12 members were honored in categories including Best Developer, Most Innovative Project, Best Event Lead, and Community Champion.",
    stat: "12 Honored", statIcon: "⭐", ctaText: "FULL RECAP",
  },
  {
    id: 6, emoji: "🔥", c1: "#ef4444", c2: "#7f1d1d",
    badge: "past", badgeText: "PAST EVENT", category: "hackathon",
    date: "HACKATHON 2.0 · 2024", title: "Innovation Sprint 2.0",
    shortDesc: "32 teams, 96 hours of building, three category winners crowned.",
    longDesc: "The second edition of our flagship hackathon. 32 teams competed over 96 hours in tracks including FinTech, HealthTech, and EduTech. Over 240 memories captured by our photography team.",
    stat: "240 Photos", statIcon: "📷", ctaText: "BROWSE",
  },
  {
    id: 7, emoji: "🎙️", c1: "#0891b2", c2: "#164e63",
    badge: "event", badgeText: "EVENT", category: "event",
    date: "MARCH 2025", title: "Tech Talk Series — Industry Leaders",
    shortDesc: "Monthly speaker series with Microsoft engineers, founders, and UEM alumni.",
    longDesc: "Monthly tech talk series featuring Microsoft engineers, startup founders, and alumni. 120+ students attended. Discussions covered AI, career paths, and the future of tech in India.",
    stat: "120 Attended", statIcon: "👥", ctaText: "SEE MORE",
  },
  {
    id: 8, emoji: "🛠️", c1: "#16a34a", c2: "#14532d",
    badge: "workshop", badgeText: "WORKSHOP", category: "workshop",
    date: "FEB 2025", title: "GitHub & DevOps Essentials",
    shortDesc: "Git workflows, CI/CD pipelines, and collaborative coding best practices.",
    longDesc: "A hands-on workshop covering Git workflows, GitHub Actions CI/CD, and collaborative development best practices. Participants built and deployed a real project by end of session.",
    stat: "85 Photos", statIcon: "📷", ctaText: "BROWSE",
  },
];

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  live:     { bg: "#dcfce7", color: "#15803d" },
  workshop: { bg: "#dbeafe", color: "#1d4ed8" },
  event:    { bg: "#fef9c3", color: "#a16207" },
  recruit:  { bg: "#ffe4e6", color: "#be123c" },
  award:    { bg: "#f3e8ff", color: "#7e22ce" },
  past:     { bg: "#f1f5f9", color: "#475569" },
};

const STATS = [
  { num: "24", suffix: "+", label: "Events Hosted" },
  { num: "180", suffix: "+", label: "Members" },
  { num: "3", suffix: "K+", label: "Photos Captured" },
  { num: "6", suffix: "", label: "Workshops Run" },
  { num: "2", suffix: "nd", label: "Season Active" },
];

const FILTERS: { key: Category; label: string }[] = [
  { key: "all", label: "ALL MOMENTS" },
  { key: "hackathon", label: "HACKATHONS" },
  { key: "workshop", label: "WORKSHOPS" },
  { key: "event", label: "EVENTS" },
  { key: "recruitment", label: "RECRUITMENT" },
  { key: "award", label: "AWARDS" },
];

/* ─── Animated Counter ───────────────────────────────────────────────────── */
function AnimatedNumber({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(timer); }
            else setVal(start);
          }, 35);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{val}</span>;
}

/* ─── Lightbox ───────────────────────────────────────────────────────────── */
function Lightbox({ item, onClose }: { item: GalleryItem | null; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!item) return null;
  const badge = BADGE_STYLES[item.badge] ?? BADGE_STYLES.past;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: visible ? "rgba(8,16,28,0.82)" : "rgba(8,16,28,0)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.35s ease",
        backdropFilter: visible ? "blur(8px)" : "blur(0px)",
      }}
    >
      {/* Close btn */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 24, right: 28,
          width: 42, height: 42, borderRadius: "50%",
          background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)",
          color: "white", fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s", backdropFilter: "blur(4px)",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.22)"; (e.currentTarget as HTMLButtonElement).style.transform = "rotate(90deg)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.transform = "rotate(0deg)"; }}
      >✕</button>

      {/* Card */}
      <div style={{
        background: "white", borderRadius: 24, overflow: "hidden",
        maxWidth: 600, width: "92%", boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        transform: visible ? "scale(1) translateY(0)" : "scale(0.88) translateY(30px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
      }}>
        {/* Header */}
        <div style={{
          height: 280, display: "flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(145deg, ${item.c1}, ${item.c2})`,
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.06)", top: -80, right: -60 }} />
          <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", bottom: -60, left: -30 }} />
          <span style={{ fontSize: 90, position: "relative", zIndex: 1, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.3))" }}>{item.emoji}</span>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)" }} />
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px 32px" }}>
          <span style={{
            display: "inline-block", fontSize: 10, fontWeight: 800,
            padding: "4px 12px", borderRadius: 12, marginBottom: 14,
            letterSpacing: "0.1em", textTransform: "uppercase",
            background: badge.bg, color: badge.color,
          }}>{item.badgeText}</span>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.2, marginBottom: 6 }}>{item.title}</div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 16, letterSpacing: "0.06em" }}>{item.date}</div>
          <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.7, marginBottom: 24 }}>{item.longDesc}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{
              flex: 1, padding: "12px 20px", borderRadius: 14,
              background: "linear-gradient(135deg, #0078d4, #005a9e)",
              color: "white", border: "none", fontWeight: 700, fontSize: 12,
              letterSpacing: "0.06em", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,120,212,0.3)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(0,120,212,0.4)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,120,212,0.3)"; }}
            >VIEW ALL PHOTOS</button>
            <button style={{
              padding: "12px 20px", borderRadius: 14,
              background: "#f0f7ff", color: "#0078d4",
              border: "1.5px solid #bfdbfe", fontWeight: 700, fontSize: 12,
              letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#dbeafe"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f0f7ff"; }}
            >SHARE</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Gallery Card ───────────────────────────────────────────────────────── */
function GalleryCard({ item, index, onClick }: { item: GalleryItem; index: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const badge = BADGE_STYLES[item.badge] ?? BADGE_STYLES.past;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: item.large ? "span 2" : "span 1",
        borderRadius: 20,
        background: "white",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        boxShadow: hovered
          ? "0 20px 60px rgba(0,120,212,0.16), 0 4px 16px rgba(0,0,0,0.06)"
          : "0 2px 16px rgba(0,120,212,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        transform: visible
          ? hovered ? "translateY(-6px) scale(1.005)" : "translateY(0) scale(1)"
          : "translateY(28px)",
        opacity: visible ? 1 : 0,
        transition: `transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, opacity 0.5s ease ${index * 0.07}s`,
        border: hovered ? "1px solid rgba(0,120,212,0.15)" : "1px solid rgba(226,232,240,0.8)",
      }}
    >
      {/* Image area */}
      <div style={{
        height: item.large ? 256 : 210,
        background: `linear-gradient(145deg, ${item.c1}, ${item.c2})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", flexShrink: 0,
      }}>
        {/* Decorative orbs */}
        <div style={{
          position: "absolute", width: "60%", height: "60%",
          borderRadius: "50%", background: "rgba(255,255,255,0.07)",
          top: "-20%", right: "-15%",
          transform: hovered ? "scale(1.15)" : "scale(1)",
          transition: "transform 0.6s ease",
        }} />
        <div style={{
          position: "absolute", width: "40%", height: "40%",
          borderRadius: "50%", background: "rgba(255,255,255,0.07)",
          bottom: "-15%", left: "-10%",
          transform: hovered ? "scale(1.2)" : "scale(1)",
          transition: "transform 0.6s ease 0.05s",
        }} />
        <span style={{
          fontSize: item.large ? 64 : 54,
          position: "relative", zIndex: 1,
          filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.25))",
          transform: hovered ? "scale(1.1) translateY(-3px)" : "scale(1) translateY(0)",
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          display: "block",
        }}>{item.emoji}</span>
        <span style={{
          position: "absolute", top: 14, left: 14, zIndex: 2,
          fontSize: 10, fontWeight: 800, padding: "4px 12px", borderRadius: 12,
          letterSpacing: "0.1em", textTransform: "uppercase",
          background: badge.bg, color: badge.color,
        }}>{item.badgeText}</span>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(8,16,28,0.45) 0%, transparent 55%)",
        }} />
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 12px", flex: 1 }}>
        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, marginBottom: 6, letterSpacing: "0.08em" }}>{item.date}</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.3, marginBottom: 8 }}>{item.title}</div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{item.shortDesc}</div>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 18px 16px",
        borderTop: "1px solid #f1f5f9",
        marginTop: "auto",
      }}>
        <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
          <span>{item.statIcon}</span> {item.stat}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 800, color: "#0078d4",
          display: "flex", alignItems: "center", gap: 4, letterSpacing: "0.05em",
          transform: hovered ? "translateX(3px)" : "translateX(0)",
          transition: "transform 0.25s ease",
        }}>
          {item.ctaText} →
        </span>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
import { getData } from "@/lib/api";

export default function MSSGallery() {
  const [activeFilter, setActiveFilter] = useState<Category>("all");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [items, setItems] = useState<GalleryItem[]>(DEFAULT_ITEMS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await getData();
        const data: any = res.data;
        if (data && data.gallery && data.gallery.length > 0) {
          setItems(data.gallery.map((g: any, i: number) => {
            const categoryNorm = (g.category || "").toLowerCase();
            const validCategory: Category = ["hackathon", "workshop", "event", "recruitment", "award"].includes(categoryNorm) 
              ? (categoryNorm as Category) 
              : "event";
              
            return {
              id: g.id || i,
              emoji: "📷",
              c1: "#1a7dc4", c2: "#0c3d6b",
              badge: "past", badgeText: "GALLERY",
              category: validCategory,
              date: g.eventDate || "",
              title: g.title || "",
              shortDesc: g.description || "",
              longDesc: g.description || "",
              stat: "View", statIcon: "📷", ctaText: "VIEW",
              large: false
            };
          }));
        }
      } catch (err: any) {
        console.error("Failed to fetch gallery:", err);
        setError(err.message || "Failed to load gallery items.");
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  const filtered = items.filter(item => activeFilter === "all" || item.category === activeFilter);

  return (
    <div style={{
      fontFamily: "'Segoe UI', 'Segoe UI Variable', system-ui, sans-serif",
      background: "#f8fafc",
      minHeight: "100vh",
      color: "#0f172a",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* ── Subtle dot-grid background ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        opacity: 0.45,
      }} />

      {/* ── Ambient blobs ── */}
      <div style={{
        position: "fixed", top: -180, right: -120, width: 600, height: 600,
        borderRadius: "50%", zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(circle, rgba(0,120,212,0.09) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "fixed", bottom: -200, left: -150, width: 700, height: 700,
        borderRadius: "50%", zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(circle, rgba(0,164,239,0.07) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <div style={{ textAlign: "center", padding: "120px 40px 40px" }}>

          {/* Actually render 4 squares in a 2x2 grid */}
          <div style={{
            display: "inline-grid", gridTemplateColumns: "1fr 1fr", gap: 3,
            marginBottom: 28,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(-16px)",
            transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            {["#f25022","#7fba00","#00a4ef","#ffb900"].map((c, i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: c }} />
            ))}
          </div>

          {/* Pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "white", border: "1.5px solid #e2e8f0",
            borderRadius: 30, padding: "7px 22px", marginBottom: 24,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#0078d4",
            boxShadow: "0 2px 12px rgba(0,120,212,0.1)",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s",
          }}>
            <span style={{ color: "#0078d4", fontSize: 14 }}>◆</span>
            UEM KOLKATA · SEASON II
            <span style={{ color: "#0078d4", fontSize: 14 }}>◆</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(52px, 8vw, 88px)",
            fontWeight: 900, lineHeight: 0.9, letterSpacing: "-2px",
            color: "#0f172a", textTransform: "uppercase", marginBottom: 14,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.18s",
          }}>
            MEMORY<br />
            <span style={{
              background: "linear-gradient(135deg, #0078d4, #00a4ef)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>GALLERY</span>
          </h1>

          <p style={{
            fontSize: 11, letterSpacing: "0.24em", color: "#64748b",
            fontWeight: 700, textTransform: "uppercase",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.6s ease 0.28s",
          }}>
            UEMK · KOLKATA · EXCELLENCE &amp; INNOVATION
          </p>
        </div>

        {/* ── STATS BAR ── */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 0,
          padding: "0 40px 44px", maxWidth: 900, margin: "0 auto",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              flex: 1, textAlign: "center",
              background: "white", padding: "20px 14px",
              border: "1px solid #e2e8f0",
              borderLeft: i === 0 ? "1px solid #e2e8f0" : "none",
              borderRadius: i === 0 ? "16px 0 0 16px" : i === STATS.length - 1 ? "0 16px 16px 0" : 0,
              boxShadow: "0 2px 12px rgba(0,120,212,0.06)",
              transition: "all 0.25s ease",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "#f0f7ff"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "white"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: 38, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
                <AnimatedNumber target={parseInt(s.num)} />
                <span style={{ color: "#0078d4" }}>{s.suffix}</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTER BAR ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8, padding: "0 40px 36px" }}>
          {FILTERS.map(f => {
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                  padding: "9px 22px", borderRadius: 30,
                  border: isActive ? "1.5px solid #0078d4" : "1.5px solid #e2e8f0",
                  background: isActive ? "linear-gradient(135deg, #0078d4, #005a9e)" : "white",
                  color: isActive ? "white" : "#334155",
                  cursor: "pointer",
                  boxShadow: isActive ? "0 4px 16px rgba(0,120,212,0.25)" : "0 1px 4px rgba(0,0,0,0.06)",
                  transform: isActive ? "translateY(-2px)" : "translateY(0)",
                  transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.borderColor = "#93c5fd"; (e.currentTarget as HTMLButtonElement).style.background = "#f0f7ff"; (e.currentTarget as HTMLButtonElement).style.color = "#0078d4"; }}}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.background = "white"; (e.currentTarget as HTMLButtonElement).style.color = "#334155"; }}}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* ── GALLERY GRID ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
          padding: "0 40px 72px",
          maxWidth: 1220,
          margin: "0 auto",
        }}>
          {loading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "100px 0", color: "#8aabcc" }}>Loading gallery...</div>
          ) : error ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "100px 0", color: "#ff6b6b" }}>{error}</div>
          ) : (
            filtered.map((item, i) => (
              <GalleryCard
                key={item.id}
                item={item}
                index={i}
                onClick={() => setLightboxItem(item)}
              />
            ))
          )}
        </div>

        {/* ── FOOTER ── */}
        <footer style={{
          textAlign: "center", padding: "28px 40px",
          borderTop: "1px solid #e2e8f0",
          background: "white",
          fontSize: 12, color: "#94a3b8", fontWeight: 600,
          letterSpacing: "0.06em",
        }}>
          © 2026 Microsoft Student Society · UEM Kolkata Chapter &nbsp;·&nbsp; Season II
        </footer>
      </div>

      {/* ── LIGHTBOX ── */}
      <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />

      {/* Global styles for mobile */}
      <style>{`
        @media (max-width: 768px) {
          .mss-grid { grid-template-columns: 1fr !important; padding: 0 16px 48px !important; }
        }
      `}</style>
    </div>
  );
}