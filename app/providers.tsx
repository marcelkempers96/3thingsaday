"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Settings, Theme, Language, FontChoice, CountdownMode, ColorScheme } from '@/lib/settings';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/lib/settings';
import { fontBaloo, fontInter, fontNunito } from '@/app/fonts';
import { supabase } from '@/lib/supabaseClient';
import { syncPull, syncPush } from '@/lib/sync';

export type SettingsContextValue = Settings & {
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
  setFont: (f: FontChoice) => void;
  setGoogleClientId: (id: string) => void;
  setCountdownMode: (m: CountdownMode) => void;
  setSleepTime: (hhmm: string) => void;
  setCustomTime: (hhmm: string) => void;
  setMealTimes: (t: { breakfast: string; lunch: string; dinner: string }) => void;
  setColorScheme: (c: ColorScheme) => void;
  setRememberGoogle: (b: boolean) => void;
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

  // On mount, attempt to reload session and rehydrate tasks/projects via syncPull
  useEffect(() => {
    const init = async () => {
      try { await supabase.auth.getSession(); } catch {}
      try { await syncPull(); window.dispatchEvent(new Event('focus3:refresh')); } catch {}
    };
    init();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const clsLight = 'theme-light';
    const clsDark = 'theme-dark';
    document.body.classList.remove(clsLight, clsDark);
    document.body.classList.add(settings.theme === 'dark' ? clsDark : clsLight);
    const colorClasses = ['color-green','color-blue','color-purple','color-orange','color-rose'];
    document.body.classList.remove(...colorClasses);
    document.body.classList.add(`color-${settings.colorScheme}`);
    saveSettings(settings);
  }, [settings, ready]);

  useEffect(() => {
    // Pull cloud data when signed in
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        await syncPull();
        window.dispatchEvent(new Event('focus3:refresh'));
      }
    }).catch(() => {});
    // Push periodically
    const id = setInterval(() => { syncPush().catch(() => {}); }, 20_000);
    // Push whenever local data changes (debounced)
    let debounceId: any = null;
    const schedulePush = () => {
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(() => { syncPush().catch(() => {}); }, 1200);
    };
    window.addEventListener('focus3:data', schedulePush);
    window.addEventListener('focus3:projects', schedulePush);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus3:data', schedulePush);
      window.removeEventListener('focus3:projects', schedulePush);
    };
  }, []);

  const value: SettingsContextValue = useMemo(() => ({
    ...settings,
    setTheme: (t) => setSettings(s => ({ ...s, theme: t })),
    setLanguage: (l) => setSettings(s => ({ ...s, language: l })),
    setFont: (f) => setSettings(s => ({ ...s, font: f })),
    setGoogleClientId: (id) => setSettings(s => ({ ...s, googleClientId: id })),
    setCountdownMode: (m) => setSettings(s => ({ ...s, countdownMode: m })),
    setSleepTime: (hhmm) => setSettings(s => ({ ...s, sleepTimeHHMM: hhmm })),
    setCustomTime: (hhmm) => setSettings(s => ({ ...s, customTimeHHMM: hhmm })),
    setMealTimes: (t) => setSettings(s => ({ ...s, mealTimes: t })),
    setColorScheme: (c) => setSettings(s => ({ ...s, colorScheme: c })),
    setRememberGoogle: (b) => setSettings(s => ({ ...s, rememberGoogle: b }))
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