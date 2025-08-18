"use client";

import { useMemo } from 'react';
import { loadAllDays, type Task } from '@/lib/storage';
import Link from 'next/link';

export default function PriorityMatrixPage() {
	const days = useMemo(() => loadAllDays(), []);
	const tasks: Task[] = useMemo(() => Object.values(days).flatMap(d => d.tasks), [days]);
	const groups = groupByQuadrant(tasks);

	return (
		<main className="grid" style={{ marginTop: 8 }}>
			<section className="panel">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<h2 style={{ margin: 0 }}>Priority Matrix</h2>
					<Link href="/" className="btn">← Back</Link>
				</div>
				<div className="small muted">Eisenhower Matrix: Urgency vs Importance</div>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
					<Quadrant title="Urgent & Important (Do first)" list={groups.UI} />
					<Quadrant title="Not Urgent & Important (Schedule)" list={groups.NU_I} />
					<Quadrant title="Urgent & Not Important (Delegate)" list={groups.U_NI} />
					<Quadrant title="Not Urgent & Not Important (Eliminate)" list={groups.NU_NI} />
				</div>
			</section>
		</main>
	);
}

function Quadrant({ title, list }: { title: string; list: Task[] }) {
	return (
		<div className="panel">
			<div className="small muted">{title}</div>
			<div className="tasks" style={{ marginTop: 8 }}>
				{list.length === 0 ? <div className="small muted">No tasks yet</div> : null}
				{list.map(t => (
					<div key={t.id} className={`task ${t.category ? `cat-${t.category}` : ''}`} style={{ gridTemplateColumns: '1fr auto' }}>
						<div>
							<div>{emojiForCategory(t.category)} {t.title}</div>
							<div className="small muted">{formatLabelsModern(t.labels || {})}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function groupByQuadrant(tasks: Task[]) {
	const isHigh = (v?: string | null) => (v || '').toLowerCase() === 'high';
	const isLow = (v?: string | null) => (v || '').toLowerCase() === 'low';
	const as = (t: Task) => ({
		urgent: isHigh(t.labels?.urgency) || t.labels?.priority === 'P1',
		important: isHigh(t.labels?.importance)
	});
	const UI: Task[] = [], NU_I: Task[] = [], U_NI: Task[] = [], NU_NI: Task[] = [];
	for (const t of tasks) {
		const { urgent, important } = as(t);
		if (urgent && important) UI.push(t);
		else if (!urgent && important) NU_I.push(t);
		else if (urgent && !important) U_NI.push(t);
		else NU_NI.push(t);
	}
	return { UI, NU_I, U_NI, NU_NI };
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

function formatLabelsModern(l: NonNullable<Task['labels']>): string {
	const parts: string[] = [];
	if (l.urgency) parts.push(`Urgency: ${l.urgency}`);
	if (l.importance) parts.push(`Importance: ${l.importance}`);
	return parts.join(' · ');
}