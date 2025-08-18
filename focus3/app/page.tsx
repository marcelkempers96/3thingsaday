"use client";

import { useEffect, useMemo, useState } from 'react';
import { DailyTasks, loadToday, saveToday, toggleTask, upsertTask, removeTask, moveTask } from '@/lib/storage';
import { getMillisUntilEndOfDay, formatCountdown } from '@/lib/time';
import Link from 'next/link';
import { useSettings } from './providers';
import { getStrings } from '@/lib/i18n';

export default function Page() {
  const { language } = useSettings();
  const t = getStrings(language);

  const [data, setData] = useState<DailyTasks>(loadToday());
  const [input, setInput] = useState('');
  const [now, setNow] = useState(Date.now());

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

  function addTask() {
    const title = input.trim();
    if (!title) return;
    if (data.tasks.length >= 5) return alert('Max 5 items for the day');
    setData(prev => upsertTask(prev, { id: crypto.randomUUID(), title, done: false }));
    setInput('');
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

  return (
    <main className="grid grid-2" style={{ marginTop: 8 }}>
      <section className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0 }}>{t.today}</h2>
          <div className="small muted">{t.timeLeft}: <strong>{formatCountdown(remaining)}</strong></div>
        </div>
        <hr className="hr" />

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder={t.addPlaceholder}
            value={input}
            maxLength={80}
            onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addTask}>{t.addButton}</button>
        </div>
        <div className="small muted" style={{ marginTop: 8 }}>
          {t.aim}
        </div>

        <div className="tasks" style={{ marginTop: 16 }}>
          {data.tasks.map((t, idx) => (
            <div key={t.id} className="task">
              <button className={`checkbox ${t.done ? 'checked' : ''}`} aria-label="Toggle" onClick={() => toggle(t.id)}>
                {t.done ? '✓' : ''}
              </button>
              <div style={{ opacity: t.done ? 0.6 : 1, textDecoration: t.done ? 'line-through' as const : 'none' }}>{t.title}</div>
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
    </main>
  );
}