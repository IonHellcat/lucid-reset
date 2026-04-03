import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import ActivityComplete from "@/components/ActivityComplete";
import { saveScore } from "@/lib/scores";

const INHALE = 4000;
const HOLD = 4000;
const EXHALE = 6000;
const CYCLE = INHALE + HOLD + EXHALE;
const TOTAL_CYCLES = 4;

const Breathe = () => {
  const [phase, setPhase] = useState<"active" | "dissolve" | "done">("active");
  const [label, setLabel] = useState("breathe in");
  const [scale, setScale] = useState(0.4);
  const [ringScale, setRingScale] = useState(0.38);
  const [opacity, setOpacity] = useState(0.4);
  const [bgBrightness, setBgBrightness] = useState(6);
  const [cycle, setCycle] = useState(0);
  const [particles, setParticles] = useState<{ x: number; y: number; vx: number; vy: number; o: number }[]>([]);
  const animRef = useRef<number>(0);
  const startRef = useRef(0);

  const init = useCallback(() => {
    setPhase("active");
    setCycle(0);
    setParticles([]);
    startRef.current = Date.now();
  }, []);

  useEffect(() => {
    init();
    return () => cancelAnimationFrame(animRef.current);
  }, [init]);

  useEffect(() => {
    if (phase === "dissolve") {
      // Create dissolve particles
      const pts = Array.from({ length: 30 }, () => ({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        o: 1,
      }));
      setParticles(pts);

      let frame: number;
      const animate = () => {
        setParticles((prev) =>
          prev.map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            o: Math.max(0, p.o - 0.015),
          }))
        );
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
      setTimeout(() => {
        cancelAnimationFrame(frame);
        setPhase("done");
      }, 2000);
      return () => cancelAnimationFrame(frame);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "active") return;

    const loop = () => {
      const elapsed = Date.now() - startRef.current;
      const currentCycle = Math.floor(elapsed / CYCLE);

      if (currentCycle >= TOTAL_CYCLES) {
        saveScore("breathe", null, "");
        setPhase("dissolve");
        return;
      }

      setCycle(currentCycle);
      const inCycle = elapsed % CYCLE;

      if (inCycle < INHALE) {
        const t = inCycle / INHALE;
        setScale(0.4 + t * 0.6);
        setRingScale(0.38 + t * 0.6 * 0.95);
        setOpacity(0.4 + t * 0.6);
        setLabel("breathe in");
        setBgBrightness(6 + t * 1);
      } else if (inCycle < INHALE + HOLD) {
        setScale(1);
        setRingScale(0.98);
        setOpacity(0.85 + Math.sin((inCycle - INHALE) / HOLD * Math.PI * 2) * 0.15);
        setLabel("hold");
        setBgBrightness(7);
      } else {
        const t = (inCycle - INHALE - HOLD) / EXHALE;
        setScale(1 - t * 0.6);
        setRingScale(0.98 - t * 0.6 * 0.95);
        setOpacity(1 - t * 0.6);
        setLabel("breathe out");
        setBgBrightness(7 - t * 1);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  if (phase === "done") {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <ActivityComplete score={null} onRetry={init} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-16 animate-fade-in transition-colors duration-1000"
        style={{ backgroundColor: `hsl(0 0% ${bgBrightness}%)` }}
      >
        <h1 className="font-display text-xl font-bold mb-2">breathe</h1>
        <p className="font-body text-sm text-muted-foreground mb-16">Follow the circle. No rush.</p>

        <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
          {/* Ring echo */}
          <div
            className="absolute rounded-full border border-primary/30 transition-none"
            style={{
              width: 220,
              height: 220,
              transform: `scale(${ringScale})`,
              opacity: opacity * 0.4,
            }}
          />
          {/* Main circle with radial gradient */}
          <div
            className="rounded-full transition-none"
            style={{
              width: 200,
              height: 200,
              transform: `scale(${scale})`,
              opacity,
              background: "radial-gradient(circle, hsl(168 60% 50%) 0%, hsl(168 60% 35% / 0.3) 70%, transparent 100%)",
            }}
          />

          {/* Dissolve particles */}
          {phase === "dissolve" && particles.map((p, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary"
              style={{
                transform: `translate(${p.x}px, ${p.y}px)`,
                opacity: p.o,
              }}
            />
          ))}
        </div>

        <span className="font-display text-sm text-muted-foreground mt-6 select-none">
          {label}
        </span>

        <p className="font-mono text-xs text-muted-foreground mt-8">
          cycle {cycle + 1} / {TOTAL_CYCLES}
        </p>
      </div>
    </Layout>
  );
};

export default Breathe;
