import { Link } from "react-router-dom";

interface ActivityCompleteProps {
  score: number | null;
  label?: string;
  message?: string;
  onRetry: () => void;
}

const ActivityComplete = ({ score, label, message, onRetry }: ActivityCompleteProps) => {
  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in">
      {score !== null ? (
        <div className="text-center">
          <p className="font-mono text-6xl font-bold text-accent">{score}{label}</p>
          <p className="text-muted-foreground font-body mt-3">
            {message || "Ready to get back to it?"}
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="font-mono text-3xl font-bold text-primary">Reset complete.</p>
          <p className="text-muted-foreground font-body mt-3">Go crush it.</p>
        </div>
      )}
      <div className="flex gap-4">
        <button
          onClick={onRetry}
          className="font-mono text-sm px-6 py-3 rounded-md border border-border bg-secondary transition-all duration-300 hover:border-primary hover:glow-primary"
        >
          go again
        </button>
        <Link
          to="/"
          className="font-mono text-sm px-6 py-3 rounded-md bg-primary text-primary-foreground transition-all duration-300 hover:opacity-90"
        >
          back to menu
        </Link>
      </div>
    </div>
  );
};

export default ActivityComplete;
