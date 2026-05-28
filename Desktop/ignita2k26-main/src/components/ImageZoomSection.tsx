import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ImageZoomSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !imageRef.current || !overlayRef.current) return;

    const ctx = gsap.context(() => {
      // The image container starts scaled down and zooms in as you scroll
      gsap.fromTo(
        imageRef.current,
        { 
          scale: 0.8,
          borderRadius: "32px",
        },
        {
          scale: 1.1, // Zoom in effect
          borderRadius: "0px",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom", // when the top of the container hits the bottom of the screen
            end: "bottom center", // when the bottom of the container hits the center of the screen
            scrub: 1, // Smooth scrubbing
          },
        }
      );

      // Text and overlay parallax
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "center center",
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center my-20">
      <div 
        ref={imageRef}
        className="absolute inset-0 w-full h-full origin-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          willChange: "transform"
        }}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      </div>
      
      <div ref={overlayRef} className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm text-primary mb-6 shimmer-card">
            <Sparkles size={14} className="text-primary animate-pulse" />
            <span>The Biggest Tech Fest</span>
        </div>
        <h2 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tight text-white mb-6">
          Experience the <span className="gradient-text">Future</span>
        </h2>
        <p className="text-lg text-white/80 md:text-xl">
          Dive into 48 hours of relentless building, learning, and celebration.
        </p>
      </div>
    </section>
  );
};

export default ImageZoomSection;
