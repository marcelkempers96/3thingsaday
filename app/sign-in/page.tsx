"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function SignInPage() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState('');

	async function signInWithEmail() {
		setLoading(true); setMsg('');
		const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/' } });
		setLoading(false);
		setMsg(error ? error.message : 'Check your email for the login link.');
	}

	async function signInWithGoogle() {
		setLoading(true); setMsg('');
		const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/' } });
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