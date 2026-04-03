export interface ScoreEntry {
  id: string;
  activity: string;
  score: number | null;
  label: string;
  date: string;
}

const STORAGE_KEY = "defog-scores";

export function saveScore(activity: string, score: number | null, label: string) {
  const entries = getScores();
  entries.unshift({
    id: crypto.randomUUID(),
    activity,
    score,
    label,
    date: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getScores(): ScoreEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearScores() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getTotalResets(): number {
  return getScores().length;
}

export function getResetsToday(): number {
  const today = new Date().toDateString();
  return getScores().filter((s) => new Date(s.date).toDateString() === today).length;
}

export function getResetsThisWeek(): number {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return getScores().filter((s) => new Date(s.date) >= weekAgo).length;
}

export function getBestScore(activity: string): ScoreEntry | undefined {
  const scores = getScores().filter((s) => s.activity === activity && s.score !== null);
  if (scores.length === 0) return undefined;
  return scores.reduce((best, s) => (s.score! > best.score! ? s : best));
}

export function getStreak(): number {
  const scores = getScores();
  if (scores.length === 0) return 0;
  const days = new Set(scores.map((s) => new Date(s.date).toDateString()));
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    if (days.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function getWeeklyHeatmap(): number[][] {
  const scores = getScores();
  const now = new Date();
  const weeks: number[][] = [];
  for (let w = 3; w >= 0; w--) {
    const week: number[] = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now.getTime() - (w * 7 + d) * 24 * 60 * 60 * 1000);
      const dateStr = date.toDateString();
      week.push(scores.filter((s) => new Date(s.date).toDateString() === dateStr).length);
    }
    weeks.push(week);
  }
  return weeks;
}

export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
