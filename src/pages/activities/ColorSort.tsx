import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import ActivityComplete from "@/components/ActivityComplete";
import { saveScore } from "@/lib/scores";

function generateColors(count: number): { hue: number; color: string }[] {
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => {
    const hue = Math.round(step * i + step * 0.1 + Math.random() * step * 0.6);
    return { hue: hue % 360, color: `hsl(${hue % 360}, 72%, 52%)` };
  });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isSorted(tiles: { hue: number }[]): boolean {
  for (let i = 1; i < tiles.length; i++) {
    if (tiles[i].hue < tiles[i - 1].hue) return false;
  }
  return true;
}

function calcAccuracy(tiles: { hue: number }[]): number {
  const sorted = [...tiles].sort((a, b) => a.hue - b.hue);
  let correct = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].hue === sorted[i].hue) correct++;
  }
  return Math.round((correct / tiles.length) * 100);
}

const ColorSort = () => {
  const [colors, setColors] = useState<{ hue: number; color: string }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cascadeIndex, setCascadeIndex] = useState(-1);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const sortedRef = useRef<{ hue: number }[]>([]);

  const init = useCallback(() => {
    const tileCount = window.innerWidth < 640 ? 8 : 10;
    const c = generateColors(tileCount);
    sortedRef.current = [...c].sort((a, b) => a.hue - b.hue);
    setColors(shuffle(c));
    setSelected(null);
    setDone(false);
    setScore(0);
    setElapsed(0);
    setCascadeIndex(-1);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 200);
  }, []);

  useEffect(() => {
    init();
    return () => clearInterval(timerRef.current);
  }, [init]);

  // Auto-detect completion
  useEffect(() => {
    if (done || colors.length === 0) return;
    if (isSorted(colors)) {
      clearInterval(timerRef.current);
      const acc = calcAccuracy(colors);
      setScore(acc);
      // Cascade animation
      let i = 0;
      const interval = setInterval(() => {
        setCascadeIndex(i);
        i++;
        if (i >= colors.length) {
          clearInterval(interval);
          setTimeout(() => setDone(true), 400);
        }
      }, 80);
    }
  }, [colors, done]);

  const handleClick = (index: number) => {
    if (done || cascadeIndex >= 0) return;
    if (selected === null) {
      setSelected(index);
    } else {
      const next = [...colors];
      [next[selected], next[index]] = [next[index], next[selected]];
      setColors(next);
      setSelected(null);
    }
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      const next = [...colors];
      [next[dragIndex], next[index]] = [next[index], next[dragIndex]];
      setColors(next);
      setDragIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const correctPositions = colors.map((c, i) =>
    sortedRef.current[i] && c.hue === sortedRef.current[i].hue
  );

  if (done) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <ActivityComplete score={score} label="%" activity="color-sort" onRetry={init} message={`Sorted in ${elapsed}s.`} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 animate-fade-in">
        <h1 className="font-mono text-xl font-bold mb-2">color sort</h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Tap two tiles to swap. Arrange in rainbow order.
        </p>
        <div className="flex gap-2 flex-wrap justify-center mb-2">
          {colors.map((c, i) => (
            <button
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              onClick={() => handleClick(i)}
              className={`w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] rounded-lg transition-all duration-300 ${
                selected === i ? "ring-2 ring-foreground scale-110" : "hover:scale-105"
              } ${cascadeIndex >= i && cascadeIndex >= 0 ? "glow-primary" : ""}`}
              style={{
                backgroundColor: c.color,
                boxShadow: cascadeIndex >= i && cascadeIndex >= 0
                  ? "0 0 20px hsl(174 58% 55% / 0.5), inset 0 2px 4px rgba(255,255,255,0.1)"
                  : "inset 0 2px 4px rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>
        <div className="flex gap-2 flex-wrap justify-center mb-6">
          {correctPositions.map((correct, i) => (
            <div key={i} className="w-[60px] sm:w-[72px] flex justify-center">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${correct ? "bg-primary" : "bg-muted-foreground/20"}`} />
            </div>
          ))}
        </div>
        <span className="font-mono text-sm text-muted-foreground">{elapsed}s</span>
      </div>
    </Layout>
  );
};

export default ColorSort;
