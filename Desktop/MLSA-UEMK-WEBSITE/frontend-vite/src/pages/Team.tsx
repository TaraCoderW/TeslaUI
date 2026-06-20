import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   TEAM DATA — 3 tiers
   Replace avatar URLs with real photos; placeholder uses initials fallback
   ───────────────────────────────────────────────────────────── */
const DEFAULT_TIERS = [
  {
    id: "high-table",
    label: "The High Table",
    sublabel: "Leadership & Founding Council",
    /* Deep navy shade for this tier */
    shade: { bg: "#0a1a3a", text: "#e8f0ff", accent: "#1557fc", badge: "rgba(21,87,252,0.18)" },
    members: [
      { name: "Arjun Mehta",     role: "President",              img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Priya Sharma",    role: "Vice President",         img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Rohit Das",       role: "Secretary General",      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Ananya Roy",      role: "Director of Operations", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
    ],
  },
  {
    id: "top-members",
    label: "Top Members",
    sublabel: "Core Team — Season II",
    /* Mid blue shade */
    shade: { bg: "#0d2a5c", text: "#cce0ff", accent: "#2979ff", badge: "rgba(41,121,255,0.18)" },
    members: [
      { name: "Siddharth Sen",   role: "Lead Developer",         img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Neha Gupta",      role: "Design Lead",            img: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Kartik Bose",     role: "ML Engineer",            img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Tanya Verma",     role: "Community Manager",      img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Aman Singh",      role: "Cloud Architect",        img: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Riya Banerjee",   role: "Event Coordinator",      img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
    ],
  },
  {
    id: "members",
    label: "Members",
    sublabel: "Active Contributors",
    /* Light steel blue shade */
    shade: { bg: "#1a4a8a", text: "#daeeff", accent: "#00a8e8", badge: "rgba(0,168,232,0.18)" },
    members: [
      { name: "Vikram Nair",     role: "Frontend Dev",           img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Shreya Iyer",     role: "Backend Dev",            img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Dev Choudhary",   role: "Cybersecurity",          img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Pooja Mishra",    role: "Data Analyst",           img: "https://images.unsplash.com/photo-1520810627419-35e6bea78a2c?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Rahul Ghosh",     role: "Mobile Dev",             img: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Isha Kapoor",     role: "UI/UX Designer",         img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Nikhil Joshi",    role: "DevOps Engineer",        img: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
      { name: "Meera Pillai",    role: "Content Strategist",     img: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&q=80", twitter: "#", linkedin: "#", instagram: "#" },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   3D HEX BACKGROUND CANVAS — matches site theme
   ───────────────────────────────────────────────────────────── */
function HexBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, t = 0, raf = 0;
    const hexes: any[] = [];
    const R = 32, GAP = 5;

    function resize() {
      if (!canvas) return;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      buildGrid();
    }

    function buildGrid() {
      hexes.length = 0;
      const colW = Math.sqrt(3) * (R + GAP);
      const rowH = 1.5 * (R + GAP);
      const cols = Math.ceil(W / colW) + 3;
      const rows = Math.ceil(H / rowH) + 3;
      for (let row = 0; row < rows; row++) {
        const off = row % 2 === 0 ? 0 : colW / 2;
        for (let col = -1; col < cols; col++) {
          hexes.push({
            cx: col * colW + off,
            cy: row * rowH,
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.4,
            /* Subtle blue/white palette for bg — not as loud as hero */
            colorIdx: Math.floor(Math.random() * 4),
          });
        }
      }
    }

    /* Soft MS-adjacent blues for background hexes */
    const COLORS = [
      { stroke: "rgba(21,87,252,0.12)",  fill: "rgba(220,235,255,0.55)" },
      { stroke: "rgba(0,164,239,0.10)",  fill: "rgba(210,240,255,0.45)" },
      { stroke: "rgba(127,186,0,0.08)",  fill: "rgba(230,245,210,0.35)" },
      { stroke: "rgba(255,185,0,0.08)",  fill: "rgba(255,248,220,0.35)" },
    ];

    function drawHex(cx: number, cy: number, r: number, pulse: number, ci: number) {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        i === 0 ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.closePath();
      const c = COLORS[ci];
      /* Slight 3D top shimmer */
      const grd = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
      grd.addColorStop(0, "rgba(255,255,255,0.38)");
      grd.addColorStop(0.5, c.fill);
      grd.addColorStop(1, c.fill.replace("0.55", "0.25").replace("0.45", "0.20").replace("0.35", "0.15"));
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 1.2 + pulse * 0.6;
      ctx.stroke();
      /* Inner energy ring on pulse peak */
      if (pulse > 0.7) {
        const rr = r * (0.5 + pulse * 0.2);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          const x = cx + rr * Math.cos(a);
          const y = cy + rr * Math.sin(a);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(21,87,252,${(pulse - 0.7) * 0.25})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    function loop() {
      // raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);
      t += 0.012;
      for (const h of hexes) {
        const pulse = Math.sin(t * h.speed + h.phase) * 0.5 + 0.5;
        const floatY = Math.sin(t * 0.3 + h.phase) * 2.5;
        ctx.globalAlpha = 0.55 + pulse * 0.25;
        drawHex(h.cx, h.cy + floatY, R * (0.9 + pulse * 0.08), pulse, h.colorIdx);
      }
      ctx.globalAlpha = 1;
    }

    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(timer); timer = setTimeout(resize, 80); };
    window.addEventListener("resize", onResize);
    resize();
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      {/* Top fade */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(232,240,255,0.92) 0%, rgba(232,240,255,0.60) 20%, transparent 50%)", pointerEvents: "none" }} />
      {/* Bottom fade */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(232,240,255,0.85) 0%, transparent 40%)", pointerEvents: "none" }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SOCIAL ICON SVGs — Twitter/X, LinkedIn, Instagram
   ───────────────────────────────────────────────────────────── */
function TwitterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm10.75 1.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   TEAM MEMBER CARD
   ───────────────────────────────────────────────────────────── */
interface Member {
  name: string; role: string; img: string;
  twitter: string; linkedin: string; instagram: string;
}
interface CardProps { member: Member; accent: string; }

function MemberCard({ member, accent }: CardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const initials = member.name.split(" ").map(w => w[0]).join("").slice(0, 2);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: "relative",
        width: "180px",
        height: "240px",
        borderRadius: "16px",
        overflow: "hidden",
        flexShrink: 0,
        cursor: "pointer",
        /* Subtle blue-tinted border */
        border: `1.5px solid ${accent}33`,
        boxShadow: hovered
          ? `0 20px 50px ${accent}44, 0 4px 16px rgba(0,0,0,0.18)`
          : "0 4px 20px rgba(10,26,58,0.18)",
        transition: "box-shadow 0.35s ease",
      }}
    >
      {/* Photo / Initials fallback */}
      {!imgErr ? (
        <img
          src={member.img}
          alt={member.name}
          onError={() => setImgErr(true)}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            display: "block",
            /* Desaturate slightly for consistency, restore on hover */
            filter: hovered ? "saturate(1.1) brightness(1.05)" : "saturate(0.85)",
          }}
        />
      ) : (
        <div style={{
          width: "100%", height: "100%", display: "flex", alignItems: "center",
          justifyContent: "center", background: `linear-gradient(135deg, #0d2a5c, #1557fc)`,
          fontSize: "42px", fontWeight: 700, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: ".05em",
        }}>
          {initials}
        </div>
      )}

      {/* Always-visible bottom name bar */}
      <motion.div
        animate={hovered ? { height: "90px" } : { height: "52px" }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(to top, rgba(8,18,40,0.97) 0%, rgba(8,18,40,0.85) 60%, transparent 100%)",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          padding: "10px 12px",
          overflow: "hidden",
        }}
      >
        {/* Name */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "15px", fontWeight: 700, color: "#fff",
          lineHeight: 1.1, letterSpacing: ".01em",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {member.name}
        </div>

        {/* Role — always visible */}
        <div style={{
          fontSize: "10px", fontWeight: 500, color: "rgba(180,210,255,0.80)",
          letterSpacing: ".06em", textTransform: "uppercase", marginTop: "2px",
        }}>
          {member.role}
        </div>

        {/* Social links — slide in on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              style={{
                display: "flex", gap: "6px", marginTop: "8px", alignItems: "center",
              }}
            >
              {/* Twitter / X — brand blue on hover */}
              <motion.a
                href={member.twitter} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                whileHover={{ scale: 1.18, backgroundColor: "#1da1f2", color: "#fff" }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "26px", height: "26px", borderRadius: "6px",
                  background: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.80)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  transition: "background 0.2s, color 0.2s",
                  textDecoration: "none",
                }}
              >
                <TwitterIcon size={13} />
              </motion.a>

              {/* LinkedIn — brand blue on hover */}
              <motion.a
                href={member.linkedin} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                whileHover={{ scale: 1.18, backgroundColor: "#0a66c2", color: "#fff" }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "26px", height: "26px", borderRadius: "6px",
                  background: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.80)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  transition: "background 0.2s, color 0.2s",
                  textDecoration: "none",
                }}
              >
                <LinkedInIcon size={13} />
              </motion.a>

              {/* Instagram — brand pink/violet on hover */}
              <motion.a
                href={member.instagram} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                whileHover={{ scale: 1.18, backgroundColor: "#c13584", color: "#fff" }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "26px", height: "26px", borderRadius: "6px",
                  background: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.80)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  transition: "background 0.2s, color 0.2s",
                  textDecoration: "none",
                }}
              >
                <InstagramIcon size={13} />
              </motion.a>

              {/* Arrow link indicator */}
              <span style={{ color: "rgba(180,210,255,0.55)", fontSize: "11px", marginLeft: "auto" }}>↗</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COOL BUTTON-PRESS SLIDER
   ───────────────────────────────────────────────────────────── */
