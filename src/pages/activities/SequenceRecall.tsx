import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import ActivityComplete from "@/components/ActivityComplete";
import { saveScore } from "@/lib/scores";
import { playTone, tileFrequency } from "@/lib/audio";

const GRID = 4;
const TILES = GRID * GRID;
const FLASH_MS = 600;
const GAP_MS = 300;

const SequenceRecall = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSeq, setUserSeq] = useState<number[]>([]);
  const [phase, setPhase] = useState<"countdown" | "watch" | "input" | "wrong" | "done">("countdown");
  const [lit, setLit] = useState<number | null>(null);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [correctTile, setCorrectTile] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [countdownNum, setCountdownNum] = useState(3);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const startRound = useCallback((prevSeq: number[]) => {
    const next = [...prevSeq, Math.floor(Math.random() * TILES)];
    setSequence(next);
    setUserSeq([]);
    setPhase("watch");
    setWrongTile(null);
    setCorrectTile(null);

    next.forEach((tile, i) => {
      timeoutRef.current = setTimeout(() => {
        setLit(tile);
        playTone(tileFrequency(tile, TILES));
      }, i * (FLASH_MS + GAP_MS));
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
    setPhase("countdown");
    setCountdownNum(3);
    setWrongTile(null);
    setCorrectTile(null);

    // Countdown 3, 2, 1 using chained timeouts
    setTimeout(() => setCountdownNum(2), 800);
    setTimeout(() => setCountdownNum(1), 1600);
    setTimeout(() => {
      const initial: number[] = [];
      for (let i = 0; i < 3; i++) initial.push(Math.floor(Math.random() * TILES));
      startRound(initial);
    }, 2400);
  }, [startRound]);

  useEffect(() => {
    init();
    return () => clearTimeout(timeoutRef.current);
  }, [init]);

  const handleTile = (index: number) => {
    if (phase !== "input") return;
    const nextUserSeq = [...userSeq, index];
    setUserSeq(nextUserSeq);

    setLit(index);
    playTone(tileFrequency(index, TILES));
    setTimeout(() => setLit(null), 150);

    const pos = nextUserSeq.length - 1;
    if (nextUserSeq[pos] !== sequence[pos]) {
      const finalScore = sequence.length - 1;
      setWrongTile(index);
      setPhase("wrong");

      // Flash wrong red, then show correct in teal
      setTimeout(() => {
        setWrongTile(null);
        setCorrectTile(sequence[pos]);
        setTimeout(() => {
          setCorrectTile(null);
          setScore(finalScore);
          setPhase("done");
          saveScore("sequence-recall", finalScore, " tiles");
        }, 800);
      }, 600);
      return;
    }

    if (nextUserSeq.length === sequence.length) {
      const newRound = round + 1;
      setRound(newRound);
      if (newRound >= 12) {
        setScore(sequence.length);
        setPhase("done");
        saveScore("sequence-recall", sequence.length, " tiles");
        return;
      }
      setTimeout(() => startRound(sequence), 800);
    }
  };

  if (phase === "done") {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <ActivityComplete
            score={score}
            label=" tiles"
            activity="sequence-recall"
            onRetry={init}
            message={`You recalled ${score} tiles in sequence`}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 animate-fade-in">
        <h1 className="font-mono text-xl font-bold mb-2">sequence recall</h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          {phase === "countdown"
            ? ""
            : phase === "watch"
            ? "Watch the sequence..."
            : phase === "wrong"
            ? "Oops..."
            : "Your turn. Repeat it."}
        </p>

        {phase === "countdown" ? (
          <div className="flex items-center justify-center" style={{ width: 280, height: 280 }}>
            <span className="font-mono text-6xl font-bold text-primary animate-fade-in" key={countdownNum}>
              {countdownNum}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 max-w-[280px]">
            {Array.from({ length: TILES }).map((_, i) => {
              const isLit = lit === i;
              const isWrong = wrongTile === i;
              const isCorrect = correctTile === i;
              return (
                <button
                  key={i}
                  onClick={() => handleTile(i)}
                  disabled={phase === "watch" || phase === "wrong"}
                  className={`w-16 h-16 rounded-md border transition-all duration-200 ${
                    isWrong
                      ? "bg-destructive border-destructive"
                      : isCorrect
                      ? "bg-primary border-primary glow-primary"
                      : isLit
                      ? "border-primary"
                      : "bg-secondary border-border hover:border-muted-foreground"
                  } ${phase === "watch" || phase === "wrong" ? "cursor-default" : "cursor-pointer"}`}
                  style={
                    isLit && !isWrong
                      ? {
                          background: "radial-gradient(circle, hsl(174 58% 55%) 0%, hsl(174 58% 35%) 100%)",
                          boxShadow: "0 0 20px hsl(174 58% 55% / 0.4)",
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}

        {phase !== "countdown" && (
          <p className="font-mono text-xs text-muted-foreground mt-6">
            sequence length: {sequence.length}
          </p>
        )}
      </div>
    </Layout>
  );
};

export default SequenceRecall;
