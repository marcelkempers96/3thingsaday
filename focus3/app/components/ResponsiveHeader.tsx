"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ResponsiveHeader() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	useEffect(() => { setOpen(false); }, [pathname]);

	return (
		<header className="header" style={{ position: 'sticky', top: 0, background: 'transparent', zIndex: 20, paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
			<div className="title">
				<span className="title-badge">⚡</span>
				<span>Focus3</span>
			</div>

			<nav className="nav desktop-only">
				<Link className={pathname === '/' ? 'active' : ''} href="/" prefetch={false}>Today</Link>
				<Link className={pathname?.startsWith('/achievements') ? 'active' : ''} href="/achievements" prefetch={false}>Achievements</Link>
				<Link className={pathname?.startsWith('/history') ? 'active' : ''} href="/history" prefetch={false}>History</Link>
				<Link className={pathname?.startsWith('/priority-matrix') ? 'active' : ''} href="/priority-matrix" prefetch={false}>Priority Matrix</Link>
				<Link className={pathname?.startsWith('/projects') ? 'active' : ''} href="/projects" prefetch={false}>Projects</Link>
				<Link className={pathname?.startsWith('/calendar') ? 'active' : ''} href="/calendar" prefetch={false}>Calendar</Link>
				<Link className={pathname?.startsWith('/sign-in') ? 'active' : ''} href="/sign-in" prefetch={false}>Sign In</Link>
				<Link className={pathname?.startsWith('/settings') ? 'active' : ''} href="/settings" prefetch={false}>Settings</Link>
			</nav>

			<div className="mobile-only">
				<button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} aria-expanded={open} aria-controls="mobile-menu">Menu ▾</button>
			</div>

			{open && (
				<div id="mobile-menu" className="panel" style={{ position: 'absolute', right: 24, top: 'calc(56px + env(safe-area-inset-top))', minWidth: 220, zIndex: 20 }} onClick={() => setOpen(false)}>
					<div className="tasks">
						<Link href="/" prefetch={false} className={pathname === '/' ? 'active' : ''} onClick={() => setOpen(false)}>Today</Link>
						<Link href="/achievements" prefetch={false} className={pathname?.startsWith('/achievements') ? 'active' : ''} onClick={() => setOpen(false)}>Achievements</Link>
						<Link href="/history" prefetch={false} className={pathname?.startsWith('/history') ? 'active' : ''} onClick={() => setOpen(false)}>History</Link>
						<Link href="/priority-matrix" prefetch={false} className={pathname?.startsWith('/priority-matrix') ? 'active' : ''} onClick={() => setOpen(false)}>Priority Matrix</Link>
						<Link href="/projects" prefetch={false} className={pathname?.startsWith('/projects') ? 'active' : ''} onClick={() => setOpen(false)}>Projects</Link>
						<Link href="/calendar" prefetch={false} className={pathname?.startsWith('/calendar') ? 'active' : ''} onClick={() => setOpen(false)}>Calendar</Link>
						<Link href="/sign-in" prefetch={false} className={pathname?.startsWith('/sign-in') ? 'active' : ''} onClick={() => setOpen(false)}>Sign In</Link>
						<Link href="/settings" prefetch={false} className={pathname?.startsWith('/settings') ? 'active' : ''} onClick={() => setOpen(false)}>Settings</Link>
					</div>
				</div>
			)}
		</header>
	);
}