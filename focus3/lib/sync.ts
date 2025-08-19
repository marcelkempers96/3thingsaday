import { supabase } from './supabaseClient';
import { loadAllDays, saveAllDays, type DailyTasksByDate } from './storage';
import { loadProjects, saveProjects, type Project } from './projects';
import { safeGet, safeSet } from './safeStorage';
import { newId } from './uid';

export type CloudPayload = {
	days: DailyTasksByDate;
	projects: Project[];
	updatedAt: string;
	lastDevice?: { id: string; label: string };
};

const TABLE = 'user_data';
const LAST_SYNC_AT_KEY = 'focus3_last_sync_at';
const LAST_SYNC_DEVICE_KEY = 'focus3_last_sync_device';
const DEVICE_ID_KEY = 'focus3_device_id';

function getDeviceId(): string {
	const existing = safeGet(DEVICE_ID_KEY);
	if (existing) return existing;
	const id = newId();
	try { safeSet(DEVICE_ID_KEY, id); } catch {}
	return id;
}

function getDeviceLabel(): string {
	try {
		const ua = navigator.userAgent;
		const platform = (navigator as any)?.platform || '';
		return `${platform}`.trim() || ua.slice(0, 40);
	} catch { return 'unknown-device'; }
}

export async function syncPull(): Promise<boolean> {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return false;
	const { data, error } = await supabase.from(TABLE).select('payload').eq('user_id', user.id).single();
	if (error) return false;
	if (!data || !data.payload) return true;
	const payload = data.payload as CloudPayload;
	if (payload.days) saveAllDays(payload.days);
	if (payload.projects) saveProjects(payload.projects);
	try {
		safeSet(LAST_SYNC_AT_KEY, new Date().toISOString());
		if (payload.lastDevice) safeSet(LAST_SYNC_DEVICE_KEY, JSON.stringify(payload.lastDevice));
	} catch {}
	return true;
}

export async function syncPush(): Promise<boolean> {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return false;
	const payload: CloudPayload = {
		days: loadAllDays(),
		projects: loadProjects(),
		updatedAt: new Date().toISOString(),
		lastDevice: { id: getDeviceId(), label: getDeviceLabel() }
	};
	const { error } = await supabase.from(TABLE)
		.upsert({ user_id: user.id, payload })
		.select('user_id');
	const ok = !error;
	if (ok) {
		try {
			safeSet(LAST_SYNC_AT_KEY, payload.updatedAt);
			safeSet(LAST_SYNC_DEVICE_KEY, JSON.stringify(payload.lastDevice!));
		} catch {}
	}
	return ok;
}

export function getLastSyncInfo(): { at: string | null; device: { id: string; label: string } | null } {
	let at: string | null = null;
	let device: { id: string; label: string } | null = null;
	try { at = safeGet(LAST_SYNC_AT_KEY); } catch {}
	try { const raw = safeGet(LAST_SYNC_DEVICE_KEY); device = raw ? JSON.parse(raw) : null; } catch {}
	return { at, device };
}