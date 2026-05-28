import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Tilt from "react-parallax-tilt";
import PageSciFiLayout from "@/components/layout/PageSciFiLayout";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type Member = {
  name: string;
  role: string;
  stat: number;
};

const gOneMembers: Member[] = [
  { name: "Dr. A. Sharma", role: "FACULTY_LEAD", stat: 95 },
  { name: "Prof. R. Bose", role: "ADVISOR", stat: 90 },
  { name: "Dr. P. Sen", role: "COORDINATOR", stat: 88 },
  { name: "Ms. T. Das", role: "MENTOR", stat: 85 },
];

const raOneMembers: Member[] = [
  { name: "Rahul Mehta", role: "LEAD_DEV", stat: 98 },
  { name: "Priya Nair", role: "DESIGN_CMD", stat: 95 },
  { name: "Arjun Roy", role: "OPS_CHIEF", stat: 92 },
  { name: "Sneha Pal", role: "EVENT_CMD", stat: 89 },
  { name: "Vikram Das", role: "TECH_LEAD", stat: 94 },
  { name: "Aarav Singh", role: "OUTREACH", stat: 87 },
];

const HudCorners = () => (
  <>
    <span className="hc-tl" />
    <span className="hc-tr" />
    <span className="hc-bl" />
    <span className="hc-br" />
  </>
);

const FactionCard = ({
  member,
  faction,
}: {
  member: Member;
  faction: "gone" | "raone";
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [0.88, 1]), {
    stiffness: 100,
    damping: 22,
  });
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const isGone = faction === "gone";
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Tilt
      tiltMaxAngleX={12}
      tiltMaxAngleY={12}
      glareEnable
      glareMaxOpacity={0.14}
      glareColor={isGone ? "#00f5ff" : "#e8000d"}
      scale={1.03}
      transitionSpeed={1500}
    >
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className={`faction-card hud-corners holo-card-glow ${faction} group`}
    >
      <div className="scan-line" style={{ animationDuration: "4s" }} />
      <div className="avatar-flash" />
      <HudCorners />

      <span
        className="absolute top-3 right-3 status-tag z-10"
        style={{
          color: isGone ? "var(--gone-cyan)" : "var(--raone-red)",
          borderColor: isGone ? "var(--gone-cyan)" : "var(--raone-red)",
        }}
      >
        {member.role}
      </span>

      <div className="relative z-10 p-6 pt-12 text-center">
        <div className="relative w-24 h-24 mx-auto mb-5">
          <div className="faction-orbit" />
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center border-2 relative z-10 mx-auto"
            style={{
              borderColor: isGone ? "var(--gone-cyan)" : "var(--raone-red)",
              background: `radial-gradient(circle, ${isGone ? "var(--gone-cyan-dim)" : "var(--raone-red-dim)"} 0%, #000 70%)`,
              boxShadow: isGone ? "var(--glow-cyan)" : "var(--glow-red)",
            }}
          >
            <span
              className="font-hud text-2xl font-bold"
              style={{ color: isGone ? "var(--gone-cyan)" : "var(--raone-red)" }}
            >
              {initials}
            </span>
          </div>
        </div>

        <h3
          className="font-hud text-base font-bold text-white uppercase glitch-text tracking-wider mb-4"
          data-text={member.name}
        >
          {member.name}
        </h3>

        <div className="text-left">
          <span className="text-[10px] font-hud text-gray-500 uppercase tracking-widest block mb-1">
            {isGone ? "SYSTEM AUTHORITY" : "THREAT LEVEL"}
          </span>
          <div className="h-1.5 w-full bg-black border border-gray-800 overflow-hidden">
            <motion.div
              className="stat-bar-fill h-full"
              style={{
                backgroundColor: isGone ? "var(--gone-cyan)" : "var(--raone-red)",
                boxShadow: isGone ? "var(--glow-cyan)" : "var(--glow-red)",
              }}
              initial={{ transform: "scaleX(0)" }}
              whileInView={{ transform: `scaleX(${member.stat / 100})` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            />
          </div>
          <span className="text-[10px] font-hud text-gray-600 mt-1 block">{member.stat}%</span>
        </div>
      </div>

      {!isGone && (
        <div className="absolute bottom-0 right-0 w-28 h-28 bg-[var(--raone-red)] opacity-[0.04] blur-2xl rounded-full pointer-events-none" />
      )}
    </motion.div>
    </Tilt>
  );
};

const Team = () => {
  const { ref: headerRef, visible } = useScrollReveal(0.2);

  return (
    <PageSciFiLayout variant="team">
        <section className="section-redesign relative pt-24 pb-10 overflow-hidden">
          <div className="section-redesign-bg section-noise">
            <div className="team-dual-atmo" />
            <div className="team-center-divider hidden md:block" />
            <div className="team-silhouette gone hidden lg:block" />
            <div className="team-silhouette raone hidden lg:block" />
          </div>

          <div
            ref={headerRef as React.RefObject<HTMLDivElement>}
            className="container mx-auto px-4 relative z-10"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={visible ? { opacity: 1 } : {}}
              className="font-hud text-xs text-center text-[var(--gone-cyan)] uppercase tracking-[0.35em] mb-8"
            >
              [ DUAL-FACTION SELECT ]
            </motion.p>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={visible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center md:text-left border border-[var(--gone-cyan-dim)] bg-[var(--gone-cyan-dim)] p-5"
              >
                <h2 className="font-hud text-[var(--gone-cyan)] text-lg md:text-xl font-bold tracking-widest uppercase glitch-text" data-text="G.ONE PROTOCOL">
                  G.ONE PROTOCOL — GUARDIAN CLASS
                </h2>
                <p className="font-body text-xs text-[var(--gone-cyan)]/80 uppercase tracking-widest mt-2">
                  Protectors. System guardians.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={visible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-center md:text-right border border-[var(--raone-red-dim)] bg-[var(--raone-red-dim)] p-5"
              >
                <h2 className="font-hud text-[var(--raone-red)] text-lg md:text-xl font-bold tracking-widest uppercase glitch-text" data-text="RA.ONE PROTOCOL">
                  RA.ONE PROTOCOL — DOMINANT CLASS
                </h2>
                <p className="font-body text-xs text-[var(--raone-red)]/80 uppercase tracking-widest mt-2">
                  Commanders. Event architects.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="pb-24 px-4 relative z-10">
          <div className="container mx-auto max-w-6xl space-y-16">
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {gOneMembers.map((member) => (
                  <FactionCard key={member.name} member={member} faction="gone" />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 py-4">
              <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[var(--gone-cyan)] opacity-40" />
              <p className="protocol-boundary text-center whitespace-nowrap">
                ━━━━━━━━━━━ [ PROTOCOL BOUNDARY ] ━━━━━━━━━━━
              </p>
              <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[var(--raone-red)] opacity-40" />
            </div>

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {raOneMembers.map((member) => (
                  <FactionCard key={member.name} member={member} faction="raone" />
                ))}
              </div>
            </div>
          </div>
        </section>
    </PageSciFiLayout>
  );
};

export default Team;
