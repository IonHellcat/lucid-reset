import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import ActivityComplete from "@/components/ActivityComplete";
import { saveScore } from "@/lib/scores";
import { playClick } from "@/lib/audio";

function generatePattern(): number[] {
  const count = 4 + Math.floor(Math.random() * 4);
  const intervals: number[] = [0];
  for (let i = 1; i < count; i++) {
    intervals.push(intervals[i - 1] + 200 + Math.random() * 600);
  }
  return intervals;
}

const RhythmTap = () => {
  const [phase, setPhase] = useState<"idle" | "demo" | "input" | "roundScore" | "done">("idle");
  const [pattern, setPattern] = useState<number[]>([]);
  const [taps, setTaps] = useState<number[]>([]);
  const [pulse, setPulse] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [roundScoreDisplay, setRoundScoreDisplay] = useState(0);
  const [tapFeedback, setTapFeedback] = useState<"green" | "yellow" | "red" | null>(null);
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
        setRipple(true);
        playClick();
        setTimeout(() => setPulse(false), 150);
        setTimeout(() => setRipple(false), 500);
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
    setTapFeedback(null);
    playPattern(p);
  }, [playPattern]);

  const init = useCallback(() => {
    setRound(0);
    setScores([]);
    setFinalScore(0);
    setPhase("idle");
    setTaps([]);
    setTapFeedback(null);
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
    return Math.max(0, Math.round(100 - avgDiff / 5));
  }, []);

  const handleTap = useCallback(() => {
    if (phase !== "input") return;
    const now = Date.now() - startTimeRef.current;
    const nextTaps = [...taps, now];
    setTaps(nextTaps);

    // Accuracy feedback per tap
    const tapIndex = nextTaps.length - 1;
    if (tapIndex < pattern.length) {
      const diff = Math.abs(pattern[tapIndex] - nextTaps[tapIndex]);
      if (diff < 50) setTapFeedback("green");
      else if (diff < 100) setTapFeedback("yellow");
      else setTapFeedback("red");
      setTimeout(() => setTapFeedback(null), 300);
    }

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
        // Show round score briefly
        setRoundScoreDisplay(roundScore);
        setPhase("roundScore");
        setTimeout(() => {
          setPhase("idle");
          startRound();
        }, 1200);
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
          <ActivityComplete score={finalScore} label="%" activity="rhythm-tap" onRetry={init} />
        </div>
      </Layout>
    );
  }

  const feedbackRing = tapFeedback === "green"
    ? "ring-2 ring-green-400"
    : tapFeedback === "yellow"
    ? "ring-2 ring-yellow-400"
    : tapFeedback === "red"
    ? "ring-2 ring-red-400"
    : "";

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 animate-fade-in">
        <h1 className="font-display text-xl font-bold mb-2">rhythm tap</h1>
        <p className="font-body text-sm text-muted-foreground mb-12">
          {phase === "demo" ? "Watch the rhythm..." : phase === "input" ? "Your turn — tap!" : phase === "roundScore" ? `Round ${round}: ${roundScoreDisplay}%` : "Get ready..."}
        </p>

        <div className="relative flex items-center justify-center mb-6">
          {/* Ripple */}
          {ripple && (
            <div className="absolute w-32 h-32 rounded-full border-2 border-primary animate-ping opacity-30" />
          )}
          <div
            className={`w-32 h-32 rounded-full border-2 transition-all duration-150 ${feedbackRing} ${
              pulse
                ? "bg-primary border-primary glow-primary scale-110"
                : "bg-secondary border-border"
            }`}
          />
        </div>

        {/* Mobile tap button */}
        <button
          onClick={handleTap}
          className="font-display text-sm px-8 py-4 rounded-full border-2 border-border bg-secondary transition-all duration-200 hover:border-primary active:scale-95 sm:hidden mb-4"
        >
          TAP
        </button>

        <p className="font-display text-xs text-muted-foreground hidden sm:block mb-4"><span className="font-mono">spacebar</span> to tap</p>

        <p className="font-mono text-xs text-muted-foreground mt-4">
          round {Math.min(round + 1, 5)} / 5
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
