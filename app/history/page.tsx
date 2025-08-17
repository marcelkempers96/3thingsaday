"use client";

import { useMemo, useState } from 'react';
import { loadAllDays, type DailyTasksByDate } from '@/lib/storage';
import { formatDateKeyToHuman } from '@/lib/time';

export default function HistoryPage() {
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
        <h2 style={{ marginTop: 0 }}>History</h2>
        <input className="input" placeholder="Search dates (e.g. 2025-01-01)" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          {entries.map(({ key, data }) => (
            <div key={key} className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{formatDateKeyToHuman(key)}</strong>
                <span className="small muted">{data.tasks.filter(t => t.done).length} / {data.tasks.length} done</span>
              </div>
              <div className="tasks" style={{ marginTop: 10 }}>
                {data.tasks.map(t => (
                  <div key={t.id} className="task" style={{ gridTemplateColumns: '1fr auto' }}>
                    <div style={{ opacity: t.done ? 0.6 : 1, textDecoration: t.done ? 'line-through' as const : 'none' }}>{t.title}</div>
                    <div className="small muted">{t.done ? 'Done' : 'Open'}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {entries.length === 0 ? <div className="muted small">No days yet. Add tasks on the Today page.</div> : null}
        </div>
      </section>
    </main>
  );
}