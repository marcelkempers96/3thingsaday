"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSettings } from '@/app/providers';
import { getStrings } from '@/lib/i18n';

export default function ResponsiveHeader() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [userName, setUserName] = useState<string | null>(null);
	const { language } = useSettings();
	const S = getStrings(language);

	useEffect(() => { setOpen(false); }, [pathname]);

	useEffect(() => {
		let unsub: (() => void) | null = null;
		supabase.auth.getUser().then(({ data }) => {
			const u = data.user; if (!u) { setUserName(null); return; }
			const name = (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || u.email || null;
			setUserName(name);
		}).catch(() => {});
		const { data } = supabase.auth.onAuthStateChange((_event, session) => {
			const u = session?.user || null;
			if (!u) { setUserName(null); return; }
			const name = (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || u.email || null;
			setUserName(name);
		});
		unsub = () => { try { data.subscription.unsubscribe(); } catch {} };
		return () => { if (unsub) unsub(); };
	}, []);

	async function signOut() {
		try { await supabase.auth.signOut(); } catch {}
		try { window.dispatchEvent(new Event('focus3:refresh')); } catch {}
		try { window.location.href = '/sign-in'; } catch {}
	}

	return (
		<header className="header" style={{ position: 'sticky', top: 0, background: 'transparent', zIndex: 20, paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
			<div className="title">
				<span className="title-badge">⚡</span>
				<span>Focus3</span>
			</div>

			<nav className="nav desktop-only" role="navigation" aria-label="Main">
				<Link className={pathname === '/' ? 'active' : ''} href="/" prefetch={false}>{S.today}</Link>
				<Link className={pathname?.startsWith('/achievements') ? 'active' : ''} href="/achievements" prefetch={false}>{S.achievements}</Link>
				<Link className={pathname?.startsWith('/history') ? 'active' : ''} href="/history" prefetch={false}>{S.history}</Link>
				<Link className={pathname?.startsWith('/priority-matrix') ? 'active' : ''} href="/priority-matrix" prefetch={false}>Priority Matrix</Link>
				<Link className={pathname?.startsWith('/projects') ? 'active' : ''} href="/projects" prefetch={false}>Projects</Link>
				<Link className={pathname?.startsWith('/calendar') ? 'active' : ''} href="/calendar" prefetch={false}>Calendar</Link>
				{userName ? (
					<button className="btn" onClick={signOut}>{language === 'zh' ? '退出' : 'Sign out'}</button>
				) : (
					<Link className={pathname?.startsWith('/sign-in') ? 'active' : ''} href="/sign-in" prefetch={false}>{language === 'zh' ? '登录' : 'Sign In'}</Link>
				)}
				<Link className={pathname?.startsWith('/settings') ? 'active' : ''} href="/settings" prefetch={false}>Settings</Link>
			</nav>

			<div className="mobile-only">
				<button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} aria-expanded={open} aria-controls="mobile-menu">Menu ▾</button>
			</div>

			{open && (
				<div id="mobile-menu" className="panel" style={{ position: 'absolute', right: 24, top: 'calc(56px + env(safe-area-inset-top))', minWidth: 220, zIndex: 20 }} onClick={() => setOpen(false)} role="menu">
					<div className="tasks">
						<Link href="/" prefetch={false} className={pathname === '/' ? 'active' : ''} onClick={() => setOpen(false)}>{S.today}</Link>
						<Link href="/achievements" prefetch={false} className={pathname?.startsWith('/achievements') ? 'active' : ''} onClick={() => setOpen(false)}>{S.achievements}</Link>
						<Link href="/history" prefetch={false} className={pathname?.startsWith('/history') ? 'active' : ''} onClick={() => setOpen(false)}>{S.history}</Link>
						<Link href="/priority-matrix" prefetch={false} className={pathname?.startsWith('/priority-matrix') ? 'active' : ''} onClick={() => setOpen(false)}>Priority Matrix</Link>
						<Link href="/projects" prefetch={false} className={pathname?.startsWith('/projects') ? 'active' : ''} onClick={() => setOpen(false)}>Projects</Link>
						<Link href="/calendar" prefetch={false} className={pathname?.startsWith('/calendar') ? 'active' : ''} onClick={() => setOpen(false)}>Calendar</Link>
						{userName ? (
							<button className="btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); signOut(); }}>{language === 'zh' ? '退出' : 'Sign out'}</button>
						) : (
							<Link href="/sign-in" prefetch={false} className={pathname?.startsWith('/sign-in') ? 'active' : ''} onClick={() => setOpen(false)}>{language === 'zh' ? '登录' : 'Sign In'}</Link>
						)}
						<Link href="/settings" prefetch={false} className={pathname?.startsWith('/settings') ? 'active' : ''} onClick={() => setOpen(false)}>Settings</Link>
					</div>
				</div>
			)}
		</header>
	);
}