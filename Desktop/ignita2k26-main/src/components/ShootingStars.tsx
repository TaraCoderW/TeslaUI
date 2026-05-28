import { useEffect, useRef } from "react";

const ShootingStars = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const stars: { x: number; y: number; len: number; speed: number; opacity: number; life: number; maxLife: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      if (stars.length < 3 && Math.random() < 0.008) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          len: Math.random() * 80 + 40,
          speed: Math.random() * 4 + 3,
          opacity: 1,
          life: 0,
          maxLife: Math.random() * 60 + 40,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      spawn();

      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.life++;
        s.x += s.speed;
        s.y += s.speed * 0.6;
        s.opacity = 1 - s.life / s.maxLife;

        if (s.life >= s.maxLife) {
          stars.splice(i, 1);
          continue;
        }

        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.len, s.y - s.len * 0.6);
        grad.addColorStop(0, `hsla(199, 89%, 70%, ${s.opacity})`);
        grad.addColorStop(1, `hsla(199, 89%, 70%, 0)`);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.len, s.y - s.len * 0.6);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(199, 89%, 80%, ${s.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "hsl(199 89% 60%)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[1] pointer-events-none" />;
};

export default ShootingStars;
