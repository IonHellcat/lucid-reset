import Layout from "@/components/Layout";
import { getScores, getTotalResets, getResetsToday, getResetsThisWeek, getBestScore } from "@/lib/scores";

const activities = ["color-sort", "sequence-recall", "rhythm-tap", "flow-trace", "breathe"];

const Stats = () => {
  const total = getTotalResets();
  const today = getResetsToday();
  const week = getResetsThisWeek();
  const scores = getScores();

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-6 py-16 w-full animate-fade-in">
        <h1 className="font-mono text-2xl font-bold mb-10">stats</h1>

        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="text-center">
            <p className="font-mono text-3xl font-bold text-accent">{total}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">total resets</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-3xl font-bold text-foreground">{today}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">today</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-3xl font-bold text-foreground">{week}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">this week</p>
          </div>
        </div>

        <h2 className="font-mono text-sm font-semibold mb-4 text-muted-foreground">best scores</h2>
        <div className="space-y-3 mb-12">
          {activities.map((a) => {
            const best = getBestScore(a);
            return (
              <div key={a} className="flex justify-between items-center border border-border rounded-lg px-4 py-3">
                <span className="font-mono text-sm">{a}</span>
                <span className="font-mono text-sm text-accent">
                  {best ? `${best.score}${best.label}` : "--"}
                </span>
              </div>
            );
          })}
        </div>

        <h2 className="font-mono text-sm font-semibold mb-4 text-muted-foreground">history</h2>
        {scores.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground">No resets yet. Go clear the fog.</p>
        ) : (
          <div className="space-y-2">
            {scores.slice(0, 50).map((s) => (
              <div key={s.id} className="flex justify-between items-center border border-border rounded-lg px-4 py-3">
                <div>
                  <span className="font-mono text-sm">{s.activity}</span>
                  <span className="font-body text-xs text-muted-foreground ml-3">
                    {new Date(s.date).toLocaleDateString()}
                  </span>
                </div>
                <span className="font-mono text-sm text-accent">
                  {s.score !== null ? `${s.score}${s.label}` : "done"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Stats;
