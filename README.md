# FitFam

**Training that feels like a game.**

FitFam is a gamified training-plan app for hybrid athletes: people who mix strength and endurance (think HYROX-style training). Instead of a spreadsheet or a PDF, your plan becomes a map. Every week is a stage, every workout you finish earns points and keeps your streak alive, and the next stage unlocks when you complete the current one.

FitFam is tied to a real fitness community, [@fitfam_hybrid](https://www.instagram.com/fitfam_hybrid) on Instagram and TikTok.

## What the app does

- **Training roadmap:** a winding, week-by-week map of your plan. Completed weeks light up, the current week is live, and upcoming weeks stay locked until you get there.
- **Points and streaks:** finishing workouts earns points and builds a daily streak, so showing up is rewarded.
- **Progress tracking:** see how far you are through your plan and how each week went.
- **Leaderboards:** compare progress with the community.
- **AI-generated plans (planned):** training plans that adapt to you. The design for this is still open.

## Status

FitFam is in early development. What exists today:

- A Hebrew, right-to-left welcome page with an animated roadmap preview and two entry points: log in with Google, or create a new account.
- Installable PWA setup (web manifest, icons, service worker).
- A full design system reverse-engineered from the original Stitch designs, in [`docs/design-system/`](docs/design-system/).

Sign-in is not wired up yet, because the backend API does not exist yet. The buttons currently show a "coming soon" message.

## How it's built

This repository is the **web app** only. It is a pure client of the FitFam API (a separate Spring Boot service, in its own repo) and never talks to the database directly.

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS 4, design tokens from `docs/design-system/tokens.md` |
| Fonts | Heebo (headings) and Assistant (body), Hebrew + Latin |
| App type | Installable PWA, mobile-first, Hebrew RTL |
| Hosting | Vercel |
| Auth | Google Sign-In only, verified server-side by the API |

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

The service worker only registers in production, so to test installing the PWA use `npm run build && npm run start`.

## Project layout

```
app/                 Next.js routes, layout, manifest, icons
components/          UI components (welcome page auth buttons, hero roadmap map)
public/              Logo, PWA icons, service worker
docs/design-system/  Tokens, components, layout patterns, screen inventory
design-reference/    Original Google Stitch design export
```

## Design

The look is dark and dense, like an athletic control room: near-black surfaces, hairline borders, an ember-orange accent for action and streaks, and a lime "volt" accent for completion. The interface is Hebrew and right-to-left, with numbers (weights, times, points) kept left-to-right. See [`docs/design-system/`](docs/design-system/) for the full reference.
