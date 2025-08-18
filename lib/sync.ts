import { supabase } from './supabaseClient';
import { loadAllDays, saveAllDays, type DailyTasksByDate } from './storage';
import { loadProjects, saveProjects, type Project } from './projects';

export type CloudPayload = {
	days: DailyTasksByDate;
	projects: Project[];
	updatedAt: string;
};

const TABLE = 'user_data';

export async function syncPull(): Promise<boolean> {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return false;
	const { data, error } = await supabase.from(TABLE).select('payload').eq('user_id', user.id).single();
	if (error) return false;
	if (!data || !data.payload) return true;
	const payload = data.payload as CloudPayload;
	if (payload.days) saveAllDays(payload.days);
	if (payload.projects) saveProjects(payload.projects);
	return true;
}

export async function syncPush(): Promise<boolean> {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return false;
	const payload: CloudPayload = {
		days: loadAllDays(),
		projects: loadProjects(),
		updatedAt: new Date().toISOString()
	};
	const { error } = await supabase.from(TABLE)
		.upsert({ user_id: user.id, payload })
		.select('user_id');
	return !error;
}