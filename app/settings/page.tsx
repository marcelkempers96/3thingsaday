"use client";

import { useSettings } from '@/app/providers';
import Link from 'next/link';

export default function SettingsPage() {
	const { countdownMode, setCountdownMode, sleepTimeHHMM, setSleepTime, customTimeHHMM, setCustomTime, mealTimes, setMealTimes } = useSettings();
	return (
		<main className="grid" style={{ marginTop: 8 }}>
			<section className="panel">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<h2 style={{ margin: 0 }}>Settings</h2>
					<Link className="btn" href="/">← Back</Link>
				</div>
				<div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
					<div>
						<label className="small muted">Countdown target</label><br />
						<select className="input" value={countdownMode} onChange={(e) => setCountdownMode(e.target.value as any)}>
							<option value="endOfDay">End of day (23:59)</option>
							<option value="sleepTime">Sleep time</option>
							<option value="customTime">Custom time</option>
							<option value="nextMeal">Next meal</option>
						</select>
					</div>
					{countdownMode === 'sleepTime' ? (
						<div>
							<label className="small muted">Sleep time (HH:MM)</label><br />
							<input className="input" value={sleepTimeHHMM || ''} onChange={(e) => setSleepTime(e.target.value)} />
						</div>
					) : null}
					{countdownMode === 'customTime' ? (
						<div>
							<label className="small muted">Custom time (HH:MM)</label><br />
							<input className="input" value={customTimeHHMM || ''} onChange={(e) => setCustomTime(e.target.value)} />
						</div>
					) : null}
					{countdownMode === 'nextMeal' ? (
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
							<div>
								<label className="small muted">Breakfast</label><br />
								<input className="input" value={mealTimes?.breakfast || ''} onChange={(e) => setMealTimes({ ...mealTimes!, breakfast: e.target.value })} />
							</div>
							<div>
								<label className="small muted">Lunch</label><br />
								<input className="input" value={mealTimes?.lunch || ''} onChange={(e) => setMealTimes({ ...mealTimes!, lunch: e.target.value })} />
							</div>
							<div>
								<label className="small muted">Dinner</label><br />
								<input className="input" value={mealTimes?.dinner || ''} onChange={(e) => setMealTimes({ ...mealTimes!, dinner: e.target.value })} />
							</div>
						</div>
					) : null}
				</div>
			</section>
		</main>
	);
}