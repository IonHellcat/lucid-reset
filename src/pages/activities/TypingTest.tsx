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

const DURATION_OPTIONS = [15, 30, 60, 120];

function pickWords(count: number): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
  }
  return words;
}

const TypingTest = () => {
  const [duration, setDuration] = useState(30);
  const [words, setWords] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<"waiting" | "active" | "done">("waiting");
  const [timeLeft, setTimeLeft] = useState(30);
  const [correctWords, setCorrectWords] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [wordResults, setWordResults] = useState<("correct" | "wrong" | "pending")[]>([]);
  const [wpm, setWpm] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
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
    setTimeLeft(duration);
    setCorrectWords(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setWpm(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [duration]);

  useEffect(() => {
    init();
    return () => clearInterval(timerRef.current);
  }, [init]);

  useEffect(() => {
    if (phase !== "active") return;
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(Math.ceil(remaining));

      const minutes = elapsed / 60;
      if (minutes > 0) {
        setWpm(Math.round(correctWords / minutes));
      }

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        const finalMinutes = duration / 60;
        const finalWpm = Math.round(correctWords / finalMinutes);
        setWpm(finalWpm);
        setPhase("done");
        saveScore("typing-test", finalWpm, " wpm");
      }
    }, 200);
    return () => clearInterval(timerRef.current);
  }, [phase, correctWords, duration]);

  const handleDurationChange = (d: number) => {
    if (phase !== "waiting") return;
    setDuration(d);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (phase === "done") return;

    if (phase === "waiting" && e.key.length === 1) {
      setPhase("active");
      startRef.current = Date.now();
    }

    if (e.key === " ") {
      e.preventDefault();
      if (typed.length === 0) return;

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
            message={`${accuracy}% accuracy · ${duration}s test`}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-16 animate-fade-in"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Live stats bar */}
        <div className="flex items-center gap-4 mb-8 h-8">
          {phase === "active" ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-bold text-accent transition-all duration-300">{wpm}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">wpm</span>
              </div>
              <div className="w-px h-4 bg-muted-foreground/20" />
              <span className="font-mono text-sm text-muted-foreground/60">{accuracy}%</span>
              <div className="w-px h-4 bg-muted-foreground/20" />
              <span className="font-mono text-sm text-primary">{timeLeft}s</span>
            </>
          ) : (
            /* Duration selector — only visible before starting */
            <div className="flex items-center gap-1">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={(e) => { e.stopPropagation(); handleDurationChange(d); }}
                  className={`font-mono text-sm px-3 py-1 rounded-md transition-all duration-200 cursor-pointer ${
                    d === duration
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground/40 hover:text-muted-foreground/70"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Word display */}
        <div
          ref={containerRef}
          className={`max-w-2xl w-full h-[7.5rem] overflow-hidden relative mb-8 cursor-text transition-all duration-300 ${
            !isFocused ? "blur-[3px] opacity-50" : ""
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex flex-wrap gap-x-2.5 gap-y-2 leading-relaxed select-none">
            {words.slice(0, wordIndex + 40).map((word, wi) => {
              const isActive = wi === wordIndex;
              const result = wordResults[wi];

              return (
                <span
                  key={wi}
                  data-active={isActive}
                  className={`font-mono text-[1.35rem] transition-colors duration-200 relative ${
                    result === "correct"
                      ? "text-primary/50"
                      : result === "wrong"
                      ? "text-destructive/50 line-through decoration-destructive/30"
                      : isActive
                      ? ""
                      : "text-muted-foreground/30"
                  }`}
                >
                  {isActive
                    ? word.split("").map((char, ci) => {
                        const isBeforeCursor = ci < typed.length;
                        const isAtCursor = ci === typed.length;
                        let charColor = "text-muted-foreground/30";
                        if (isBeforeCursor) {
                          charColor = typed[ci] === char ? "text-foreground" : "text-destructive";
                        }
                        return (
                          <span key={ci} className="relative">
                            {isAtCursor && (
                              <span className="absolute left-0 top-[2px] bottom-[2px] w-[2px] bg-primary animate-caret" />
                            )}
                            <span className={`${charColor} transition-colors duration-75`}>
                              {char}
                            </span>
                          </span>
                        );
                      })
                    : word}
                  {/* Blinking caret at end of word if typed matches length */}
                  {isActive && typed.length >= word.length && (
                    <span className="relative">
                      <span className="absolute left-0 top-[2px] bottom-[2px] w-[2px] bg-primary animate-caret" />
                    </span>
                  )}
                  {/* Extra typed chars beyond word length */}
                  {isActive && typed.length > word.length && (
                    <span className="text-destructive/60">
                      {typed.slice(word.length)}
                    </span>
                  )}
                  {/* Caret at very start when nothing typed */}
                  {isActive && typed.length === 0 && (
                    <span className="absolute left-0 top-[2px] bottom-[2px] w-[2px] bg-primary animate-caret" />
                  )}
                </span>
              );
            })}
          </div>

          {/* Click-to-focus overlay when blurred */}
          {!isFocused && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-sm text-muted-foreground/70 bg-background/80 px-4 py-2 rounded-lg">
                click to focus
              </span>
            </div>
          )}
        </div>

        {/* Hidden input */}
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="opacity-0 absolute w-0 h-0"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="w-52 h-[3px] bg-secondary/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/60 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((duration - timeLeft) / duration) * 100}%` }}
            />
          </div>
        </div>

        {phase === "waiting" && (
          <p className="font-mono text-xs text-muted-foreground/30 mt-8 animate-pulse">
            start typing to begin
          </p>
        )}
      </div>
    </Layout>
  );
};

export default TypingTest;
