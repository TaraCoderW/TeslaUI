import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";


const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Team", href: "/team" },
  { label: "Projects", href: "/projects" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

function MicrosoftLogo({ size = 28 }: { size?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-[3px] shrink-0 transition-all duration-300"
      style={{ width: size, height: size }}
    >
      <span className="rounded-[2px] bg-[#e8392b] block shadow-sm" />
      <span className="rounded-[2px] bg-[#79b829] block shadow-sm" />
      <span className="rounded-[2px] bg-[#01a6f0] block shadow-sm" />
      <span className="rounded-[2px] bg-[#ffb900] block shadow-sm" />
    </div>
  );
}


function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="w-5 h-4 flex flex-col justify-between cursor-pointer">
      <motion.span
        animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="block w-full h-[2px] bg-black dark:bg-white rounded-full origin-center"
      />
      <motion.span
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
        className="block w-full h-[2px] bg-black dark:bg-white rounded-full origin-center"
      />
      <motion.span
        animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="block w-full h-[2px] bg-black dark:bg-white rounded-full origin-center"
      />
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const toggleBtn = document.getElementById("mobile-nav-toggle");
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        !(toggleBtn && toggleBtn.contains(e.target as Node))
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler, true);
    document.addEventListener("touchstart", handler, true);
    return () => {
      document.removeEventListener("mousedown", handler, true);
      document.removeEventListener("touchstart", handler, true);
    };
  }, [mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none px-4 md:px-8 mt-4">
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="pointer-events-auto flex items-center justify-between transition-all duration-500 ease-out w-full max-w-6xl py-3 px-6 bg-white/80 dark:bg-[#050816]/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
        >
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <MicrosoftLogo size={22} />
            <div>
              <div className="text-slate-900 dark:text-white font-bold tracking-widest uppercase leading-none transition-all duration-300 flex items-center gap-2">
                <span className="text-base">MLSA</span>
              </div>
              <div className="text-blue-600 dark:text-blue-400 text-[9px] tracking-widest mt-1 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                UEM KOLKATA
              </div>
            </div>
          </Link>

          {!isMobile && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 text-sm font-medium p-1 bg-gray-100/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-xl pointer-events-auto backdrop-blur-md">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`relative px-4 py-2 rounded-lg transition-colors duration-300 ${
                        isActive ? "text-slate-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg shadow-sm dark:shadow-inner"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {!isMobile && (
            <div className="flex items-center gap-4 relative z-10 pointer-events-auto">

              <Link to="/portal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Member Portal
                </motion.button>
              </Link>
              <Link to="/join">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative px-5 py-2 rounded-xl text-xs font-bold text-white group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity group-hover:opacity-90" />
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                  <span className="relative z-10 flex items-center gap-2">
                    Be part of Team!
                  </span>
                </motion.button>
              </Link>
            </div>
          )}

          {isMobile && (
            <div className="flex items-center gap-3 relative z-10 pointer-events-auto">

              <button
                id="mobile-nav-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors pointer-events-auto"
              >
                <HamburgerIcon open={mobileOpen} />
              </button>
            </div>
          )}
        </motion.nav>
      </div>

      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-white/80 dark:bg-[#050816]/80 backdrop-blur-xl z-[45]"
            />
            <motion.div
              ref={drawerRef}
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-full bg-gradient-to-b from-white to-gray-50 dark:from-[#0a0f25] dark:to-[#050816] z-[48] pt-28 pb-10 px-8 shadow-2xl border-b border-gray-200 dark:border-white/10"
            >
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`px-4 py-4 rounded-2xl text-xl font-bold transition-all ${
                        isActive
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 pl-6"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:pl-6"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col gap-4">
                <Link
                  to="/portal"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-4 rounded-xl bg-gray-100 dark:bg-white/5 text-center font-bold text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Member Portal
                </Link>
                <Link
                  to="/join"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-center font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
                >
                  Be part of Team!
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}