"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { safeSet } from '@/lib/safeStorage';

export default function SignInPage() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState('');
	const [remember, setRemember] = useState(true);

	const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
	const origin = typeof window !== 'undefined' ? window.location.origin : '';
	const redirectTo = `${origin}${basePath || ''}/`;

	useEffect(() => {
		// If already signed in, go home (after a short tick for Safari cookie read)
		const t = setTimeout(() => {
			supabase.auth.getSession().then(({ data }) => {
				if (data.session) window.location.href = redirectTo;
			});
		}, 50);
		return () => clearTimeout(t);
	}, [redirectTo]);

	function setRememberFlag(v: boolean) {
		setRemember(v);
		try { safeSet('focus3_remember_supabase', String(v)); } catch {}
	}

	async function signInWithEmail() {
		setLoading(true); setMsg('');
		try { safeSet('focus3_remember_supabase', String(remember)); } catch {}
		const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } });
		setLoading(false);
		setMsg(error ? error.message : 'Check your email for the login link.');
	}

	async function signInWithGoogle() {
		setLoading(true); setMsg('');
		try { safeSet('focus3_remember_supabase', String(remember)); } catch {}
		const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'consent' } } });
		setLoading(false);
		if (error) setMsg(error.message);
	}

	return (
		<main className="grid" style={{ marginTop: 8 }}>
			<section className="panel" style={{ maxWidth: 520, margin: '0 auto' }}>
				<h2 style={{ marginTop: 0 }}>Sign In</h2>
				<div className="small muted">Create an account to sync your Focus3 data across devices.</div>
				<div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
					<input className="input" placeholder="your@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
					<label className="small" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<input type="checkbox" checked={remember} onChange={(e) => setRememberFlag(e.target.checked)} /> Remember me
					</label>
					<button className="btn btn-primary" onClick={signInWithEmail} disabled={loading || !email}>Send magic link</button>
					<div className="small muted" style={{ textAlign: 'center' }}>or</div>
					<button className="btn" onClick={signInWithGoogle} disabled={loading}>Continue with Google</button>
					{msg ? <div className="small muted">{msg}</div> : null}
					<div className="small muted">Back to <Link href="/">Today</Link></div>
				</div>
			</section>
		</main>
	);
}