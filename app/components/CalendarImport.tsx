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

export default function CalendarImport() {
	const { googleClientId } = useSettings();
	const [token, setToken] = useState<string | null>(null);
	const [events, setEvents] = useState<EventItem[] | null>(null);
	const [loading, setLoading] = useState(false);
	const disabled = !googleClientId;

	useEffect(() => {
		if (!googleClientId) return;
		const scriptId = 'google-identity';
		if (document.getElementById(scriptId)) return;
		const s = document.createElement('script');
		s.src = 'https://accounts.google.com/gsi/client';
		s.async = true;
		s.defer = true;
		s.id = scriptId;
		document.head.appendChild(s);
	}, [googleClientId]);

	async function signIn() {
		if (!googleClientId) return;
		const oauth2 = window.google?.accounts?.oauth2;
		if (!oauth2) {
			alert('Google SDK not loaded yet. Wait a second and try again.');
			return;
		}
		const client = oauth2.initTokenClient({
			client_id: googleClientId,
			scope: 'https://www.googleapis.com/auth/calendar.readonly',
			callback: (response: { access_token: string }) => {
				setToken(response.access_token);
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
	}

	return (
		<section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
			<h3 style={{ marginTop: 0 }}>Google Calendar</h3>
			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
				<button className="btn btn-primary" onClick={signIn}>{token ? 'Signed in' : 'Sign in to Google'}</button>
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