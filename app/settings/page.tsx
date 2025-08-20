"use client";

import { useSettings } from '@/app/providers';
import { useMemo } from 'react';
import { getStrings } from '@/lib/i18n';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { loadAllDays, saveAllDays } from '@/lib/storage';
import { loadProjects, saveProjects } from '@/lib/projects';
import { getLastSyncInfo, syncPull, syncPush } from '@/lib/sync';

export default function SettingsPage() {
	const { countdownMode, setCountdownMode, sleepTimeHHMM, setSleepTime, customTimeHHMM, setCustomTime, mealTimes, setMealTimes, language, setLanguage, theme, setTheme, colorScheme, setColorScheme, font, setFont } = useSettings();
	const S = useMemo(() => getStrings(language), [language]);
	const [saved, setSaved] = useState<string>('');
	const fileRef = useRef<HTMLInputElement>(null);
	const [syncAt, setSyncAt] = useState<string | null>(null);
	const [syncDevice, setSyncDevice] = useState<{ id: string; label: string } | null>(null);

	useEffect(() => {
		const { at, device } = getLastSyncInfo();
		setSyncAt(at);
		setSyncDevice(device);
		const onLocal = () => { const { at, device } = getLastSyncInfo(); setSyncAt(at); setSyncDevice(device); };
		window.addEventListener('focus3:data', onLocal);
		window.addEventListener('focus3:projects', onLocal);
		return () => {
			window.removeEventListener('focus3:data', onLocal);
			window.removeEventListener('focus3:projects', onLocal);
		};
	}, []);

	function saveAll() { setSaved('Saved'); setTimeout(() => setSaved(''), 1500); }

	function exportData() {
		const data = { days: loadAllDays(), projects: loadProjects() };
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = 'focus3-data.json'; a.click();
		URL.revokeObjectURL(url);
	}
	function importData(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]; if (!file) return;
		file.text().then(txt => {
			try {
				const data = JSON.parse(txt);
				if (data.days) saveAllDays(data.days);
				if (data.projects) saveProjects(data.projects);
				setSaved('Imported');
				setTimeout(() => setSaved(''), 1500);
			} catch { alert('Invalid file'); }
		});
	}

	return (
		<main className="grid" style={{ marginTop: 8 }}>
			<section className="panel">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<h2 style={{ margin: 0 }}>Settings</h2>
					<Link className="btn" href="/">← Back</Link>
				</div>
				<div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
						<div>
							<label className="small muted">Theme</label><br />
							<select className="input" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
								<option value="light">Light</option>
								<option value="dark">Dark</option>
							</select>
						</div>
						<div>
							<label className="small muted">Colors</label><br />
							<select className="input" value={colorScheme} onChange={(e) => setColorScheme(e.target.value as any)}>
								<option value="apple">Apple Green</option>
								<option value="neonlime">Neon Lime</option>
								<option value="tangerine">Tangerine</option>
								<option value="sunflower">Sunflower</option>
								<option value="crimson">Crimson</option>
								<option value="coral">Coral Red</option>
								<option value="sky">Sky Blue</option>
								<option value="aqua">Aqua</option>
								<option value="royal">Royal Purple</option>
								<option value="amethyst">Amethyst</option>
								<option value="charcoal">Charcoal</option>
								<option value="graphite">Graphite</option>
								<option value="silver">Silver</option>
								<option value="porcelain">Porcelain</option>
								<option value="mint">Mint</option>
								<option value="blush">Blush</option>
							</select>
						</div>
						<div>
							<label className="small muted">Language</label><br />
							<select className="input" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
								<option value="en">English</option>
								<option value="nl">Nederlands</option>
								<option value="zh">中文</option>
							</select>
						</div>
						<div>
							<label className="small muted">Font</label><br />
							<select className="input" value={font} onChange={(e) => setFont(e.target.value as any)}>
								<option value="baloo">Baloo</option>
								<option value="nunito">Nunito</option>
								<option value="inter">Inter</option>
							</select>
						</div>
					</div>
					<div>
						<label className="small muted">Language</label><br />
						<select className="input" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
							<option value="en">English</option>
							<option value="nl">Nederlands</option>
							<option value="zh">中文</option>
						</select>
					</div>
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
					<div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
						<button className="btn btn-primary" onClick={saveAll}>Save</button>
						{saved ? <span className="small" style={{ color: 'var(--accent)' }}>✓ {saved}</span> : null}
					</div>
					<hr className="hr" />
					<div>
						<h4 style={{ margin: '8px 0' }}>Sync status</h4>
						<div className="small muted">Last sync: {syncAt ? new Date(syncAt).toLocaleString() : '—'}</div>
						<div className="small muted">Last device: {syncDevice ? syncDevice.label : '—'}</div>
						<div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
							<button className="btn" onClick={async () => { await syncPull(); const { at, device } = getLastSyncInfo(); setSyncAt(at); setSyncDevice(device); }}>Sync now (pull)</button>
							<button className="btn" onClick={async () => { await syncPush(); const { at, device } = getLastSyncInfo(); setSyncAt(at); setSyncDevice(device); }}>Sync now (push)</button>
						</div>
					</div>
					<hr className="hr" />
					<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
						<button className="btn" onClick={exportData}>Export data</button>
						<label className="btn">
							Import data
							<input type="file" accept="application/json" style={{ display: 'none' }} ref={fileRef} onChange={importData} />
						</label>
						<div className="small muted">Use this to move your data between devices.</div>
					</div>
				</div>
			</section>
		</main>
	);
}