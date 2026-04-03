import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getBestScore } from "@/lib/scores";
import { toast } from "sonner";

const messages = [
  "Ready to get back to it?",
  "Brain fog: cleared.",
  "2 minutes well spent.",
  "Go crush the next hour.",
  "Your prefrontal cortex thanks you.",
];

interface ActivityCompleteProps {
  score: number | null;
  label?: string;
  message?: string;
  activity?: string;
  onRetry: () => void;
}

const ActivityComplete = ({ score, label, message, activity, onRetry }: ActivityCompleteProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [landed, setLanded] = useState(false);
  const [randomMsg] = useState(() => message || messages[Math.floor(Math.random() * messages.length)]);
  const animRef = useRef<number>(0);

  const best = activity ? getBestScore(activity) : undefined;
  const isNewBest = best && score !== null && score > (best.score ?? 0);
  const previousBest = best && !isNewBest ? best.score : undefined;

  useEffect(() => {
    if (score === null) { setLanded(true); return; }
    const start = performance.now();
    const duration = 1000;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * score));
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setLanded(true);
      }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [score]);

  const handleShare = () => {
    const actName = activity || "activity";
    const text = `🧠 defog.app — ${actName}: ${score}${label || ""} | I defog'd my brain in 2 minutes. Try it.`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in">
      {score !== null ? (
        <div className="text-center">
          <p className={`font-mono text-6xl font-bold text-accent transition-transform duration-300 ${landed ? "scale-100" : "scale-110"}`}>
            {displayScore}{label}
          </p>
          {isNewBest && (
            <p className="font-display text-sm text-primary mt-2 glow-primary" style={{ textShadow: "0 0 10px hsl(168 60% 50% / 0.5)" }}>
              New personal best!
            </p>
          )}
          {previousBest !== undefined && (
            <p className="font-body text-xs text-muted-foreground mt-2">
              Previous best: {previousBest}{label}
            </p>
          )}
          <p className="text-muted-foreground font-body mt-3">{randomMsg}</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="font-display text-3xl font-bold text-primary">Reset complete.</p>
          <p className="text-muted-foreground font-body mt-3">Go crush it.</p>
        </div>
      )}
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={onRetry}
          className="font-display text-sm px-6 py-3 rounded-md border border-border bg-secondary transition-all duration-300 hover:border-primary hover:glow-primary"
        >
          go again
        </button>
        <Link
          to="/"
          className="font-display text-sm px-6 py-3 rounded-md bg-primary text-primary-foreground transition-all duration-300 hover:opacity-90"
        >
          back to menu
        </Link>
        {score !== null && (
          <button
            onClick={handleShare}
            className="font-display text-sm px-6 py-3 rounded-md border border-border bg-secondary transition-all duration-300 hover:border-primary hover:glow-primary"
          >
            share
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivityComplete;
