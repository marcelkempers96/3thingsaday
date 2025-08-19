"use client";

import { useEffect, useMemo, useState } from 'react';
import type { Category, Labels, Task } from '@/lib/storage';
import { loadProjects, type Project } from '@/lib/projects';
import { getTodayKey } from '@/lib/time';

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

const URGENCY: Labels['urgency'][] = ['High', 'Medium', 'Low'];
const IMPORTANCE: Labels['importance'][] = ['High', 'Medium', 'Low'];
const LOCATION: NonNullable<Labels['location']>[] = ['Office', 'Home', 'Mobile'];
const DURATION: Labels['duration'][] = ['15m', '30m', '60m', '90m+'];

export default function AddTaskModal({ open, onClose, onSave }: {
	open: boolean;
	onClose: () => void;
	onSave: (task: Omit<Task, 'id' | 'done'>, dateKey?: string) => void;
}) {
	const [title, setTitle] = useState('');
	const [category, setCategory] = useState<Category | undefined>(undefined);
	const [labels, setLabels] = useState<Labels>({});
	const [projectId, setProjectId] = useState<string>('');
	const [projectItemId, setProjectItemId] = useState<string>('');
	const [projects, setProjects] = useState<Project[]>([]);
	const [timeFrom, setTimeFrom] = useState<string>('');
	const [timeTo, setTimeTo] = useState<string>('');
	const [dateMode, setDateMode] = useState<'today' | 'tomorrow' | 'other'>('today');
	const [otherDate, setOtherDate] = useState<string>('');

	useEffect(() => { if (open) setProjects(loadProjects()); }, [open]);
	const itemsForProject = useMemo(() => projects.find(p => p.id === projectId)?.items || [], [projects, projectId]);

	useEffect(() => {
		if (!open) {
			setTitle(''); setCategory(undefined); setLabels({}); setProjectId(''); setProjectItemId(''); setTimeFrom(''); setTimeTo(''); setDateMode('today'); setOtherDate('');
		}
	}, [open]);

	function submit() {
		if (!title.trim()) return;
		const finalLabels: Labels = { ...labels };
		if (timeFrom) finalLabels.timeFromHHMM = timeFrom;
		if (timeTo) finalLabels.timeToHHMM = timeTo;
		let dateKey: string | undefined = undefined;
		if (dateMode === 'tomorrow') {
			const d = new Date(); d.setDate(d.getDate() + 1);
			dateKey = getTodayKey(d.getTime());
		} else if (dateMode === 'other') {
			if (!otherDate) return; // require date when choosing other
			dateKey = otherDate;
		}
		onSave({ title: title.trim(), category, labels: Object.keys(finalLabels).length ? finalLabels : undefined, projectId: projectId || undefined, projectItemId: projectItemId || undefined }, dateKey);
		onClose();
	}

	if (!open) return null;
	return (
		<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'grid', placeItems: 'center', zIndex: 50 }}>
			<div className="panel" style={{ width: 'min(640px, 92vw)', maxHeight: '90vh', overflow: 'auto' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<h3 style={{ marginTop: 0 }}>Add Task</h3>
					<button className="btn btn-primary" onClick={submit} disabled={!title.trim()}>Save</button>
				</div>
				<div style={{ display: 'grid', gap: 10 }}>
					<input className="input" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />

					<div>
						<label className="small muted">Add to</label>
						<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
							<button type="button" className={`btn ${dateMode === 'today' ? 'btn-primary' : ''}`} onClick={() => setDateMode('today')}>Today</button>
							<button type="button" className={`btn ${dateMode === 'tomorrow' ? 'btn-primary' : ''}`} onClick={() => setDateMode('tomorrow')}>Tomorrow</button>
							<div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
								<button type="button" className={`btn ${dateMode === 'other' ? 'btn-primary' : ''}`} onClick={() => setDateMode('other')}>Other</button>
								{dateMode === 'other' ? <input className="input" type="date" value={otherDate} onChange={e => setOtherDate(e.target.value)} /> : null}
							</div>
						</div>
					</div>

					<div>
						<label className="small muted">Project (optional)</label>
						<select className="input" value={projectId} onChange={(e) => { setProjectId(e.target.value); setProjectItemId(''); }}>
							<option value="">—</option>
							{projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
						</select>
					</div>
					<div>
						<label className="small muted">Project item (optional)</label>
						<select className="input" value={projectItemId} onChange={(e) => setProjectItemId(e.target.value)} disabled={!projectId}>
							<option value="">—</option>
							{itemsForProject.map(it => <option key={it.id} value={it.id}>{it.type} — {it.title}</option>)}
						</select>
					</div>

					<div>
						<label className="small muted">Category (optional)</label>
						<select className="input" value={category ?? ''} onChange={(e) => setCategory((e.target.value || undefined) as any)}>
							<option value="">—</option>
							{CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
						</select>
					</div>

					<div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
						<div>
							<label className="small muted">Importance (optional)</label>
							<select className="input" value={labels.importance ?? ''} onChange={(e) => setLabels(l => ({ ...l, importance: (e.target.value || undefined) as any }))}>
								<option value="">—</option>
								{IMPORTANCE.map(e => <option key={e} value={e}>{e}</option>)}
							</select>
						</div>
						<div>
							<label className="small muted">Urgency (optional)</label>
							<select className="input" value={labels.urgency ?? ''} onChange={(e) => setLabels(l => ({ ...l, urgency: (e.target.value || undefined) as any }))}>
								<option value="">—</option>
								{URGENCY.map(p => <option key={p} value={p}>{p}</option>)}
							</select>
						</div>
						<div>
							<label className="small muted">Location</label>
							<select className="input" value={labels.location ?? ''} onChange={(e) => setLabels(l => ({ ...l, location: (e.target.value || undefined) as any }))}>
								<option value="">—</option>
								{LOCATION.map(e => <option key={e} value={e}>{e}</option>)}
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

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
						<div>
							<label className="small muted">Time from</label>
							<input className="input" type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} />
						</div>
						<div>
							<label className="small muted">Time to</label>
							<input className="input" type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} />
						</div>
					</div>
				</div>
				<div style={{ position: 'sticky', bottom: 0, display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12, background: 'var(--panel)', paddingTop: 8 }}>
					<button className="btn" onClick={onClose}>Cancel</button>
				</div>
			</div>
		</div>
	);
}