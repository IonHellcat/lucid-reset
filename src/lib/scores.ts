export interface ScoreEntry {
  id: string;
  activity: string;
  score: number | null;
  label: string;
  date: string;
}

const STORAGE_KEY = "lucid-scores";

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
