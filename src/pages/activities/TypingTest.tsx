import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import ActivityComplete from "@/components/ActivityComplete";
import { saveScore } from "@/lib/scores";

const WORD_POOL = [
  "focus","brain","reset","clear","sharp","think","flow","calm","drift","spark",
  "pulse","wave","still","deep","glow","swift","quiet","bold","trace","rhythm",
  "code","build","ship","type","fast","slow","mind","rest","task","plan",
  "move","shift","start","loop","break","push","pull","test","data","grid",
  "node","path","edge","sort","hash","tree","link","stack","view","page",
  "form","text","font","line","dark","light","color","space","time","work",
  "play","goal","step","next","back","home","core","base","signal","stream",
  "render","launch","deploy","commit","branch","merge","debug","parse",
  "clarity","energy","moment","breath","mental","visual","smooth","gentle","subtle","refine",
  "output","input","pixel","frame","layer","state","scope","value","index","query",
  "about","after","again","water","where","which","world","would","write","young",
  "above","among","began","being","below","bring","carry","cause","clean","close",
  "could","cover","earth","eight","every","field","fight","final","first","force",
  "found","front","given","going","green","group","grown","heart","heavy","horse",
  "hotel","house","human","image","issue","known","large","later","learn","leave",
  "level","local","money","month","moral","movie","music","night","north","noted",
  "novel","offer","often","order","other","paper","party","peace","phone","piece",
  "place","plant","point","power","press","price","prime","quite","radio","raise",
  "range","rapid","reach","ready","right","river","round","royal","scene","sense",
  "serve","seven","shall","shape","share","short","shown","sight","since","sixty",
  "sleep","small","smile","sound","south","spoke","staff","stage","stand","steam",
  "steel","stock","stone","store","story","study","style","sugar","super","sweet",
  "table","taken","teeth","thank","their","theme","these","thing","third","those",
  "three","today","total","touch","tower","track","trade","train","treat","tried",
  "truck","truly","trust","truth","twice","under","union","unite","until","upper",
  "usage","using","usual","valid","video","visit","vital","voice","watch","wheel",
  "while","white","whole","wider","woman","worth","wrong","wrote","admit","adopt",
  "agent","agree","ahead","alarm","album","alert","alien","align","alive","allow",
  "alone","along","alter","angel","anger","angle","aside","audit","avoid","award",
  "aware","basis","beach","bench","birth","blade","blame","blank","blast","blaze",
  "bleed","blend","blind","block","blood","blown","board","bound","brave","bread",
  "breed","brick","brief","broad","broke","brown","brush","burst","buyer","cabin",
  "cable","cargo","catch","chain","chair","chalk","chaos","charm","chase","cheap",
  "check","chess","chief","child","china","chunk","civic","civil","claim","clash",
  "class","cliff","climb","clock","cloth","cloud","coach","coast","count","court",
  "crack","craft","crash","crazy","cream","crime","cross","crowd","cruel","crush",
  "curve","cycle","dance","dealt","death","decay","delay","delta","dense","depot",
  "depth","derby","devil","diary","dirty","doubt","draft","drain","drama","drawn",
  "dream","dress","dried","drill","drink","drive","dying","eager","early","elite",
  "empty","enemy","enjoy","entry","equal","error","essay","event","exact","exist",
  "extra","faced","faith","false","fatal","fault","feast","fence","fewer","fiber",
  "fifty","flame","flash","fleet","flesh","float","flood","flour","fluid","flush",
  "foggy","forge","forms","forth","forum","frame","fraud","fresh","frost","fruit",
  "fully","funds","gamma","gauge","giant","glare","gleam","globe","glory","glove",
  "grace","grade","grain","grand","grant","graph","grasp","grass","grave","great",
  "greed","grief","guard","guess","guide","guild","guilt","habit","haste","haven",
  "hence","hobby","honey","honor","hover","hurry","ideal","inner","ivory","jewel",
  "joint","juice","knife","knock","label","lance","laser","laugh","legal","lemon",
  "linen","liver","logic","loose","lover","loyal","lucky","lunar","lunch","lyric",
  "magic","major","maker","manor","march","marsh","match","mayor","medal","mercy",
  "merit","metal","meter","might","minor","mixed","model","moral","motif","motor",
  "mount","mourn","mouse","moved","mouth","mural","nerve","never","newly","noble",
  "noise","nurse","nylon","occur","ocean","olive","onset","opera","orbit","organ",
  "outer","owner","oxide","ozone","paint","panel","panic","patch","pause","pearl",
  "penny","phase","pilot","pitch","pizza","plain","plane","plate","plaza","plead",
  "plumb","plume","polar","pound","print","prior","prize","probe","proof","proud",
  "prove","psalm","purse","queen","quest","queue","quick","quiet","quote","radar",
  "ranch","ratio","realm","rebel","refer","reign","relax","reply","rider","ridge",
  "rifle","rigid","risky","rival","robot","rocky","roman","rough","route","rugby",
  "ruler","rural","salad","sauce","scale","shaft","shame","sheer","shelf","shell",
  "shine","shirt","shock","shore","shout","siege","sixth","skill","skull","slash",
  "slave","slice","slide","slope","smart","smell","smoke","snake","solar","solid",
  "solve","spare","spawn","speak","speed","spend","spice","spine","split","spray",
  "squad","stamp","stare","stark","steal","steep","steer","stern","stick","stiff",
  "stood","stove","strip","stuff","suite","surge","swamp","swear","sweep","swept",
  "swing","sword","swore","sworn","taste","teach","tempo","theft","thick","thorn",
  "threw","throw","thumb","tiger","tight","timer","tired","title","token","topic",
  "tough","toxic","trail","trait","trash","trend","trial","tribe","trick","troop",
  "trunk","tumor","tuner","ultra","uncle","unity","upset","urban","utter","valve",
  "vapor","vault","verse","vigor","vinyl","viral","vivid","vocal","voter","wagon",
  "waste","weave","weigh","weird","wheat","whose","witch","worry","worse","worst",
  "wound","wreck","wrist","yacht","yield","youth","zebra","zones",
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
  const [incorrectKeystrokes, setIncorrectKeystrokes] = useState(0);
  const [extraChars, setExtraChars] = useState(0);
  const [missedChars, setMissedChars] = useState(0);
  const [wordResults, setWordResults] = useState<("correct" | "wrong" | "pending")[]>([]);
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const [caretPos, setCaretPos] = useState({ left: 0, top: 0 });

  const init = useCallback(() => {
    const w = pickWords(120);
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
    setIncorrectKeystrokes(0);
    setExtraChars(0);
    setMissedChars(0);
    setWpm(0);
    setRawWpm(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [duration]);

  useEffect(() => {
    init();
    return () => clearInterval(timerRef.current);
  }, [init]);

  // Tab to restart — global handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        init();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
        setRawWpm(Math.round((totalKeystrokes / 5) / minutes));
      }

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        const finalMinutes = duration / 60;
        const finalWpm = Math.round(correctWords / finalMinutes);
        const finalRaw = Math.round((totalKeystrokes / 5) / finalMinutes);
        setWpm(finalWpm);
        setRawWpm(finalRaw);
        setPhase("done");
        saveScore("typing-test", finalWpm, " wpm");
      }
    }, 200);
    return () => clearInterval(timerRef.current);
  }, [phase, correctWords, totalKeystrokes, duration]);

  const handleDurationChange = (d: number) => {
    if (phase !== "waiting") return;
    setDuration(d);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") return; // handled globally
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

      // Track missed chars (chars in word not typed)
      if (typed.length < currentWord.length) {
        setMissedChars((prev) => prev + (currentWord.length - typed.length));
      }
      // Track extra chars
      if (typed.length > currentWord.length) {
        setExtraChars((prev) => prev + (typed.length - currentWord.length));
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
      } else {
        setIncorrectKeystrokes((prev) => prev + 1);
      }
      setTyped((prev) => prev + e.key);
      setCharIndex((prev) => prev + 1);
    }
  };

  // Update caret position
  useEffect(() => {
    const container = containerRef.current;
    if (!container || (phase !== "waiting" && phase !== "active")) return;

    const activeWord = container.querySelector("[data-active='true']") as HTMLElement;
    if (!activeWord) return;

    const containerRect = container.getBoundingClientRect();
    const chars = activeWord.querySelectorAll("[data-char]");

    if (typed.length === 0) {
      // Caret at very start of word
      const wordRect = activeWord.getBoundingClientRect();
      setCaretPos({
        left: wordRect.left - containerRect.left,
        top: wordRect.top - containerRect.top,
      });
    } else if (typed.length <= words[wordIndex]?.length) {
      // Caret after typed chars
      const targetChar = chars[typed.length - 1] as HTMLElement;
      if (targetChar) {
        const charRect = targetChar.getBoundingClientRect();
        setCaretPos({
          left: charRect.right - containerRect.left,
          top: charRect.top - containerRect.top,
        });
      }
    } else {
      // Caret after extra chars
      const extraSpan = activeWord.querySelector("[data-extra]") as HTMLElement;
      if (extraSpan) {
        const extraRect = extraSpan.getBoundingClientRect();
        setCaretPos({
          left: extraRect.right - containerRect.left,
          top: extraRect.top - containerRect.top,
        });
      }
    }
  }, [typed, wordIndex, words, phase]);

  // Smooth scroll active word into view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeWord = container.querySelector("[data-active='true']") as HTMLElement;
    if (activeWord) {
      const containerRect = container.getBoundingClientRect();
      const wordRect = activeWord.getBoundingClientRect();
      if (wordRect.top > containerRect.top + containerRect.height * 0.5) {
        container.scrollTo({
          top: container.scrollTop + wordRect.top - containerRect.top - 20,
          behavior: "smooth",
        });
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
          {/* Stats breakdown */}
          <div className="grid grid-cols-4 gap-4 mt-8 animate-fade-in" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
            <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg bg-secondary/50">
              <span className="font-mono text-lg font-bold text-foreground">{rawWpm}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">raw wpm</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg bg-secondary/50">
              <span className="font-mono text-lg font-bold text-foreground">{accuracy}%</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">accuracy</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg bg-secondary/50">
              <span className="font-mono text-[13px] font-bold text-foreground">
                {correctKeystrokes}/{incorrectKeystrokes}/{extraChars}/{missedChars}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">characters</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg bg-secondary/50">
              <span className="font-mono text-lg font-bold text-foreground">{duration}s</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">time</span>
            </div>
          </div>
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
          className={`max-w-2xl w-full h-[5.5rem] overflow-hidden relative mb-8 cursor-text transition-all duration-300 ${
            !isFocused ? "blur-[3px] opacity-50" : ""
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Smooth caret */}
          {isFocused && phase !== "done" && (
            <div
              ref={caretRef}
              className="absolute w-[2px] bg-primary rounded-full z-10"
              style={{
                left: caretPos.left,
                top: caretPos.top + 2,
                height: "1.4em",
                transition: "left 0.08s cubic-bezier(0.16, 1, 0.3, 1), top 0.08s cubic-bezier(0.16, 1, 0.3, 1)",
                animation: "caret-blink 1s ease-in-out infinite",
              }}
            />
          )}

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
                        let charColor = "text-muted-foreground/30";
                        if (isBeforeCursor) {
                          charColor = typed[ci] === char ? "text-foreground" : "text-destructive";
                        }
                        return (
                          <span key={ci} data-char className={`${charColor} transition-colors duration-75`}>
                            {char}
                          </span>
                        );
                      })
                    : word}
                  {/* Extra typed chars beyond word length */}
                  {isActive && typed.length > word.length && (
                    <span className="text-destructive/60" data-extra>
                      {typed.slice(word.length)}
                    </span>
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
        <div className="flex flex-col items-center gap-2">
          <div className="w-52 h-[3px] bg-secondary/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/60 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((duration - timeLeft) / duration) * 100}%` }}
            />
          </div>
          <p className="font-mono text-[10px] text-muted-foreground/20">tab to restart</p>
        </div>

        {phase === "waiting" && (
          <p className="font-mono text-xs text-muted-foreground/30 mt-6 animate-pulse">
            start typing to begin
          </p>
        )}
      </div>
    </Layout>
  );
};

export default TypingTest;
