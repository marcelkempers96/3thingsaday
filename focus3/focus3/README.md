# Focus3 — 3 Things a Day

A tiny, offline-first Next.js app that helps you focus on 3–5 important things each day, with a countdown to midnight, check-offs, streaks, badges, and a history view. No servers or external APIs — everything is stored in your browser.

## Features
- 3–5 tasks per day with quick add and reordering
- Live countdown to end-of-day
- Check-off with progress bar
- Achievements: streaks and badges
- History of all days
- Offline storage via localStorage

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Build for production

```bash
npm run build
npm start
```

## Notes
- Data is saved in your browser (`localStorage`). Clearing site data resets progress.
- No external APIs required.