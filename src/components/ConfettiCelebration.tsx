import { useEffect, useRef } from 'react';

interface ConfettiCelebrationProps {
  active?: boolean;
  durationMs?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle' | 'strip';
  opacity: number;
}

const BRAND_CONFETTI_COLORS = [
  '#F05A28', // Brand Orange
  '#F59E0B', // Amber Gold
  '#10B981', // Emerald Green
  '#3B82F6', // Royal Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
];

export default function ConfettiCelebration({
  active = true,
  durationMs = 4200,
}: ConfettiCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnBurst = (originX: number, originY: number, count: number, spreadDir: number) => {
      const shapes: Array<'rect' | 'circle' | 'strip'> = ['rect', 'circle', 'strip'];
      for (let i = 0; i < count; i++) {
        const angle = (Math.random() * Math.PI * 0.55 + Math.PI * 0.18) * spreadDir;
        const speed = 9 + Math.random() * 14;
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed * spreadDir + (Math.random() - 0.5) * 4,
          vy: -Math.abs(Math.sin(angle) * speed) - Math.random() * 6,
          size: 6 + Math.random() * 6,
          color: BRAND_CONFETTI_COLORS[Math.floor(Math.random() * BRAND_CONFETTI_COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          opacity: 1,
        });
      }
    };

    // Wave 1: Dual side cannons
    spawnBurst(window.innerWidth * 0.12, window.innerHeight * 0.65, 55, 1);
    spawnBurst(window.innerWidth * 0.88, window.innerHeight * 0.65, 55, -1);

    // Wave 2: Center celebration pop after 350ms
    const secondWaveTimer = window.setTimeout(() => {
      spawnBurst(window.innerWidth * 0.35, window.innerHeight * 0.5, 40, 1);
      spawnBurst(window.innerWidth * 0.65, window.innerHeight * 0.5, 40, -1);
    }, 350);

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32; // gravity
        p.vx *= 0.99; // air drag
        p.rotation += p.rotationSpeed;

        if (elapsed > durationMs - 1000) {
          p.opacity = Math.max(0, p.opacity - 0.025);
        }

        if (p.y > canvas.height + 40 || p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'strip') {
          ctx.fillRect(-p.size * 0.8, -p.size * 0.25, p.size * 1.6, p.size * 0.5);
        } else {
          ctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size * 0.75);
        }
        ctx.restore();
      }

      if (elapsed < durationMs && particles.length > 0) {
        animationFrameId = window.requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(secondWaveTimer);
      window.removeEventListener('resize', resize);
    };
  }, [active, durationMs]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[100]"
    />
  );
}
