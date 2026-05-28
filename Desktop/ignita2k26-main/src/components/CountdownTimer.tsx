import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TARGET_DATE = new Date("2026-08-01T09:00:00+05:30").getTime();

interface TimeUnit {
  value: number;
  label: string;
}

const FlipDigit = ({ value, label }: { value: number; label: string }) => {
  const prev = useRef(value);
  const changed = prev.current !== value;
  prev.current = value;
  const str = String(value).padStart(2, "0");

  return (
    <div className="glass-card neon-glow-blue p-4 md:p-6 min-w-[70px] md:min-w-[100px] text-center relative overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={changed ? { y: -30, opacity: 0, rotateX: -90 } : false}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: 30, opacity: 0, rotateX: 90 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="font-heading text-3xl md:text-5xl font-bold text-primary block"
        >
          {str}
        </motion.span>
      </AnimatePresence>
      <p className="text-xs md:text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

const CountdownTimer = ({ embedded = false }: { embedded?: boolean }) => {
  const [timeLeft, setTimeLeft] = useState<TimeUnit[]>([]);

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, TARGET_DATE - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft([
        { value: days, label: "Days" },
        { value: hours, label: "Hours" },
        { value: minutes, label: "Minutes" },
        { value: seconds, label: "Seconds" },
      ]);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const content = (
    <>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-sm text-muted-foreground mb-6 uppercase tracking-widest"
      >
        Event Starts In
      </motion.p>
      <div className="flex justify-center gap-4 md:gap-8">
        {timeLeft.map((unit, i) => (
          <motion.div
            key={unit.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <FlipDigit value={unit.value} label={unit.label} />
          </motion.div>
        ))}
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="relative w-full pt-10 md:pt-6 lg:pt-4">{content}</div>
    );
  }

  return (
    <section className="relative py-16 px-4">
      <div className="container mx-auto">{content}</div>
    </section>
  );
};

export default CountdownTimer;
