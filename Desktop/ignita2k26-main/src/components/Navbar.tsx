import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Schedule", href: "/schedule" },
  { label: "Team", href: "/team" },
  { label: "Gallery", href: "/gallery" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [logoPulseKey, setLogoPulseKey] = useState(0);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const { scrollY } = useScroll();
  const logoScale = useSpring(useTransform(scrollY, [0, 110], [0.97, 1]), {
    stiffness: 180,
    damping: 30,
  });
  const logoY = useSpring(useTransform(scrollY, [0, 110], [2, 0]), {
    stiffness: 180,
    damping: 30,
  });
  const logoOpacity = useTransform(scrollY, [0, 20, 80], [0.25, 0.7, 1]);
  const navHeight = useSpring(useTransform(scrollY, [0, 110], [68, 64]), {
    stiffness: 180,
    damping: 30,
  });

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(!isHome && y > 100 && y > lastY);
      setLastY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY, isHome]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const onLoaderComplete = () => setLogoPulseKey((k) => k + 1);
    window.addEventListener("ignitia:loader-complete", onLoaderComplete);
    return () =>
      window.removeEventListener("ignitia:loader-complete", onLoaderComplete);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-glass-border"
    >
      <motion.div
        style={{ height: isHome ? navHeight : 64 }}
        className="container mx-auto flex items-center justify-between px-4"
      >
        <Link to="/" className="flex items-center gap-2">
          <motion.span
            style={
              isHome
                ? { scale: logoScale, y: logoY, opacity: logoOpacity }
                : undefined
            }
            className="origin-left"
          >
            <motion.span
              key={logoPulseKey}
              initial={
                logoPulseKey
                  ? { opacity: 0.35, scale: 0.72, filter: "blur(8px)" }
                  : false
              }
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="font-heading text-xl font-bold gradient-text inline-block"
            >
              IGNITIA'26
            </motion.span>
          </motion.span>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`nav-link-underline text-sm transition-colors duration-200 ${
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/events"
            className="glow-button text-sm !px-6 !py-2 pulse-cta"
          >
            Register Now
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-foreground relative w-6 h-6"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="m"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-t border-glass-border overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.href}
                    className={`block transition-colors ${
                      location.pathname === link.href
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                to="/events"
                className="glow-button text-center text-sm !px-6 !py-2"
              >
                Register Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
