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
  const [phase, setPhase] = useState<"active" | "done">("active");
  const [label, setLabel] = useState("breathe in");
  const [scale, setScale] = useState(0.4);
  const [opacity, setOpacity] = useState(0.4);
  const [cycle, setCycle] = useState(0);
  const animRef = useRef<number>(0);
  const startRef = useRef(0);

  const init = useCallback(() => {
    setPhase("active");
    setCycle(0);
    startRef.current = Date.now();
  }, []);

  useEffect(() => {
    init();
    return () => cancelAnimationFrame(animRef.current);
  }, [init]);

  useEffect(() => {
    if (phase !== "active") return;

    const loop = () => {
      const elapsed = Date.now() - startRef.current;
      const currentCycle = Math.floor(elapsed / CYCLE);

      if (currentCycle >= TOTAL_CYCLES) {
        setPhase("done");
        saveScore("breathe", null, "");
        return;
      }

      setCycle(currentCycle);
      const inCycle = elapsed % CYCLE;

      if (inCycle < INHALE) {
        const t = inCycle / INHALE;
        setScale(0.4 + t * 0.6);
        setOpacity(0.4 + t * 0.6);
        setLabel("breathe in");
      } else if (inCycle < INHALE + HOLD) {
        setScale(1);
        setOpacity(0.85 + Math.sin((inCycle - INHALE) / HOLD * Math.PI * 2) * 0.15);
        setLabel("hold");
      } else {
        const t = (inCycle - INHALE - HOLD) / EXHALE;
        setScale(1 - t * 0.6);
        setOpacity(1 - t * 0.6);
        setLabel("breathe out");
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 animate-fade-in">
        <h1 className="font-mono text-xl font-bold mb-2">breathe</h1>
        <p className="font-body text-sm text-muted-foreground mb-16">Follow the circle. No rush.</p>

        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          <div
            className="rounded-full bg-primary transition-none"
            style={{
              width: 200,
              height: 200,
              transform: `scale(${scale})`,
              opacity,
            }}
          />
          <span className="absolute font-mono text-sm text-primary-foreground select-none">
            {label}
          </span>
        </div>

        <p className="font-mono text-xs text-muted-foreground mt-12">
          cycle {cycle + 1} / {TOTAL_CYCLES}
        </p>
      </div>
    </Layout>
  );
};

export default Breathe;
