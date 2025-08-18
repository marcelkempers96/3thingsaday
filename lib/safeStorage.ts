function getCookie(name: string): string | null {
	if (typeof document === 'undefined') return null;
	const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
	return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, value: string) {
	if (typeof document === 'undefined') return;
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

export function safeGet(key: string): string | null {
	if (typeof window === 'undefined') return null;
	try { const v = localStorage.getItem(key); if (v !== null) return v; } catch {}
	try { const v = sessionStorage.getItem(key); if (v !== null) return v; } catch {}
	try { const v = getCookie(key); if (v !== null) return v; } catch {}
	try {
		const map = JSON.parse(window.name || '{}') as Record<string,string>;
		if (map && typeof map === 'object' && key in map) return map[key];
	} catch {}
	return null;
}

export function safeSet(key: string, value: string): boolean {
	if (typeof window === 'undefined') return false;
	try { localStorage.setItem(key, value); return true; } catch {}
	try { sessionStorage.setItem(key, value); return true; } catch {}
	try { setCookie(key, value); return true; } catch {}
	try {
		let map: Record<string,string> = {};
		try { map = JSON.parse(window.name || '{}'); } catch { map = {}; }
		map[key] = value;
		window.name = JSON.stringify(map);
		return true;
	} catch {}
	return false;
}