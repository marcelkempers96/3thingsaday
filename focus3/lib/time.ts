import type { Settings } from './settings';

export function getTodayKey(now: number = Date.now()): string {
  const d = new Date(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getMillisUntilEndOfDay(now: number = Date.now()): number {
  const d = new Date(now);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return Math.max(0, end.getTime() - now);
}

export function getMillisUntilTarget(settings: Settings, now: number = Date.now()): number {
  const d = new Date(now);
  function parseHHMM(hhmm?: string) {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    const t = new Date(d);
    t.setHours(h, m, 0, 0);
    if (t.getTime() < now) t.setDate(t.getDate() + 1); // next day if past
    return t.getTime() - now;
  }

  switch (settings.countdownMode) {
    case 'sleepTime':
      return parseHHMM(settings.sleepTimeHHMM) ?? getMillisUntilEndOfDay(now);
    case 'customTime':
      return parseHHMM(settings.customTimeHHMM) ?? getMillisUntilEndOfDay(now);
    case 'nextMeal':
      const msList = [settings.mealTimes?.breakfast, settings.mealTimes?.lunch, settings.mealTimes?.dinner]
        .map(parseHHMM)
        .filter((x): x is number => typeof x === 'number')
        .sort((a, b) => a - b);
      return msList.length > 0 ? msList[0] : getMillisUntilEndOfDay(now);
    case 'endOfDay':
    default:
      return getMillisUntilEndOfDay(now);
  }
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDateKeyToHuman(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit', weekday: 'short' });
}