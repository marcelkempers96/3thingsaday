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
			</nav>

			<div className="mobile-only">
				<button className="btn btn-primary" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="mobile-menu">Menu ▾</button>
			</div>

			{open && (
				<div id="mobile-menu" className="panel" style={{ position: 'absolute', right: 24, top: 'calc(56px + env(safe-area-inset-top))', minWidth: 220 }}>
					<div className="tasks">
						<Link href="/" prefetch={false} className={pathname === '/' ? 'active' : ''}>Today</Link>
						<Link href="/achievements" prefetch={false} className={pathname?.startsWith('/achievements') ? 'active' : ''}>Achievements</Link>
						<Link href="/history" prefetch={false} className={pathname?.startsWith('/history') ? 'active' : ''}>History</Link>
					</div>
				</div>
			)}
		</header>
	);
}