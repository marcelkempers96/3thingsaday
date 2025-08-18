"use client";

import { useMemo, useState } from 'react';
import { loadAllDays, type Task } from '@/lib/storage';
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

  const categoryTotals = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of Object.values(days)) {
      for (const t of d.tasks) {
        if (t.category) counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [days]);

  return (
    <main className="grid" style={{ marginTop: 8 }}>
      <section className="panel">
        <h2 style={{ marginTop: 0 }}>{S.history}</h2>
        <input className="input" placeholder={S.searchDates} value={query} onChange={(e) => setQuery(e.target.value)} />

        <div className="panel" style={{ marginTop: 12 }}>
          <div className="small muted" style={{ marginBottom: 6 }}>Category totals</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categoryTotals.length === 0 ? <span className="small muted">No categories yet</span> : null}
            {categoryTotals.map(([key, n]) => (
              <span key={key} className="badge earned"><strong>{emojiForCategory(key as Task['category'])} {categoryLabel(key as Task['category'])}</strong> <span className="small muted">({n})</span></span>
            ))}
          </div>
        </div>

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
                    <div style={{ opacity: t.done ? 0.6 : 1 }}>
                      <div style={{ textDecoration: t.done ? 'line-through' as const : 'none' }}>{emojiForCategory(t.category)} {t.title}</div>
                      {(t.category || t.labels) && (
                        <div className="small muted">
                          {t.category ? categoryLabel(t.category) : ''}
                          {t.labels ? ` · ${formatLabels(t.labels)}` : ''}
                        </div>
                      )}
                    </div>
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

function emojiForCategory(c?: Task['category']) {
  switch (c) {
    case 'deep_work': return '🧠';
    case 'meetings': return '📅';
    case 'admin_email': return '📧';
    case 'planning_review': return '🗂️';
    case 'research_learning': return '🔎';
    case 'writing_creative': return '✍️';
    case 'health_fitness': return '💪';
    case 'family_friends': return '👨‍👩‍👧‍👦';
    case 'errands_chores': return '🧹';
    case 'hobbies_growth': return '🌱';
    default: return '';
  }
}

function categoryLabel(c: Task['category']): string {
  switch (c) {
    case 'deep_work': return 'Deep Work / Focus';
    case 'meetings': return 'Meetings';
    case 'admin_email': return 'Admin & Email';
    case 'planning_review': return 'Planning & Review';
    case 'research_learning': return 'Research & Learning';
    case 'writing_creative': return 'Writing / Creative';
    case 'health_fitness': return 'Health & Fitness';
    case 'family_friends': return 'Family & Friends';
    case 'errands_chores': return 'Errands & Chores';
    case 'hobbies_growth': return 'Hobbies / Personal Growth';
    default: return '';
  }
}

function formatLabels(l: NonNullable<Task['labels']>): string {
  const parts: string[] = [];
  if (l.priority) parts.push(l.priority);
  if (l.energy) parts.push(l.energy);
  if (l.context) parts.push(l.context);
  if (l.duration) parts.push(l.duration);
  return parts.join(' · ');
}