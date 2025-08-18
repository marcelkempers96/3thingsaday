"use client";

import { useEffect, useState } from 'react';
import type { Category, Labels, Task } from '@/lib/storage';

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
	{ value: 'deep_work', label: 'Deep Work / Focus' },
	{ value: 'meetings', label: 'Google Meetings' },
	{ value: 'admin_email', label: 'Admin & Email' },
	{ value: 'planning_review', label: 'Planning & Review' },
	{ value: 'research_learning', label: 'Research & Learning' },
	{ value: 'writing_creative', label: 'Writing / Creative' },
	{ value: 'health_fitness', label: 'Health & Fitness' },
	{ value: 'family_friends', label: 'Family & Friends' },
	{ value: 'errands_chores', label: 'Errands & Chores' },
	{ value: 'hobbies_growth', label: 'Hobbies / Personal Growth' }
];

const URGENCY: Labels['urgency'][] = ['High', 'Medium', 'Low'];
const IMPORTANCE: Labels['importance'][] = ['High', 'Medium', 'Low'];

export default function EditTaskModal({ open, task, onClose, onSave }: {
	open: boolean;
	task: Task | null;
	onClose: () => void;
	onSave: (task: Task) => void;
}) {
	const [title, setTitle] = useState('');
	const [category, setCategory] = useState<Category | undefined>(undefined);
	const [labels, setLabels] = useState<Labels>({});

	useEffect(() => {
		if (open && task) {
			setTitle(task.title);
			setCategory(task.category);
			setLabels(task.labels || {});
		}
	}, [open, task]);

	function submit() {
		if (!task) return;
		onSave({ ...task, title: title.trim() || task.title, category, labels });
		onClose();
	}

	if (!open || !task) return null;
	return (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'grid', placeItems: 'center', zIndex: 50 }}>
			<div className="panel" style={{ width: 'min(640px, 92vw)' }}>
				<h3 style={{ marginTop: 0 }}>Edit Task</h3>
				<div style={{ display: 'grid', gap: 10 }}>
					<input className="input" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
					<div>
						<label className="small muted">Category</label>
						<select className="input" value={category ?? ''} onChange={(e) => setCategory((e.target.value || undefined) as any)}>
							<option value="">—</option>
							{CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
						</select>
					</div>
					<div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
						<div>
							<label className="small muted">Urgency</label>
							<select className="input" value={labels.urgency ?? ''} onChange={(e) => setLabels(l => ({ ...l, urgency: (e.target.value || undefined) as any }))}>
								<option value="">—</option>
								{URGENCY.map(p => <option key={p} value={p}>{p}</option>)}
							</select>
						</div>
						<div>
							<label className="small muted">Importance</label>
							<select className="input" value={labels.importance ?? ''} onChange={(e) => setLabels(l => ({ ...l, importance: (e.target.value || undefined) as any }))}>
								<option value="">—</option>
								{IMPORTANCE.map(e => <option key={e} value={e}>{e}</option>)}
							</select>
						</div>
					</div>
				</div>
				<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
					<button className="btn" onClick={onClose}>Cancel</button>
					<button className="btn btn-primary" onClick={submit}>Save</button>
				</div>
			</div>
		</div>
	);
}