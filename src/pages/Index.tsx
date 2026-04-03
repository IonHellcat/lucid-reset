import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import DefogLogo from "@/components/DefogLogo";
import Particles from "@/components/Particles";

const activities = [
  { id: "color-sort", name: "color sort", description: "Arrange shuffled hues in rainbow order", time: "~90 sec", path: "/activity/color-sort", icon: "dots" },
  { id: "sequence-recall", name: "sequence recall", description: "Memorize and reproduce tile sequences", time: "~2 min", path: "/activity/sequence-recall", icon: "grid" },
  { id: "rhythm-tap", name: "rhythm tap", description: "Watch a rhythm, then tap it back", time: "~90 sec", path: "/activity/rhythm-tap", icon: "pulse" },
  { id: "flow-trace", name: "flow trace", description: "Follow the dot with your cursor", time: "~60 sec", path: "/activity/flow-trace", icon: "curve" },
  { id: "typing-test", name: "typing test", description: "Type words against the clock. Pure speed.", time: "~60 sec", path: "/activity/typing-test", icon: "typing" },
  { id: "breathe", name: "breathe", description: "Guided breathing. No score, just calm.", time: "~90 sec", path: "/activity/breathe", icon: "breathe" },
];

const resetActivities = activities.filter((a) => a.id !== "typing-test");

const CardIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "dots":
      return (
        <div className="flex gap-1">
          {["hsl(0,70%,50%)", "hsl(60,70%,50%)", "hsl(120,70%,50%)", "hsl(200,70%,50%)", "hsl(280,70%,50%)"].map((c, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
      );
    case "grid":
      return (
        <div className="grid grid-cols-2 gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-2 h-2 rounded-[2px] ${i === 1 ? "bg-primary" : "bg-muted-foreground/30"}`} />
          ))}
        </div>
      );
    case "pulse":
      return <div className="w-3 h-3 rounded-full bg-primary/60 animate-pulse" />;
    case "curve":
      return (
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <path d="M1 11C5 1 10 1 19 6" stroke="hsl(174,58%,55%)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "typing":
      return (
        <span className="font-mono text-[10px] text-primary/70 leading-none">ab_</span>
      );
    case "breathe":
      return (
        <div className="w-3 h-3 rounded-full bg-primary/50" style={{ animation: "breathe-icon 4s ease-in-out infinite" }} />
      );
    default:
      return null;
  }
};

const Index = () => {
  const navigate = useNavigate();

  const handleRandom = () => {
    const random = resetActivities[Math.floor(Math.random() * resetActivities.length)];
    navigate(random.path);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        handleRandom();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative">
      <Particles />

      <div className="flex flex-col items-center gap-3 mb-16 relative z-10">
        <div className="animate-fade-in" style={{ animationDelay: "0ms", animationFillMode: "both" }}>
          <DefogLogo size="lg" />
        </div>
        <p className="font-body italic text-muted-foreground text-lg animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
          defog your brain in 2 minutes.
        </p>
        <p className="font-body text-sm text-muted-foreground/60 animate-fade-in" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
          science-backed micro-activities that reset your focus
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full mb-12 relative z-10">
        {activities.map((a, i) => (
          <Link
            key={a.id}
            to={a.path}
            className="group border border-border rounded-lg p-6 transition-all duration-300 hover:border-primary hover:glow-primary bg-card hover:bg-[hsl(0_0%_12%)] animate-fade-in"
            style={{
              animationDelay: `${600 + i * 100}ms`,
              animationFillMode: "both",
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-mono text-sm font-semibold group-hover:text-primary transition-colors duration-300">
                {a.name}
              </h3>
              <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <CardIcon type={a.icon} />
              </div>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-3">{a.description}</p>
            <span className="font-mono text-xs text-muted-foreground">{a.time}</span>
          </Link>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 mb-16 relative z-10 animate-fade-in" style={{ animationDelay: "1100ms", animationFillMode: "both" }}>
        <button
          onClick={handleRandom}
          className="font-mono text-sm font-semibold px-10 py-4 rounded-md bg-primary text-primary-foreground transition-all duration-300 hover:opacity-90 hover:glow-primary animate-pulse-glow"
          style={{ boxShadow: "0 0 30px hsl(174 58% 55% / 0.15)" }}
        >
          random reset
        </button>
        <p className="font-mono text-xs text-muted-foreground/50 mt-1">press R for instant reset</p>
      </div>

      <footer className="flex flex-col items-center gap-3 relative z-10">
        <div className="flex gap-4">
          <Link to="/stats" className="font-mono text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground">stats</Link>
          <Link to="/about" className="font-mono text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground">about</Link>
        </div>
        <p className="font-mono text-xs text-muted-foreground/30 mt-2">
          R — random reset · Esc — menu
        </p>
      </footer>
    </div>
  );
};

export default Index;
