import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Gamepad2,
  FlaskConical,
  Music2,
  Brain,
  Bot,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import PageSciFiLayout from "@/components/layout/PageSciFiLayout";
import { useScrollReveal, useTypewriter } from "@/hooks/useScrollReveal";

type EventCategory = "TECH" | "GAME" | "CULT" | "HACK";
type CardAccent = "cyan" | "blue" | "red";

type EventItem = {
  level: string;
  title: string;
  prompt: string;
  description: string;
  prize: string;
  prizeNum: number;
  difficulty: string;
  category: EventCategory;
  status: "ACTIVE" | "LOCKED";
  accent: CardAccent;
  image: string;
  imageAlt: string;
  Icon: LucideIcon;
};

const events: EventItem[] = [
  {
    level: "01",
    title: "CODE MATRIX",
    prompt: "PROMPT: BREAK_THE_FIREWALL",
    description: "Algorithmic warfare. Break Ra.One's firewall.",
    prize: "₹15,000",
    prizeNum: 15000,
    difficulty: "◆◆◆◆◇",
    category: "TECH",
    status: "ACTIVE",
    accent: "cyan",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBwufKDY9ZVQL4t12Zza17PENxSqBcp5ElAX9L2DtdeeOxNQouoUerhxNW3GGhqdT-dOPr-BaeFUPaw9zaR2JWpqBqlDKnaIEZi8fVgevzU-pkie6Mzyafa4-xvCTF9wiWRjfmY0Zw0qPlMR9L5Un3Ny3WG9mU3Ag8tA0d5CVMafzvwq0A5ORscVrHiZE8-tQCSUboDhnKjg5sOQKGTespxcQ-iAdOQGqxTl1GFC62q8weFPJeiOyOriiDUJsEDg0qeXS6DEsMELqII",
    imageAlt: "Cyberpunk coding terminal with holographic data streams",
    Icon: Terminal,
  },
  {
    level: "02",
    title: "G.ONE ARENA",
    prompt: "ARENA: NEON_VALOR",
    description: "Squad-based combat in Ra.One's virtual world.",
    prize: "₹20,000",
    prizeNum: 20000,
    difficulty: "◆◆◆◆◆",
    category: "GAME",
    status: "ACTIVE",
    accent: "blue",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAJAUbFCJrgVTFPyhzVBjjRjq33-iFr7fJdfJxqWgViStDlury3jN_8jAN7AK6jmQpsXoVDdFXDe-_PngPawONRrREjwKzZ0Sr5MQCE3HtTY13AiaaVrGdMIdzGv6eClA7ofvZjTgi6U1Xf8p0VR12XicB7g9Uay1kTbSYk6xx6byQLizsOwuW546LSSWufHoNB3GrT1VGAWBEna_DJ4DqJmZUJqVlb3YV65H4691UkL5KAc4suYDe_E2yiaesJNwF_7gqJJEk9z-je",
    imageAlt: "Esports arena with neon blue holographic scoreboards",
    Icon: Gamepad2,
  },
  {
    level: "03",
    title: "HACKSTORM",
    prompt: "MODE: 24HR_OVERRIDE",
    description: "24hr system override across 3 domains.",
    prize: "₹25,000",
    prizeNum: 25000,
    difficulty: "◆◆◆◆◆",
    category: "HACK",
    status: "ACTIVE",
    accent: "cyan",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBT8XzQrheLs1o09XbG6LbgEyF1zbjCEsMbqlFDEKNTPZVn72KjEZDKRLiKquW05XPSBwhhTGBBZ4UeEewk3H0PB5lsO7JrmjrALq_v4loCrvlgsN1luaDkXbxC11BK5hSLTDtI5fGo-XsQqyU2f0TMV-s0PRx9L8UXXoQt0ecrFAGfCqtYMitenjuI3LHkVFxHUfMjjoI326kBhl3oGgVeZujkVjMHk4uVbfsXU7GIYnL5z5RXCrIjVF15cYjFFcZpoxKOzIfnWa96",
    imageAlt: "Neural network visualization with glowing data nodes",
    Icon: FlaskConical,
  },
  {
    level: "04",
    title: "NEON STAGE",
    prompt: "STAGE: RA_ONE_CORE",
    description: "Cultural showdown powered by Ra.One's core.",
    prize: "₹12,000",
    prizeNum: 12000,
    difficulty: "◆◆◆◇◇",
    category: "CULT",
    status: "ACTIVE",
    accent: "blue",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDsCy4NoAM4UvQgljZddPNZlbXrtj-BcBNgbUuvpQTS7s2mgS9rrxdHGO3W7M9rs9_dHuxi3lStIgTX99tNGC-UCB02l8xBc8S9W9iEE1uyQ-b_q1PlhX8ychFDy1j8UI9ywmgMF6-T_s_ZAAh-2j4jiFby4Dp-g6lsGWbptwTK-xtL9UM1A-EU9bU8fgrOpuk2ijdXRCKZ-5lhPqIcGo7UfeikGdwbS1qbKosBMyhX7N2hER2fi2d18H7RKn68ibkapItPHCDZ0ki9",
    imageAlt: "Digital sound waves in a futuristic debate chamber",
    Icon: Music2,
  },
  {
    level: "05",
    title: "QUIZ_CORE",
    prompt: "LOGIC: SYNAPTIC_WAR",
    description: "Interface with Ra.One's knowledge mainframe.",
    prize: "₹8,000",
    prizeNum: 8000,
    difficulty: "◆◆◆◇◇",
    category: "TECH",
    status: "ACTIVE",
    accent: "cyan",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBT8XzQrheLs1o09XbG6LbgEyF1zbjCEsMbqlFDEKNTPZVn72KjEZDKRLiKquW05XPSBwhhTGBBZ4UeEewk3H0PB5lsO7JrmjrALq_v4loCrvlgsN1luaDkXbxC11BK5hSLTDtI5fGo-XsQqyU2f0TMV-s0PRx9L8UXXoQt0ecrFAGfCqtYMitenjuI3LHkVFxHUfMjjoI326kBhl3oGgVeZujkVjMHk4uVbfsXU7GIYnL5z5RXCrIjVF15cYjFFcZpoxKOzIfnWa96",
    imageAlt: "Abstract neural network data visualization",
    Icon: Brain,
  },
  {
    level: "06",
    title: "ROBO WARS",
    prompt: "MODE: COMBAT_UNIT",
    description: "Deploy your combat unit vs Ra.One's army.",
    prize: "₹18,000",
    prizeNum: 18000,
    difficulty: "◆◆◆◆◇",
    category: "TECH",
    status: "LOCKED",
    accent: "red",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCeeJyX0UVrZXFCL61IcBSUWHUa3NZufk37tU4FAjLQhvd21v0b9KdOtKtGMvSCxyDLxJP3IFqzuRz3Ex7bkWqLPh6htdpqU9TlwmXPMJ0lhXREnOlVLrDC8eBLpa1D8hQWP7krZx3u-1iRwnWadcOuM8YCvBagLB_D5yAHoOmyqxaL1CG_uCvaVfnqv2iuwt1rKzYZHC8mCvz1HcAerspc65-ha_hu46JPylELTshgLw3eXfnrbQhwwe_Eia-BWYrysCqOF0oVAR8S",
    imageAlt: "Glitch-heavy crimson digital combat interface",
    Icon: Bot,
  },
];

