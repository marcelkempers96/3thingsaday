"use client";

import { useSettings } from '@/app/providers';
import { getStrings } from '@/lib/i18n';

export default function FooterControls() {
	const { theme, setTheme, language, setLanguage, font, setFont, colorScheme, setColorScheme } = useSettings();
	const S = getStrings(language);
	return (
		<footer className="panel" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
				<div className="small muted">{language === 'zh' ? '偏好设置' : 'Preferences'}</div>
				<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
					<div>
						<label className="small muted">{language === 'zh' ? '主题' : 'Theme'}</label><br />
						<select className="input" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
							<option value="light">Light</option>
							<option value="dark">Dark</option>
						</select>
					</div>
					<div>
						<label className="small muted">{language === 'zh' ? '颜色' : 'Colors'}</label><br />
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
						<label className="small muted">{language === 'zh' ? '语言' : 'Language'}</label><br />
						<select className="input" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
							<option value="en">English</option>
							<option value="nl">Nederlands</option>
							<option value="zh">中文</option>
						</select>
					</div>
					<div>
						<label className="small muted">{language === 'zh' ? '字体' : 'Font'}</label><br />
						<select className="input" value={font} onChange={(e) => setFont(e.target.value as any)}>
							<option value="baloo">Baloo</option>
							<option value="nunito">Nunito</option>
							<option value="inter">Inter</option>
						</select>
					</div>
				</div>
			</div>
			<div className="small muted">{language === 'zh' ? '由 Marcel Kempers 专注打造' : 'Made with focus by Marcel Kempers'}</div>
		</footer>
	);
}