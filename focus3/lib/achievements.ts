import type { DailyTasksByDate } from './storage';

export type Streaks = {
  current: number;
  best: number;
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
};

export function computeStreaks(days: DailyTasksByDate): Streaks {
  const keys = Object.keys(days).sort();
  if (keys.length === 0) return { current: 0, best: 0 };

  // normalize: a "completed day" is when at least 1 task exists and all tasks are done
  const completed = new Set(keys.filter(k => {
    const d = days[k];
    return d.tasks.length > 0 && d.tasks.every(t => t.done);
  }));

  let best = 0;
  let current = 0;
  // compute best contiguous streak ignoring gaps
  let prev: string | null = null;
  for (const k of keys) {
    if (!completed.has(k)) {
      best = Math.max(best, current);
      current = 0;
      prev = k;
      continue;
    }
    if (prev && isNextDay(prev, k)) current += 1; else current = 1;
    prev = k;
  }
  best = Math.max(best, current);

  // compute current streak from latest backwards
  current = 0;
  for (let i = keys.length - 1; i >= 0; i--) {
    const k = keys[i];
    if (i === keys.length - 1) {
      if (completed.has(k)) current = 1; else break;
    } else {
      const expected = addDays(keys[i + 1], -1);
      if (k === expected && completed.has(k)) current += 1; else break;
    }
  }

  return { current, best };
}

export function computeBadges(streaks: Streaks, days: DailyTasksByDate): Badge[] {
  const totalCompletedDays = Object.values(days).filter(d => d.tasks.length > 0 && d.tasks.every(t => t.done)).length;
  const totalTasks = Object.values(days).reduce((s, d) => s + d.tasks.length, 0);
  const tasksDone = Object.values(days).reduce((s, d) => s + d.tasks.filter(t => t.done).length, 0);

  const all: Badge[] = [
    { id: 'first-day', title: 'First Day', description: 'Complete your first full day', icon: '🌱', earned: totalCompletedDays >= 1 },
    { id: 'three-days', title: '3-Day Streak', description: 'Keep the momentum 3 days in a row', icon: '🔥', earned: streaks.best >= 3 || streaks.current >= 3 },
    { id: 'seven-days', title: '7-Day Streak', description: 'A full week streak', icon: '🗓️', earned: streaks.best >= 7 || streaks.current >= 7 },
    { id: 'thirty-days', title: '30-Day Streak', description: 'One month of consistency', icon: '🏆', earned: streaks.best >= 30 || streaks.current >= 30 },
    { id: 'hundred-tasks', title: 'Century', description: 'Complete 100 tasks total', icon: '💯', earned: tasksDone >= 100 },
    { id: 'five-in-a-day', title: 'Max Focus', description: 'Complete 5 tasks in a single day', icon: '🎯', earned: Object.values(days).some(d => d.tasks.length >= 5 && d.tasks.every(t => t.done)) },
  ];

  return all;
}

function isNextDay(a: string, b: string): boolean {
  return addDays(a, 1) === b;
}

function addDays(dateKey: string, amount: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + amount);
  const y2 = dt.getFullYear();
  const m2 = String(dt.getMonth() + 1).padStart(2, '0');
  const d2 = String(dt.getDate()).padStart(2, '0');
  return `${y2}-${m2}-${d2}`;
}