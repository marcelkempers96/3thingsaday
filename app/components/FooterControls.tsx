"use client";

import { useSettings } from '@/app/providers';

export default function FooterControls() {
	const { theme, setTheme, language, setLanguage, font, setFont, googleClientId, setGoogleClientId } = useSettings();
	return (
		<footer className="panel" style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
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
				<div style={{ minWidth: 260 }}>
					<label className="small muted">Google OAuth Client ID (for Calendar)</label><br />
					<input className="input" placeholder="xxxxxxxx.apps.googleusercontent.com" value={googleClientId ?? ''} onChange={(e) => setGoogleClientId(e.target.value)} />
				</div>
			</div>
		</footer>
	);
}