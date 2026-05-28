import { ReactNode, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollProgress from "@/components/ScrollProgress";
import ShootingStars from "@/components/ShootingStars";
import SciFiUniverseBackground from "@/components/background/SciFiUniverseBackground";
import type { SciFiVariant } from "@/components/background/SciFiScene3D";

type Props = {
  children: ReactNode;
  variant?: SciFiVariant;
  /** Extra class on content wrapper */
  className?: string;
};

/**
 * Shared shell for Events / Schedule / Team / Gallery —
 * cinematic 3D background + particles + stars + scroll progress.
 */
const PageSciFiLayout = ({
  children,
  variant = "default",
  className = "",
}: Props) => {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty(
        "--spot-x",
        `${(e.clientX / window.innerWidth) * 100}%`,
      );
      document.documentElement.style.setProperty(
        "--spot-y",
        `${(e.clientY / window.innerHeight) * 100}%`,
      );
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
  <PageTransition>
    <div
      className={`min-h-screen text-gray-200 scanline-overlay relative overflow-x-hidden ${className}`}
      style={{ background: "var(--void-black)" }}
    >
      <SciFiUniverseBackground variant={variant} />
      <ShootingStars />

      <div className="scifi-dual-spotlight pointer-events-none fixed inset-0 z-[2]" />

      <ScrollProgress />

      <div className="relative z-10">
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  </PageTransition>
  );
};

export default PageSciFiLayout;
