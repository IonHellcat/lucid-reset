import { useState } from "react";
import Layout from "@/components/Layout";
import { getScores, getTotalResets, getResetsToday, getResetsThisWeek, getBestScore, getStreak, getWeeklyHeatmap, relativeTime, clearScores } from "@/lib/scores";

const activities = ["color-sort", "sequence-recall", "rhythm-tap", "flow-trace", "typing-test", "breathe"];
const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const Stats = () => {
  const [cleared, setCleared] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const total = getTotalResets();
  const today = getResetsToday();
  const week = getResetsThisWeek();
  const streak = getStreak();
  const scores = getScores();
  const heatmap = getWeeklyHeatmap();

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearScores();
    setCleared(true);
    setConfirmClear(false);
  };

  if (cleared) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-6 py-16 w-full animate-fade-in text-center">
          <p className="font-display text-lg">All data cleared.</p>
          <button onClick={() => window.location.reload()} className="font-display text-sm text-primary mt-4 hover:opacity-70 transition-opacity">refresh</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-6 py-16 w-full animate-fade-in">
        <h1 className="font-display text-2xl font-bold mb-10">stats</h1>

        {/* Streak */}
        <div className="mb-8 text-center">
          {streak > 0 ? (
            <p className="font-display text-lg font-bold text-accent">🔥 <span className="font-mono">{streak}</span> day streak</p>
          ) : (
            <p className="font-display text-sm text-muted-foreground">Start your streak today</p>
          )}
        </div>

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

        {/* Weekly heatmap */}
        <h2 className="font-display text-sm font-semibold mb-3 text-muted-foreground">last 4 weeks</h2>
        <div className="mb-12">
          <div className="flex gap-1 mb-1">
            {dayLabels.map((d, i) => (
              <span key={i} className="w-6 h-4 text-center font-mono text-[10px] text-muted-foreground/50">{d}</span>
            ))}
          </div>
          {heatmap.map((week, wi) => (
            <div key={wi} className="flex gap-1 mb-1">
              {week.map((count, di) => (
                <div
                  key={di}
                  className="w-6 h-6 rounded-sm border border-border transition-colors duration-200"
                  style={{
                    backgroundColor: count === 0
                      ? "hsl(var(--secondary))"
                      : `hsla(168, 60%, 50%, ${Math.min(0.2 + count * 0.2, 1)})`,
                  }}
                  title={`${count} resets`}
                />
              ))}
            </div>
          ))}
        </div>

        <h2 className="font-display text-sm font-semibold mb-4 text-muted-foreground">best scores</h2>
        <div className="space-y-3 mb-12">
          {activities.map((a) => {
            const best = getBestScore(a);
            return (
              <div key={a} className="flex justify-between items-center border border-border rounded-lg px-4 py-3">
                <span className="font-display text-sm">{a}</span>
                <span className="font-mono text-sm text-accent">
                  {best ? `${best.score}${best.label}` : "--"}
                </span>
              </div>
            );
          })}
        </div>

        <h2 className="font-display text-sm font-semibold mb-4 text-muted-foreground">history</h2>
        {scores.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground">No resets yet. Go clear the fog.</p>
        ) : (
          <div className="space-y-2 mb-12">
            {scores.slice(0, 50).map((s) => (
              <div key={s.id} className="flex justify-between items-center border border-border rounded-lg px-4 py-3">
                <div>
                  <span className="font-display text-sm">{s.activity}</span>
                  <span className="font-body text-xs text-muted-foreground ml-3">
                    {relativeTime(s.date)}
                  </span>
                </div>
                <span className="font-mono text-sm text-accent">
                  {s.score !== null ? `${s.score}${s.label}` : "done"}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-border pt-8 mt-8">
          <button
            onClick={handleClear}
            className={`font-display text-sm px-4 py-2 rounded-md transition-all duration-300 ${
              confirmClear
                ? "bg-destructive text-destructive-foreground"
                : "text-destructive border border-destructive/30 hover:border-destructive"
            }`}
          >
            {confirmClear ? "confirm — delete all data" : "clear all data"}
          </button>
          {confirmClear && (
            <button
              onClick={() => setConfirmClear(false)}
              className="font-display text-sm text-muted-foreground ml-3 hover:text-foreground transition-colors"
            >
              cancel
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Stats;
