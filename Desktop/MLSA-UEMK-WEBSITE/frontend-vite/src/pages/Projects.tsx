 ;
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface Project {
  id: number;
  name: string;
  shortDesc: string;
  type: "Software" | "Hardware" | "Research" | "Design" | "AI/ML";
  status: "In Progress" | "Review" | "Planning";
  lead: string;
  leadRole: string;
  team: string[];
  tags: string[];
  github?: string;
  liveUrl?: string;
  progress: number;
  startDate: string;
  eta: string;
  category: "ongoing" | "upcoming";
  accentColor: string;
  bgGradient: string;
  coverEmoji: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_PROJECTS: Project[] = [
  {
    id: 1,
    name: "Smart Campus Advisory Assistant",
    shortDesc: "AI assistant providing quick links, curriculum maps, and room directions using Gemini models.",
    type: "AI/ML",
    status: "In Progress",
    lead: "Arjun Mehta",
    leadRole: "President",
    team: ["Priya Sharma", "Rohit Das", "Ananya Roy"],
    tags: ["React", "TypeScript", "Express", "Gemini API"],
    github: "https://github.com/mlsa-uemk",
    liveUrl: "https://campus.mlsa-uemk.in",
    progress: 72,
    startDate: "Jan 2025",
    eta: "Apr 2025",
    category: "ongoing",
    accentColor: "#1557fc",
    bgGradient: "linear-gradient(135deg, #dceeff 0%, #eaf3ff 100%)",
    coverEmoji: "🤖",
  },
  {
    id: 2,
    name: "MSS Event Management Portal",
    shortDesc: "Full-stack portal for organizing, registering and tracking all MSS events and workshops.",
    type: "Software",
    status: "In Progress",
    lead: "Priya Sharma",
    leadRole: "Vice President",
    team: ["Dev Kapoor", "Sana Mirza", "Kunal Bose"],
    tags: ["Next.js", "PostgreSQL", "Prisma", "Tailwind"],
    github: "https://github.com/mlsa-uemk",
    progress: 55,
    startDate: "Feb 2025",
    eta: "May 2025",
    category: "ongoing",
    accentColor: "#0d9afc",
    bgGradient: "linear-gradient(135deg, #d6f0ff 0%, #e8f7ff 100%)",
    coverEmoji: "📅",
  },
  {
    id: 3,
    name: "IoT Campus Environment Monitor",
    shortDesc: "Hardware + cloud project tracking air quality, temperature & noise levels across UEM campus.",
    type: "Hardware",
    status: "Review",
    lead: "Rohit Das",
    leadRole: "Secretary General",
    team: ["Aditya Sen", "Monika Pal"],
    tags: ["Arduino", "Raspberry Pi", "Azure IoT", "Python"],
    github: "https://github.com/mlsa-uemk",
    progress: 88,
    startDate: "Nov 2024",
    eta: "Mar 2025",
    category: "ongoing",
    accentColor: "#00b4d8",
    bgGradient: "linear-gradient(135deg, #cff4fc 0%, #e0faff 100%)",
    coverEmoji: "🌡️",
  },
  {
    id: 4,
    name: "MLSA Leaderboard & Points System",
    shortDesc: "Gamified contribution tracker rewarding members for events, PRs, and volunteer hours.",
    type: "Software",
    status: "In Progress",
    lead: "Sana Mirza",
    leadRole: "Tech Lead",
    team: ["Arjun Mehta", "Dev Kapoor", "Tanvi Ghosh"],
    tags: ["React", "Firebase", "Node.js", "Chart.js"],
    github: "https://github.com/mlsa-uemk",
    progress: 40,
    startDate: "Mar 2025",
    eta: "Jun 2025",
    category: "ongoing",
    accentColor: "#3a86ff",
    bgGradient: "linear-gradient(135deg, #dce8ff 0%, #edf3ff 100%)",
    coverEmoji: "🏆",
  },
  {
    id: 5,
    name: "AR Campus Navigation App",
    shortDesc: "Augmented reality mobile app to navigate UEM campus buildings and locate facilities.",
    type: "Research",
    status: "Planning",
    lead: "Ananya Roy",
    leadRole: "Research Lead",
    team: ["Kunal Bose", "Rahul Singh", "Diya Nath"],
    tags: ["Unity", "AR Foundation", "C#", "Google Maps API"],
    progress: 15,
    startDate: "Apr 2025",
    eta: "Sep 2025",
    category: "upcoming",
    accentColor: "#4cc9f0",
    bgGradient: "linear-gradient(135deg, #d0f4ff 0%, #e8faff 100%)",
    coverEmoji: "🗺️",
  },
  {
    id: 6,
    name: "Open-Source Contribution Drive",
    shortDesc: "Organized hackathon-style initiative to get members contributing to real-world OSS projects.",
    type: "Software",
    status: "Planning",
    lead: "Dev Kapoor",
    leadRole: "Community Lead",
    team: ["Priya Sharma", "Tanvi Ghosh", "Aditya Sen"],
    tags: ["Git", "GitHub", "Open Source", "Mentorship"],
    progress: 8,
    startDate: "May 2025",
    eta: "Jul 2025",
    category: "upcoming",
    accentColor: "#1557fc",
    bgGradient: "linear-gradient(135deg, #dceeff 0%, #eaf3ff 100%)",
    coverEmoji: "🌐",
  },
  {
    id: 7,
    name: "AI Study Buddy Chatbot",
    shortDesc: "LLM-powered study assistant tuned on UEM syllabus data to help students prepare for exams.",
    type: "AI/ML",
    status: "Planning",
    lead: "Tanvi Ghosh",
    leadRole: "AI Research Lead",
    team: ["Arjun Mehta", "Monika Pal", "Rahul Singh"],
    tags: ["Python", "LangChain", "OpenAI", "FastAPI"],
    progress: 5,
    startDate: "Jun 2025",
    eta: "Oct 2025",
    category: "upcoming",
    accentColor: "#0077b6",
    bgGradient: "linear-gradient(135deg, #d0ebff 0%, #e6f4ff 100%)",
    coverEmoji: "📚",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HEX BACKGROUND — same engine as the rest of the site
// ─────────────────────────────────────────────────────────────────────────────
// ── Shared hex config ──────────────────────────────────────────────────────
function HexCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number = 0;
    let hexes: { x: number; y: number; R: number; alpha: number; phase: number; speed: number }[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      buildGrid();
    }

    function buildGrid() {
      if (!canvas) return;
      hexes = [];
      const W = canvas.width, H = canvas.height;
      // Smaller hexes on mobile for better density
      const R = W < 480 ? 26 : 38;
      const rw = R * Math.sqrt(3), rh = R * 1.5;
      const cols = Math.ceil(W / rw) + 2;
      const rows = Math.ceil(H / rh) + 2;
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * rw + (row % 2 === 0 ? 0 : rw / 2);
          const y = row * rh;
          const isTop = y < H * 0.28;
          const isBottom = y > H * 0.72;
          if (isTop || isBottom) {
            const dist = isTop ? H * 0.28 - y : y - H * 0.72;
            const alpha = Math.min(dist / (H * 0.28), 1);
            hexes.push({ x, y, R, alpha, phase: Math.random() * Math.PI * 2, speed: 0.008 + Math.random() * 0.012 });
          }
        }
      }
    }

    function hexPath(x: number, y: number, r: number) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30);
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    let t = 0;
    function draw() {
      if (!canvas) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t++;
      for (const h of hexes) {
        const pulse = 0.5 + 0.5 * Math.sin(t * h.speed + h.phase);
        const base = h.alpha * 0.55;
        const a = base * (0.4 + 0.6 * pulse);
        hexPath(h.x, h.y, h.R - 3);
        ctx.strokeStyle = `rgba(0,100,200,${a * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        hexPath(h.x, h.y, h.R - 3);
        ctx.fillStyle = `rgba(100,170,255,${a * 0.12})`;
        ctx.fill();
      }
      // animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}

// ── Reusable hex cloud canvas — renders ROWS rows starting from a given edge ─

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Project["status"] }) {
  const cfg = {
    "In Progress": { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6", label: "In Progress" },
    "Review":      { bg: "#d1fae5", color: "#065f46", dot: "#10b981", label: "Under Review" },
    "Planning":    { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Upcoming" },
  }[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", background: cfg.bg, color: cfg.color, fontSize: "9px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'Outfit', sans-serif" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, display: "inline-block", animation: status === "In Progress" ? "dot-blink 1.8s ease-in-out infinite" : "none" }} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPE BADGE
// ─────────────────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: Project["type"] }) {
  const cfg = {
    "Software": { bg: "#eff6ff", color: "#1d4ed8", icon: "⌨️" },
    "Hardware": { bg: "#f0fdf4", color: "#166534", icon: "🔧" },
    "Research": { bg: "#faf5ff", color: "#6b21a8", icon: "🔬" },
    "Design":   { bg: "#fff1f2", color: "#9f1239", icon: "🎨" },
    "AI/ML":    { bg: "#ecfeff", color: "#0e7490", icon: "🧠" },
  }[type];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", background: cfg.bg, color: cfg.color, fontSize: "9px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'Outfit', sans-serif", border: `1px solid ${cfg.color}22` }}>
      {cfg.icon} {type}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────
function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ width: "100%", height: "6px", borderRadius: "6px", background: "rgba(21,87,252,0.10)", overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        style={{ height: "100%", borderRadius: "6px", background: `linear-gradient(90deg, ${color} 0%, ${color}bb 100%)`, boxShadow: `0 0 8px ${color}66` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", cursor: "pointer" }}
    >
      <motion.div
        animate={{
          y: hovered ? -10 : 0,
          boxShadow: hovered
            ? `0 32px 72px rgba(21,87,252,0.22), 0 8px 24px rgba(0,0,0,0.10), 0 0 0 1.5px ${project.accentColor}44`
            : "0 4px 20px rgba(21,87,252,0.08), 0 1px 4px rgba(0,0,0,0.05)",
        }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        style={{
          background: "#ffffff",
          borderRadius: "22px",
          border: `1.5px solid rgba(21,87,252,0.10)`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ── Top accent bar ── */}
        <div style={{ height: "4px", background: `linear-gradient(90deg, ${project.accentColor} 0%, ${project.accentColor}88 100%)` }} />

        {/* ── Cover area ── */}
        <div style={{ height: "140px", background: project.bgGradient, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {/* subtle hex texture overlay */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 20% 80%, ${project.accentColor}14 0%, transparent 60%), radial-gradient(circle at 80% 20%, ${project.accentColor}10 0%, transparent 60%)` }} />
          <motion.div
            animate={{ scale: hovered ? 1.12 : 1, rotate: hovered ? 8 : 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            style={{ fontSize: "54px", lineHeight: 1, zIndex: 1, filter: "drop-shadow(0 4px 12px rgba(21,87,252,0.20))" }}
          >
            {project.coverEmoji}
          </motion.div>
          {/* status badge top-right */}
          <div style={{ position: "absolute", top: "12px", right: "12px" }}>
            <StatusBadge status={project.status} />
          </div>
          {/* type badge top-left */}
          <div style={{ position: "absolute", top: "12px", left: "12px" }}>
            <TypeBadge type={project.type} />
          </div>
        </div>

        {/* ── Base info (always visible) ── */}
        <div style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "15px", fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: "#0d1a30", letterSpacing: "-.01em", lineHeight: 1.25, marginBottom: "6px" }}>
            {project.name}
          </div>
          <div style={{ fontSize: "11.5px", fontFamily: "'Outfit', sans-serif", color: "#4d6e96", lineHeight: 1.6, marginBottom: "14px", minHeight: "36px" }}>
            {project.shortDesc}
          </div>
          <ProgressBar value={project.progress} color={project.accentColor} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "10px", fontFamily: "'Outfit', sans-serif", color: "#7a9abb", fontWeight: 600 }}>
            <span>Progress</span>
            <span style={{ color: project.accentColor, fontWeight: 800 }}>{project.progress}%</span>
          </div>
        </div>

        {/* ── HOVER EXPAND PANEL ── */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="expand"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "0 20px 20px", borderTop: `1px solid rgba(21,87,252,0.07)`, marginTop: "-2px" }}>
                <div style={{ height: "1px", background: "rgba(21,87,252,0.07)", marginBottom: "14px" }} />

                {/* Lead */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `linear-gradient(135deg, ${project.accentColor} 0%, ${project.accentColor}88 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "#fff", fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>
                    {project.lead.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "#0d1a30" }}>{project.lead}</div>
                    <div style={{ fontSize: "9.5px", fontFamily: "'Outfit', sans-serif", color: "#6b8caa", letterSpacing: ".06em", textTransform: "uppercase" }}>{project.leadRole} · Project Lead</div>
                  </div>
                </div>

                {/* Team avatars */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "9px", fontFamily: "'Outfit', sans-serif", color: "#8aabcc", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: "6px" }}>Team</div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {project.team.map((member) => (
                      <span key={member} style={{ padding: "3px 9px", borderRadius: "20px", background: "rgba(21,87,252,0.06)", color: "#1a4a7a", fontSize: "10px", fontFamily: "'Outfit', sans-serif", fontWeight: 600, border: "1px solid rgba(21,87,252,0.10)" }}>
                        {member.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech tags */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "9px", fontFamily: "'Outfit', sans-serif", color: "#8aabcc", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: "6px" }}>Tech Stack</div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {project.tags.map((tag) => (
                      <span key={tag} style={{ padding: "3px 9px", borderRadius: "6px", background: `${project.accentColor}12`, color: project.accentColor, fontSize: "10px", fontFamily: "'Outfit', sans-serif", fontWeight: 700, border: `1px solid ${project.accentColor}30` }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
                  <div style={{ flex: 1, padding: "8px 10px", borderRadius: "10px", background: "rgba(21,87,252,0.04)", border: "1px solid rgba(21,87,252,0.08)" }}>
                    <div style={{ fontSize: "8.5px", fontFamily: "'Outfit', sans-serif", color: "#8aabcc", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>Started</div>
                    <div style={{ fontSize: "11px", fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: "#0d1a30", marginTop: "2px" }}>{project.startDate}</div>
                  </div>
                  <div style={{ flex: 1, padding: "8px 10px", borderRadius: "10px", background: "rgba(21,87,252,0.04)", border: "1px solid rgba(21,87,252,0.08)" }}>
                    <div style={{ fontSize: "8.5px", fontFamily: "'Outfit', sans-serif", color: "#8aabcc", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>ETA</div>
                    <div style={{ fontSize: "11px", fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: project.accentColor, marginTop: "2px" }}>{project.eta}</div>
                  </div>
                </div>

                {/* Link buttons */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {project.github && (
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "8px", borderRadius: "10px", background: "#0d1a30", color: "#fff", fontSize: "10px", fontFamily: "'Outfit', sans-serif", fontWeight: 700, textDecoration: "none", letterSpacing: ".06em" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                      Codebase
                    </motion.a>
                  )}
                  {project.liveUrl && (
                    <motion.a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "8px", borderRadius: "10px", background: `${project.accentColor}`, color: "#fff", fontSize: "10px", fontFamily: "'Outfit', sans-serif", fontWeight: 700, textDecoration: "none", letterSpacing: ".06em", boxShadow: `0 4px 14px ${project.accentColor}44` }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Ingress Live
                    </motion.a>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: `0 6px 20px ${project.accentColor}55` }}
                    whileTap={{ scale: 0.97 }}
                    style={{ flex: project.liveUrl ? 1 : 2, padding: "8px", borderRadius: "10px", background: `linear-gradient(135deg, ${project.accentColor} 0%, ${project.accentColor}cc 100%)`, color: "#fff", fontSize: "10px", fontFamily: "'Outfit', sans-serif", fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: ".08em", textTransform: "uppercase", boxShadow: `0 4px 14px ${project.accentColor}44` }}
                  >
                    ✦ Apply
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER (same numbered style as image 1)
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ number, title, subtitle, count }: { number: number; title: string; subtitle: string; count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "32px" }}
    >
      <div style={{ width: "54px", height: "54px", borderRadius: "16px", background: "linear-gradient(135deg, #1557fc 0%, #0d3ed4 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontFamily: "'Bebas Neue', sans-serif", color: "#fff", flexShrink: 0, boxShadow: "0 8px 24px rgba(21,87,252,0.36)" }}>
        {number}
      </div>
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: 0, fontSize: "clamp(20px, 3vw, 28px)", fontFamily: "'Bebas Neue', sans-serif", color: "#0d1a30", letterSpacing: ".06em", lineHeight: 1 }}>
          {title}
        </h2>
        <div style={{ fontSize: "10px", fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "#1557fc", letterSpacing: ".15em", textTransform: "uppercase", marginTop: "3px" }}>
          {subtitle}
        </div>
      </div>
      {/* divider line */}
      <div style={{ flex: 1, height: "1.5px", background: "linear-gradient(90deg, rgba(21,87,252,0.18) 0%, transparent 100%)", maxWidth: "200px" }} />
      {/* count pill */}
      <div style={{ padding: "6px 16px", borderRadius: "50px", background: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(21,87,252,0.15)", backdropFilter: "blur(10px)", fontSize: "11px", fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "#1557fc", letterSpacing: ".05em", boxShadow: "0 2px 10px rgba(21,87,252,0.10)", whiteSpace: "nowrap" }}>
        {count} Projects
      </div>
    </motion.div>
  );
}

import { getData } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await getData();
        const data: any = res.data;
        if (data && data.projects && data.projects.length > 0) {
          setProjects(data.projects.map((p: any, i: number) => ({
            id: p.id || i,
            name: p.title || "Project",
            shortDesc: p.description || "",
            type: "Software",
            status: "In Progress",
            lead: "MLSA Team",
            leadRole: "Core",
            team: [],
            tags: p.techStack || [],
            github: p.githubUrl,
            liveUrl: p.liveUrl,
            progress: 80,
            startDate: "2024",
            eta: "Ongoing",
            category: "ongoing",
            accentColor: "#1557fc",
            bgGradient: "linear-gradient(135deg, #dceeff 0%, #eaf3ff 100%)",
            coverEmoji: "🚀",
          })));
        }
      } catch (err: any) {
        console.error("Failed to fetch projects:", err);
        setError(err.message || "Failed to load projects.");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const ongoing = projects.filter(p => p.category === "ongoing");
  const upcoming = projects.filter(p => p.category === "upcoming");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #edf5ff; }
        @keyframes dot-blink {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.25; transform:scale(.6); }
        }
        @keyframes float-badge {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #edf5ff; }
        ::-webkit-scrollbar-thumb { background: rgba(21,87,252,0.25); border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(21,87,252,0.45); }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#edf5ff", position: "relative", fontFamily: "'Outfit', sans-serif" }}>
        <HexCanvas />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "1400px", margin: "0 auto", padding: "clamp(120px, 10vw, 160px) clamp(20px, 5vw, 60px) 80px" }}>

          {/* ─── PAGE HERO ─── */}
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            {/* eyebrow pill */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 20px", borderRadius: "50px", background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(21,87,252,0.18)", backdropFilter: "blur(12px)", fontSize: "10px", fontWeight: 700, letterSpacing: ".16em", color: "#1557fc", textTransform: "uppercase", marginBottom: "20px", boxShadow: "0 4px 16px rgba(21,87,252,0.10)" }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1557fc", display: "inline-block", animation: "dot-blink 1.8s ease-in-out infinite" }} />
              Microsoft Student Society · UEMK
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1557fc", display: "inline-block", animation: "dot-blink 1.8s ease-in-out infinite" }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              style={{ fontSize: "clamp(48px, 8vw, 96px)", fontFamily: "'Bebas Neue', sans-serif", color: "#0d1a30", letterSpacing: ".04em", lineHeight: 0.95, marginBottom: "16px" }}
            >
              OUR{" "}
              <span style={{ color: "#1557fc", textShadow: "0 0 40px rgba(21,87,252,0.25)" }}>PROJECTS</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: "clamp(12px, 1.5vw, 14px)", fontFamily: "'Outfit', sans-serif", color: "#4d6e96", letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 600 }}
            >
              UEMK · KOLKATA · EXCELLENCE &amp; INNOVATION
            </motion.p>

            {/* stats row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}
            >
              {[
                { value: `${ongoing.length}`, label: "Active Projects" },
                { value: `${upcoming.length}`, label: "Upcoming" },
                { value: `${projects.reduce((a, p) => a + p.team.length, 0) + projects.length}`, label: "Contributors" },
                { value: `${ongoing.length > 0 ? Math.round(ongoing.reduce((a, p) => a + p.progress, 0) / ongoing.length) : 0}%`, label: "Avg Progress" },
              ].map(({ value, label }) => (
                <div key={label} style={{ padding: "10px 20px", borderRadius: "16px", background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(21,87,252,0.12)", backdropFilter: "blur(12px)", textAlign: "center", boxShadow: "0 4px 16px rgba(21,87,252,0.08)" }}>
                  <div style={{ fontSize: "22px", fontFamily: "'Bebas Neue', sans-serif", color: "#1557fc", letterSpacing: ".04em" }}>{value}</div>
                  <div style={{ fontSize: "9px", fontFamily: "'Outfit', sans-serif", color: "#6b8caa", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "100px 0", color: "#8aabcc" }}>Loading projects...</div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "100px 0", color: "#ff6b6b" }}>{error}</div>
          ) : (
            <>
              {/* ─── ONGOING PROJECTS ─── */}
              <section style={{ marginBottom: "64px" }}>
                <SectionHeader
                  number={1}
                  title="Ongoing Projects"
                  subtitle="Currently Active — Season II"
                  count={ongoing.length}
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: "24px" }}>
                  {ongoing.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} />
                  ))}
                </div>
              </section>

              {/* ─── UPCOMING PROJECTS ─── */}
              <section>
                <SectionHeader
                  number={2}
                  title="Upcoming Projects"
                  subtitle="Planned Initiatives — Open for Applications"
                  count={upcoming.length}
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: "24px" }}>
                  {upcoming.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ─── BOTTOM CTA ─── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            style={{ marginTop: "72px", textAlign: "center", padding: "48px 32px", borderRadius: "28px", background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,249,255,0.95) 100%)", border: "1.5px solid rgba(21,87,252,0.14)", backdropFilter: "blur(20px)", boxShadow: "0 8px 40px rgba(21,87,252,0.10), inset 0 1px 0 rgba(255,255,255,0.9)" }}
          >
            <div style={{ fontSize: "clamp(28px, 4vw, 42px)", fontFamily: "'Bebas Neue', sans-serif", color: "#0d1a30", letterSpacing: ".06em", marginBottom: "10px" }}>
              HAVE AN IDEA? <span style={{ color: "#1557fc" }}>PITCH IT.</span>
            </div>
            <p style={{ fontSize: "13px", fontFamily: "'Outfit', sans-serif", color: "#4d6e96", maxWidth: "480px", margin: "0 auto 24px", lineHeight: 1.7 }}>
              Got a project idea that benefits the UEM community? Submit a proposal and our team will review it for the next season.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 12px 32px rgba(21,87,252,0.40)" }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: "13px 32px", borderRadius: "50px", background: "linear-gradient(135deg, #1557fc 0%, #0d3ed4 100%)", color: "#fff", fontSize: "11px", fontFamily: "'Outfit', sans-serif", fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: ".12em", textTransform: "uppercase", boxShadow: "0 6px 20px rgba(21,87,252,0.36)" }}
              >
                Submit a Proposal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: "13px 32px", borderRadius: "50px", background: "rgba(255,255,255,0.9)", color: "#1557fc", fontSize: "11px", fontFamily: "'Outfit', sans-serif", fontWeight: 800, border: "1.8px solid rgba(21,87,252,0.30)", cursor: "pointer", letterSpacing: ".12em", textTransform: "uppercase" }}
              >
                Join a Team
              </motion.button>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}