const filters: { label: string; value: "ALL" | EventCategory }[] = [
  { label: "[ALL_SIM]", value: "ALL" },
  { label: "[TECH.exe]", value: "TECH" },
  { label: "[GAME_MODE]", value: "GAME" },
  { label: "[CULT.dat]", value: "CULT" },
  { label: "[HACK.run]", value: "HACK" },
];

const BentoLevelCard = ({ event }: { event: EventItem }) => {
  const locked = event.status === "LOCKED";
  const { Icon } = event;

  return (
    <article
      className={`bento-level-card group ${locked ? "is-locked" : ""}`}
      data-accent={event.accent}
    >
      <span className="bento-lvl-badge">LVL_{event.level}</span>

      <div className="bento-media">
        <img src={event.image} alt={event.imageAlt} loading="lazy" />
        <div className="bento-media-gradient" />
        <div className="bento-media-scan" />
      </div>

      <div className="bento-card-head">
        <div>
          <h3 className="bento-card-title glitch-text" data-text={event.title}>
            {event.title}
          </h3>
          <p className="bento-card-prompt">{event.prompt}</p>
        </div>
        <Icon className="bento-card-icon" size={28} strokeWidth={1.5} />
      </div>

      <div className="bento-prize-row">
        <span className="bento-prize-label">PRIZE_POOL</span>
        <span className="bento-prize-value">{event.prize}</span>
      </div>

      <p className="bento-difficulty" title="Difficulty rating">
        {event.difficulty}
      </p>

      <button
        type="button"
        disabled={locked}
        className="bento-enter-btn glitch-skew"
      >
        {locked ? "LEVEL_LOCKED" : "ENTER_LEVEL"}
        {!locked && <ArrowRight size={14} />}
      </button>
    </article>
  );
};

