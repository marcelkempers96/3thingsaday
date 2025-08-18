"use client";

import { useEffect, useMemo, useState } from 'react';
import { DailyTasks, loadToday, saveToday, toggleTask, upsertTask, removeTask, moveTask, reorderTasks, type Task, type Category } from '@/lib/storage';
import { getMillisUntilEndOfDay, formatCountdown } from '@/lib/time';
import Link from 'next/link';
import { useSettings } from './providers';
import { getStrings } from '@/lib/i18n';
import AddTaskModal from './components/AddTaskModal';
import QuoteOfTheDay from './components/QuoteOfTheDay';
import CalendarImport from './components/CalendarImport';
import EditTaskModal from './components/EditTaskModal';

function formatEventTime(ev: { start?: { date?: string; dateTime?: string }, end?: { date?: string; dateTime?: string } }) {
  const start = ev.start?.dateTime || ev.start?.date;
  const end = ev.end?.dateTime || ev.end?.date;
  if (!start) return '';
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const sStr = s.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const eStr = e ? e.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
  return e ? `${sStr} – ${eStr}` : sStr;
}

export default function Page() {
  const settings = useSettings();
  const { language } = settings;
  const S = getStrings(language);

  const [data, setData] = useState<DailyTasks>(loadToday());
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [now, setNow] = useState(Date.now());
  const [showModal, setShowModal] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    saveToday(data);
  }, [data]);

  useEffect(() => {
    function onRefresh() { setData(loadToday()); }
    window.addEventListener('focus3:refresh', onRefresh);
    window.addEventListener('focus3:data', onRefresh);
    window.addEventListener('storage', onRefresh);
    return () => {
      window.removeEventListener('focus3:refresh', onRefresh);
      window.removeEventListener('focus3:data', onRefresh);
      window.removeEventListener('storage', onRefresh);
    };
  }, []);

  const remaining = useMemo(() => getMillisUntilEndOfDay(now), [now]);
  const doneCount = data.tasks.filter(t => t.done).length;
  const progress = Math.min(100, Math.round((doneCount / Math.max(1, data.tasks.length)) * 100));

  function addQuickTask() {
    const title = input.trim();
    if (!title) return;
    setData(prev => upsertTask(prev, { id: crypto.randomUUID(), title, done: false, category: selectedCategory || undefined }));
    setInput('');
  }

  function addDetailedTask(t: Omit<Task, 'id' | 'done'>) {
    setData(prev => upsertTask(prev, { id: crypto.randomUUID(), done: false, ...t }));
  }

  function toggle(id: string) {
    setData(prev => toggleTask(prev, id));
  }

  function remove(id: string) {
    setData(prev => removeTask(prev, id));
  }

  function onDragStart(index: number, e: React.DragEvent) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }

  function onDragOver(index: number, e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onDrop(index: number, e: React.DragEvent) {
    e.preventDefault();
    const from = dragIndex ?? parseInt(e.dataTransfer.getData('text/plain') || '-1', 10);
    if (isNaN(from) || from === index) return;
    setData(prev => reorderTasks(prev, from, index));
    setDragIndex(null);
  }

  function onDragEnd() { setDragIndex(null); }

  function onEdit(t: Task) {
    setEditTask(t);
    setEditOpen(true);
  }

  function saveEditedTask(updated: Task) {
    setData(prev => {
      const idx = prev.tasks.findIndex(x => x.id === updated.id);
      if (idx === -1) return prev;
      const next = { ...prev, tasks: [...prev.tasks] };
      next.tasks[idx] = updated;
      return next;
    });
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
          <select className="input" value={selectedCategory} onChange={(e) => setSelectedCategory((e.target.value as Category) || '')}>
            <option value="">Category</option>
            <option value="deep_work">Deep Work / Focus</option>
            <option value="meetings">Meetings</option>
            <option value="admin_email">Admin & Email</option>
            <option value="planning_review">Planning & Review</option>
            <option value="research_learning">Research & Learning</option>
            <option value="writing_creative">Writing / Creative</option>
            <option value="health_fitness">Health & Fitness</option>
            <option value="family_friends">Family & Friends</option>
            <option value="errands_chores">Errands & Chores</option>
            <option value="hobbies_growth">Hobbies / Personal Growth</option>
          </select>
          <button className="btn btn-primary" onClick={addQuickTask}>{S.addButton}</button>
          <button className="btn" onClick={() => setShowModal(true)}>Add with details</button>
        </div>
        <div className="small muted" style={{ marginTop: 8 }}>
          {S.aim}
        </div>

        <div className="tasks" style={{ marginTop: 16 }}>
          {data.tasks.map((t, idx) => (
            <div
              key={t.id}
              className={`task ${t.category ? `cat-${t.category}` : ''}`}
              draggable
              onDragStart={(e) => onDragStart(idx, e)}
              onDragOver={(e) => onDragOver(idx, e)}
              onDrop={(e) => onDrop(idx, e)}
              onDragEnd={onDragEnd}
            >
              <button className={`checkbox ${t.done ? 'checked' : ''}`} aria-label="Toggle" onClick={() => toggle(t.id)}>
                {t.done ? '✓' : ''}
              </button>
              <div style={{ opacity: t.done ? 0.6 : 1 }} onClick={() => onEdit(t)}>
                <div style={{ textDecoration: t.done ? 'line-through' as const : 'none' }}>{emojiForCategory(t.category)} {t.title}</div>
                {(t.category || t.labels || t.startIso) && (
                  <div className="small muted">
                    {t.category ? categoryLabel(t.category) : ''}
                    {t.startIso ? ` · ${formatEventTime({ start: { dateTime: t.startIso }, end: t.endIso ? { dateTime: t.endIso } : undefined })}` : ''}
                    {t.attendee ? ` · with ${t.attendee}` : ''}
                    {t.labels ? ` · ${formatLabelsModern(t.labels)}` : ''}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
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
        <QuoteOfTheDay />
        <CalendarImport />
      </aside>

      <AddTaskModal open={showModal} onClose={() => setShowModal(false)} onSave={addDetailedTask} />
      <EditTaskModal open={editOpen} task={editTask} onClose={() => setEditOpen(false)} onSave={saveEditedTask} />
    </main>
  );
}

function emojiForCategory(c?: Category) {
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
  if (l.priority) parts.push(l.priority);
  if (l.energy) parts.push(l.energy);
  if (l.context) parts.push(l.context);
  if (l.duration) parts.push(l.duration);
  return parts.join(' · ');
}

function formatLabelsModern(l: NonNullable<Task['labels']>): string {
  const parts: string[] = [];
  if (l.urgency) parts.push(`Urgency: ${l.urgency}`);
  if (l.importance) parts.push(`Importance: ${l.importance}`);
  // backward-compat for old priority
  if (l.priority) {
    const map: Record<string, string> = { P1: 'High', P2: 'Medium', P3: 'Low' };
    parts.push(`Urgency: ${map[l.priority] || l.priority}`);
  }
  if (l.energy) parts.push(`Energy: ${l.energy}`);
  if (l.context) parts.push(`Context: ${l.context}`);
  if (l.duration) parts.push(`Duration: ${l.duration}`);
  return parts.join(' · ');
}