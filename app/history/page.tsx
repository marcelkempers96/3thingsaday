"use client";

import { useMemo, useState } from 'react';
import { loadAllDays, saveAllDays, type Task, type DailyTasksByDate } from '@/lib/storage';
import { formatDateKeyToHuman, getTodayKey } from '@/lib/time';
import { useSettings } from '@/app/providers';
import { getStrings } from '@/lib/i18n';
import { loadProjects } from '@/lib/projects';
import { newId } from '@/lib/uid';

export default function HistoryPage() {
  const { language } = useSettings();
  const S = getStrings(language);
  const [query, setQuery] = useState('');
  const [days, setDays] = useState<DailyTasksByDate>(loadAllDays());

  function updateDays(next: DailyTasksByDate) {
    saveAllDays(next);
    setDays(next);
    try { window.dispatchEvent(new Event('focus3:data')); } catch {}
  }

  function toggleTaskInHistory(dateKey: string, taskId: string) {
    const d = days[dateKey]; if (!d) return;
    const nextTasks = d.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    const next: DailyTasksByDate = { ...days, [dateKey]: { ...d, tasks: nextTasks } };
    updateDays(next);
  }

  function bringToToday(_dateKey: string, task: Task) {
    const todayKey = getTodayKey();
    const today = days[todayKey] || { dateKey: todayKey, tasks: [] };
    const duplicated: Task = { ...task, id: newId(), done: false };
    const nextToday = { ...today, tasks: [...today.tasks, duplicated] };
    const next: DailyTasksByDate = { ...days, [todayKey]: nextToday };
    updateDays(next);
  }

  function deleteTaskInHistory(dateKey: string, taskId: string) {
    const d = days[dateKey]; if (!d) return;
    const nextTasks = d.tasks.filter(t => t.id !== taskId);
    const next: DailyTasksByDate = { ...days, [dateKey]: { ...d, tasks: nextTasks } };
    updateDays(next);
  }

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
  const projects = useMemo(() => loadProjects(), []);
  const projectMap = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p.title])), [projects]);

  const projectTotals = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of Object.values(days)) {
      for (const t of d.tasks) {
        if (t.projectId) counts.set(t.projectId, (counts.get(t.projectId) ?? 0) + 1);
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
          <div className="small muted" style={{ marginBottom: 6 }}>Project totals</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {projectTotals.length === 0 ? <span className="small muted">No projects yet</span> : null}
            {projectTotals.map(([key, n]) => (
              <span key={key} className="badge earned"><strong>{projectMap[key] || 'Unknown project'}</strong> <span className="small muted">({n})</span></span>
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
                          {t.projectId ? ` · Project: ${projectMap[t.projectId] || 'Unknown'}` : ''}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="btn" onClick={() => toggleTaskInHistory(key, t.id)}>{t.done ? 'Mark open' : 'Mark done'}</button>
                      {t.done ? <button className="btn" onClick={() => bringToToday(key, t)}>Bring to Today</button> : null}
                      <button className="btn" onClick={() => deleteTaskInHistory(key, t.id)}>Delete</button>
                    </div>
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
    case 'meetings': return 'Google Meetings';
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
  if (l.importance) parts.push(`Importance: ${l.importance}`);
  if (l.urgency) parts.push(`Urgency: ${l.urgency}`);
  if (l.location) parts.push(l.location);
  if (l.duration) parts.push(l.duration);
  if (l.timeFromHHMM || l.timeToHHMM) parts.push(`${l.timeFromHHMM || ''}${l.timeToHHMM ? `–${l.timeToHHMM}` : ''}`);
  return parts.join(' · ');
}