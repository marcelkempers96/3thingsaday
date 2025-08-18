import { safeGet, safeSet } from './safeStorage';
export type ProjectItemType = 'deadline' | 'milestone' | 'deliverable' | 'goal';
export type ProjectItem = {
	id: string;
	type: ProjectItemType;
	title: string;
	dateIso?: string;
};

export type Project = {
	id: string;
	title: string;
	description?: string;
	items: ProjectItem[];
};

const KEY = 'focus3_projects_v1';

export function loadProjects(): Project[] {
	if (typeof window === 'undefined') return [];
	try { const raw = safeGet(KEY); return raw ? JSON.parse(raw) as Project[] : []; } catch { return []; }
}

export function saveProjects(list: Project[]) {
	if (typeof window === 'undefined') return;
	try { safeSet(KEY, JSON.stringify(list)); } catch {}
	try { window.dispatchEvent(new Event('focus3:projects')); } catch {}
}

export function upsertProject(project: Project) {
	const list = loadProjects();
	const idx = list.findIndex(p => p.id === project.id);
	if (idx >= 0) list[idx] = project; else list.push(project);
	saveProjects(list);
}

export function removeProject(id: string) {
	const list = loadProjects().filter(p => p.id !== id);
	saveProjects(list);
}