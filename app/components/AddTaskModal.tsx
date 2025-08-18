"use client";

import { useEffect, useState } from 'react';
import type { Category, Labels, Task } from '@/lib/storage';

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
	{ value: 'deep_work', label: 'Deep Work / Focus' },
	{ value: 'meetings', label: 'Meetings' },
	{ value: 'admin_email', label: 'Admin & Email' },
	{ value: 'planning_review', label: 'Planning & Review' },
	{ value: 'research_learning', label: 'Research & Learning' },
	{ value: 'writing_creative', label: 'Writing / Creative' },
	{ value: 'health_fitness', label: 'Health & Fitness' },
	{ value: 'family_friends', label: 'Family & Friends' },
	{ value: 'errands_chores', label: 'Errands & Chores' },
	{ value: 'hobbies_growth', label: 'Hobbies / Personal Growth' }
];

const PRIORITY: Labels['priority'][] = ['P1', 'P2', 'P3'];
const ENERGY: Labels['energy'][] = ['High', 'Medium', 'Low'];
const CONTEXT: Labels['context'][] = ['Office', 'Home', 'Mobile'];
const DURATION: Labels['duration'][] = ['15m', '30m', '60m', '90m+'];

export default function AddTaskModal({ open, onClose, onSave }: {
	open: boolean;
	onClose: () => void;
	onSave: (task: Omit<Task, 'id' | 'done'>) => void;
}) {
	const [title, setTitle] = useState('');
	const [category, setCategory] = useState<Category | undefined>(undefined);
	const [labels, setLabels] = useState<Labels>({});

	useEffect(() => {
		if (!open) {
			setTitle('');
			setCategory(undefined);
			setLabels({});
		}
	}, [open]);

	function submit() {
		if (!title.trim()) return;
		onSave({ title: title.trim(), category, labels: Object.keys(labels).length ? labels : undefined });
		onClose();
	}

	if (!open) return null;
	return (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'grid', placeItems: 'center', zIndex: 50 }}>
			<div className="panel" style={{ width: 'min(640px, 92vw)' }}>
				<h3 style={{ marginTop: 0 }}>Add Task</h3>
				<div style={{ display: 'grid', gap: 10 }}>
					<input className="input" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
					<div>
						<label className="small muted">Category (optional)</label>
						<select className="input" value={category ?? ''} onChange={(e) => setCategory((e.target.value || undefined) as any)}>
							<option value="">—</option>
							{CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
						</select>
					</div>
					<div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
						<div>
							<label className="small muted">Priority</label>
							<select className="input" value={labels.priority ?? ''} onChange={(e) => setLabels(l => ({ ...l, priority: (e.target.value || undefined) as any }))}>
								<option value="">—</option>
								{PRIORITY.map(p => <option key={p} value={p}>{p}</option>)}
							</select>
						</div>
						<div>
							<label className="small muted">Energy</label>
							<select className="input" value={labels.energy ?? ''} onChange={(e) => setLabels(l => ({ ...l, energy: (e.target.value || undefined) as any }))}>
								<option value="">—</option>
								{ENERGY.map(e => <option key={e} value={e}>{e}</option>)}
							</select>
						</div>
						<div>
							<label className="small muted">Context</label>
							<select className="input" value={labels.context ?? ''} onChange={(e) => setLabels(l => ({ ...l, context: (e.target.value || undefined) as any }))}>
								<option value="">—</option>
								{CONTEXT.map(c => <option key={c} value={c}>{c}</option>)}
							</select>
						</div>
						<div>
							<label className="small muted">Duration</label>
							<select className="input" value={labels.duration ?? ''} onChange={(e) => setLabels(l => ({ ...l, duration: (e.target.value || undefined) as any }))}>
								<option value="">—</option>
								{DURATION.map(d => <option key={d} value={d}>{d}</option>)}
							</select>
						</div>
					</div>
				</div>
				<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
					<button className="btn" onClick={onClose}>Cancel</button>
					<button className="btn btn-primary" onClick={submit} disabled={!title.trim()}>Save</button>
				</div>
			</div>
		</div>
	);
}