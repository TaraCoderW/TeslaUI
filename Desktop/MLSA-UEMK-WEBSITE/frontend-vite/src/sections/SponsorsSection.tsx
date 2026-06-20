import { useEffect, useRef, useState } from "react";
const ROBOT_IMG = "/image__1_-removebg-preview.png"; 
// ↑ Put the PNG in your /public folder and update this path
/* ── Base64 sponsor logos ── */
const MICROSOFT_IMG = "data:image/png;base64,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";
const KIBA_IMG = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAE8AUADASIAAhEBAxEB/8QAHQABAAEEAwEAAAAAAAAAAAAAAAcBBggJAgMFBP/EAFIQAAEDAwICBAoHBAUJBgcAAAEAAgMEBREGBxIhCBMxQRQYIjhRVoSltNMyYXGBkaHRFUJSsRYjM5PBCRckNTdUcnN0J1ViY5LhJTRFU6Oys//EABwBAQABBQEBAAAAAAAAAAAAAAABAgMEBQYHCP/EADgRAAIBAwMDAQYCBwkAAAAAAAABAgMEEQUhMQYSQVETIjJhcZEVgQcUIzNCUrEWFyRDU3KhwdH/2gAMAwEAAhEDEQA/AMSV7GjNMXzWOpaTTem6Hw661nH1EHWsj4+Bjnu8p5DRhrXHme5eOpg6GPnKaU9s+DnQDxZd7/Un3rR/OTxZd7/Un3rR/OWyFEBre8WXe/1J960fzk8WXe/1J960fzlshRAa3vFl3v8AUn3rR/OTxZd7/Un3rR/OWyFEBre8WXe/1J960fzk8WXe/wBSfetH85bIUQGt7xZd7/Un3rR/OTxZd7/Un3rR/OWyFEBre8WXe/1J960fzk8WXe/1J960fzlshRAa3vFl3v8AUn3rR/OTxZd7/Un3rR/OWyFEBre8WXe/1J960fzk8WXe/wBSfetH85bIUQGt7xZd7/Un3rR/OTxZd7/Un3rR/OWyFEBre8WXe/1J960fzk8WXe/1J960fzlshRAa3vFl3v8AUn3rR/OTxZd7/Un3rR/OWyFEBre8WXe/1J960fzk8WXe/wBSfetH85bIUQGt7xZd7/Un3rR/OTxZd7/Un3rR/OWyFEBre8WXe/1J960fzk8WXe/1J960fzlshRAa3vFl3v8AUn3rR/OTxZd7/Un3rR/OWyFEBre8WXe/1J960fzk8WXe/wBSfetH85bIUQGt7xZd7/Un3rR/OTxZd7/Un3rR/OWyFEBre8WXe/1J960fzk8WXe/1J960fzlshRAa3vFl3v8AUn3rR/OUb600xfNHalq9N6kofAbrR8HXwdayTg42Ne3ymEtOWuaeR71tpWt7pnecpqv2P4OBAQ+pg6GPnKaU9s+DnUPqYOhj5ymlPbPg50BshREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAWt7pnecpqv2P4OBbIVre6Z3nKar9j+DgQEPqYOhj5ymlPbPg51D6mDoY+cppT2z4OdAbIUREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAFre6Z3nKar9j+DgWyFa3umd5ymq/Y/g4EBD6mDoY+cppT2z4OdQ+pg6GPnKaU9s+DnQGyFERAEREAREQBERAEREAREQBEVEBVFQKvNAERB9qAJlAqIEVRERkBFQp3qESVREUgIiIAiIgCIiAIiIAiIgC1vdM7zlNV+x/BwLZCtb3TO85TVfsfwcCAh9TB0MfOU0p7Z8HOofUwdDHzlNKe2fBzoDZCiIgCIiAIiIAqEgdqquLsh2QBjvQFe0cigOMAnJULa66SO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";
const GDG_IMG = "data:image/png;base64,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ABnBdoknkDXPnb3R4a5iRDVxmOtROEdYOhiD9u9Jp7AdHkgEa3+VnhyVCap91FchfB63oeo1+2+p39nbv89/6dfnhctfw+dluDL0GSRX46scETrcjC87fMHh5ZsEAPY8AeSwDztZh01Zh6OOCpufX7clHJE9jx3sibaY/uBOx3BgJ5B59k0OprWYLBk9CVknpSOjeWnenDyD8j3/AB4VsF2pNZfXisRvmZvuYDsjR0ePglcg/C5WCpDRdRluV6sMlesa9oQkvJBZO/8AUOdEgkbIcCQCHcYIeneoocky26ZsrGvLrEbXhhtAyNJAcCC0aBdrwSACQCdzpG3dSyMjaHSPaxpcGgl2tkkADn3JIAHuSFlUcu6ezths5uU53NL688kItACSWOw17/TPeTosDgC8gk63rQ1uOn8fm4erJrtqKWKq9lgSD1w5j3GVhiLR3EnTA4EkDRJAAGgmjbpshVhvUbFKw0uhsRuikaCRtrgQRseOCVfVhjrVoq8QLY4mBjBvwAND+wWVFCRERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERB//2Q==";

