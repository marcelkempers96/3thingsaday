"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Settings, Theme, Language, FontChoice } from '@/lib/settings';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/lib/settings';
import { fontBaloo, fontInter, fontNunito } from '@/app/fonts';

export type SettingsContextValue = Settings & {
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
  setFont: (f: FontChoice) => void;
  setGoogleClientId: (id: string) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('SettingsProvider missing');
  return ctx;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const clsLight = 'theme-light';
    const clsDark = 'theme-dark';
    document.body.classList.remove(clsLight, clsDark);
    document.body.classList.add(settings.theme === 'dark' ? clsDark : clsLight);
    saveSettings(settings);
  }, [settings, ready]);

  const value: SettingsContextValue = useMemo(() => ({
    ...settings,
    setTheme: (t) => setSettings(s => ({ ...s, theme: t })),
    setLanguage: (l) => setSettings(s => ({ ...s, language: l })),
    setFont: (f) => setSettings(s => ({ ...s, font: f })),
    setGoogleClientId: (id) => setSettings(s => ({ ...s, googleClientId: id }))
  }), [settings]);

  const fontClass = settings.font === 'nunito' ? fontNunito.className : settings.font === 'inter' ? fontInter.className : fontBaloo.className;

  return (
    <SettingsContext.Provider value={value}>
      <div className={fontClass}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
}