"use client";

import { useEffect, useMemo, useState } from 'react';
import { loadAllDays } from '@/lib/storage';
import { computeStreaks, computeBadges } from '@/lib/achievements';

export default function AchievementsPage() {
  const [refresh, setRefresh] = useState(0);

  // force re-render when coming back; lightweight approach
  useEffect(() => {
    const on = () => setRefresh(r => r + 1);
    window.addEventListener('focus', on);
    return () => window.removeEventListener('focus', on);
  }, []);

  const days = useMemo(() => loadAllDays(), [refresh]);
  const streaks = useMemo(() => computeStreaks(days), [days]);
  const badges = useMemo(() => computeBadges(streaks, days), [streaks, days]);

  const completionRate = useMemo(() => {
    const list = Object.values(days);
    if (list.length === 0) return 0;
    const completed = list.filter(d => d.tasks.length > 0 && d.tasks.every(t => t.done)).length;
    return Math.round((completed / list.length) * 100);
  }, [days]);

  return (
    <main className="grid" style={{ marginTop: 8 }}>
      <section className="panel">
        <h2 style={{ marginTop: 0 }}>Achievements</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <Card title="Current Streak" value={`${streaks.current} 🔥`} subtitle={`${streaks.best > 0 ? `Best: ${streaks.best} days` : 'Start today!'}`} />
          <Card title="All-time Days Logged" value={Object.keys(days).length.toString()} subtitle={`${completionRate}% days fully completed`} />
          <Card title="Tasks Completed" value={Object.values(days).reduce((s, d) => s + d.tasks.filter(t => t.done).length, 0).toString()} subtitle="Across all days" />
        </div>

        <hr className="hr" />

        <h3>Badges</h3>
        <div className="badges">
          {badges.map(b => (
            <div key={b.id} className={`badge ${b.earned ? 'earned' : ''}`}>
              <span>{b.icon}</span>
              <div>
                <div><strong>{b.title}</strong></div>
                <div className="small muted">{b.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Card({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div className="small muted">{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
      {subtitle ? <div className="small muted">{subtitle}</div> : null}
    </div>
  );
}