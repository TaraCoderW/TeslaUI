import { useEffect, useState } from "react";

const MouseSpotlight = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, rgba(0, 245, 255, 0.07), transparent 42%), radial-gradient(400px circle at ${pos.x + 80}px ${pos.y + 40}px, rgba(232, 0, 13, 0.05), transparent 38%)`,
      }}
    />
  );
};

export default MouseSpotlight;