const SPONSORS = [
  {
    id: "microsoft",
    name: "Microsoft",
    tier: "Title Sponsor",
    tagline: "Empowering every student to achieve more",
    img: MICROSOFT_IMG,
    accent: "#00a4ef",
    accent2: "#7fba00",
    accentRgb: "0,164,239",
    particles: ["#f25022","#7fba00","#00a4ef","#ffb900"],
    hoverBg: "linear-gradient(135deg, #e8f4ff 0%, #f0fbff 50%, #e0f5e8 100%)",
  },
  {
    id: "kiba",
    name: "Kolkata International Blockchain Association",
    tier: "Blockchain Partner",
    tagline: "Pioneering decentralised innovation in Bengal",
    img: KIBA_IMG,
    accent: "#e63012",
    accent2: "#1a1a1a",
    accentRgb: "230,48,18",
    particles: ["#e63012","#ff6b47","#1a1a1a","#ff9c88"],
    hoverBg: "linear-gradient(135deg, #fff5f3 0%, #fff0ee 50%, #ffecea 100%)",
  },
  {
    id: "gdg",
    name: "GDG on Campus · UEM Kolkata",
    tier: "Community Partner",
    tagline: "Google Developer Groups — build, learn, connect",
    img: GDG_IMG,
    accent: "#4285f4",
    accent2: "#34a853",
    accentRgb: "66,133,244",
    particles: ["#4285f4","#34a853","#fbbc05","#ea4335"],
    hoverBg: "linear-gradient(135deg, #f0f4ff 0%, #f5fff5 50%, #fffbf0 100%)",
  },
];

/* ── Floating particle canvas ── */
function ParticleCanvas({ colors, active }: { colors: string[]; active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const count = active ? 28 : 12;
    const particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 2 + Math.random() * 4,
      vx: (Math.random() - 0.5) * (active ? 1.2 : 0.4),
      vy: (Math.random() - 0.5) * (active ? 1.2 : 0.4),
      color: colors[i % colors.length],
      alpha: 0.15 + Math.random() * 0.5,
      pulse: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.02;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.04;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (active ? 1.3 : 1), 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(a * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
      // draw connecting lines between close particles
      if (active) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 80) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = particles[i].color + Math.round((1 - d / 80) * 60).toString(16).padStart(2, "0");
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }
      // rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "inherit", pointerEvents: "none" }} />;
}

