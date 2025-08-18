"use client";

import { useEffect, useMemo, useState } from 'react';
import { DailyTasks, loadToday, saveToday, toggleTask, upsertTask, removeTask, moveTask, type Task } from '@/lib/storage';
import { getMillisUntilEndOfDay, formatCountdown } from '@/lib/time';
import Link from 'next/link';
import { useSettings } from './providers';
import { getStrings } from '@/lib/i18n';
import AddTaskModal from './components/AddTaskModal';

export default function Page() {
  const { language } = useSettings();
  const S = getStrings(language);

  const [data, setData] = useState<DailyTasks>(loadToday());
  const [input, setInput] = useState('');
  const [now, setNow] = useState(Date.now());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    saveToday(data);
  }, [data]);

  const remaining = useMemo(() => getMillisUntilEndOfDay(now), [now]);
  const doneCount = data.tasks.filter(t => t.done).length;
  const progress = Math.min(100, Math.round((doneCount / Math.max(1, data.tasks.length)) * 100));

  function addQuickTask() {
    const title = input.trim();
    if (!title) return;
    if (data.tasks.length >= 5) return alert('Max 5 items for the day');
    setData(prev => upsertTask(prev, { id: crypto.randomUUID(), title, done: false }));
    setInput('');
  }

  function addDetailedTask(t: Omit<Task, 'id' | 'done'>) {
    if (data.tasks.length >= 5) return alert('Max 5 items for the day');
    setData(prev => upsertTask(prev, { id: crypto.randomUUID(), done: false, ...t }));
  }

  function toggle(id: string) {
    setData(prev => toggleTask(prev, id));
  }

  function remove(id: string) {
    setData(prev => removeTask(prev, id));
  }

  function move(id: string, dir: -1 | 1) {
    setData(prev => moveTask(prev, id, dir));
  }

  const dayDate = useMemo(() => {
    const d = new Date(now);
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [now]);

  return (
    <main className="grid grid-2" style={{ marginTop: 8 }}>
      <section className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div className="small muted" style={{ marginBottom: 4 }}>{dayDate}</div>
            <h2 style={{ margin: 0 }}>{S.today}</h2>
          </div>
          <div className="small muted">{S.timeLeft}: <strong>{formatCountdown(remaining)}</strong></div>
        </div>
        <hr className="hr" />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            className="input"
            placeholder={S.addPlaceholder}
            value={input}
            maxLength={80}
            onKeyDown={(e) => { if (e.key === 'Enter') addQuickTask(); }}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addQuickTask}>{S.addButton}</button>
          <button className="btn" onClick={() => setShowModal(true)}>Add with details</button>
        </div>
        <div className="small muted" style={{ marginTop: 8 }}>
          {S.aim}
        </div>

        <div className="tasks" style={{ marginTop: 16 }}>
          {data.tasks.map((t, idx) => (
            <div key={t.id} className="task">
              <button className={`checkbox ${t.done ? 'checked' : ''}`} aria-label="Toggle" onClick={() => toggle(t.id)}>
                {t.done ? '✓' : ''}
              </button>
              <div style={{ opacity: t.done ? 0.6 : 1 }}>
                <div style={{ textDecoration: t.done ? 'line-through' as const : 'none' }}>{t.title}</div>
                {(t.category || t.labels) && (
                  <div className="small muted">
                    {t.category ? categoryLabel(t.category) : ''}
                    {t.labels ? ` · ${formatLabels(t.labels)}` : ''}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn" onClick={() => move(t.id, -1)} disabled={idx === 0}>↑</button>
                <button className="btn" onClick={() => move(t.id, 1)} disabled={idx === data.tasks.length - 1}>↓</button>
                <button className="btn" onClick={() => remove(t.id)} aria-label="Delete">✕</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="progress"><span style={{ width: `${progress}%` }} /></div>
          <div className="small muted" style={{ marginTop: 6 }}>{getStrings(language).tasksDoneShort(doneCount, data.tasks.length || 3)}</div>
        </div>
      </section>

      <aside className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ margin: 0 }}>Motivation</h3>
        <p className="muted small" style={{ marginTop: 0 }}>{getStrings(language).motivation}</p>
        <Link href="/achievements" className="btn btn-success" prefetch={false}>{getStrings(language).viewAchievements}</Link>
        <Link href="/history" className="btn" prefetch={false}>{getStrings(language).seeHistory}</Link>
      </aside>

      <AddTaskModal open={showModal} onClose={() => setShowModal(false)} onSave={addDetailedTask} />
    </main>
  );
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