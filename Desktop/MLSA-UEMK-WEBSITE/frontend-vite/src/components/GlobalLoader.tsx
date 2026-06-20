import { motion, AnimatePresence } from "framer-motion";

export default function GlobalLoader({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-white/30 dark:bg-[#050816]/60 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden transition-colors duration-500"
        >
          {/* Ambient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Microsoft Windows 11 style 4 squares */}
          <div className="relative z-10 grid grid-cols-2 gap-1.5">
            <motion.div
              animate={{ scale: [1, 0.85, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0 }}
              className="w-10 h-10 rounded-[3px] bg-[#f25022] shadow-[0_0_15px_rgba(242,80,34,0.4)]"
            />
            <motion.div
              animate={{ scale: [1, 0.85, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.2 }}
              className="w-10 h-10 rounded-[3px] bg-[#7fba00] shadow-[0_0_15px_rgba(127,186,0,0.4)]"
            />
            <motion.div
              animate={{ scale: [1, 0.85, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.6 }}
              className="w-10 h-10 rounded-[3px] bg-[#00a4ef] shadow-[0_0_15px_rgba(0,164,239,0.4)]"
            />
            <motion.div
              animate={{ scale: [1, 0.85, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.4 }}
              className="w-10 h-10 rounded-[3px] bg-[#ffb900] shadow-[0_0_15px_rgba(255,185,0,0.4)]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
