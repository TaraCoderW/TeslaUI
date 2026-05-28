import { useState, useEffect, useRef } from "react";

export const useCountUp = (target: string, duration = 2000) => {
  const [display, setDisplay] = useState(target);
  const ref = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const numMatch = target.match(/(\d+)/);
          if (!numMatch) return;

          const end = parseInt(numMatch[1]);
          const prefix = target.slice(0, target.indexOf(numMatch[1]));
          const suffix = target.slice(target.indexOf(numMatch[1]) + numMatch[1].length);
          const startTime = performance.now();

          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * end);
            setDisplay(`${prefix}${current}${suffix}`);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, display };
};
