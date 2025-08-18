"use client";

import { useSettings } from '@/app/providers';

export default function FooterControls() {
	const { theme, setTheme, language, setLanguage, font, setFont, colorScheme, setColorScheme } = useSettings();
	return (
		<footer className="panel" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
				<div className="small muted">Preferences</div>
				<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
							<option value="green">Green</option>
							<option value="blue">Blue</option>
							<option value="purple">Purple</option>
							<option value="orange">Orange</option>
							<option value="rose">Rose</option>
							<option value="teal">Teal</option>
							<option value="cyan">Cyan</option>
							<option value="amber">Amber</option>
							<option value="lime">Lime</option>
							<option value="indigo">Indigo</option>
						</select>
					</div>
					<div>
						<label className="small muted">Language</label><br />
						<select className="input" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
							<option value="en">English</option>
							<option value="nl">Nederlands</option>
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
			</div>
			<div className="small muted">Made with focus by Marcel Kempers</div>
		</footer>
	);
}