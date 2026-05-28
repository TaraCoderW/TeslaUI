import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tilt from "react-parallax-tilt";
import PageSciFiLayout from "@/components/layout/PageSciFiLayout";
import { useScrollReveal, useTypewriter } from "@/hooks/useScrollReveal";

type GalleryItem = {
  id: string;
  file: string;
  icon: string;
  span: string;
};

const galleryItems: GalleryItem[] = [
  { id: "0001", file: "EVENTS.dat", icon: "⚡", span: "md:col-span-2 md:row-span-2" },
  { id: "0002", file: "GAME_MODE.dat", icon: "🎮", span: "" },
  { id: "0003", file: "TECH.dat", icon: "🔬", span: "md:col-span-2" },
  { id: "0004", file: "CULT.dat", icon: "🎭", span: "" },
  { id: "0005", file: "ENTITIES.log", icon: "👥", span: "" },
  { id: "0006", file: "ENVIRON.dat", icon: "🏛️", span: "md:row-span-2" },
  { id: "0007", file: "EVENTS.dat", icon: "🏆", span: "" },
  { id: "0008", file: "TECH.dat", icon: "💻", span: "md:col-span-2" },
  { id: "0009", file: "GAME_MODE.dat", icon: "🎯", span: "" },
  { id: "0010", file: "ENVIRON.dat", icon: "🌐", span: "" },
  { id: "0011", file: "CULT.dat", icon: "🎵", span: "md:row-span-2" },
  { id: "0012", file: "ENTITIES.log", icon: "🤖", span: "" },
];

const filters = [
  { label: "[ALL_DATA]", value: "ALL" },
  { label: "[EVENTS.dat]", value: "EVENTS.dat" },
  { label: "[ENVIRON.dat]", value: "ENVIRON.dat" },
  { label: "[ENTITIES.log]", value: "ENTITIES.log" },
];

const TICKER =
  "◈ IGNITIA'26 ARCHIVES ◈ UEM KOLKATA ◈ MEMORY FRAGMENTS LOADED: 12 ◈ CLASSIFICATION: UNCLASSIFIED ◈ SYSTEM: ONLINE ◈ AUG 1-2, 2026 ◈ ";

