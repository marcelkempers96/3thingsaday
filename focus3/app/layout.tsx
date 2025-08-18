export const metadata = {
  title: 'Focus3 — 3 Things a Day',
  description: 'Simple daily focus: 3–5 tasks, streaks, and achievements. Runs fully in your browser.'
};

import './globals.css';
import { ReactNode } from 'react';
import Providers from './providers';
import ResponsiveHeader from './components/ResponsiveHeader';
import FooterControls from './components/FooterControls';

function ErrorBoundary({ children }: { children: ReactNode }) {
  try { return <>{children}</>; } catch (e) { return <div className="panel">Something went wrong. Please refresh.</div>; }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="container">
            <ResponsiveHeader />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <FooterControls />
          </div>
        </Providers>
      </body>
    </html>
  );
}