import type { Language } from './settings';

export type Strings = {
  today: string;
  achievements: string;
  history: string;
  timeLeft: string;
  addPlaceholder: string;
  addButton: string;
  aim: string;
  motivation: string;
  viewAchievements: string;
  seeHistory: string;
  badges: string;
  currentStreak: string;
  best: (n: number) => string;
  allTimeDays: string;
  tasksCompleted: string;
  acrossAllDays: string;
  startToday: string;
  searchDates: string;
  done: string;
  open: string;
  noDaysYet: string;
  tasksDoneShort: (done: number, total: number) => string;
  quoteOfTheDay: string;
};

export const STRINGS: Record<Language, Strings> = {
  en: {
    today: 'Today',
    achievements: 'Achievements',
    history: 'History',
    timeLeft: 'Time left',
    addPlaceholder: 'Add one of your 3–5 priorities...',
    addButton: 'Add',
    aim: 'Aim for 3 core tasks. Add as many as you need.',
    motivation: 'Check tasks to build streaks and earn badges. Everything saves offline in your browser.',
    viewAchievements: 'View achievements →',
    seeHistory: 'See past days →',
    badges: 'Badges',
    currentStreak: 'Current Streak',
    best: (n) => `Best: ${n} days`,
    allTimeDays: 'All-time Days Logged',
    tasksCompleted: 'Tasks Completed',
    acrossAllDays: 'Across all days',
    startToday: 'Start today!',
    searchDates: 'Search dates (e.g. 2025-01-01)',
    done: 'Done',
    open: 'Open',
    noDaysYet: 'No days yet. Add tasks on the Today page.',
    tasksDoneShort: (done, total) => `${done} / ${total} done`,
    quoteOfTheDay: 'Quote of the day'
  },
  nl: {
    today: 'Vandaag',
    achievements: 'Prestaties',
    history: 'Geschiedenis',
    timeLeft: 'Tijd over',
    addPlaceholder: 'Voeg een van je 3–5 prioriteiten toe...',
    addButton: 'Toevoegen',
    aim: 'Streef naar 3 kerntaken. Voeg zoveel toe als je nodig hebt.',
    motivation: 'Vink taken af om streaks op te bouwen en badges te verdienen. Alles wordt lokaal opgeslagen in je browser.',
    viewAchievements: 'Bekijk prestaties →',
    seeHistory: 'Bekijk eerdere dagen →',
    badges: 'Badges',
    currentStreak: 'Huidige streak',
    best: (n) => `Beste: ${n} dagen`,
    allTimeDays: 'Aantal dagen vastgelegd',
    tasksCompleted: 'Taken voltooid',
    acrossAllDays: 'Over alle dagen',
    startToday: 'Begin vandaag!',
    searchDates: 'Zoek datums (bijv. 2025-01-01)',
    done: 'Klaar',
    open: 'Open',
    noDaysYet: 'Nog geen dagen. Voeg taken toe op de Vandaag-pagina.',
    tasksDoneShort: (done, total) => `${done} / ${total} klaar`,
    quoteOfTheDay: 'Quote van de dag'
  }
};

export function getStrings(language: Language): Strings {
  return STRINGS[language] ?? STRINGS.en;
}