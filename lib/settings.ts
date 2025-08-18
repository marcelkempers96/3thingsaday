export type Theme = 'light' | 'dark';
export type Language = 'en' | 'nl';
export type FontChoice = 'baloo' | 'nunito' | 'inter';
export type ColorScheme = 'green' | 'blue' | 'purple' | 'orange' | 'rose';

export type CountdownMode = 'endOfDay' | 'sleepTime' | 'customTime' | 'nextMeal';

export type Settings = {
  theme: Theme;
  language: Language;
  font: FontChoice;
  googleClientId?: string;
  countdownMode: CountdownMode;
  sleepTimeHHMM?: string;
  customTimeHHMM?: string;
  mealTimes?: { breakfast: string; lunch: string; dinner: string };
  colorScheme: ColorScheme;
};

const STORAGE_KEY = 'focus3_settings_v1';

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  language: 'en',
  font: 'baloo',
  googleClientId: '926648035624-ncv9e26jnh5rpm6tgte0jjdqul64b1j3.apps.googleusercontent.com',
  countdownMode: 'endOfDay',
  sleepTimeHHMM: '23:00',
  customTimeHHMM: '18:00',
  mealTimes: { breakfast: '08:00', lunch: '12:30', dinner: '18:30' },
  colorScheme: 'green'
};

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Settings;
    const merged: Settings = { ...DEFAULT_SETTINGS, ...parsed };
    if (!merged.googleClientId) merged.googleClientId = DEFAULT_SETTINGS.googleClientId;
    merged.mealTimes = { ...DEFAULT_SETTINGS.mealTimes!, ...(parsed as any).mealTimes };
    if (!merged.colorScheme) merged.colorScheme = 'green';
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(next: Settings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}