import { motion } from "framer-motion";
import { Github, Instagram, Linkedin, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Footer = () => (
  <footer className="border-t border-glass-border bg-card/40 backdrop-blur-xl">
    <div className="container mx-auto px-4 py-16">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-4 gap-10"
      >
        <motion.div variants={fadeUp} className="md:col-span-1">
          <Link to="/" className="font-heading text-2xl font-bold gradient-text">IGNITIA'26</Link>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            The flagship multi-domain event by IEM-UEM groups, UEM Kolkata.
          </p>
          <div className="flex gap-3 mt-4">
            {[Instagram, Twitter, Linkedin, Github].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              >
                <Icon size={16} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h4 className="font-heading font-semibold text-foreground mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {[
              { label: "About", to: "/about" },
              { label: "Events", to: "/events" },
              { label: "Schedule", to: "/schedule" },
              { label: "Sponsors", to: "/sponsors" },
              { label: "Team", to: "/team" },
              { label: "FAQ", to: "/faq" },
            ].map((l) => (
              <motion.div key={l.label} whileHover={{ x: 4 }}>
                <Link
                  to={l.to}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors nav-link-underline w-fit"
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h4 className="font-heading font-semibold text-foreground mb-4">Events</h4>
          <div className="flex flex-col gap-2">
            {["Ideathon", "Coding Quest", "Quiz", "Gaming Arena", "Cultural Fest", "Game Dev Hackathon"].map((e) => (
              <motion.div key={e} whileHover={{ x: 4 }}>
                <Link
                  to="/events"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors nav-link-underline w-fit"
                >
                  {e}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h4 className="font-heading font-semibold text-foreground mb-4">Contact</h4>
          <div className="flex flex-col gap-3">
            <motion.div whileHover={{ x: 4 }} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail size={14} className="text-primary" /> ignitia@uem.edu.in
            </motion.div>
            <motion.div whileHover={{ x: 4 }} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone size={14} className="text-primary" /> +91 98765 43210
            </motion.div>
            <motion.div whileHover={{ x: 4 }} className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin size={14} className="text-primary shrink-0 mt-0.5" /> University of Engineering & Management, Kolkata
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="border-t border-glass-border mt-12 pt-6 text-center text-xs text-muted-foreground origin-center"
      >
        © 2026 IGNITIA'26 — IEM-UEM groups, UEM Kolkata. All rights reserved.
      </motion.div>
    </div>
  </footer>
);

export default Footer;
