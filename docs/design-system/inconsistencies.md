# Flagged Inconsistencies — Needs Your Decision

These are called out rather than silently resolved. Each has a recommendation, but none is applied in `tokens.md`/`components.md` beyond marking a default — confirm before the Next.js build locks them in.

---

## 1. ✅ RESOLVED — Three competing color palettes

The export isn't one consistent design system — it's **three**, and only the training-roadmap screen was iterated across all three:

| Direction | Screens | Canvas | Ember | Volt | Blue | Font |
|---|---|---|---|---|---|---|
| **A — Legacy** | home, workout, leaderboard, onboarding, roadmap-1 (5/7) | `#131314` | `#ff5637`/`#ff5636` | `#a4d64c`/`#bdf532` | `#7bd0ff` | Heebo + Assistant |
| **B — Kinetic Obsidian** | roadmap-2 only | `#0a0a0b` | `#ff4f2e` | `#c6ff3d` | — | Rubik |
| **C — Obsidian Kinetic** | roadmap-3 only | `#0a0a0b`/`#09090b` | `#ff4322` | `#bef264` | `#38bdf8` | Heebo |

**The interesting part:** the two `DESIGN.md` briefs (`kinetic_obsidian/DESIGN.md`, `obsidian_kinetic/DESIGN.md`) are not generic mood text — their stated hex values match Direction B and Direction C **exactly** (ember/volt values are byte-for-byte identical). So the two written specs are documentation for the two *minority* palettes, while the *majority* of shipped screens use a third, undocumented palette (A) that predates both briefs.

**Why this matters:** picking a direction changes every hex in `tokens.md §1.3`, the Tailwind config, and likely the font loading strategy.

**Decision (from the user, 2026-09-20):** Direction A (Legacy) is canonical for the app as a whole. The Training Roadmap screen is the one confirmed exception — the user continued iterating on it directly in Google Stitch after the rest of the app was drafted, and **Direction C (Obsidian Kinetic / roadmap-3) is the final, up-to-date design for that screen specifically.** Roadmap-1 and roadmap-2 (Kinetic Obsidian) are now superseded explorations, kept only for history.

**Applied:** `tokens.md §0/§1.5` now documents Legacy as the app-wide palette and adds a scoped `roadmap.*` token group for the Roadmap screen; the Tailwind config proposal includes both. `obsidian_kinetic/DESIGN.md` is the source of truth for that screen's color/elevation/shape details. `components.md §2.4` (Roadmap Node/Path) and `screens-inventory.md` have been updated to point at roadmap-3 as the implementation target.

---

## 2. 🟡 Surface color drift (near-black card backgrounds)

At least 9 distinct hex values are used for "a card on a dark background," all visually within a few percent of each other: `#141416`, `#121215`, `#121214`, `#111114`, `#151517`, `#161618`, `#141417`, `#0e0e11`, `#0d0d0e`. This looks like drift from typing arbitrary hex by hand rather than a deliberate multi-tier elevation system (a real tiered system would show larger, intentional jumps, like the `well` vs `surface-raised` split does).

**Recommendation:** collapse to the 4-tier ramp already proposed in `tokens.md §1.1`: `canvas → surface (#141416) → surface-raised (#18181b) → surface-high (#201f22)`, plus a separate darker `well` (#0e0e11) reserved specifically for recessed numeric read-outs (timers, input wells) — not for general cards.

---

## 3. 🟡 Parallel gray systems for text

`roadmap_path_3` uses Tailwind's built-in `neutral-300/400/500` utilities instead of the custom hex grays (`#a1a1aa`/`#71717a`) used everywhere else. They're close in value but not identical, and mixing named-scale and arbitrary-hex grays in the same codebase makes future greps/refactors harder.

**Recommendation:** standardize on the custom hex grays (`text-primary #fafafa`, `text-secondary #a1a1aa`, `text-muted #71717a`) as Tailwind color tokens (see config in `tokens.md §8`) and stop using default `neutral-*`/`zinc-*` anywhere in the app.

Related: `text-on-surface` (config token, resolves to `#e5e2e3`) and literal `text-[#fafafa]` are both used for "primary heading text" across the export, at slightly different values. Recommend retiring the M3-style `on-surface` config token entirely — it's Stitch's Material 3 boilerplate, not something the screens consistently rely on.

---

## 4. 🟡 Three different logo executions

1. `fitfam_vector_logo_mark/code.html` — clean inline SVG, geometric "F" + lightning bolt, `#fafafa` on `#121214`, `#ff4322` bolt.
2. `fitfam_brand_logo/screen.png` — a separate raster lockup, and this is actually what's referenced via `<img src="https://lh3.googleusercontent.com/...">` in most screen headers (a hosted placeholder URL, not the local PNG).
3. Home dashboard's own header — a third, throwaway execution: a plain orange rounded-square with "FF" text, unrelated to either of the above.

**Recommendation:** standardize on the vector mark (#1) — it's resolution-independent, matches the ember accent, and works at favicon/PWA-icon sizes. Confirm, then generate the PWA icon set from it and replace every header's logo reference.

---

## 5. 🟢 Font-family application bug in roadmap-3

`training_roadmap_path_3` applies a `font-heebo` utility class directly (e.g. `class="font-heebo text-[22px] ..."`), but its Tailwind config never defines a `heebo` key in `fontFamily`, and Tailwind's JIT/CDN build silently drops unknown utility classes rather than erroring. In a live render this text would fall back to the browser default sans-serif instead of Heebo — likely an unintended regression versus the `font-['Heebo']` arbitrary-value syntax used correctly on the other screens (which loads Heebo directly without needing a config entry).

**Recommendation:** when rebuilding in Next.js this is moot (fonts will be wired through `next/font`/a real config), but it's worth knowing the mockup as rendered by Stitch likely didn't actually show Heebo on that screen — don't treat roadmap-3's screenshot typography as gospel if it looks like a generic sans-serif.

---

## 6. 🟢 Unverified/aspirational content, not extracted from a real screen

Flag these as "documented because the brief mentioned them," not because a screen demonstrates them:

- **Tablet/desktop breakpoints and grid** — only in the two `DESIGN.md` briefs, no coded screen shows a non-mobile layout.
- **Error/danger color usage** — only present as unused Tailwind config values (`#ffb4ab`/`#93000a`); no screen renders an error, empty, or destructive-action state.
- **Circular progress ring** — the brief's "progress rings" pattern only appears as linear bars in the export; a ring-style indicator would need original design work.
- **Achievement/badge-unlock moment** — no modal, toast, or unlock animation screen exists; closest analogues are the roadmap milestone node and the leaderboard gold rank badge.
- **Space Grotesk usage** — configured in `fontSize`/`fontFamily` tokens (`metric-*`, `label-technical`) on 5 screens, but the actual visible numerals in the markup are set in Heebo via explicit overrides. Space Grotesk may never actually render anywhere in the current export.

**Recommendation:** treat all five as gaps to design deliberately, not values to blindly extract.
