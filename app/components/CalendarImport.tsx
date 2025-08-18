"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSettings } from '@/app/providers';
import { upsertTask, loadToday, saveToday } from '@/lib/storage';

// Minimal gapi-free approach: Google Identity Services for OAuth2 token
// and direct fetch to Calendar API endpoints.

declare global {
	interface Window {
		google?: {
			accounts?: {
				oauth2?: {
					initTokenClient: (opts: {
						client_id: string;
						scope: string;
						callback: (response: { access_token: string }) => void;
					}) => { requestAccessToken: () => void };
				};
			};
		};
	}
}

type EventItem = {
	id: string;
	summary: string;
	start?: { date?: string; dateTime?: string };
	end?: { date?: string; dateTime?: string };
	attendees?: { email?: string; displayName?: string; organizer?: boolean }[];
	hangoutLink?: string;
	conferenceData?: unknown;
};

const DEFAULT_CLIENT_ID = '926648035624-ncv9e26jnh5rpm6tgte0jjdqul64b1j3.apps.googleusercontent.com';
const ACCOUNT_KEY = 'googleAccountName';

export default function CalendarImport() {
	const { googleClientId } = useSettings();
	const clientId = googleClientId || DEFAULT_CLIENT_ID;
	const [token, setToken] = useState<string | null>(null);
	const [accountName, setAccountName] = useState<string | null>(null);
	const [events, setEvents] = useState<EventItem[] | null>(null);
	const [loading, setLoading] = useState(false);
	const disabled = !clientId;

	useEffect(() => {
		if (!clientId) return;
		function trySilent() {
			const oauth2 = window.google?.accounts?.oauth2;
			if (!oauth2) return;
			const client = oauth2.initTokenClient({
				client_id: clientId,
				scope: 'https://www.googleapis.com/auth/calendar.readonly openid https://www.googleapis.com/auth/userinfo.profile',
				callback: (response: { access_token: string }) => {
					setToken(response.access_token);
					fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${response.access_token}` } })
						.then(r => r.ok ? r.json() : null)
						.then(info => { if (info?.name) { setAccountName(info.name as string); try { localStorage.setItem(ACCOUNT_KEY, info.name as string); } catch {} } })
						.catch(() => {});
				}
			});
			try { client.requestAccessToken(); } catch {}
		}

		const scriptId = 'google-identity';
		const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
		if (existing) {
			setTimeout(trySilent, 200);
			return;
		}
		const s = document.createElement('script');
		s.src = 'https://accounts.google.com/gsi/client';
		s.async = true;
		s.defer = true;
		s.id = scriptId;
		s.onload = () => setTimeout(trySilent, 50);
		document.head.appendChild(s);
	}, [clientId]);

	useEffect(() => {
		const savedAccountName = localStorage.getItem(ACCOUNT_KEY);
		if (savedAccountName) {
			setAccountName(savedAccountName);
		}
	}, []);

	async function signIn() {
		if (!clientId) return;
		const oauth2 = window.google?.accounts?.oauth2;
		if (!oauth2) {
			alert('Google SDK not loaded yet. Wait a second and try again.');
			return;
		}
		const client = oauth2.initTokenClient({
			client_id: clientId,
			scope: 'https://www.googleapis.com/auth/calendar.readonly openid https://www.googleapis.com/auth/userinfo.profile',
			callback: (response: { access_token: string }) => {
				setToken(response.access_token);
				fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${response.access_token}` } })
					.then(r => r.ok ? r.json() : null)
					.then(info => { if (info?.name) { setAccountName(info.name as string); try { localStorage.setItem(ACCOUNT_KEY, info.name as string); } catch {} } })
					.catch(() => {});
			}
		});
		client.requestAccessToken();
	}

	async function fetchTodayEvents() {
		if (!token) return;
		setLoading(true);
		try {
			const now = new Date();
			const start = new Date(now);
			start.setHours(0,0,0,0);
			const end = new Date(now);
			end.setHours(23,59,59,999);
			const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
			url.searchParams.set('timeMin', start.toISOString());
			url.searchParams.set('timeMax', end.toISOString());
			url.searchParams.set('singleEvents', 'true');
			url.searchParams.set('orderBy', 'startTime');
			url.searchParams.set('maxResults', '50');
			const resp = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
			if (!resp.ok) throw new Error('HTTP ' + resp.status);
			const data = await resp.json();
			const items: EventItem[] = (data.items || []).map((it: any) => ({
				id: it.id, summary: it.summary,
				start: it.start, end: it.end,
				attendees: it.attendees, hangoutLink: it.hangoutLink, conferenceData: it.conferenceData
			}));
			setEvents(items);
		} catch (e) {
			alert('Failed to fetch events. Check console.');
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	function addEventAsTask(item: EventItem) {
		const day = loadToday();
		const title = item.summary || 'Untitled event';
		const attendee = (item.attendees || []).find(a => !a.organizer)?.displayName || (item.attendees || []).find(a => !a.organizer)?.email;
		const next = upsertTask(day, {
			id: crypto.randomUUID(),
			title,
			done: false,
			category: 'meetings',
			source: 'google',
			startIso: item.start?.dateTime || item.start?.date,
			endIso: item.end?.dateTime || item.end?.date,
			attendee: attendee
		});
		saveToday(next);
		setEvents(prev => prev ? prev.filter(e => e.id !== item.id) : prev);
		// Notify the main page to refresh immediately
		try { window.dispatchEvent(new Event('focus3:refresh')); } catch {}
	}

	return (
		<section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
			<h3 style={{ marginTop: 0 }}>Google Calendar</h3>
			<div className="small muted">Connect to google to fetch daily meetings into your task list</div>
			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
				<button className="btn btn-primary" onClick={signIn}>{token ? 'Signed in' : 'Sign in to Google'}</button>
				{token ? <span className="small" style={{ color: 'var(--accent)' }}>✓ Signed in{accountName ? ` as: ${accountName}` : ''}</span> : null}
				<button className="btn" disabled={!token || loading} onClick={fetchTodayEvents}>{loading ? 'Loading…' : 'Fetch today\'s events'}</button>
			</div>
			{events && events.length > 0 && (
				<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
					<div className="small muted">Add to tasks:</div>
					{events.map(ev => (
						<div key={ev.id} className="task" style={{ gridTemplateColumns: '1fr auto' }}>
							<div>
								<div>📅 {ev.summary}</div>
								<div className="small muted">{formatEventTime(ev)} {formatAttendee(ev)}</div>
							</div>
							<button className="btn" onClick={() => addEventAsTask(ev)}>Add</button>
						</div>
					))}
				</div>
			)}
		</section>
	);
}

function formatEventTime(ev: EventItem): string {
	const start = ev.start?.dateTime || ev.start?.date;
	const end = ev.end?.dateTime || ev.end?.date;
	if (!start) return '';
	const s = new Date(start);
	const e = end ? new Date(end) : null;
	const sStr = s.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	const eStr = e ? e.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
	return e ? `${sStr} – ${eStr}` : sStr;
}

function formatAttendee(ev: EventItem): string {
	const a = (ev.attendees || []).find(x => !x.organizer);
	if (!a) return '';
	return `· with ${a.displayName || a.email}`;
}