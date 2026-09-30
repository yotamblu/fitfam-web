# FitFam Design Tokens

Source: reverse-engineered from the Google Stitch export in `/design-reference/` (7 coded screens + 2 AI-authored `DESIGN.md` briefs). All values below are **exact**, taken from the literal Tailwind classes / arbitrary values in the exported `code.html` files — not eyeballed from screenshots.

> ✅ **Decision made (see [`inconsistencies.md`](./inconsistencies.md) #1):** the export contained three competing color palettes. **Legacy is the canonical app-wide design system.** The one deliberate exception is the **Training Roadmap screen**, which is confirmed to use the **Obsidian Kinetic** (roadmap-3) skin as its final, up-to-date design — that direction was iterated on directly with the user in Google Stitch after the rest of the app was drafted, so it supersedes roadmap-1 and roadmap-2 for that screen specifically. Treat it as a themed sub-system scoped to `RoadmapPath`/`RoadmapNode` and their immediate container, not a hint to migrate the whole app.

---

## 0. The two palettes in play

| Direction | Scope | Background | Ember (primary) | Volt (secondary) | Info blue | Heading font |
|---|---|---|---|---|---|---|
| **Legacy — app-wide canonical** | Everything except the Training Roadmap screen: home_dashboard, active_workout_session, leaderboard_progress, onboarding_level_selection, and the roadmap's own shell (header/nav) | `#131314` | `#ff5637` (also `#ff5636` in config) | `#a4d64c` (also `#bdf532` in config) | `#7bd0ff` | Heebo |
| **Obsidian Kinetic — Roadmap screen only** | Training Roadmap content area (`RoadmapPath`, `RoadmapNode`, the mission cards) | `#0a0a0b`/`#09090b` | `#ff4322` | `#bef264` | `#38bdf8` | Heebo |

`training_roadmap_path_1` and `training_roadmap_path_2` (Kinetic Obsidian) are now **superseded explorations** — kept in the export/docs for history, not to be built from. `obsidian_kinetic/DESIGN.md` documents the confirmed Roadmap skin in full detail (colors, elevation, shapes, component specs) and should be read alongside this file when building that screen. **All tables below default to the Legacy palette**; §1.5 covers the Roadmap-specific override values.

---

## 1. Color Palette

### 1.1 Surfaces (neutral ramp — Legacy)

| Role | Hex | Notes |
|---|---|---|
| `canvas` (app background) | `#131314` | Body bg on 5/7 screens. Alt: `#0a0a0b` (roadmap-2/3, and both DESIGN.md briefs use true-black). |
| `surface` (card/module base) | `#141416` | Canonical pick — see drift list below. |
| `surface-raised` (chips, steppers, interactive fills) | `#18181b` | Very consistent across screens as-is. |
| `surface-high` (nested emphasis, active tab track) | `#201f22` | |
| `well` (recessed data wells, inset numeric displays) | `#0e0e11` | Darker than `surface`, used for input wells / timer wells. Alt seen: `#09090b`. |
| `border` (hairline) | `#27272a` | The single most consistent token in the whole export — used almost everywhere. |
| `border-emphasis` (focus/active/lighter divider) | `#3f3f46` | |

**Surface color drift (needs consolidation):** the export uses at least 9 distinct near-black hex values for "a card": `#141416`, `#121215`, `#121214`, `#111114`, `#151517`, `#161618`, `#141417`, `#0e0e11`, `#0d0d0e`. Visually indistinguishable; almost certainly unintentional drift from hand-typed arbitrary values rather than a deliberate multi-tier system. See inconsistencies.md #2.

### 1.2 Text

| Role | Hex | Notes |
|---|---|---|
| `text-primary` | `#fafafa` | Used as literal on headings/numerals in most screens. |
| `text-primary` (token variant) | `#e5e2e3` | This is what `text-on-surface` resolves to via the Tailwind config, and it's also the CSS `body{color:...}` default. Competes with `#fafafa` above — same role, two values. |
| `text-secondary` | `#a1a1aa` | Consistent. |
| `text-muted` / disabled | `#71717a` | Consistent. |
| `text-rank-neutral` (one-off) | `#d4d4d8` | Leaderboard 2nd/3rd place badge text only. |

### 1.5 Roadmap-screen override tokens (Obsidian Kinetic — confirmed final for this screen)

Scope these to the Roadmap route/components only (e.g. a `data-theme="roadmap"` wrapper or a dedicated `roadmap.*` Tailwind color group) — do not apply app-wide:

| Role | Hex | Notes |
|---|---|---|
| `roadmap-canvas` | `#0a0a0b` | True black; the Roadmap page's own background image/gradient layer sits on this, not on the app's normal `#131314` canvas. |
| `roadmap-surface` | `#121214` / `#151517` | Node metadata cards, mission card. |
| `roadmap-border` | `#27272a` | Same hairline value as the rest of the app — kept consistent. |
| `roadmap-ember` | `#ff4322` | Active node, active CTA, "live now" tag. |
| `roadmap-volt` | `#bef264` | Completed node, completed track segment, positive deltas. |
| `roadmap-info` | `#38bdf8` | Not used directly on this screen's nodes but shared with the leaderboard's blue accent — keep for consistency if the roadmap ever surfaces pacing/HR data. |
| `roadmap-text-primary` | `#ffffff`/`#fafafa` | Node titles. |
| `roadmap-text-secondary` | `#a1a1aa`/neutral-400 | Node subtitles (see inconsistencies.md #3 re: neutral-* usage on this screen — acceptable to keep scoped here since it's an isolated skin, but don't let it leak into the rest of the app). |

Full elevation/shape/component detail for this skin is already written up in `obsidian_kinetic/DESIGN.md` at the repo root — treat that file as the source of truth for the Roadmap screen's internals (button heights, set-row states, chip sizing, etc. described there apply conceptually even though that doc was originally written for a workout-logging context; for the Roadmap screen, apply its color/elevation/shape sections and defer to `components.md §2.4` for the actual Roadmap-specific component structure).

**roadmap_path_3 also uses Tailwind's built-in `neutral-300/400/500` utilities** (`#d4d4d8`/`#a3a3a3`/`#737373`) instead of the project's custom grays — a fourth, parallel gray system. Flagged in inconsistencies.md #3.

### 1.3 Accent colors (role-based, Legacy palette)

| Role | Hex | Used for | Screens |
|---|---|---|---|
| **Ember** (primary/CTA/streak/active) | `#ff5637` | Primary buttons, streak flame, active states, "start workout" | home, onboarding(`#ff4322` variant — see below), roadmap-1 (`#ff5636` via config) |
| **Volt** (secondary/success/completion) | `#a4d64c` | Completion checks, positive deltas, readiness score | home, leaderboard |
| **Volt** (config value) | `#bdf532` | Same role, different exact hex, from the shared Tailwind config `secondary` token | roadmap-1, and the `tailwind-config` block on every Legacy screen |
| **Info / telemetry blue** | `#7bd0ff` | Pool/swim icon, "missed workouts" stat, roadmap SVG gradient | home, roadmap-1 |
| **Info / telemetry blue** (alt) | `#38bdf8` | Bar chart, "aerobic capacity" tag | leaderboard, roadmap-3 |
| **Rank gold** (one-off, intentional) | `#eab308` | 1st place podium border/badge | leaderboard only |
| **Error/danger** | `#ffb4ab` fg / `#93000a` bg | From Tailwind config only — **no screen actually renders an error state.** Treat as unverified/placeholder. | — |

Ember/Volt/Blue each have **3–4 near-duplicate hex values** across the export — see inconsistencies.md #1 for the full breakdown and the recommended single value per role once you pick a direction.

### 1.4 Full literal color inventory (for reference)

<details>
<summary>Every distinct hex value found in the export, by frequency</summary>

| Hex | Approx. role | Appears in |
|---|---|---|
| `#27272a` | border | all 7 screens |
| `#18181b` | raised surface | home, workout, onboarding, roadmap-1/2/3 |
| `#a1a1aa` | text secondary | home, workout, leaderboard, onboarding |
| `#71717a` | text muted | home, workout, onboarding, roadmap-1/3 |
| `#fafafa` | text primary | home, workout, onboarding, roadmap-2/3 |
| `#ff5637` / `#ff5636` | ember (legacy) | home, onboarding CTA hover, roadmap-1 config |
| `#ff4322` | ember (obsidian kinetic) | onboarding active-card, roadmap-3 |
| `#ff4f2e` | ember (kinetic obsidian) | roadmap-2 |
| `#a4d64c` | volt (legacy, literal) | home, leaderboard |
| `#bdf532` | volt (legacy, config) | roadmap-1, all configs |
| `#c6ff3d` | volt (kinetic obsidian) | roadmap-2 |
| `#bef264` | volt (obsidian kinetic) | roadmap-3 |
| `#7bd0ff` | info blue (legacy) | home, roadmap-1 |
| `#38bdf8` | info blue (obsidian kinetic) | leaderboard, roadmap-3 |
| `#131314` | canvas (legacy) | home, workout, leaderboard, onboarding, roadmap-1 |
| `#0a0a0b` / `#09090b` | canvas (obsidian) | roadmap-2, roadmap-3, both DESIGN.md |
| `#eab308` | rank gold (one-off) | leaderboard |
| `#3f3f46` | border-emphasis | onboarding, leaderboard rank badges |
| `#d4d4d8` | rank-neutral text (one-off) | leaderboard |
| `#0e0e11` / `#09090b` / `#0d0d0e` | recessed well | home, workout |
| `#e5e2e3` | on-surface (config) | all Legacy screens (CSS default body color) |

</details>

---

## 2. Typography

### 2.1 Font families

| Family | Role | Loaded on |
|---|---|---|
| **Heebo** (400/600/700/800/900) | Headings, numerals, brand wordmark | home, workout, leaderboard, onboarding, roadmap-1/3 |
| **Assistant** (400/500/600/700) | Body copy, captions, secondary labels | home, workout, leaderboard, onboarding |
| **Rubik** (400–800) | Headings + body (Kinetic Obsidian direction only) | roadmap-2, and loaded-but-unused on workout/leaderboard/roadmap-1 |
| **Space Grotesk** (500–700) | Numeric/telemetry readouts (`metric-*`, `label-technical` tokens) | loaded on workout/leaderboard/roadmap-1/2, but tokens are barely used in body markup — most numerals actually render in Heebo |
| **Material Symbols Outlined** | All iconography | every screen |

**Practical rule:** the shipped screens overwhelmingly render as **Heebo (headings/numbers) + Assistant (body)**. Space Grotesk is configured but not actually applied to visible numerals in the markup — treat it as aspirational until a screen demonstrates it. Roadmap-2 is the outlier, going all-Rubik.

### 2.2 Type scale (from the shared Tailwind config, present verbatim on 5 of 7 screens)

| Token | Size | Line height | Letter spacing | Weight | Font |
|---|---|---|---|---|---|
| `display-hero` | 44px | 52px | -0.02em | 800 | Rubik*/Heebo |
| `display-hero-mobile` | 34px | 40px | -0.02em | 800 | Rubik*/Heebo |
| `headline-lg` | 28px | 34px | -0.015em | 700 | Rubik*/Heebo |
| `headline-md` | 22px | 28px | -0.01em | 700 | Rubik*/Heebo |
| `headline-sm` | 18px | 24px | — | 600 | Rubik*/Heebo |
| `body-lg` | 16px | 24px | — | 400 | Rubik*/Heebo |
| `body-md` | 14px | 20px | — | 400 | Rubik*/Heebo |
| `body-sm` | 12px | 16px | — | 400 | Rubik*/Heebo |
| `label-lg` | 14px | 18px | — | 600 | Rubik*/Heebo |
| `label-md` | 12px | 16px | 0.02em | 600 | Rubik*/Heebo |
| `label-technical` | 11px | 14px | 0.05em | 600 | Space Grotesk |
| `metric-display` | 38px | 42px | -0.03em | 700 | Space Grotesk |
| `metric-md` | 24px | 28px | -0.02em | 700 | Space Grotesk |

\* `fontFamily` in the config maps every token to `Rubik`/`Space Grotesk`, but in practice screens override with `font-['Heebo']`/`font-['Assistant']` arbitrary classes on the actual elements — another sign the config is stale boilerplate the screens partially ignore. **Trust the rendered markup (Heebo/Assistant), not the config's `fontFamily` block, until you decide otherwise.**

### 2.3 Ad-hoc sizes actually seen in markup (bypassing the scale above)

A large amount of text uses arbitrary `text-[Npx]` instead of the named tokens: `10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 32, 34, 36, 38, 44, 52px`. Recommend consolidating new work onto the named scale (§2.2) and only reaching for arbitrary sizes for one-off hero numerals (e.g. the 52px workout timer).

### 2.4 RTL / bilingual numerals

- Every screen is `dir="rtl" lang="he"`.
- Any Western numeral/unit cluster (BPM, kg, timers, dates) is wrapped in `dir="ltr"` inline, e.g. `<span dir="ltr">154 BPM</span>`, `<span dir="ltr">100 KG × 6</span>`.
- `tabular-nums` is applied to live-updating numerals (session timer) to prevent jitter.
- Directional icons (arrows, chevrons, fast-forward) are mirrored with `scale-x-[-1]` or `rtl:rotate-180`; symmetric icons (heart, flame, dumbbell) are left unmirrored.

---

## 3. Spacing scale

From the shared Tailwind config (identical numeric values on **all 7** screens — the most consistent token category in the whole export):

| Token | Value (px) |
|---|---|
| `space-xs` | 4 |
| `space-sm` | 8 |
| `space-md` | 12 |
| `space-lg` / `margin` / `gutter` | 16 |
| `space-xl` | 24 |

Layered on top, screens freely use Tailwind's default 4px-based spacing scale for everything else (`p-2`, `p-2.5`(10px), `p-3`, `p-3.5`(14px), `p-4`, `gap-1.5`(6px), `mt-0.5`(2px), etc.). Net effect: a **4px base grid** with half-steps at 2/6/10/14px. No conflicts here — safe to adopt as-is.

Page-level rhythm: 16px outer gutter (`px-gutter`/`px-4`) on every screen; vertical rhythm between stacked sections is `gap-space-lg` (16px) or `gap-space-md` (12px).

---

## 4. Border radius

Also identical across **all 7** screens' Tailwind configs:

| Token | Value |
|---|---|
| `rounded` (DEFAULT) | 4px (0.25rem) |
| `rounded-lg` | 8px (0.5rem) |
| `rounded-xl` | 12px (0.75rem) |
| `rounded-2xl` (Tailwind default, not overridden) | 16px — used only in roadmap-2 |
| `rounded-full` | 9999px |

Usage pattern: inputs/small chips/icon wells → `rounded`/`rounded-md`(6px default); cards → `rounded-lg`; bottom sheets/hero cards → `rounded-xl`/`rounded-2xl`; pills, avatars, badges, buttons → `rounded-full`. This is the **cleanest, most reusable token set in the whole export** — adopt directly.

---

## 5. Shadows, blur, opacity

No flat `box-shadow` tokens are declared; everything is an arbitrary Tailwind value or a Tailwind default (`shadow-sm/md/lg/xl`). Observed patterns:

| Purpose | Value |
|---|---|
| Fixed header shadow | `shadow-[0_1px_8px_rgba(0,0,0,0.35)]` |
| Fixed bottom nav shadow | `shadow-[0_-4px_24px_rgba(0,0,0,0.5)]` |
| Ember glow (active/CTA elements) | `shadow-[0_0_18px_rgba(255,86,54,0.65)]`-style, alpha 0.2–0.65, radius 12–30px, color-matched to the accent |
| Volt glow (completed/success elements) | `shadow-[0_0_18px_rgba(189,245,50,0.35)]`-style, same pattern with volt hex |
| Generic card elevation | `shadow-sm` / `shadow-md` / `shadow-lg` / `shadow-xl` (Tailwind defaults, no custom values) |
| Ring accents (focus/active node) | `ring-4 ring-{accent}/30` |

Translucency: fixed header/nav use `bg-surface/80` through `/95` + `backdrop-blur-md`/`backdrop-blur-xl` for a frosted-glass effect over scrolling content. Disabled/locked states (roadmap nodes) use `opacity-40` through `opacity-75` rather than a distinct disabled color.

---

## 6. Breakpoints / responsive behavior

**Not present in the export.** Every screen is a single fixed mobile viewport (`viewport-fit=cover`, `user-scalable=no`) — there is no tablet/desktop variant among the coded screens. The two `DESIGN.md` briefs each *propose* a tablet (600–1024px) and desktop (1024px+, max-width 1140–1280px, 12-column) layout, but this is unverified aspiration, not something extracted from a real screen. Since the Next.js build is a PWA that may also run on desktop web, treat those proposed breakpoints as a starting point to validate, not a locked spec.

---

## 7. Iconography

- **Library:** Google Material Symbols Outlined exclusively (two font-face `<link>` variants loaded redundantly on every screen — harmless but worth deduping in the real app's `<head>`).
- **Style:** line/outlined by default; filled via `style="font-variation-settings: 'FILL' 1;"` on emphasis icons (e.g. active streak flame).
- **Sizes seen:** 12–32px, most commonly 14–20px inline and 22–28px in stat/hero contexts.
- **Color:** inherits text color context — muted (`#71717a`) by default, ember/volt/blue when signaling state.
- **RTL mirroring:** directional icons (`arrow_back/forward`, `chevron_left/right`, `fast_forward`) get `scale-x-[-1]` or `rtl:rotate-180`; symmetric icons (heart, flame, dumbbell, timer) are untouched.

---

## 8. Tailwind config proposal (Next.js)

This encodes §1–5 using the **Legacy palette** as the app-wide default, plus a scoped `roadmap.*` color group for the confirmed Roadmap-screen skin (§1.5) — use `roadmap-ember`/`roadmap-volt`/etc. only inside `components/fitness/RoadmapPath.tsx`, `RoadmapNode.tsx`, and their mission-card children.

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#131314',
        surface: '#141416',
        'surface-raised': '#18181b',
        'surface-high': '#201f22',
        well: '#0e0e11',
        border: {
          DEFAULT: '#27272a',
          emphasis: '#3f3f46',
        },
        text: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          muted: '#71717a',
        },
        ember: {
          DEFAULT: '#ff5637',
          // pressed: TBD once palette direction is confirmed
        },
        volt: {
          DEFAULT: '#a4d64c',
        },
        info: {
          DEFAULT: '#7bd0ff',
        },
        gold: '#eab308',
        // Scoped override for the Training Roadmap screen only (see §1.5) — do not use app-wide.
        roadmap: {
          canvas: '#0a0a0b',
          surface: '#121214',
          ember: '#ff4322',
          volt: '#bef264',
          info: '#38bdf8',
        },
      },
      fontFamily: {
        heading: ['Heebo', 'sans-serif'],
        body: ['Assistant', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      fontSize: {
        'display-hero': ['44px', { lineHeight: '52px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-hero-mobile': ['34px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['28px', { lineHeight: '34px', letterSpacing: '-0.015em', fontWeight: '700' }],
        'headline-md': ['22px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '18px', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
        'label-technical': ['11px', { lineHeight: '14px', letterSpacing: '0.05em', fontWeight: '600' }],
        'metric-display': ['38px', { lineHeight: '42px', letterSpacing: '-0.03em', fontWeight: '700' }],
        'metric-md': ['24px', { lineHeight: '28px', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      spacing: {
        'space-xs': '0.25rem', // 4px
        'space-sm': '0.5rem',  // 8px
        'space-md': '0.75rem', // 12px
        'space-lg': '1rem',    // 16px
        'space-xl': '1.5rem',  // 24px
        gutter: '1rem',
        margin: '1rem',
      },
      borderRadius: {
        DEFAULT: '0.25rem', // 4px
        lg: '0.5rem',       // 8px
        xl: '0.75rem',      // 12px
        '2xl': '1rem',      // 16px
        full: '9999px',
      },
      boxShadow: {
        header: '0 1px 8px rgba(0,0,0,0.35)',
        nav: '0 -4px 24px rgba(0,0,0,0.5)',
        'glow-ember': '0 0 18px rgba(255,86,55,0.5)',
        'glow-volt': '0 0 18px rgba(164,214,76,0.35)',
      },
    },
  },
};
```