/* ── Single sponsor card ── */
function SponsorCard({ sponsor, index }: { sponsor: typeof SPONSORS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPopped(true), 200 + index * 180);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: "28px",
        background: hovered ? sponsor.hoverBg : "#ffffff",
        border: `2px solid ${hovered ? sponsor.accent : "rgba(0,0,0,0.07)"}`,
        boxShadow: hovered
          ? `0 32px 80px rgba(${sponsor.accentRgb},0.22), 0 8px 24px rgba(${sponsor.accentRgb},0.14), inset 0 1px 0 rgba(255,255,255,1)`
          : "0 8px 40px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
        transition: "all 0.38s cubic-bezier(0.34,1.56,0.64,1)",
        transform: popped
          ? hovered ? "translateY(-14px) scale(1.025)" : "translateY(0) scale(1)"
          : "translateY(40px) scale(0.94)",
        opacity: popped ? 1 : 0,
        cursor: "default",
        overflow: "hidden",
        minHeight: "340px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Particle canvas background */}
      <ParticleCanvas colors={sponsor.particles} active={hovered} />

      {/* Top accent stripe */}
      <div style={{
        height: "5px",
        background: `linear-gradient(90deg, ${sponsor.accent}, ${sponsor.accent2}, ${sponsor.accent})`,
        backgroundSize: "200% 100%",
        animation: hovered ? "stripeSlide 1.5s linear infinite" : "none",
        position: "relative", zIndex: 1,
      }} />

      {/* Tier badge */}
      <div style={{
        position: "absolute", top: "20px", right: "20px", zIndex: 10,
        padding: "4px 14px", borderRadius: "20px",
        background: hovered ? sponsor.accent : "rgba(0,0,0,0.06)",
        color: hovered ? "#fff" : "#666",
        fontSize: "9px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase",
        transition: "all 0.3s ease",
        boxShadow: hovered ? `0 4px 14px rgba(${sponsor.accentRgb},0.4)` : "none",
      }}>
        {sponsor.tier}
      </div>

      {/* Logo area */}
      <div style={{
        position: "relative", zIndex: 2,
        flex: "0 0 auto",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "44px 36px 24px",
        minHeight: "160px",
      }}>
        {/* Glow halo behind logo */}
        <div style={{
          position: "absolute",
          width: "140px", height: "140px", borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${sponsor.accentRgb},0.15) 0%, transparent 70%)`,
          filter: "blur(20px)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }} />
        <img
          src={sponsor.img}
          alt={sponsor.name}
          style={{
            maxWidth: "180px",
            maxHeight: "100px",
            objectFit: "contain",
            position: "relative", zIndex: 1,
            transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), filter 0.3s ease",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            filter: hovered ? `drop-shadow(0 8px 20px rgba(${sponsor.accentRgb},0.35))` : "none",
          }}
        />
      </div>

      {/* Divider */}
      <div style={{
        height: "1px",
        background: `linear-gradient(90deg, transparent, rgba(${sponsor.accentRgb},0.2), transparent)`,
        margin: "0 28px",
        position: "relative", zIndex: 2,
        transform: hovered ? "scaleX(1)" : "scaleX(0.4)",
        transition: "transform 0.4s ease",
      }} />

      {/* Text content */}
      <div style={{
        padding: "22px 28px 28px",
        position: "relative", zIndex: 2,
        flex: 1, display: "flex", flexDirection: "column", gap: "8px",
      }}>
        <div style={{
          fontSize: "17px", fontWeight: 800,
          color: hovered ? sponsor.accent : "#0d1a2e",
          lineHeight: 1.2,
          fontFamily: "'Outfit', sans-serif",
          transition: "color 0.3s ease",
          letterSpacing: "-.01em",
        }}>
          {sponsor.name}
        </div>
        <div style={{
          fontSize: "11.5px", color: "#6a7a8c", lineHeight: 1.6,
          fontFamily: "'Outfit', sans-serif",
        }}>
          {sponsor.tagline}
        </div>

        {/* Animated CTA row */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          marginTop: "auto", paddingTop: "16px",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.3s ease 0.05s",
        }}>
          <div style={{
            width: "28px", height: "2px",
            background: `linear-gradient(90deg, ${sponsor.accent}, ${sponsor.accent2})`,
            borderRadius: "2px",
          }} />
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: ".12em",
            textTransform: "uppercase", color: sponsor.accent,
          }}>
            Official Partner
          </span>
        </div>
      </div>
    </div>
  );
}
function RobotPopup({ visible }: { visible: boolean }) {
  const [popped, setPopped] = useState(false);
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    /* Small delay so it feels like it "notices" the scroll */
    const t1 = setTimeout(() => setPopped(true), 400);
    /* Start waving 800ms after appearing */
    const t2 = setTimeout(() => setWaving(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  return (
    <>
      <style>{`
        @keyframes robotFloat {
          0%,100% { transform: translateY(0px) rotate(-2deg); }
          50%      { transform: translateY(-18px) rotate(2deg); }
        }
        @keyframes robotSlidein {
          from { transform: translateX(120px) rotate(12deg) scale(0.7); opacity: 0; }
          to   { transform: translateX(0px) rotate(-2deg) scale(1); opacity: 1; }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 40px 10px rgba(138,92,246,0.25), 0 0 80px 20px rgba(21,87,252,0.10); }
          50%      { box-shadow: 0 0 60px 20px rgba(138,92,246,0.40), 0 0 120px 40px rgba(21,87,252,0.18); }
        }
        @keyframes speechPop {
          0%   { transform: scale(0.4) translateY(10px); opacity: 0; }
          70%  { transform: scale(1.08) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes starSpin {
          from { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.3); }
          to   { transform: rotate(360deg) scale(1); }
        }
        @keyframes trailFade {
          0%   { opacity: 0.7; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.5); }
        }
      `}</style>

      {/* Fixed right-side robot container */}
      <div style={{
        position: "absolute",
        right: 0,
        /* ↕ Adjust this top % to move robot up or down on the page */
        top: "38%",
        zIndex: 30,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}>

        {/* Speech bubble — appears 0.5s after robot */}
        <div style={{
          marginRight: "90px",
          marginBottom: "8px",
          background: "linear-gradient(135deg, #ffffff, #f0f6ff)",
          border: "2px solid rgba(21,87,252,0.18)",
          borderRadius: "20px 20px 4px 20px",
          padding: "10px 18px",
          boxShadow: "0 8px 32px rgba(21,87,252,0.15)",
          whiteSpace: "nowrap",
          fontSize: "13px",
          fontWeight: 700,
          color: "#1557fc",
          fontFamily: "'Outfit', sans-serif",
          opacity: popped ? 1 : 0,
          animation: popped ? "speechPop 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.5s both" : "none",
        }}>
          These sponsors are 🔥 amazing!
          {/* Tail */}
          <div style={{
            position: "absolute",
            bottom: "-10px", right: "14px",
            width: 0, height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "10px solid rgba(21,87,252,0.18)",
          }} />
          <div style={{
            position: "absolute",
            bottom: "-7px", right: "16px",
            width: 0, height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid #f0f6ff",
          }} />
        </div>

        {/* Sparkle stars around robot */}
        {popped && [
          { top: "10px",  left: "-30px", delay: "0.8s",  size: 14, color: "#ffb900" },
          { top: "40px",  left: "-50px", delay: "1.1s",  size: 10, color: "#1557fc" },
          { top: "80px",  left: "-20px", delay: "0.9s",  size: 12, color: "#7fba00" },
          { top: "20px",  left: "10px",  delay: "1.3s",  size: 8,  color: "#f25022" },
        ].map((star, i) => (
          <div key={i} style={{
            position: "absolute",
            top: star.top, left: star.left,
            fontSize: `${star.size}px`,
            color: star.color,
            animation: `starSpin 2.5s ease-in-out infinite`,
            animationDelay: star.delay,
            opacity: 0.9,
          }}>✦</div>
        ))}

        {/* Glow halo behind robot */}
        <div style={{
          position: "absolute",
          right: "10px",
          top: "20px",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(138,92,246,0.20) 0%, rgba(21,87,252,0.08) 50%, transparent 70%)",
          animation: popped ? "glowPulse 3s ease-in-out infinite" : "none",
          pointerEvents: "none",
        }} />

        {/* Trail rings — emanate outward */}
        {popped && [1,2,3].map(i => (
          <div key={i} style={{
            position: "absolute",
            right: "20px", top: "30px",
            width: "180px", height: "180px",
            borderRadius: "50%",
            border: `2px solid rgba(138,92,246,${0.3 - i*0.08})`,
            animation: `trailFade 2.4s ease-out infinite`,
            animationDelay: `${i * 0.7}s`,
            pointerEvents: "none",
          }} />
        ))}

        {/* The robot image itself */}
        <div style={{
          width: "220px",
          /* mix-blend-mode: multiply knocks out the black background */
          mixBlendMode: "multiply",
          opacity: popped ? 1 : 0,
          animation: popped
            ? "robotSlidein 0.8s cubic-bezier(0.34,1.56,0.64,1) both, robotFloat 4s ease-in-out 0.8s infinite"
            : "none",
          transformOrigin: "center bottom",
          position: "relative",
          zIndex: 2,
          /* 
           * ↕ ROBOT POSITION TUNING:
           * marginRight — move robot left (increase) or right (decrease) from edge
           * Use negative marginRight to let it peek out from the edge
           */
          marginRight: "-20px",
          filter: "drop-shadow(0 20px 40px rgba(138,92,246,0.35)) drop-shadow(0 8px 16px rgba(0,0,0,0.12))",
        }}>
          <img
            src={ROBOT_IMG}
            alt="MSS Robot mascot"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </div>
    </>
  );
}

/* ── Animated grid background ── */
function GridBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Dot grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(21,87,252,0.10) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }} />
      {/* Floating orbs */}
      {[
        { w:500, h:500, top:"-10%", left:"-8%",  c:"rgba(21,87,252,0.07)", d:"18s" },
        { w:400, h:400, top:"60%",  left:"70%",  c:"rgba(0,164,239,0.06)", d:"22s" },
        { w:300, h:300, top:"40%",  left:"30%",  c:"rgba(127,186,0,0.05)", d:"15s" },
        { w:350, h:350, top:"10%",  left:"80%",  c:"rgba(255,185,0,0.05)", d:"20s" },
      ].map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          width: o.w, height: o.h,
          top: o.top, left: o.left,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${o.c} 0%, transparent 70%)`,
          animation: `floatOrb ${o.d} ease-in-out infinite`,
          animationDelay: `${i * -4}s`,
        }} />
      ))}
      {/* Diagonal light lines */}
      {[0,1,2].map(i => (
        <div key={i} style={{
          position: "absolute",
          top: 0, bottom: 0,
          left: `${20 + i * 30}%`,
          width: "1px",
          background: `linear-gradient(180deg, transparent, rgba(21,87,252,0.06) 40%, rgba(21,87,252,0.06) 60%, transparent)`,
          transform: "skewX(-20deg)",
        }} />
      ))}
    </div>
  );
}

