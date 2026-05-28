import { useRef } from "react";
import { useScroll, useTransform, useSpring, MotionValue } from "framer-motion";

export const useScaleOnScroll = (start = 0.6, end = 1) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.5], [start, end]), { stiffness: 100, damping: 30 });
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  return { ref, scale, opacity };
};

export const usePerspectiveTilt = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 1], [15, 0]), { stiffness: 80, damping: 20 });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [80, 0]), { stiffness: 80, damping: 20 });
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  return { ref, rotateX, y, opacity };
};

export const useHorizontalScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  return { ref, x, scrollYProgress };
};

export const useStickyZoom = (targetScale = 1.5) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.8, 1], [0.7, targetScale, 1]), { stiffness: 60, damping: 20 });
  return { ref, scale, scrollYProgress };
};

export const useZoomFollow = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1.1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  return { ref, scale, opacity };
};

export const useDiagonalEntry = (fromX = -100, fromY = 100) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const x = useSpring(useTransform(scrollYProgress, [0, 1], [fromX, 0]), { stiffness: 60, damping: 20 });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [fromY, 0]), { stiffness: 60, damping: 20 });
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  return { ref, x, y, opacity };
};

export const useRotateIntoPlace = (startAngle = 15) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotate = useSpring(useTransform(scrollYProgress, [0, 1], [startAngle, 0]), { stiffness: 80, damping: 20 });
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  return { ref, rotate, opacity };
};
