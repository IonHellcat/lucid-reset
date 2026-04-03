import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import ActivityComplete from "@/components/ActivityComplete";
import { saveScore } from "@/lib/scores";

const GRID = 4;
const TILES = GRID * GRID;
const FLASH_MS = 600;
const GAP_MS = 300;

const SequenceRecall = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSeq, setUserSeq] = useState<number[]>([]);
  const [phase, setPhase] = useState<"watch" | "input" | "done">("watch");
  const [lit, setLit] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const startRound = useCallback((prevSeq: number[]) => {
    const next = [...prevSeq, Math.floor(Math.random() * TILES)];
    setSequence(next);
    setUserSeq([]);
    setPhase("watch");

    // Play sequence
    next.forEach((tile, i) => {
      timeoutRef.current = setTimeout(() => setLit(tile), i * (FLASH_MS + GAP_MS));
      timeoutRef.current = setTimeout(() => setLit(null), i * (FLASH_MS + GAP_MS) + FLASH_MS);
    });
    timeoutRef.current = setTimeout(() => {
      setLit(null);
      setPhase("input");
    }, next.length * (FLASH_MS + GAP_MS));
  }, []);

  const init = useCallback(() => {
    setSequence([]);
    setUserSeq([]);
    setRound(0);
    setScore(0);
    setPhase("watch");
    // Start with 3 tiles
    const initial: number[] = [];
    for (let i = 0; i < 3; i++) initial.push(Math.floor(Math.random() * TILES));
    setTimeout(() => startRound(initial.slice(0, 2)), 500);
  }, [startRound]);

  useEffect(() => {
    init();
    return () => clearTimeout(timeoutRef.current);
  }, [init]);

  const handleTile = (index: number) => {
    if (phase !== "input") return;
    const nextUserSeq = [...userSeq, index];
    setUserSeq(nextUserSeq);

    // Flash feedback
    setLit(index);
    setTimeout(() => setLit(null), 150);

    const pos = nextUserSeq.length - 1;
    if (nextUserSeq[pos] !== sequence[pos]) {
      // Wrong
      const finalScore = sequence.length - 1;
      setScore(finalScore);
      setPhase("done");
      saveScore("sequence-recall", finalScore, "");
      return;
    }

    if (nextUserSeq.length === sequence.length) {
      // Correct, next round
      const newRound = round + 1;
      setRound(newRound);
      if (newRound >= 12) {
        setScore(sequence.length);
        setPhase("done");
        saveScore("sequence-recall", sequence.length, "");
        return;
      }
      setTimeout(() => startRound(sequence), 800);
    }
  };

  if (phase === "done") {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <ActivityComplete score={score} label=" tiles" onRetry={init} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 animate-fade-in">
        <h1 className="font-mono text-xl font-bold mb-2">sequence recall</h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          {phase === "watch" ? "Watch the sequence..." : "Your turn. Repeat it."}
        </p>
        <div className="grid grid-cols-4 gap-2 max-w-[280px]">
          {Array.from({ length: TILES }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleTile(i)}
              disabled={phase === "watch"}
              className={`w-16 h-16 rounded-md border transition-all duration-200 ${
                lit === i
                  ? "bg-primary border-primary glow-primary"
                  : "bg-secondary border-border hover:border-muted-foreground"
              } ${phase === "watch" ? "cursor-default" : "cursor-pointer"}`}
            />
          ))}
        </div>
        <p className="font-mono text-xs text-muted-foreground mt-6">
          sequence length: {sequence.length}
        </p>
      </div>
    </Layout>
  );
};

export default SequenceRecall;
