const fs = require('fs');

const content = `import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitContact } from "@/lib/api";

function HexBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const hexSize = 30;
    const hexHeight = hexSize * Math.sqrt(3);
    const hexWidth = hexSize * 2;
    const hexCols = Math.ceil(width / (hexWidth * 0.75)) + 1;
    const hexRows = Math.ceil(height / hexHeight) + 1;

    let time = 0;

    function drawHex(x: number, y: number, alpha: number) {
      if (!ctx) return;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i);
        const px = x + hexSize * Math.cos(angle);
        const py = y + hexSize * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = \`rgba(21, 87, 252, \${alpha})\`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (let row = 0; row < hexRows; row++) {
        for (let col = 0; col < hexCols; col++) {
          const x = col * hexWidth * 0.75;
          const y = row * hexHeight + (col % 2 === 1 ? hexHeight / 2 : 0);
          
          const dist = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2));
          const maxDist = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
          const normalizedDist = dist / maxDist;
          
          const wave = Math.sin(normalizedDist * 10 - time * 2);
          const alpha = Math.max(0.02, Math.min(0.08, (wave + 1) / 2 * 0.08));
          
          drawHex(x, y, alpha);
        }
      }

      time += 0.01;
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(237,245,255,0) 0%, rgba(237,245,255,1) 100%)",
        pointerEvents: "none"
      }} />
    </div>
  );
}

const socialLinks = [
  { name: "LinkedIn", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", color: "#0A66C2", url: "https://linkedin.com" },
  { name: "Instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z", color: "#E1306C", url: "https://instagram.com" },
  { name: "Facebook", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", color: "#1877F2", url: "https://facebook.com" },
];

const infoItems = [
  { icon: "🏛️", label: "Campus Host", value: "University of Engineering & Management, Kolkata" },
  { icon: "📍", label: "Geographic Address", value: "New Town, Kolkata, WB 700160" },
  { icon: "✉️", label: "Organizational Mail ID", value: "microsoftstudentsocietyuemk@gmail.com" },
];

export default function Contact() {
  const [form, setForm] = useState({ fullName: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.message) {
      setError("Please fill out all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitContact({
        name: form.fullName,
        email: form.email,
        subject: form.subject || "Contact form submission",
        message: form.message,
      });

      setSent(true);
      setForm({ fullName: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch (err: any) {
      setError(err.message || "Network Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles: React.CSSProperties = {
    width: "100%", padding: "14px 18px",
    background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: "12px",
    color: "#0f172a", fontSize: "14px", fontWeight: 500,
    outline: "none", transition: "all 0.2s ease"
  };
  
  const labelStyles: React.CSSProperties = {
    display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: 700,
    color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em"
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#edf5ff", fontFamily: "'Outfit', sans-serif" }}>
      <HexBackground />

      <div style={{ position: "relative", zIndex: 10, padding: "120px 48px 80px", maxWidth: "1280px", margin: "0 auto" }}>
        
        {/* Eyebrow */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(21, 87, 252, 0.08)", border: "1px solid rgba(21, 87, 252, 0.15)",
            padding: "8px 24px", borderRadius: "30px",
            fontSize: "12px", fontWeight: 800, color: "#1557fc",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            <span style={{ fontSize: "14px" }}>◆</span>
            MSS UEMK Communications Node
            <span style={{ fontSize: "14px" }}>◆</span>
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          textAlign: "center", fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 900,
          color: "#0f172a", lineHeight: 1, letterSpacing: "-0.03em", marginBottom: "60px",
          fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif"
        }}>
          GET IN <span style={{ color: "#1557fc" }}>TOUCH</span>
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px", alignItems: "start" }}>
          
          {/* Contact Info Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: "30px" }}
          >
            <div style={{
              background: "#ffffff", padding: "40px", borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0",
              position: "relative", overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: "linear-gradient(90deg, #1557fc, #00a4ef)" }} />
              <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "30px" }}>Chapter Operations Desk</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {infoItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "12px",
                      background: "rgba(21, 87, 252, 0.08)", border: "1px solid rgba(21, 87, 252, 0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{item.label}</div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "40px", paddingTop: "30px", borderTop: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>Social Networks</div>
                <div style={{ display: "flex", gap: "12px" }}>
                  {socialLinks.map((link) => (
                    <a 
                      key={link.name} 
                      href={link.url} 
                      target="_blank" 
                      rel="noreferrer"
                      title={link.name}
                      style={{
                        width: "44px", height: "44px", borderRadius: "12px",
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#64748b", transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = link.color; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; (e.currentTarget as HTMLAnchorElement).style.borderColor = link.color; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#f8fafc"; (e.currentTarget as HTMLAnchorElement).style.color = "#64748b"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e2e8f0"; }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "20px", height: "20px" }}>
                        <path d={link.icon} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
              <img 
                src="/images/Techsupport.png" 
                alt="Support" 
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"}
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80" }}
              />
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background: "#ffffff", padding: "40px", borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0",
            }}
          >
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "32px" }}>Send a Message</h2>
            
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "16px 24px", borderRadius: "12px", marginBottom: "24px", fontSize: "14px", fontWeight: 600, border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </motion.div>
              )}
              {sent && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", padding: "16px 24px", borderRadius: "12px", marginBottom: "24px", fontSize: "14px", fontWeight: 600, border: "1px solid rgba(34,197,94,0.2)" }}>
                  Message Transmitted Successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div>
                  <label style={labelStyles}>Full Name *</label>
                  <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required style={inputStyles} placeholder="John Doe" onFocus={(e) => { e.currentTarget.style.borderColor = "#1557fc"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(21,87,252,0.1)"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }} />
                </div>
                <div>
                  <label style={labelStyles}>Email Address *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyles} placeholder="john@example.com" onFocus={(e) => { e.currentTarget.style.borderColor = "#1557fc"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(21,87,252,0.1)"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }} />
                </div>
              </div>

              <div>
                <label style={labelStyles}>Subject</label>
                <input type="text" name="subject" value={form.subject} onChange={handleChange} style={inputStyles} placeholder="e.g. Collaboration Inquiry" onFocus={(e) => { e.currentTarget.style.borderColor = "#1557fc"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(21,87,252,0.1)"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }} />
              </div>

              <div>
                <label style={labelStyles}>Message *</label>
                <textarea name="message" value={form.message} onChange={handleChange} required placeholder="How can we help you?" style={{ ...inputStyles, minHeight: "180px", resize: "vertical" }} onFocus={(e) => { e.currentTarget.style.borderColor = "#1557fc"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(21,87,252,0.1)"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }} />
              </div>

              <motion.button 
                type="submit" 
                disabled={isSubmitting} 
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                style={{
                  width: "100%", padding: "16px", marginTop: "8px", borderRadius: "12px",
                  fontWeight: 800, color: "#fff", fontSize: "15px", letterSpacing: "0.05em",
                  border: "none", cursor: isSubmitting ? "not-allowed" : "pointer",
                  background: isSubmitting ? "rgba(21,87,252,0.5)" : sent ? "#22c55e" : "linear-gradient(135deg, #1557fc, #00a4ef)",
                  boxShadow: sent ? "0 8px 24px rgba(34,197,94,0.3)" : "0 8px 24px rgba(21,87,252,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                  transition: "all 0.3s ease"
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg style={{ animation: "spin 1s linear infinite", height: "20px", width: "20px", color: "white" }} viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Transmitting...
                  </>
                ) : sent ? (
                  <>
                    <svg style={{ width: "24px", height: "24px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Message Sent
                  </>
                ) : "Transmit Message"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
      <style>{\`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          form > div:first-child { grid-template-columns: 1fr !important; }
        }
      \`}</style>
    </div>
  );
}
\`;

fs.writeFileSync('c:/Users/rahul/Desktop/MLSA-UEMK-WEBSITE/frontend-vite/src/pages/Contact.tsx', content);
