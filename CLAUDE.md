# FitFam

FitFam is a gamified hybrid-training (strength + endurance) PWA, built as a Next.js app, tied to an Instagram/TikTok fitness community. Points, streaks, leaderboards, and a Duolingo-style winding training roadmap are core, not decorative — they're the primary retention mechanic.

**Visual identity:** dark, dense, "athletic control-room" aesthetic — near-black surfaces, hairline borders instead of drop shadows, tabular numerals for live data, and a two-accent system (a hot ember/orange for action and streaks, a lime "volt" for completion/success) laid over a mostly-Hebrew RTL interface with embedded LTR numeric clusters (weights, times, BPM).

The design system was reverse-engineered from a Google Stitch export (`/design-reference/`), not designed from scratch. It contained three competing color-palette directions; this is now resolved: **"Legacy" is the canonical palette for the whole app**, with one confirmed exception — **the Training Roadmap screen uses its own "Obsidian Kinetic" skin** (true-black background, sharper ember/volt accents), since the user continued refining that specific screen in Stitch after the rest of the app was drafted. See [`docs/design-system/inconsistencies.md`](docs/design-system/inconsistencies.md) #1 and `tokens.md §1.5`.

## Where to look

- [`docs/design-system/tokens.md`](docs/design-system/tokens.md) — exact colors, type scale, spacing, radius, shadows, and the proposed `tailwind.config.js`.
- [`docs/design-system/components.md`](docs/design-system/components.md) — full component catalog (gamification primitives, workout/session components, leaderboard, generic UI), one section each, with source screens cited.
- [`docs/design-system/layout-patterns.md`](docs/design-system/layout-patterns.md) — page shell conventions, section ordering, grid/list patterns, proposed `/components` and `/app` folder structure.
- [`docs/design-system/inconsistencies.md`](docs/design-system/inconsistencies.md) — everything that disagreed across screens, with a recommendation, awaiting user confirmation.
- [`docs/design-system/screens-inventory.md`](docs/design-system/screens-inventory.md) — map of every exported screen/asset to what it contains and where it's used.

## Rules of thumb

- **Never hardcode a hex value, font size, spacing value, or radius in a component** — pull it from `docs/design-system/tokens.md` / the Tailwind theme it maps to.
- **Check `components.md` before creating a new component** — most workout/leaderboard/gamification UI already has a named counterpart there; extend it rather than duplicating.
- **Use the Legacy palette everywhere except the Training Roadmap screen**, which uses its own confirmed "Obsidian Kinetic" tokens (`tokens.md §1.5`) — don't let that screen's colors leak elsewhere, and don't build the Roadmap screen from `training_roadmap_path_1`/`path_2` (superseded); build it from `training_roadmap_path_3`.
- **Preserve the RTL/bilingual convention**: Hebrew content flows `dir="rtl"`, but numeric/Western data clusters (weights, times, BPM, dates) are wrapped `dir="ltr"` inline — see `tokens.md §2.4`.
- **The export is mobile-only** — there is no verified tablet/desktop layout; treat any responsive behavior as new design work, not extraction.
- Placeholder image URLs (`lh3.googleusercontent.com/...`) in the original export are Stitch scratch assets — never ship them; replace with real or self-hosted media.