/* ── Main section export ── */
export default function SponsorsSection() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Barlow+Condensed:wght@700;800;900&display=swap');

        @keyframes stripeSlide {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        @keyframes floatOrb {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.06); }
          66% { transform: translate(-20px,25px) scale(0.95); }
        }
        @keyframes titleReveal {
          from { opacity:0; transform: translateY(30px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes badgePop {
          0%   { transform: scale(0.7) rotate(-6deg); opacity:0; }
          70%  { transform: scale(1.08) rotate(1deg); opacity:1; }
          100% { transform: scale(1) rotate(0deg); opacity:1; }
        }
        .sponsors-section * { box-sizing: border-box; }
      `}</style>

      <section
        ref={sectionRef}
        className="sponsors-section"
        style={{
          position: "relative",
          background: "#ffffff",
          padding: "100px 0 120px",
          overflow: "hidden",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <GridBackground />

        {/* ── Section header ── */}
        <div style={{
          position: "relative", zIndex: 10,
          textAlign: "center",
          padding: "0 24px 72px",
        }}>
          {/* Eyebrow label */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "7px 22px", borderRadius: "50px",
            background: "rgba(21,87,252,0.06)",
            border: "1.5px solid rgba(21,87,252,0.14)",
            marginBottom: "22px",
            animation: visible ? "badgePop 0.7s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#1557fc", display:"inline-block" }} />
            <span style={{ fontSize:"10px", fontWeight:800, letterSpacing:".22em", textTransform:"uppercase", color:"#1557fc" }}>
              Season 2026 · Partners &amp; Sponsors
            </span>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#1557fc", display:"inline-block" }} />
          </div>

          {/* Main heading */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(52px, 7vw, 96px)",
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            margin: "0 0 18px",
            color: "#0a1628",
            animation: visible ? "titleReveal 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s both" : "none",
          }}>
            Our Leading
            <span style={{
              display: "block",
              background: "linear-gradient(92deg, #1557fc 0%, #0091ff 45%, #00c4ff 70%, #1557fc 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: visible ? "titleReveal 0.9s cubic-bezier(0.22,1,0.36,1) 0.2s both, shimmer 4s linear infinite 1s" : "none",
            }}>
              Sponsors
            </span>
          </h2>

          <p style={{
            fontSize: "15px", color: "#6a7a9c", maxWidth: "520px",
            margin: "0 auto", lineHeight: 1.7, fontWeight: 400,
            animation: visible ? "titleReveal 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s both" : "none",
          }}>
            Proud to partner with industry leaders who believe in the next generation of builders and innovators.
          </p>
        </div>

        {/* ── Sponsor cards grid ── */}
        <div style={{
          position: "relative", zIndex: 10,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "28px",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 36px",
        }}>
          {SPONSORS.map((s, i) => (
            <SponsorCard key={s.id} sponsor={s} index={i} />
          ))}
        </div>

        {/* ── Bottom CTA strip ── */}
        <div style={{
          position: "relative", zIndex: 10,
          textAlign: "center", marginTop: "72px", padding: "0 24px",
          animation: visible ? "titleReveal 0.9s cubic-bezier(0.22,1,0.36,1) 0.6s both" : "none",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "16px",
            padding: "16px 32px", borderRadius: "50px",
            background: "linear-gradient(135deg, #f0f6ff, #e8f4ff)",
            border: "1.5px solid rgba(21,87,252,0.15)",
            boxShadow: "0 4px 20px rgba(21,87,252,0.08)",
          }}>
            <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#1557fc", animation:"floatOrb 2s ease-in-out infinite" }} />
            <span style={{ fontSize:"12px", fontWeight:700, color:"#1557fc", letterSpacing:".06em" }}>
              Interested in partnering with MLSA UEMK?
            </span>
            <a href="mailto:mlsa@uem.edu.in" style={{
              padding: "8px 20px", borderRadius: "30px",
              background: "#1557fc", color: "#fff",
              fontSize: "11px", fontWeight: 800, letterSpacing: ".10em", textTransform: "uppercase",
              textDecoration: "none",
              transition: "all 0.22s ease",
              boxShadow: "0 4px 14px rgba(21,87,252,0.35)",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(21,87,252,0.5)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 14px rgba(21,87,252,0.35)"; }}
            >
              Get in Touch →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
