export const metadata = {
  title: 'Focus3 — 3 Things a Day',
  description: 'Simple daily focus: 3–5 tasks, streaks, and achievements. Runs fully in your browser.'
};

import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Baloo_2 } from 'next/font/google';

const baloo = Baloo_2({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={baloo.className}>
        <div className="container">
          <header className="header">
            <div className="title">
              <span className="title-badge">⚡</span>
              <span>Focus3</span>
            </div>
            <nav className="nav">
              <Link href="/" prefetch={false}>Today</Link>
              <Link href="/achievements" prefetch={false}>Achievements</Link>
              <Link href="/history" prefetch={false}>History</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}