const MatrixRain = () => {
  const cols = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${4 + i * 5.2}%`,
        delay: `${(i * 0.7) % 8}s`,
        duration: `${10 + (i % 6)}s`,
        chars: "01アイウエオカキクケコサシスセソ",
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden opacity-40">
      {cols.map((col) => (
        <span
          key={col.id}
          className="gallery-matrix-col"
          style={{
            left: col.left,
            animationDuration: col.duration,
            animationDelay: col.delay,
          }}
        >
          {col.chars.repeat(24)}
        </span>
      ))}
    </div>
  );
};

const GalleryCard = ({
  item,
  onClick,
}: {
  item: GalleryItem;
  onClick: () => void;
}) => (
  <Tilt
    tiltMaxAngleX={10}
    tiltMaxAngleY={10}
    glareEnable
    glareMaxOpacity={0.15}
    glareColor="#00f5ff"
    scale={1.03}
    transitionSpeed={1200}
    className="w-full h-full"
  >
  <button
    type="button"
    onClick={onClick}
    className="memory-card hud-corners holo-card-glow group w-full h-full min-h-[200px] text-left"
  >
    <div className="memory-card-holo" />
    <span className="memory-card-icon">{item.icon}</span>
    <span className="hc-tl" style={{ borderColor: "var(--gone-cyan)" }} />
    <span className="hc-tr" style={{ borderColor: "var(--gone-cyan)" }} />
    <span className="hc-bl" style={{ borderColor: "var(--gone-cyan)" }} />
    <span className="hc-br" style={{ borderColor: "var(--gone-cyan)" }} />
    <div className="scan-line opacity-0 group-hover:opacity-100" style={{ animationDuration: "2.5s" }} />

    <div className="relative z-10 p-4 flex flex-col justify-between h-full min-h-[200px]">
      <div>
        <span className="font-hud text-[10px] text-[var(--gone-cyan)] tracking-widest">
          #{item.id}
        </span>
        <p className="font-hud text-sm text-white mt-2 uppercase tracking-wider memory-rgb-title">
          {item.file}
        </p>
      </div>
      <div className="mt-auto pt-4 border-t border-[var(--panel-border)]">
        <div className="h-1 bg-gray-900 overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-[var(--raone-red)] to-[var(--gone-cyan)]"
            style={{ width: "78%" }}
          />
        </div>
        <div className="flex justify-between font-hud text-[9px] uppercase tracking-widest">
          <span className="text-gray-500">STATUS: ARCHIVED</span>
          <span className="text-[var(--raone-red)] group-hover:text-green-400 transition-colors">
            DECRYPT
          </span>
        </div>
      </div>
    </div>
  </button>
  </Tilt>
);

const Gallery = () => {
  const [filter, setFilter] = useState("ALL");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { ref: headerRef, visible: headerVisible } = useScrollReveal(0.2);
  const subtitle = useTypewriter(
    "> Accessing archived simulations... [CLASSIFIED]",
    headerVisible,
    32,
  );

  const filtered =
    filter === "ALL"
      ? galleryItems
      : galleryItems.filter((i) => i.file === filter);

  const selected = selectedIndex !== null ? filtered[selectedIndex] : null;

  const goPrev = () => {
    if (selectedIndex === null || filtered.length === 0) return;
    setSelectedIndex((selectedIndex - 1 + filtered.length) % filtered.length);
  };

  const goNext = () => {
    if (selectedIndex === null || filtered.length === 0) return;
    setSelectedIndex((selectedIndex + 1) % filtered.length);
  };

  useEffect(() => {
    if (selectedIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev === null || filtered.length === 0
            ? null
            : (prev - 1 + filtered.length) % filtered.length,
        );
      }
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          prev === null || filtered.length === 0 ? null : (prev + 1) % filtered.length,
        );
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, filtered.length]);

  const openItem = (item: GalleryItem) => {
    const idx = filtered.findIndex((f) => f.id === item.id);
    setSelectedIndex(idx >= 0 ? idx : 0);
  };

  return (
    <PageSciFiLayout variant="gallery">
        <section className="section-redesign relative pt-24 pb-6">
          <div className="section-redesign-bg section-noise">
            <div className="gallery-atmo" />
            <MatrixRain />
            <span className="section-watermark">MEMORY_CORE</span>
          </div>

          <div
            ref={headerRef as React.RefObject<HTMLDivElement>}
            className="container mx-auto px-4 text-center relative z-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: -16 }}
              animate={headerVisible ? { opacity: 1, y: 0 } : {}}
              className="font-hud text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--raone-red)] to-[var(--gone-cyan)]"
            >
              MEMORY_CORE
            </motion.h1>
            <p className="font-hud text-xs md:text-sm text-[var(--gone-cyan)] mt-4 uppercase tracking-widest min-h-[1.25rem]">
              {subtitle}
              {headerVisible && subtitle.length < 48 && (
                <span className="animate-blink">█</span>
              )}
            </p>
          </div>
        </section>

        <div className="relative z-10 border-y border-[var(--raone-red)]/40 bg-[rgba(232,0,13,0.12)] py-2 overflow-hidden">
          <div className="gallery-ticker-track font-hud text-[10px] text-[var(--gone-cyan)] uppercase tracking-widest">
            <span className="px-4">{TICKER}</span>
            <span className="px-4">{TICKER}</span>
          </div>
        </div>

        <section className="section-padding relative z-10">
          <div className="container mx-auto">
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {filters.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    setFilter(c.value);
                    setSelectedIndex(null);
                  }}
                  className={`terminal-chip ${filter === c.value ? "is-active" : ""}`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.3 }}
                    className={item.span}
                  >
                    <GalleryCard item={item} onClick={() => openItem(item)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        <AnimatePresence>
          {selected && selectedIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="memory-lightbox-backdrop flex items-center justify-center p-4"
              onClick={() => setSelectedIndex(null)}
              role="dialog"
              aria-modal
              aria-label="Memory analysis"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: "spring", damping: 26, stiffness: 280 }}
                onClick={(e) => e.stopPropagation()}
                className="memory-lightbox-panel is-open hud-corners"
              >
                <span className="lb-corner tl" />
                <span className="lb-corner tr" />
                <span className="lb-corner bl" />
                <span className="lb-corner br" />

                <div className="flex justify-between items-center p-3 border-b border-[var(--panel-border)] bg-[var(--panel-dark)]">
                  <span className="font-hud text-xs text-[var(--gone-cyan)] uppercase tracking-widest">
                    [ HUD MEMORY ANALYSIS — <span className="animate-blink">█</span> ]
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(null)}
                    className="font-hud text-xs text-[var(--raone-red)] hover:opacity-80 uppercase"
                  >
                    [ ESC ] CLOSE
                  </button>
                </div>

                <div className="relative aspect-video bg-[var(--deep-space)] flex items-center justify-center overflow-hidden">
                  <motion.div
                    initial={{ top: "-8%" }}
                    animate={{ top: "108%" }}
                    transition={{ duration: 1.1, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-[var(--gone-cyan)] z-20"
                    style={{ boxShadow: "var(--glow-cyan)" }}
                  />
                  <span className="text-6xl opacity-30">{selected.icon}</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="font-hud text-xl md:text-2xl text-white uppercase tracking-widest glitch-text memory-rgb-title"
                      data-text={selected.file}
                    >
                      {selected.file}
                    </span>
                  </div>
                </div>

                <div className="p-4 font-hud text-xs text-[var(--gone-cyan)] space-y-1 border-t border-[var(--panel-border)] bg-[var(--panel-dark)]">
                  <p>
                    <span className="text-gray-500">{">"} FRAGMENT_ID :</span> #{selected.id}
                  </p>
                  <p>
                    <span className="text-gray-500">{">"} TYPE :</span> {selected.file}
                  </p>
                  <p>
                    <span className="text-gray-500">{">"} CLASSIFICATION :</span> UNCLASSIFIED
                  </p>
                  <p>
                    <span className="text-gray-500">{">"} TIMESTAMP :</span> IGNITIA&apos;26 — AUG 1-2, 2026
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-500">{">"} INTEGRITY :</span> 100%
                    <span className="text-green-500 tracking-tighter">████████████</span>
                  </p>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="pointer-events-auto font-hud text-[10px] px-3 py-2 border border-[var(--raone-red)] text-[var(--raone-red)] bg-black/80 hover:bg-[var(--raone-red)] hover:text-black transition-colors uppercase"
                  >
                    ◀ PREV
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="pointer-events-auto font-hud text-[10px] px-3 py-2 border border-[var(--raone-red)] text-[var(--raone-red)] bg-black/80 hover:bg-[var(--raone-red)] hover:text-black transition-colors uppercase"
                  >
                    NEXT ▶
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </PageSciFiLayout>
  );
};

export default Gallery;
