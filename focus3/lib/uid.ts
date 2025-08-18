export function newId(): string {
	try {
		// @ts-ignore
		if (typeof crypto !== 'undefined' && crypto.randomUUID) {
			// @ts-ignore
			return crypto.randomUUID();
		}
	} catch {}
	return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}