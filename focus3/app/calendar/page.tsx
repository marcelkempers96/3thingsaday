"use client";

import { useMemo } from 'react';
import { loadAllDays } from '@/lib/storage';
import { loadProjects } from '@/lib/projects';
import Link from 'next/link';

export default function CalendarPage() {
	const days = useMemo(() => loadAllDays(), []);
	const projects = useMemo(() => loadProjects(), []);

	const entries = useMemo(() => {
		const map = new Map<string, { label: string }[]>();
		// project items
		for (const p of projects) {
			for (const it of p.items) {
				if (!it.dateIso) continue;
				const key = it.dateIso;
				if (!map.has(key)) map.set(key, []);
				map.get(key)!.push({ label: `${p.title}: ${it.type} — ${it.title}` });
			}
		}
		// tasks with start date
		for (const d of Object.values(days)) {
			for (const t of d.tasks) {
				if (!t.startIso) continue;
				const k = (t.startIso || '').slice(0, 10);
				if (!k) continue;
				if (!map.has(k)) map.set(k, []);
				map.get(k)!.push({ label: `Task: ${t.title}` });
			}
		}
		const arr = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
		return arr;
	}, [days, projects]);

	return (
		<main className="grid" style={{ marginTop: 8 }}>
			<section className="panel">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<h2 style={{ margin: 0 }}>Calendar</h2>
					<Link className="btn" href="/">← Back</Link>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
					{entries.map(([date, items]) => (
						<div key={date} className="panel">
							<strong>{new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit', weekday: 'short' })}</strong>
							<ul>
								{items.map((it, i) => <li key={i}>{it.label}</li>)}
							</ul>
						</div>
					))}
					{entries.length === 0 ? <div className="small muted">No dated items yet</div> : null}
				</div>
			</section>
		</main>
	);
}