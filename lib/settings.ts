export type Theme = 'light' | 'dark';
export type Language = 'en' | 'nl';
export type FontChoice = 'baloo' | 'nunito' | 'inter';

export type Settings = {
  theme: Theme;
  language: Language;
  font: FontChoice;
  googleClientId?: string;
};

const STORAGE_KEY = 'focus3_settings_v1';

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  language: 'en',
  font: 'baloo',
  googleClientId: '926648035624-ncv9e26jnh5rpm6tgte0jjdqul64b1j3.apps.googleusercontent.com'
};

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Settings;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(next: Settings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}