"use client";

import { useMemo, useState } from 'react';
import { loadAllDays } from '@/lib/storage';
import { formatDateKeyToHuman } from '@/lib/time';
import { useSettings } from '@/app/providers';
import { getStrings } from '@/lib/i18n';

export default function HistoryPage() {
  const { language } = useSettings();
  const S = getStrings(language);
  const [query, setQuery] = useState('');
  const days = useMemo(() => loadAllDays(), []);

  const entries = useMemo(() => {
    const keys = Object.keys(days).sort((a, b) => b.localeCompare(a));
    const filtered = keys.filter(k => !query || formatDateKeyToHuman(k).toLowerCase().includes(query.toLowerCase()));
    return filtered.map(k => ({ key: k, data: days[k] }));
  }, [days, query]);

  return (
    <main className="grid" style={{ marginTop: 8 }}>
      <section className="panel">
        <h2 style={{ marginTop: 0 }}>{S.history}</h2>
        <input className="input" placeholder={S.searchDates} value={query} onChange={(e) => setQuery(e.target.value)} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          {entries.map(({ key, data }) => (
            <div key={key} className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{formatDateKeyToHuman(key)}</strong>
                <span className="small muted">{S.tasksDoneShort(data.tasks.filter(t => t.done).length, data.tasks.length)}</span>
              </div>
              <div className="tasks" style={{ marginTop: 10 }}>
                {data.tasks.map(t => (
                  <div key={t.id} className="task" style={{ gridTemplateColumns: '1fr auto' }}>
                    <div style={{ opacity: t.done ? 0.6 : 1, textDecoration: t.done ? 'line-through' as const : 'none' }}>{t.title}</div>
                    <div className="small muted">{t.done ? S.done : S.open}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {entries.length === 0 ? <div className="muted small">{S.noDaysYet}</div> : null}
        </div>
      </section>
    </main>
  );
}