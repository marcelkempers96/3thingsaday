import { createClient } from '@supabase/supabase-js';
import { safeGet, safeSet } from './safeStorage';

const supabaseUrl = 'https://lxuvtdljnlearahrxnne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dXZ0ZGxqbmxlYXJhaHJ4bm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTM2MTUsImV4cCI6MjA3MTEyOTYxNX0.x3dHK7ffTijz5M3bJDi2qNllYU7fyfT6g5gHQOP3YBM';

export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		persistSession: true,
		detectSessionInUrl: true,
		storage: {
			getItem: (key: string) => safeGet(key),
			setItem: (key: string, value: string) => { safeSet(key, value); },
			removeItem: (key: string) => { safeSet(key, ''); }
		} as any
	}
});