const PrizePoolTicker = ({ total }: { total: number }) => (
  <div className="events-prize-ticker mb-10 p-4 md:p-5">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pl-3">
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <span className="font-hud text-[10px] text-[var(--gone-cyan)] border border-[var(--gone-cyan)]/30 bg-[var(--gone-cyan)]/10 px-3 py-1 uppercase tracking-widest">
          PRIZE_POOL_STATUS
        </span>
        <h2 className="font-hud text-2xl md:text-3xl text-[var(--gone-cyan)] tracking-widest tabular-nums">
          ₹{total.toLocaleString("en-IN")}
        </h2>
      </div>
      <div className="overflow-hidden w-full md:w-auto md:max-w-md">
        <div className="animate-marquee whitespace-nowrap font-hud text-[10px] text-gray-500 uppercase tracking-widest flex gap-8">
          <span>◈ ALL_SYSTEMS_OPERATIONAL</span>
          <span>◈ VIRTUAL_CURRENCY_STABILIZED</span>
          <span>◈ CORE_ENCRYPTION_ACTIVE</span>
          <span>◈ ALL_SYSTEMS_OPERATIONAL</span>
        </div>
      </div>
    </div>
  </div>
);

const Events = () => {
  const [activeFilter, setActiveFilter] = useState<"ALL" | EventCategory>("ALL");
  const [livePrize, setLivePrize] = useState(0);
  const { ref: introRef, visible: introVisible } = useScrollReveal(0.25);
  const eyebrow = useTypewriter("> SIMULATION_CORE.exe — LOADING PROTOCOLS", introVisible, 28);

  const filteredEvents =
    activeFilter === "ALL" ? events : events.filter((e) => e.category === activeFilter);

  const basePrizeTotal = useMemo(
    () => events.reduce((sum, e) => sum + e.prizeNum, 0),
    [],
  );

  useEffect(() => {
    setLivePrize(basePrizeTotal);
    const id = window.setInterval(() => {
      setLivePrize((p) => p + Math.floor(Math.random() * 120));
    }, 2500);
    return () => clearInterval(id);
  }, [basePrizeTotal]);

  return (
    <PageSciFiLayout variant="events">
      <section className="section-redesign relative pt-24 pb-8 md:pb-12">
        <div className="section-redesign-bg section-noise">
          <span className="section-watermark">SIMULATION_CORE</span>
          <span className="events-laser" />
          <span className="events-laser" />
          <span className="events-laser" />
          <div className="events-scan-shimmer" />
        </div>

        <div ref={introRef as React.RefObject<HTMLDivElement>} className="container mx-auto px-4 text-center relative z-10">
          <p className="font-hud text-xs md:text-sm text-[var(--gone-cyan)] uppercase tracking-[0.25em] mb-4 min-h-[1.25rem]">
            {eyebrow}
            {introVisible && eyebrow.length < 42 && (
              <span className="animate-blink text-[var(--gone-cyan)]">█</span>
            )}
          </p>

          <div className="relative inline-block mb-10">
            <div className="section-title-ring" aria-hidden />
            <motion.h1
              initial={{ opacity: 0, x: -48 }}
              animate={introVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`events-title-bracket font-hud text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-wider relative z-10 ${introVisible ? "is-visible" : ""}`}
            >
              <span className="bracket-l">[</span> MISSION PROTOCOLS <span className="bracket-r">]</span>
            </motion.h1>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`terminal-chip ${activeFilter === filter.value ? "is-active" : ""}`}
              >
                {filter.label}
                {activeFilter === filter.value && (
                  <span className="inline-block w-1 h-3 bg-white ml-2 animate-blink align-middle" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-redesign pb-24 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <header className="mb-8">
            <p className="font-hud text-[10px] text-[var(--gone-cyan)] uppercase tracking-[0.2em] mb-2">
              [ SECTOR: EVENT_LEVELS ]
            </p>
            <h2 className="font-hud text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">
              CHOOSE_YOUR_CHALLENGE
            </h2>
            <div className="h-1 w-32 bg-[var(--gone-cyan)] mt-4" />
          </header>

          <PrizePoolTicker total={livePrize} />

          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeFilter}
              className="events-bento-grid"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
            >
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.level}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 24, scale: 0.96 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                >
                  <BentoLevelCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </PageSciFiLayout>
  );
};

export default Events;
