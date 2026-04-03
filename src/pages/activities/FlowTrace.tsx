import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import ActivityComplete from "@/components/ActivityComplete";
import { saveScore } from "@/lib/scores";

const DURATION = 30000;

function generatePath(w: number, h: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const segments = 5;
  const controlPoints: { x: number; y: number }[] = [];

  // Random control points for bezier curves
  controlPoints.push({ x: w * 0.1, y: h * 0.5 });
  for (let i = 0; i < segments; i++) {
    controlPoints.push({
      x: w * (0.15 + 0.7 * ((i + 0.5) / segments)) + (Math.random() - 0.5) * w * 0.15,
      y: h * 0.15 + Math.random() * h * 0.7,
    });
  }
  controlPoints.push({ x: w * 0.9, y: h * 0.5 });

  // Interpolate with cubic bezier-like curves
  const total = 300;
  for (let i = 0; i <= total; i++) {
    const t = i / total;
    const segT = t * (controlPoints.length - 1);
    const segIdx = Math.min(Math.floor(segT), controlPoints.length - 2);
    const localT = segT - segIdx;

    const p0 = controlPoints[Math.max(0, segIdx - 1)];
    const p1 = controlPoints[segIdx];
    const p2 = controlPoints[Math.min(controlPoints.length - 1, segIdx + 1)];
    const p3 = controlPoints[Math.min(controlPoints.length - 1, segIdx + 2)];

    // Catmull-Rom spline
    const tt = localT;
    const tt2 = tt * tt;
    const tt3 = tt2 * tt;
    const x = 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * tt + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * tt3);
    const y = 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * tt + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * tt3);

    points.push({ x: Math.round(Math.max(10, Math.min(w - 10, x))), y: Math.round(Math.max(10, Math.min(h - 10, y))) });
  }
  return points;
}

const FlowTrace = () => {
  const [phase, setPhase] = useState<"countdown" | "playing" | "done">("countdown");
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [countdownText, setCountdownText] = useState("Ready...");
  const [canvasSize, setCanvasSize] = useState({ w: 500, h: 400 });
  const pathRef = useRef<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const distancesRef = useRef<number[]>([]);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const animRef = useRef<number>(0);
  const startRef = useRef(0);

  const getSpeed = (t: number) => {
    if (t < 0.3) return "slow";
    if (t < 0.7) return "medium";
    return "fast";
  };

  const init = useCallback(() => {
    distancesRef.current = [];
    trailRef.current = [];
    setScore(0);
    setProgress(0);
    setAccuracy(100);
    setPhase("countdown");
    setCountdownText("Ready...");

    // Measure container
    setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = Math.min(Math.floor(rect.width), 600);
        const h = Math.round(w * 0.75);
        setCanvasSize({ w, h });
        pathRef.current = generatePath(w, h);
      }
    }, 50);

    // Countdown
    setTimeout(() => setCountdownText("Set..."), 1000);
    setTimeout(() => setCountdownText("Go!"), 2000);
    setTimeout(() => {
      setPhase("playing");
      startRef.current = Date.now();
    }, 2800);
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
    const { w, h } = canvasSize;

    const loop = () => {
      const elapsed = Date.now() - startRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      setProgress(t);
      const idx = Math.floor(t * (path.length - 1));
      const target = path[idx];

      const dx = mouseRef.current.x - target.x;
      const dy = mouseRef.current.y - target.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      distancesRef.current.push(dist);

      // Update live accuracy
      const avgDist = distancesRef.current.reduce((a, b) => a + b, 0) / distancesRef.current.length;
      setAccuracy(Math.max(0, Math.round(100 - avgDist)));

      // Trail
      trailRef.current.push({ x: target.x, y: target.y });
      if (trailRef.current.length > 30) trailRef.current.shift();

      ctx.clearRect(0, 0, w, h);

      // Gradient trail
      const trail = trailRef.current;
      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          ctx.lineTo(trail[i].x, trail[i].y);
          ctx.strokeStyle = `hsla(174, 58%, 55%, ${(i / trail.length) * 0.5})`;
          ctx.lineWidth = 2 + (i / trail.length) * 2;
          ctx.stroke();
        }
      }

      // Target dot
      ctx.beginPath();
      ctx.arc(target.x, target.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(174, 58%, 55%)";
      ctx.shadowColor = "hsl(174, 58%, 55%)";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      // User cursor
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = dist < 30 ? "hsl(174, 58%, 55%)" : "hsl(349, 73%, 64%)";
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (t >= 1) {
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
  }, [phase, canvasSize]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) * (canvasSize.w / rect.width),
      y: (e.clientY - rect.top) * (canvasSize.h / rect.height),
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    mouseRef.current = {
      x: (touch.clientX - rect.left) * (canvasSize.w / rect.width),
      y: (touch.clientY - rect.top) * (canvasSize.h / rect.height),
    };
  };

  if (phase === "done") {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <ActivityComplete score={score} label="%" activity="flow-trace" onRetry={init} />
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

        {phase === "countdown" ? (
          <div className="flex items-center justify-center" style={{ width: "100%", maxWidth: 600, aspectRatio: "4/3" }}>
            <span className="font-mono text-3xl font-bold text-primary animate-fade-in" key={countdownText}>
              {countdownText}
            </span>
          </div>
        ) : (
          <>
            <div ref={containerRef} className="border border-border rounded-lg overflow-hidden w-full" style={{ maxWidth: 600 }}>
              <canvas
                ref={canvasRef}
                width={canvasSize.w}
                height={canvasSize.h}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                className="cursor-none w-full"
                style={{ aspectRatio: `${canvasSize.w}/${canvasSize.h}`, touchAction: "none" }}
              />
            </div>
            <div className="flex items-center gap-6 mt-4">
              <span className="font-mono text-xs text-muted-foreground">{getSpeed(progress)}</span>
              <span className="font-mono text-sm text-primary">{accuracy}%</span>
            </div>
            <div className="w-64 h-1 bg-secondary rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-primary transition-all duration-200 rounded-full" style={{ width: `${progress * 100}%` }} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default FlowTrace;
