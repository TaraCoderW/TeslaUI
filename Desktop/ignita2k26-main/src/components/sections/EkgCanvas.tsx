import { useEffect, useRef } from "react";

const EkgCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const mid = h * 0.55;
      ctx.strokeStyle = "rgba(232, 0, 13, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const step = 4;
      for (let x = 0; x < w; x += step) {
        const phase = (x + frame * 2) * 0.04;
        let y = mid;

        if (Math.sin(phase) > 0.92) {
          y -= 22 + Math.sin(phase * 3) * 8;
        } else if (Math.sin(phase * 0.5) > 0.6) {
          y += Math.sin(phase * 2) * 3;
        } else {
          y += Math.sin(phase) * 2;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();

      const pulseX = ((frame * 1.2) % w);
      ctx.fillStyle = "rgba(0, 245, 255, 0.9)";
      ctx.shadowColor = "rgba(0, 245, 255, 0.8)";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(pulseX, mid - 8, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      frame += 1;
      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="section-ekg-canvas"
      aria-hidden
    />
  );
};

export default EkgCanvas;
