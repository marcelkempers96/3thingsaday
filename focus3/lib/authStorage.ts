import { safeGet, safeSet } from './safeStorage';

const REMEMBER_KEY = 'focus3_remember_supabase';
const MEMORY: Record<string, string | undefined> = {};

function shouldCookieMirror(key: string): boolean {
  return (
    key.startsWith('sb-') ||
    key.includes('supabase') ||
    key.includes('auth-token') ||
    key.includes('refresh-token')
  );
}

function prefersPersistent(): boolean {
	const v = safeGet(REMEMBER_KEY);
	return v === null ? true : v !== 'false';
}

function getFromLocal(key: string): string | null {
	try { return localStorage.getItem(key); } catch {}
	return null;
}
function setToLocal(key: string, value: string) {
	try { localStorage.setItem(key, value); return true; } catch {}
	return false;
}
function removeFromLocal(key: string) {
	try { localStorage.removeItem(key); return true; } catch {}
	return false;
}

function getFromSession(key: string): string | null {
	try { return sessionStorage.getItem(key); } catch {}
	return null;
}
function setToSession(key: string, value: string) {
	try { sessionStorage.setItem(key, value); return true; } catch {}
	return false;
}
function removeFromSession(key: string) {
	try { sessionStorage.removeItem(key); return true; } catch {}
	return false;
}

export const REMEMBER_STORAGE_KEY = REMEMBER_KEY;

export const authStorage = {
	getItem(key: string) {
		if (prefersPersistent()) {
			const v = getFromLocal(key);
			if (v !== null) return v;
			const c = safeGet(key); if (c !== null) return c;
			return MEMORY[key] ?? null;
		} else {
			const v = getFromSession(key);
			if (v !== null) return v;
			const c = safeGet(key); if (c !== null) return c;
			return MEMORY[key] ?? null;
		}
	},
	setItem(key: string, value: string) {
		if (prefersPersistent()) {
			if (!setToLocal(key, value)) { MEMORY[key] = value; }
			try { if (shouldCookieMirror(key)) safeSet(key, value); } catch {}
		} else {
			if (!setToSession(key, value)) { MEMORY[key] = value; }
			try { if (shouldCookieMirror(key)) safeSet(key, value); } catch {}
		}
	},
	removeItem(key: string) {
		if (prefersPersistent()) {
			if (!removeFromLocal(key)) { delete MEMORY[key]; }
			try { if (shouldCookieMirror(key)) safeSet(key, ''); } catch {}
		} else {
			if (!removeFromSession(key)) { delete MEMORY[key]; }
			try { if (shouldCookieMirror(key)) safeSet(key, ''); } catch {}
		}
	}
} as Storage;