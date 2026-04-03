import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import ActivityComplete from "@/components/ActivityComplete";
import { saveScore } from "@/lib/scores";

const DURATION = 30000; // 30 seconds
const WIDTH = 500;
const HEIGHT = 400;

function generatePath(): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const steps = 300;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = WIDTH * 0.1 + WIDTH * 0.8 * t + Math.sin(t * Math.PI * 4) * 60;
    const y = HEIGHT * 0.5 + Math.sin(t * Math.PI * 3) * 120 + Math.cos(t * Math.PI * 5) * 50;
    points.push({ x: Math.round(x), y: Math.round(y) });
  }
  return points;
}

const FlowTrace = () => {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const pathRef = useRef(generatePath());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const distancesRef = useRef<number[]>([]);
  const animRef = useRef<number>(0);
  const startRef = useRef(0);

  const init = useCallback(() => {
    pathRef.current = generatePath();
    distancesRef.current = [];
    setPhase("idle");
    setScore(0);
    setProgress(0);
    setTimeout(() => {
      setPhase("playing");
      startRef.current = Date.now();
    }, 800);
  }, []);

  useEffect(() => {
    init();
    return () => cancelAnimationFrame(animRef.current);
  }, [init]);

  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const path = pathRef.current;

    const loop = () => {
      const elapsed = Date.now() - startRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      setProgress(t);
      const idx = Math.floor(t * (path.length - 1));
      const target = path[idx];

      // Track distance
      const dx = mouseRef.current.x - target.x;
      const dy = mouseRef.current.y - target.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      distancesRef.current.push(dist);

      // Draw
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Draw trail
      ctx.beginPath();
      ctx.strokeStyle = "hsl(174, 58%, 55%)";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.2;
      for (let i = 0; i <= idx; i++) {
        if (i === 0) ctx.moveTo(path[i].x, path[i].y);
        else ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw target dot
      ctx.beginPath();
      ctx.arc(target.x, target.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(174, 58%, 55%)";
      ctx.fill();

      // Draw user cursor indicator
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = dist < 30 ? "hsl(174, 58%, 55%)" : "hsl(349, 73%, 64%)";
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (t >= 1) {
        const avgDist = distancesRef.current.reduce((a, b) => a + b, 0) / distancesRef.current.length;
        const pct = Math.max(0, Math.round(100 - avgDist));
        setScore(pct);
        setPhase("done");
        saveScore("flow-trace", pct, "%");
        return;
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    mouseRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  if (phase === "done") {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <ActivityComplete score={score} label="%" onRetry={init} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 animate-fade-in">
        <h1 className="font-mono text-xl font-bold mb-2">flow trace</h1>
        <p className="font-body text-sm text-muted-foreground mb-6">
          Follow the dot with your cursor. Stay close.
        </p>
        <div className="border border-border rounded-lg overflow-hidden" style={{ width: WIDTH, maxWidth: "100%" }}>
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="cursor-none"
          />
        </div>
        <div className="w-64 h-1 bg-secondary rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-primary transition-all duration-200 rounded-full" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </Layout>
  );
};

export default FlowTrace;
