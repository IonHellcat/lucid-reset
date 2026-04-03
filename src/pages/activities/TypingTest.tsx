import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import ActivityComplete from "@/components/ActivityComplete";
import { saveScore } from "@/lib/scores";

const WORD_POOL = [
  "focus", "brain", "reset", "clear", "sharp", "think", "flow", "calm", "drift", "spark",
  "pulse", "wave", "still", "deep", "glow", "swift", "quiet", "bold", "trace", "rhythm",
  "code", "build", "ship", "type", "fast", "slow", "mind", "rest", "task", "plan",
  "move", "shift", "start", "end", "loop", "break", "push", "pull", "test", "run",
  "data", "grid", "node", "path", "edge", "sort", "hash", "tree", "link", "stack",
  "view", "page", "form", "text", "font", "line", "dark", "light", "color", "space",
  "time", "work", "play", "goal", "step", "next", "back", "home", "core", "base",
  "signal", "stream", "render", "launch", "deploy", "commit", "branch", "merge", "debug", "parse",
  "clarity", "energy", "moment", "breath", "mental", "visual", "smooth", "gentle", "subtle", "refine",
  "output", "input", "pixel", "frame", "layer", "state", "scope", "value", "index", "query",
];

const DURATION = 60;

function pickWords(count: number): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
  }
  return words;
}

const TypingTest = () => {
  const [words, setWords] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<"waiting" | "active" | "done">("waiting");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [correctWords, setCorrectWords] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [wordResults, setWordResults] = useState<("correct" | "wrong" | "pending")[]>([]);
  const [wpm, setWpm] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const init = useCallback(() => {
    const w = pickWords(80);
    setWords(w);
    setWordResults(w.map(() => "pending"));
    setTyped("");
    setWordIndex(0);
    setCharIndex(0);
    setPhase("waiting");
    setTimeLeft(DURATION);
    setCorrectWords(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setWpm(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    init();
    return () => clearInterval(timerRef.current);
  }, [init]);

  // Timer
  useEffect(() => {
    if (phase !== "active") return;
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const remaining = Math.max(0, DURATION - elapsed);
      setTimeLeft(Math.ceil(remaining));

      // Calculate live WPM
      const minutes = elapsed / 60;
      if (minutes > 0) {
        setWpm(Math.round(correctWords / minutes));
      }

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        const finalMinutes = DURATION / 60;
        const finalWpm = Math.round(correctWords / finalMinutes);
        setWpm(finalWpm);
        setPhase("done");
        saveScore("typing-test", finalWpm, " wpm");
      }
    }, 200);
    return () => clearInterval(timerRef.current);
  }, [phase, correctWords]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (phase === "done") return;

    // Start on first keypress
    if (phase === "waiting" && e.key.length === 1) {
      setPhase("active");
      startRef.current = Date.now();
    }

    if (e.key === " ") {
      e.preventDefault();
      if (typed.length === 0) return;

      // Check word
      const currentWord = words[wordIndex];
      const isCorrect = typed === currentWord;
      const newResults = [...wordResults];
      newResults[wordIndex] = isCorrect ? "correct" : "wrong";
      setWordResults(newResults);

      if (isCorrect) {
        setCorrectWords((prev) => prev + 1);
      }

      setWordIndex((prev) => prev + 1);
      setTyped("");
      setCharIndex(0);

      // Add more words if needed
      if (wordIndex >= words.length - 20) {
        setWords((prev) => [...prev, ...pickWords(40)]);
        setWordResults((prev) => [...prev, ...pickWords(40).map(() => "pending" as const)]);
      }
      return;
    }

    if (e.key === "Backspace") {
      if (typed.length > 0) {
        setTyped((prev) => prev.slice(0, -1));
        setCharIndex((prev) => Math.max(0, prev - 1));
      }
      return;
    }

    // Regular character
    if (e.key.length === 1) {
      setTotalKeystrokes((prev) => prev + 1);
      const currentWord = words[wordIndex];
      if (charIndex < currentWord.length && e.key === currentWord[charIndex]) {
        setCorrectKeystrokes((prev) => prev + 1);
      }
      setTyped((prev) => prev + e.key);
      setCharIndex((prev) => prev + 1);
    }
  };

  // Scroll active word into view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeWord = container.querySelector("[data-active='true']");
    if (activeWord) {
      const containerRect = container.getBoundingClientRect();
      const wordRect = activeWord.getBoundingClientRect();
      if (wordRect.top > containerRect.top + containerRect.height * 0.6) {
        container.scrollTop += wordRect.top - containerRect.top - 40;
      }
    }
  }, [wordIndex]);

  const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

  if (phase === "done") {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <ActivityComplete
            score={wpm}
            label=" wpm"
            activity="typing-test"
            onRetry={init}
            message={`${accuracy}% accuracy`}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 animate-fade-in">
        <h1 className="font-mono text-xl font-bold mb-2">typing test</h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          {phase === "waiting" ? "Start typing to begin..." : `${timeLeft}s remaining`}
        </p>

        <div className="flex items-center gap-6 mb-6">
          {phase === "active" && (
            <>
              <span className="font-mono text-2xl font-bold text-accent">{wpm}</span>
              <span className="font-mono text-xs text-muted-foreground">wpm</span>
              <span className="font-mono text-sm text-muted-foreground">{accuracy}%</span>
            </>
          )}
        </div>

        {/* Word display */}
        <div
          ref={containerRef}
          className="max-w-2xl w-full h-[120px] overflow-hidden relative mb-6 cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex flex-wrap gap-x-2 gap-y-1 leading-relaxed">
            {words.slice(0, wordIndex + 40).map((word, wi) => {
              const isActive = wi === wordIndex;
              const result = wordResults[wi];

              return (
                <span
                  key={wi}
                  data-active={isActive}
                  className={`font-mono text-lg transition-colors duration-150 ${
                    isActive
                      ? "border-b-2 border-primary"
                      : result === "correct"
                      ? "text-primary/60"
                      : result === "wrong"
                      ? "text-destructive/60 line-through"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {isActive
                    ? word.split("").map((char, ci) => {
                        let color = "text-muted-foreground/50";
                        if (ci < typed.length) {
                          color = typed[ci] === char ? "text-foreground" : "text-destructive";
                        }
                        return (
                          <span key={ci} className={`${color} transition-colors duration-100`}>
                            {char}
                          </span>
                        );
                      })
                    : word}
                  {/* Show extra typed chars */}
                  {isActive && typed.length > word.length && (
                    <span className="text-destructive/70">
                      {typed.slice(word.length)}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Hidden input */}
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          className="opacity-0 absolute w-0 h-0"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        <div className="flex items-center gap-2">
          <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-200"
              style={{ width: `${((DURATION - timeLeft) / DURATION) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground">{timeLeft}s</span>
        </div>

        {phase === "waiting" && (
          <p className="font-mono text-xs text-muted-foreground/40 mt-6">
            click here and start typing
          </p>
        )}
      </div>
    </Layout>
  );
};

export default TypingTest;
