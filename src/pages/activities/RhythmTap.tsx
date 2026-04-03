import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import ActivityComplete from "@/components/ActivityComplete";
import { saveScore } from "@/lib/scores";

function generatePattern(): number[] {
  const count = 4 + Math.floor(Math.random() * 4);
  const intervals: number[] = [0];
  for (let i = 1; i < count; i++) {
    intervals.push(intervals[i - 1] + 200 + Math.random() * 600);
  }
  return intervals;
}

const RhythmTap = () => {
  const [phase, setPhase] = useState<"idle" | "demo" | "input" | "done">("idle");
  const [pattern, setPattern] = useState<number[]>([]);
  const [taps, setTaps] = useState<number[]>([]);
  const [pulse, setPulse] = useState(false);
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const startTimeRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const playPattern = useCallback((p: number[]) => {
    setPhase("demo");
    clearTimeouts();
    p.forEach((t) => {
      const id = setTimeout(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 150);
      }, t);
      timeoutsRef.current.push(id);
    });
    const id = setTimeout(() => {
      setPhase("input");
      setTaps([]);
      startTimeRef.current = Date.now();
    }, p[p.length - 1] + 600);
    timeoutsRef.current.push(id);
  }, []);

  const startRound = useCallback(() => {
    const p = generatePattern();
    setPattern(p);
    playPattern(p);
  }, [playPattern]);

  const init = useCallback(() => {
    setRound(0);
    setScores([]);
    setFinalScore(0);
    setPhase("idle");
    setTaps([]);
    setTimeout(() => startRound(), 500);
  }, [startRound]);

  useEffect(() => {
    init();
    return clearTimeouts;
  }, [init]);

  const calcRoundScore = useCallback((p: number[], t: number[]) => {
    if (t.length === 0) return 0;
    const len = Math.min(p.length, t.length);
    let totalDiff = 0;
    for (let i = 0; i < len; i++) {
      totalDiff += Math.abs(p[i] - t[i]);
    }
    const avgDiff = totalDiff / len;
    // Perfect = 0ms diff, scale to percentage
    const score = Math.max(0, Math.round(100 - avgDiff / 5));
    return score;
  }, []);

  const handleTap = useCallback(() => {
    if (phase !== "input") return;
    const now = Date.now() - startTimeRef.current;
    const nextTaps = [...taps, now];
    setTaps(nextTaps);

    setPulse(true);
    setTimeout(() => setPulse(false), 150);

    if (nextTaps.length >= pattern.length) {
      const roundScore = calcRoundScore(pattern, nextTaps);
      const newScores = [...scores, roundScore];
      setScores(newScores);
      const newRound = round + 1;
      setRound(newRound);

      if (newRound >= 5) {
        const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
        setFinalScore(avg);
        setPhase("done");
        saveScore("rhythm-tap", avg, "%");
      } else {
        setTimeout(() => startRound(), 1000);
      }
    }
  }, [phase, taps, pattern, scores, round, calcRoundScore, startRound]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleTap]);

  if (phase === "done") {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <ActivityComplete score={finalScore} label="%" onRetry={init} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 animate-fade-in">
        <h1 className="font-mono text-xl font-bold mb-2">rhythm tap</h1>
        <p className="font-body text-sm text-muted-foreground mb-12">
          {phase === "demo" ? "Watch the rhythm..." : phase === "input" ? "Your turn. Tap spacebar." : "Get ready..."}
        </p>

        <button
          onClick={handleTap}
          className={`w-32 h-32 rounded-full border-2 transition-all duration-150 ${
            pulse
              ? "bg-primary border-primary glow-primary scale-110"
              : "bg-secondary border-border"
          }`}
        />

        <p className="font-mono text-xs text-muted-foreground mt-8">
          round {round + 1} / 5
        </p>
        {phase === "input" && (
          <p className="font-mono text-xs text-muted-foreground mt-2">
            taps: {taps.length} / {pattern.length}
          </p>
        )}
      </div>
    </Layout>
  );
};

export default RhythmTap;
