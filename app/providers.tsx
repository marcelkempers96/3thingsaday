"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Settings, Theme, Language, FontChoice, CountdownMode, ColorScheme } from '@/lib/settings';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/lib/settings';
import { fontBaloo, fontInter, fontNunito } from '@/app/fonts';
import { supabase } from '@/lib/supabaseClient';
import { syncPull, syncPush } from '@/lib/sync';
import { getJSON } from '@/lib/durable';
import { safeGet, safeSet } from '@/lib/safeStorage';

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
      // Rehydrate tasks from IndexedDB if local storage is empty (Safari private mode / cookie limits)
      try {
        const STORAGE_KEY = 'focus3_days_v1';
        const existing = safeGet(STORAGE_KEY);
        const idb = await getJSON<Record<string, unknown>>(STORAGE_KEY);
        if (idb && (!existing || existing.length < 10)) {
          safeSet(STORAGE_KEY, JSON.stringify(idb));
          window.dispatchEvent(new Event('focus3:refresh'));
        }
      } catch {}
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
    const rtChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    // Pull cloud data when signed in
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        await syncPull();
        window.dispatchEvent(new Event('focus3:refresh'));
        try {
          // Subscribe to realtime changes for this user's row to auto-pull
          const channel = supabase
            .channel('user_data_sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_data', filter: `user_id=eq.${data.user.id}` }, async () => {
              try { await syncPull(); window.dispatchEvent(new Event('focus3:refresh')); } catch {}
            })
            .subscribe();
          rtChannelRef.current = channel;
        } catch {}
      }
    }).catch(() => {});
    // Also push immediately on new sign-in so offline-created local data gets uploaded
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          await syncPull();
          await syncPush();
          window.dispatchEvent(new Event('focus3:refresh'));
          // Reset realtime subscription with fresh user id
          try { rtChannelRef.current?.unsubscribe(); } catch {}
          try {
            const channel = supabase
              .channel('user_data_sync')
              .on('postgres_changes', { event: '*', schema: 'public', table: 'user_data', filter: `user_id=eq.${session.user.id}` }, async () => {
                try { await syncPull(); window.dispatchEvent(new Event('focus3:refresh')); } catch {}
              })
              .subscribe();
            rtChannelRef.current = channel;
          } catch {}
        } else if (event === 'SIGNED_OUT') {
          try { rtChannelRef.current?.unsubscribe(); rtChannelRef.current = null; } catch {}
        }
      } catch {}
    });
    // Push periodically
    const id = setInterval(() => { syncPush().catch(() => {}); }, 20_000);
    // Pull periodically as a fallback (in case realtime is disabled)
    const pullId = setInterval(() => { syncPull().catch(() => {}); }, 30_000);
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
      clearInterval(pullId);
      window.removeEventListener('focus3:data', schedulePush);
      window.removeEventListener('focus3:projects', schedulePush);
      try { authListener?.subscription?.unsubscribe(); } catch {}
      try { rtChannelRef.current?.unsubscribe(); } catch {}
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