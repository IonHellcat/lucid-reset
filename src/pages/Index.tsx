import { Link, useNavigate } from "react-router-dom";
import LucidLogo from "@/components/LucidLogo";

const activities = [
  { id: "color-sort", name: "color sort", description: "Arrange shuffled hues in rainbow order", time: "~90 sec", path: "/activity/color-sort" },
  { id: "sequence-recall", name: "sequence recall", description: "Memorize and reproduce tile sequences", time: "~2 min", path: "/activity/sequence-recall" },
  { id: "rhythm-tap", name: "rhythm tap", description: "Watch a rhythm, then tap it back", time: "~90 sec", path: "/activity/rhythm-tap" },
  { id: "flow-trace", name: "flow trace", description: "Follow the dot with your cursor", time: "~60 sec", path: "/activity/flow-trace" },
  { id: "breathe", name: "breathe", description: "Guided breathing. No score, just calm.", time: "~90 sec", path: "/activity/breathe" },
];

const Index = () => {
  const navigate = useNavigate();

  const handleRandom = () => {
    const random = activities[Math.floor(Math.random() * activities.length)];
    navigate(random.path);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-3 mb-16 animate-fade-in">
        <LucidLogo size="lg" />
        <p className="font-body italic text-muted-foreground text-lg">clear the fog.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full mb-12">
        {activities.map((a, i) => (
          <Link
            key={a.id}
            to={a.path}
            className="group border border-border rounded-lg p-6 transition-all duration-300 hover:border-primary hover:glow-primary"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <h3 className="font-mono text-sm font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
              {a.name}
            </h3>
            <p className="font-body text-sm text-muted-foreground mb-3">{a.description}</p>
            <span className="font-mono text-xs text-muted-foreground">{a.time}</span>
          </Link>
        ))}
      </div>

      <button
        onClick={handleRandom}
        className="font-mono text-sm font-semibold px-8 py-3 rounded-md bg-primary text-primary-foreground transition-all duration-300 hover:opacity-90 hover:glow-primary mb-16"
      >
        random reset
      </button>

      <footer className="flex flex-col items-center gap-3">
        <p className="font-body text-xs text-muted-foreground text-center">
          science-backed micro-breaks for mental clarity
        </p>
        <div className="flex gap-4">
          <Link to="/stats" className="font-mono text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground">stats</Link>
          <Link to="/about" className="font-mono text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground">about</Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