interface SliderProps {
  members: Member[];
  accent: string;
  shade: { bg: string; text: string; accent: string; badge: string };
}

function MemberSlider({ members, accent, shade }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  /* How many cards fit visibly — we show CARDS_PER_PAGE at a time */
  const CARD_W = 180;
  const CARD_GAP = 16;
  const CARDS_PER_PAGE = 4;
  const STEP = (CARD_W + CARD_GAP) * CARDS_PER_PAGE;

  const [offset, setOffset] = useState(0);
  const maxOffset = Math.max(0, members.length * (CARD_W + CARD_GAP) - CARDS_PER_PAGE * (CARD_W + CARD_GAP));

  const [pressedLeft, setPressedLeft] = useState(false);
  const [pressedRight, setPressedRight] = useState(false);

  function slideLeft() {
    setOffset(o => Math.max(0, o - STEP));
  }
  function slideRight() {
    setOffset(o => Math.min(maxOffset, o + STEP));
  }

  /* Dot indicator count */
  const totalPages = Math.ceil(members.length / CARDS_PER_PAGE);
  const currentPage = Math.round(offset / STEP);

  const canLeft = offset > 0;
  const canRight = offset < maxOffset;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      {/* Slide track wrapper */}
      <div style={{ position: "relative", width: "100%", overflow: "hidden", padding: "8px 0 12px" }}>
        <motion.div
          ref={trackRef}
          animate={{ x: -offset }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          style={{
            display: "flex", gap: `${CARD_GAP}px`,
            width: "max-content",
            paddingLeft: "4px",
          }}
        >
          {members.map((m, i) => (
            <MemberCard key={m.name + i} member={m} accent={accent} />
          ))}
        </motion.div>

        {/* Left fade edge */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: "40px",
          background: "linear-gradient(to right, rgba(232,240,255,0.95), transparent)",
          pointerEvents: "none", zIndex: 2,
          opacity: canLeft ? 1 : 0, transition: "opacity 0.3s",
        }} />
        {/* Right fade edge */}
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: "40px",
          background: "linear-gradient(to left, rgba(232,240,255,0.95), transparent)",
          pointerEvents: "none", zIndex: 2,
          opacity: canRight ? 1 : 0, transition: "opacity 0.3s",
        }} />
      </div>

      {/* Controls row: LEFT BTN · DOTS · RIGHT BTN */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Left button — cool press effect */}
        <motion.button
          onMouseDown={() => setPressedLeft(true)}
          onMouseUp={() => { setPressedLeft(false); slideLeft(); }}
          onMouseLeave={() => setPressedLeft(false)}
          animate={pressedLeft ? { scale: 0.88, y: 2 } : { scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          disabled={!canLeft}
          style={{
            width: "44px", height: "44px", borderRadius: "14px",
            border: `2px solid ${canLeft ? accent : "rgba(21,87,252,0.15)"}`,
            background: canLeft
              ? pressedLeft
                ? accent
                : "rgba(255,255,255,0.85)"
              : "rgba(255,255,255,0.30)",
            color: canLeft ? (pressedLeft ? "#fff" : accent) : "rgba(21,87,252,0.30)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: canLeft ? "pointer" : "default",
            boxShadow: canLeft && !pressedLeft
              ? `0 4px 0 ${accent}44, 0 6px 16px rgba(21,87,252,0.15)`
              : canLeft && pressedLeft
                ? `0 1px 0 ${accent}44`
                : "none",
            backdropFilter: "blur(12px)",
            transition: "background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.15s",
            outline: "none",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.button>

        {/* Dot pagination */}
        <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setOffset(Math.min(maxOffset, i * STEP))}
              animate={{
                width: i === currentPage ? 24 : 8,
                background: i === currentPage ? accent : "rgba(21,87,252,0.22)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              style={{
                height: "8px", borderRadius: "4px",
                border: "none", cursor: "pointer", padding: 0, outline: "none",
              }}
            />
          ))}
        </div>

        {/* Right button */}
        <motion.button
          onMouseDown={() => setPressedRight(true)}
          onMouseUp={() => { setPressedRight(false); slideRight(); }}
          onMouseLeave={() => setPressedRight(false)}
          animate={pressedRight ? { scale: 0.88, y: 2 } : { scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          disabled={!canRight}
          style={{
            width: "44px", height: "44px", borderRadius: "14px",
            border: `2px solid ${canRight ? accent : "rgba(21,87,252,0.15)"}`,
            background: canRight
              ? pressedRight
                ? accent
                : "rgba(255,255,255,0.85)"
              : "rgba(255,255,255,0.30)",
            color: canRight ? (pressedRight ? "#fff" : accent) : "rgba(21,87,252,0.30)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: canRight ? "pointer" : "default",
            boxShadow: canRight && !pressedRight
              ? `0 4px 0 ${accent}44, 0 6px 16px rgba(21,87,252,0.15)`
              : canRight && pressedRight
                ? `0 1px 0 ${accent}44`
                : "none",
            backdropFilter: "blur(12px)",
            transition: "background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.15s",
            outline: "none",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TIER SECTION
   ───────────────────────────────────────────────────────────── */
interface TierSectionProps {
  tier: typeof DEFAULT_TIERS[0];
  index: number;
}

function TierSection({ tier, index }: TierSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      style={{ width: "100%", marginBottom: "72px" }}
    >
      {/* Tier header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", gap: "18px" }}>
        {/* Tier number badge */}
        <div style={{
          width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
          background: `linear-gradient(135deg, ${tier.shade.accent}, ${tier.shade.bg})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "20px", fontWeight: 900, color: "#fff",
          boxShadow: `0 4px 16px ${tier.shade.accent}44`,
        }}>
          {index + 1}
        </div>

        <div>
          {/* Tier label */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(26px, 3.5vw, 38px)",
            fontWeight: 900, textTransform: "uppercase",
            letterSpacing: ".04em",
            color: "#0a1a3a",
            margin: 0, lineHeight: 1,
          }}>
            {tier.label}
          </h2>
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "11px", fontWeight: 600, letterSpacing: ".18em",
            textTransform: "uppercase", color: tier.shade.accent,
            margin: "4px 0 0",
          }}>
            {tier.sublabel}
          </p>
        </div>

        {/* Decorative line */}
        <div style={{
          flex: 1, height: "1.5px",
          background: `linear-gradient(to right, ${tier.shade.accent}40, transparent)`,
          marginLeft: "8px",
        }} />

        {/* Member count chip */}
        <div style={{
          padding: "5px 14px", borderRadius: "20px",
          background: tier.shade.badge,
          border: `1px solid ${tier.shade.accent}30`,
          fontFamily: "'Outfit', sans-serif",
          fontSize: "11px", fontWeight: 700,
          color: tier.shade.accent,
          letterSpacing: ".08em",
          flexShrink: 0,
        }}>
          {tier.members.length} Members
        </div>
      </div>

      {/* Slider */}
      <MemberSlider
        members={tier.members}
        accent={tier.shade.accent}
        shade={tier.shade}
      />
    </motion.section>
  );
}

/* ─────────────────────────────────────────────────────────────
   TEAM PAGE — main export
   ───────────────────────────────────────────────────────────── */
import { getData } from "@/lib/api";

export default function Team() {
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await getData();
        const data: any = res.data;
        if (data && data.team && data.team.length > 0) {
          const newTiers = JSON.parse(JSON.stringify(DEFAULT_TIERS));
            newTiers.forEach((t: any) => (t.members = []));

            data.team.forEach((t: any) => {
              const cat = (t.category || "").toLowerCase();
              let tierId = "members";
              if (cat.includes("board") || cat === "eb" || cat.includes("executive")) tierId = "high-table";
              else if (cat.includes("core") || cat === "top") tierId = "top-members";

              const tier = newTiers.find((tier: any) => tier.id === tierId) || newTiers[2];
              tier.members.push({
                name: t.name || "Member",
                role: t.role || "Member",
                img: t.image || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
                twitter: t.twitterUrl || "#",
                linkedin: t.linkedinUrl || "#",
                instagram: t.instagramUrl || "#",
              });
            });

            // Keep default members for tiers that got 0 members from backend, just so it doesn't look empty,
            // or we could just filter them out. Let's filter out empty tiers.
            setTiers(newTiers.filter((t: any) => t.members.length > 0));
        }
      } catch (err: any) {
        console.error("Failed to fetch team:", err);
        setError(err.message || "Failed to load team.");
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .team-page { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        .team-page *, .team-page *::before, .team-page *::after { box-sizing: border-box; }

        /* Social icon hover glow utilities — applied via JS whileHover */
        .social-tw:hover { background: #1da1f2 !important; color: #fff !important; }
        .social-li:hover { background: #0a66c2 !important; color: #fff !important; }
        .social-gh:hover { background: #24292e !important; color: #fff !important; }
      `}</style>

      <main
        className="team-page"
        style={{
          position: "relative",
          minHeight: "100vh",
          /* Light sky-blue background matching site theme */
          background: "linear-gradient(160deg, #e8f2fc 0%, #d4e8f8 30%, #c8e0f5 60%, #dceefa 100%)",
          overflow: "hidden",
        }}
      >
        {/* 3D animated hex background */}
        <HexBackground />

        {/* Content layer */}
        <div style={{ position: "relative", zIndex: 10, padding: "120px 48px 80px", maxWidth: "1280px", margin: "0 auto" }}>

          {/* ── PAGE HEADER ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "center", marginBottom: "64px" }}
          >
            {/* Eyebrow pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "6px 20px", borderRadius: "50px",
              background: "rgba(255,255,255,0.60)", backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.85)",
              marginBottom: "22px",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#1557fc", display: "inline-block", flexShrink: 0,
                boxShadow: "0 0 6px #1557fc",
                animation: "teamBlink 2.2s ease-in-out infinite",
              }} />
              <span style={{
                fontSize: "10px", fontWeight: 700, letterSpacing: ".22em",
                textTransform: "uppercase", color: "#1a4a78",
                fontFamily: "'Outfit', sans-serif",
              }}>
                Microsoft Student Society · UEMK
              </span>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#1557fc", display: "inline-block", flexShrink: 0,
                boxShadow: "0 0 6px #1557fc",
                animation: "teamBlink 2.2s ease-in-out infinite",
                animationDelay: ".9s",
              }} />
            </div>

            {/* Main heading */}
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(54px, 7vw, 96px)",
              fontWeight: 900, textTransform: "uppercase",
              letterSpacing: ".02em", lineHeight: 0.92,
              color: "#0a1a3a", margin: "0 0 10px",
            }}>
              Meet The{" "}
              <span style={{
                display: "inline-block",
                background: "linear-gradient(92deg, #1557fc 0%, #0091ff 55%, #00c4ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Team
              </span>
            </h1>

            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "13px", fontWeight: 500, letterSpacing: ".18em",
              textTransform: "uppercase", color: "#4a7aa8",
              margin: "12px 0 0",
            }}>
              UEMK &nbsp;·&nbsp; Kolkata &nbsp;·&nbsp; Excellence &amp; Innovation
            </p>
          </motion.div>

          {/* ── THREE TIER SECTIONS ── */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "100px 0", color: "#8aabcc" }}>Loading team...</div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "100px 0", color: "#ff6b6b" }}>{error}</div>
          ) : (
            tiers.map((tier: any, i: number) => (
              <TierSection key={tier.id} tier={tier} index={i} />
            ))
          )}

        </div>

        <style>{`
          @keyframes teamBlink {
            0%,100%{opacity:1;transform:scale(1)}
            50%{opacity:.2;transform:scale(.6)}
          }
        `}</style>
      </main>
    </>
  );
}