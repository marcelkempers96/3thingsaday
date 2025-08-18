"use client";

import { useEffect, useMemo, useState } from 'react';
import { loadProjects, saveProjects, type Project, type ProjectItemType } from '@/lib/projects';
import Link from 'next/link';

export default function ProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [title, setTitle] = useState('');
	const [desc, setDesc] = useState('');
	const [newItem, setNewItem] = useState<Record<string, { type: ProjectItemType; title: string; dateIso: string }>>({});

	useEffect(() => { setProjects(loadProjects()); }, []);
	useEffect(() => { saveProjects(projects); }, [projects]);

	function addProject() {
		const t = title.trim(); if (!t) return;
		setProjects(prev => [...prev, { id: crypto?.randomUUID ? crypto.randomUUID() : `p_${Date.now()}`, title: t, description: desc.trim() || undefined, items: [] }]);
		setTitle(''); setDesc('');
	}

	function addItemInline(pid: string) {
		const st = newItem[pid] || { type: 'goal', title: '', dateIso: '' };
		const t = (st.title || '').trim(); if (!t) return;
		const item = { id: crypto?.randomUUID ? crypto.randomUUID() : `i_${Date.now()}`, type: st.type, title: t, dateIso: st.dateIso || undefined };
		setProjects(prev => prev.map(p => p.id === pid ? { ...p, items: [...p.items, item] } : p));
		setNewItem(prev => ({ ...prev, [pid]: { type: 'goal', title: '', dateIso: '' } }));
	}

	function remove(pid: string) { setProjects(prev => prev.filter(p => p.id !== pid)); }

	return (
		<main className="grid" style={{ marginTop: 8 }}>
			<section className="panel">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<h2 style={{ margin: 0 }}>Projects</h2>
					<Link className="btn" href="/">← Back</Link>
				</div>
				<div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
					<input className="input" placeholder="New project title" value={title} onChange={e => setTitle(e.target.value)} />
					<input className="input" placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} />
					<button className="btn btn-primary" onClick={addProject}>Add project</button>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
					{projects.map(p => {
						const st = newItem[p.id] || { type: 'goal' as ProjectItemType, title: '', dateIso: '' };
						return (
							<div key={p.id} className="panel">
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<div>
										<strong>{p.title}</strong>
										{p.description ? <div className="small muted">{p.description}</div> : null}
									</div>
									<button className="btn" onClick={() => remove(p.id)}>Delete</button>
								</div>
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginTop: 8 }}>
									<select className="input" value={st.type} onChange={(e) => setNewItem(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || { title: '', dateIso: '' }), type: e.target.value as ProjectItemType } }))}>
										<option value="deadline">Deadline</option>
										<option value="milestone">Milestone</option>
										<option value="deliverable">Deliverable</option>
										<option value="goal">Goal</option>
									</select>
									<input className="input" placeholder="Title" value={st.title} onChange={(e) => setNewItem(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || { type: 'goal', dateIso: '' }), title: e.target.value } }))} />
									<input className="input" type="date" value={st.dateIso} onChange={(e) => setNewItem(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || { type: 'goal', title: '' }), dateIso: e.target.value } }))} />
									<button className="btn btn-primary" onClick={() => addItemInline(p.id)}>Add</button>
								</div>
								<div className="tasks" style={{ marginTop: 10 }}>
									{p.items.map(it => (
										<div key={it.id} className="task" style={{ gridTemplateColumns: '1fr auto' }}>
											<div>
												<div>{it.title}</div>
												<div className="small muted">{it.type} · {it.dateIso || 'no date'}</div>
											</div>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</section>
		</main>
	);
}