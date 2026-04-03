import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import ActivityComplete from "@/components/ActivityComplete";
import { saveScore } from "@/lib/scores";

function generateColors(count: number): { hue: number; color: string }[] {
  const hues: number[] = [];
  for (let i = 0; i < count; i++) {
    hues.push(Math.round((360 / count) * i + Math.random() * (360 / count / 2)));
  }
  return hues.map((h) => ({ hue: h % 360, color: `hsl(${h % 360}, 70%, 50%)` }));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const init = useCallback(() => {
    const c = generateColors(10);
    setColors(shuffle(c));
    setSelected(null);
    setDone(false);
    setScore(0);
    setElapsed(0);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 200);
  }, []);

  useEffect(() => {
    init();
    return () => clearInterval(timerRef.current);
  }, [init]);

  const handleClick = (index: number) => {
    if (done) return;
    if (selected === null) {
      setSelected(index);
    } else {
      const next = [...colors];
      [next[selected], next[index]] = [next[index], next[selected]];
      setColors(next);
      setSelected(null);
    }
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    const acc = calcAccuracy(colors);
    setScore(acc);
    setDone(true);
    saveScore("color-sort", acc, "%");
  };

  if (done) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <ActivityComplete score={score} label="%" onRetry={init} message={`Sorted in ${elapsed}s. Ready to get back to it?`} />
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
        <div className="flex gap-2 flex-wrap justify-center mb-6">
          {colors.map((c, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-md transition-all duration-200 ${
                selected === i ? "ring-2 ring-foreground scale-110" : "hover:scale-105"
              }`}
              style={{ backgroundColor: c.color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-sm text-muted-foreground">{elapsed}s</span>
          <button
            onClick={handleSubmit}
            className="font-mono text-sm px-6 py-2 rounded-md bg-primary text-primary-foreground transition-all duration-300 hover:opacity-90"
          >
            done
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ColorSort;
