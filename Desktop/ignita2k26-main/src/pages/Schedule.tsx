import { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import Tilt from "react-parallax-tilt";
import PageSciFiLayout from "@/components/layout/PageSciFiLayout";
import EkgCanvas from "@/components/sections/EkgCanvas";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type ScheduleItem = {
  time: string;
  ampm: string;
  title: string;
  node: string;
  status: "EXECUTING" | "PENDING";
};

const schedule: Record<string, ScheduleItem[]> = {
  "CYCLE_01 — AUG 1": [
    { time: "09:00", ampm: "AM", title: "Main Boot - Inauguration", node: "MAIN_AUD", status: "PENDING" },
    { time: "10:30", ampm: "AM", title: "CODE MATRIX Round 1", node: "LAB_COMPLEX", status: "EXECUTING" },
    { time: "12:00", ampm: "PM", title: "G.ONE ARENA Qualifiers", node: "GAMING_ZONE", status: "PENDING" },
    { time: "02:00", ampm: "PM", title: "HACKSTORM Launch", node: "INNOVATION_LAB", status: "PENDING" },
    { time: "04:30", ampm: "PM", title: "QUIZ_CORE Prelims", node: "HALL_B", status: "PENDING" },
    { time: "07:00", ampm: "PM", title: "NEON STAGE Night Show", node: "OPEN_STAGE", status: "PENDING" },
  ],
  "CYCLE_02 — AUG 2": [
    { time: "09:00", ampm: "AM", title: "Cycle 2 Boot", node: "MAIN_AUD", status: "PENDING" },
    { time: "10:00", ampm: "AM", title: "ROBO WARS Combat", node: "COMBAT_PIT", status: "PENDING" },
    { time: "12:00", ampm: "PM", title: "CODE MATRIX Finals", node: "LAB_COMPLEX", status: "PENDING" },
    { time: "02:30", ampm: "PM", title: "HACKSTORM Presentations", node: "HALL_A", status: "PENDING" },
    { time: "05:00", ampm: "PM", title: "QUIZ_CORE Finals", node: "HALL_B", status: "PENDING" },
    { time: "07:30", ampm: "PM", title: "System Shutdown Ceremony", node: "MAIN_AUD", status: "PENDING" },
  ],
};

const revealEase = [0.16, 1, 0.3, 1] as const;

const HudCorners = () => (
  <>
    <span className="hc-tl" />
    <span className="hc-tr" />
    <span className="hc-bl" />
    <span className="hc-br" />
  </>
);

const TimelineCard = ({
  item,
  side,
}: {
  item: ScheduleItem;
  side: "left" | "right";
}) => {
  const isCyan = side === "left";
  const cardClass = isCyan ? "schedule-card-cyan" : "schedule-card-red";
  const executing = item.status === "EXECUTING";

  return (
    <div
      className={`group flex items-center gap-4 md:gap-8 ${
        side === "left" ? "md:flex-row" : "md:flex-row-reverse"
      } flex-row`}
    >
      <div className={`flex-1 ${side === "left" ? "md:text-right" : "md:text-left"}`}>
        <Tilt
          tiltMaxAngleX={8}
          tiltMaxAngleY={8}
          glareEnable
          glareMaxOpacity={0.1}
          glareColor={isCyan ? "#00f5ff" : "#e8000d"}
          scale={1.02}
          transitionSpeed={1400}
        >
          <div className={`schedule-card hud-corners p-5 relative holo-card-glow ${cardClass}`}>
            <HudCorners />
            <div className="scan-line" style={{ animationDuration: "3.5s" }} />

            <div
              className={`flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2 ${
                side === "left" ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className={`flex items-baseline gap-2 ${side === "left" ? "md:justify-end" : ""}`}>
                <span
                  className="text-2xl md:text-3xl font-hud font-bold tracking-wider"
                  style={{ color: isCyan ? "var(--gone-cyan)" : "var(--raone-red)" }}
                >
                  {item.time}
                </span>
                <span className="text-xs font-hud font-bold text-gray-400">{item.ampm}</span>
              </div>
              {executing && (
                <span className="status-tag text-[var(--raone-red)] border-[var(--raone-red)] flex items-center gap-2 w-max">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--raone-red)] animate-blink" />
                  EXECUTING
                </span>
              )}
            </div>

            <h3
              className={`font-hud text-base md:text-lg font-bold text-white uppercase tracking-wider mb-2 glitch-text ${
                side === "left" ? "md:text-right" : "md:text-left"
              }`}
              data-text={item.title}
            >
              {item.title}
            </h3>
            <p
              className={`font-hud text-[10px] text-gray-500 uppercase tracking-[0.2em] ${
                side === "left" ? "md:text-right" : "md:text-left"
              }`}
            >
              NODE: {item.node}
            </p>
          </div>
        </Tilt>
      </div>

      <motion.div
        className="relative flex flex-col items-center shrink-0 timeline-node-reveal"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.45, ease: revealEase, delay: 0.15 }}
      >
        <div className={`timeline-node ${executing ? "is-active arc-pulse" : ""}`}>
          <div
            className="absolute inset-[3px] rounded-full"
            style={{
              background: executing ? "var(--raone-red)" : "rgba(255,255,255,0.15)",
            }}
          />
        </div>
      </motion.div>

      <div className="flex-1 hidden md:block" />
    </div>
  );
};

/** Each timeline row reveals individually on scroll — alternates slide direction */
const TimelineRevealRow = ({
  item,
  side,
  index,
  activeDay,
}: {
  item: ScheduleItem;
  side: "left" | "right";
  index: number;
  activeDay: string;
}) => {
  const isLeft = side === "left";

  return (
    <motion.div
      className="timeline-reveal-row"
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.35,
        margin: "0px 0px -80px 0px",
      }}
      variants={{
        hidden: {
          opacity: 0,
          x: isLeft ? -64 : 64,
          y: 28,
          filter: "blur(8px)",
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration: 0.7,
            ease: revealEase,
          },
        },
      }}
    >
      <TimelineCard item={item} side={side} />
    </motion.div>
  );
};

const Schedule = () => {
  const days = Object.keys(schedule);
  const [activeDay, setActiveDay] = useState(days[0]);
  const { ref: headerRef, visible: headerVisible } = useScrollReveal(0.2);
  const timelineRef = useRef<HTMLDivElement>(null);
  const items = schedule[activeDay];

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.9", "end 0.25"],
  });

  const spineHeightRaw = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const spineHeight = useSpring(spineHeightRaw, { stiffness: 50, damping: 22 });

  useEffect(() => {
    document.documentElement.classList.add("schedule-page-smooth");
    return () => document.documentElement.classList.remove("schedule-page-smooth");
  }, []);

  const handleDayChange = (day: string) => {
    setActiveDay(day);
    timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <PageSciFiLayout variant="schedule">
      <section className="section-redesign relative pt-24 pb-8">
        <div className="section-redesign-bg section-noise">
          <div className="schedule-atmo" />
          <span className="section-watermark">EXECUTION SEQUENCE</span>
        </div>

        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerVisible ? { opacity: 1 } : {}}
            className="font-hud text-xs text-[var(--gone-cyan)] uppercase tracking-[0.35em] mb-4"
          >
            [ BIOMECHANICAL TIMELINE ]
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={headerVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: revealEase }}
            className="font-hud text-4xl md:text-6xl lg:text-7xl font-bold tracking-wider"
          >
            <span className="text-white">EXECUTION </span>
            <span className="text-[var(--raone-red)]" style={{ textShadow: "var(--glow-text-red)" }}>
              SEQUENCE
            </span>
          </motion.h1>
        </div>
      </section>

      <section className="section-redesign section-padding relative z-10 pb-32 schedule-timeline-scroll">
        <div className="section-redesign-bg">
          <EkgCanvas />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="flex justify-center gap-0 mb-12 border-b border-gray-800/80">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayChange(day)}
                className={`schedule-tab ${activeDay === day ? "is-active" : ""}`}
              >
                {day}
                {activeDay === day && (
                  <span className="inline-block w-1 h-3 bg-[var(--raone-red)] ml-2 animate-blink align-middle" />
                )}
              </button>
            ))}
          </div>

          <div ref={timelineRef} className="relative min-h-[200px]">
            <div className="timeline-spine md:left-1/2">
              <motion.div className="timeline-spine-glow" style={{ height: spineHeight }} />
            </div>

            <div
              className="timeline-pulse-travel hidden md:block"
              style={{ animation: "pulse-travel 6s linear infinite" }}
            >
              <div className="timeline-pulse-sonar" />
              <div className="timeline-pulse-orbit" />
              <div className="timeline-pulse-core" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-10 md:space-y-14"
              >
                {items.map((item, i) => (
                  <TimelineRevealRow
                    key={`${activeDay}-${item.title}`}
                    item={item}
                    side={i % 2 === 0 ? "left" : "right"}
                    index={i}
                    activeDay={activeDay}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </PageSciFiLayout>
  );
};

export default Schedule;
