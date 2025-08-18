"use client";

import { useEffect, useState } from 'react';
import { getTodayKey } from '@/lib/time';
import { useSettings } from '@/app/providers';
import { getStrings } from '@/lib/i18n';

type Quote = { content: string; author: string };

const LOCAL_QUOTES: Quote[] = [
	{ content: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' },
	{ content: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
	{ content: 'You don’t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
	{ content: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
	{ content: 'What you do every day matters more than what you do once in a while.', author: 'Gretchen Rubin' },
];

const STORAGE_KEY = 'focus3_qotd_v1';

export default function QuoteOfTheDay() {
	const { language } = useSettings();
	const S = getStrings(language);
	const [quote, setQuote] = useState<Quote | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const key = getTodayKey();
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			const map = raw ? (JSON.parse(raw) as Record<string, Quote>) : {};
			if (map[key]) { setQuote(map[key]); return; }
		} catch {}

		let cancelled = false;
		(async () => {
			try {
				const resp = await fetch('https://api.quotable.io/quotes/random?tags=inspirational|motivational', { cache: 'no-store' });
				if (!resp.ok) throw new Error('HTTP ' + resp.status);
				const data = await resp.json();
				const first = Array.isArray(data) ? data[0] : null;
				const q: Quote = first ? { content: first.content, author: first.author } : pickLocal();
				if (!cancelled) { setQuote(q); persistQuote(q); }
			} catch (e) {
				const q = pickLocal();
				if (!cancelled) { setQuote(q); persistQuote(q); setError('offline'); }
			}
		})();
		return () => { cancelled = true; };
	}, [language]);

	return (
		<section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
			<div className="small muted">{S.quoteOfTheDay}</div>
			{quote ? (
				<blockquote style={{ margin: 0 }}>
					<div style={{ fontSize: 16 }}>&ldquo;{quote.content}&rdquo;</div>
					<div className="small muted" style={{ marginTop: 6 }}>— {quote.author}</div>
				</blockquote>
			) : (
				<div className="small muted">Loading…</div>
			)}
		</section>
	);
}

function pickLocal(): Quote { return LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)]; }

function persistQuote(q: Quote) {
	try {
		const key = getTodayKey();
		const raw = localStorage.getItem(STORAGE_KEY);
		const map = raw ? (JSON.parse(raw) as Record<string, Quote>) : {};
		map[key] = q;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
	} catch {}
}