"use client";

import { useMemo, useState } from 'react';
import { loadAllDays } from '@/lib/storage';
import { loadProjects } from '@/lib/projects';
import Link from 'next/link';

export default function CalendarPage() {
	const days = useMemo(() => loadAllDays(), []);
	const projects = useMemo(() => loadProjects(), []);
	const [view, setView] = useState<'day' | 'week' | 'month'>('week');
	const now = new Date();

	const entries = useMemo(() => collectEntries(days, projects), [days, projects]);

	return (
		<main className="grid" style={{ marginTop: 8 }}>
			<section className="panel">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<h2 style={{ margin: 0 }}>Calendar</h2>
					<Link className="btn" href="/">← Back</Link>
				</div>
				<div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
					<button className={`btn ${view==='day'?'btn-primary':''}`} onClick={() => setView('day')}>Day</button>
					<button className={`btn ${view==='week'?'btn-primary':''}`} onClick={() => setView('week')}>Week</button>
					<button className={`btn ${view==='month'?'btn-primary':''}`} onClick={() => setView('month')}>Month</button>
				</div>
				<div style={{ marginTop: 12 }}>
					{view === 'day' && <DayView date={now} entries={entries} />}
					{view === 'week' && <WeekView date={now} entries={entries} />}
					{view === 'month' && <MonthView date={now} entries={entries} />}
				</div>
			</section>
		</main>
	);
}

function collectEntries(days: ReturnType<typeof loadAllDays>, projects: ReturnType<typeof loadProjects>) {
	const map = new Map<string, string[]>();
	for (const p of projects) {
		for (const it of p.items) {
			if (!it.dateIso) continue;
			const key = it.dateIso;
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(`${p.title}: ${it.type} — ${it.title}`);
		}
	}
	for (const d of Object.values(days)) {
		for (const t of d.tasks) {
			if (!t.startIso) continue;
			const k = (t.startIso || '').slice(0, 10);
			if (!k) continue;
			if (!map.has(k)) map.set(k, []);
			map.get(k)!.push(`Task: ${t.title}`);
		}
	}
	return map;
}

function DayView({ date, entries }: { date: Date; entries: Map<string, string[]> }) {
	const key = date.toISOString().slice(0,10);
	const list = entries.get(key) || [];
	return (
		<div className="panel">
			<strong>{date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' })}</strong>
			<ul>{list.map((l, i) => <li key={i}>{l}</li>)}</ul>
		</div>
	);
}

function WeekView({ date, entries }: { date: Date; entries: Map<string, string[]> }) {
	const start = new Date(date); start.setDate(start.getDate() - start.getDay());
	const days: Date[] = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
	return (
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
			{days.map(d => {
				const key = d.toISOString().slice(0,10);
				const list = entries.get(key) || [];
				return (
					<div key={key} className="panel">
						<div className="small muted">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
						<strong>{d.getDate()}</strong>
						<ul>{list.map((l, i) => <li key={i}>{l}</li>)}</ul>
					</div>
				);
			})}
		</div>
	);
}

function MonthView({ date, entries }: { date: Date; entries: Map<string, string[]> }) {
	const first = new Date(date.getFullYear(), date.getMonth(), 1);
	const start = new Date(first); start.setDate(start.getDate() - ((start.getDay()+6)%7));
	const cells: Date[] = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
	return (
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
			{cells.map(d => {
				const key = d.toISOString().slice(0,10);
				const list = entries.get(key) || [];
				const isCurrentMonth = d.getMonth() === date.getMonth();
				return (
					<div key={key} className="panel" style={{ opacity: isCurrentMonth ? 1 : 0.6 }}>
						<div className="small muted">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
						<strong>{d.getDate()}</strong>
						<ul>{list.slice(0,3).map((l, i) => <li key={i}>{l}</li>)}</ul>
						{list.length > 3 ? <div className="small muted">+{list.length-3} more</div> : null}
					</div>
				);
			})}
		</div>
	);
}