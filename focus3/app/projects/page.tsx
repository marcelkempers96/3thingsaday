"use client";

import { useEffect, useMemo, useState } from 'react';
import { loadProjects, saveProjects, type Project, type ProjectItem, type ProjectItemType } from '@/lib/projects';
import Link from 'next/link';

export default function ProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [title, setTitle] = useState('');
	const [desc, setDesc] = useState('');

	useEffect(() => { setProjects(loadProjects()); }, []);
	useEffect(() => { saveProjects(projects); }, [projects]);

	function addProject() {
		const t = title.trim(); if (!t) return;
		setProjects(prev => [...prev, { id: crypto.randomUUID(), title: t, description: desc.trim() || undefined, items: [] }]);
		setTitle(''); setDesc('');
	}

	function addItem(pid: string, type: ProjectItemType) {
		const title = prompt('Title')?.trim(); if (!title) return;
		const dateIso = prompt('Date (YYYY-MM-DD)')?.trim() || undefined;
		setProjects(prev => prev.map(p => p.id === pid ? { ...p, items: [...p.items, { id: crypto.randomUUID(), type, title, dateIso }] } : p));
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
					{projects.map(p => (
						<div key={p.id} className="panel">
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<div>
									<strong>{p.title}</strong>
									{p.description ? <div className="small muted">{p.description}</div> : null}
									<div className="small muted">Project ID: {p.id}</div>
								</div>
								<button className="btn" onClick={() => remove(p.id)}>Delete</button>
							</div>
							<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
								<button className="btn" onClick={() => addItem(p.id, 'deadline')}>+ Deadline</button>
								<button className="btn" onClick={() => addItem(p.id, 'milestone')}>+ Milestone</button>
								<button className="btn" onClick={() => addItem(p.id, 'deliverable')}>+ Deliverable</button>
								<button className="btn" onClick={() => addItem(p.id, 'goal')}>+ Goal</button>
							</div>
							<div className="tasks" style={{ marginTop: 10 }}>
								{p.items.map(it => (
									<div key={it.id} className="task" style={{ gridTemplateColumns: '1fr auto' }}>
										<div>
											<div>{it.title}</div>
											<div className="small muted">{it.type} · {it.dateIso || 'no date'}</div>
											<div className="small muted">Item ID: {it.id}</div>
										</div>
										{/* Could add remove/edit per item later */}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</section>
		</main>
	);
}