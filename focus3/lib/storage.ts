import { getTodayKey } from './time';
import { safeGet, safeSet } from './safeStorage';
import { setJSON } from './durable';

export type Category =
	| 'deep_work'
	| 'meetings'
	| 'admin_email'
	| 'planning_review'
	| 'research_learning'
	| 'writing_creative'
	| 'health_fitness'
	| 'family_friends'
	| 'errands_chores'
	| 'hobbies_growth';

export type Labels = {
	priority?: 'P1' | 'P2' | 'P3';
	urgency?: 'High' | 'Medium' | 'Low';
	importance?: 'High' | 'Medium' | 'Low';
	location?: 'Office' | 'Home' | 'Mobile';
	duration?: '15m' | '30m' | '60m' | '90m+';
	timeFromHHMM?: string;
	timeToHHMM?: string;
};

export type SourcePlatform = 'google' | 'teams' | 'zoom';

export type Task = {
	id: string;
	title: string;
	done: boolean;
	category?: Category;
	labels?: Labels;
	source?: SourcePlatform;
	startIso?: string;
	endIso?: string;
	attendee?: string;
	projectId?: string;
	projectItemId?: string;
};

export type DailyTasks = {
	dateKey: string;
	tasks: Task[];
};

export type DailyTasksByDate = Record<string, DailyTasks>;

const STORAGE_KEY = 'focus3_days_v1';

function loadRaw(): DailyTasksByDate {
	if (typeof window === 'undefined') return {};
	try {
		const raw = safeGet(STORAGE_KEY);
		if (!raw) return {};
		const data = JSON.parse(raw) as DailyTasksByDate;
		return data || {};
	} catch {
		return {};
	}
}

function saveRaw(map: DailyTasksByDate) {
	if (typeof window === 'undefined') return;
	try { if (safeSet(STORAGE_KEY, JSON.stringify(map))) window.dispatchEvent(new Event('focus3:data')); } catch {}
	try { setJSON(STORAGE_KEY, map); } catch {}
}

export function loadAllDays(): DailyTasksByDate { return loadRaw(); }

export function saveAllDays(map: DailyTasksByDate) {
	if (typeof window === 'undefined') return;
	try { if (safeSet(STORAGE_KEY, JSON.stringify(map))) window.dispatchEvent(new Event('focus3:data')); } catch {}
	try { setJSON(STORAGE_KEY, map); } catch {}
}

export function loadToday(now: number = Date.now()): DailyTasks {
	const key = getTodayKey(now);
	const all = loadRaw();
	return all[key] || { dateKey: key, tasks: [] };
}

export function saveToday(data: DailyTasks) {
	const all = loadRaw();
	all[data.dateKey] = data;
	saveRaw(all);
}

export function upsertTask(day: DailyTasks, task: Task): DailyTasks {
	const exists = day.tasks.findIndex(t => t.id === task.id);
	const tasks = [...day.tasks];
	if (exists >= 0) tasks[exists] = task; else tasks.push(task);
	return { ...day, tasks };
}

export function toggleTask(day: DailyTasks, taskId: string): DailyTasks {
	const tasks = day.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
	return { ...day, tasks };
}

export function removeTask(day: DailyTasks, taskId: string): DailyTasks {
	const tasks = day.tasks.filter(t => t.id !== taskId);
	return { ...day, tasks };
}

export function moveTask(day: DailyTasks, taskId: string, direction: -1 | 1): DailyTasks {
	const idx = day.tasks.findIndex(t => t.id === taskId);
	if (idx < 0) return day;
	const next = [...day.tasks];
	const newIndex = Math.max(0, Math.min(next.length - 1, idx + direction));
	const [item] = next.splice(idx, 1);
	next.splice(newIndex, 0, item);
	return { ...day, tasks: next };
}

export function reorderTasks(day: DailyTasks, fromIndex: number, toIndex: number): DailyTasks {
	const next = [...day.tasks];
	if (fromIndex < 0 || fromIndex >= next.length) return day;
	const clampedTo = Math.max(0, Math.min(next.length - 1, toIndex));
	const [item] = next.splice(fromIndex, 1);
	next.splice(clampedTo, 0, item);
	return { ...day, tasks: next };
}