import { createClient } from '@supabase/supabase-js';
import { authStorage } from './authStorage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lxuvtdljnlearahrxnne.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dXZ0ZGxqbmxlYXJhaHJ4bm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTM2MTUsImV4cCI6MjA3MTEyOTYxNX0.x3dHK7ffTijz5M3bJDi2qNllYU7fyfT6g5gHQOP3YBM';

export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		persistSession: true,
		detectSessionInUrl: true,
		storage: authStorage
	}
});