# FitFam Component Catalog

Reverse-engineered from `/design-reference/*/code.html`. Every component below appears on 2+ screens, or is the canonical representative of an app-specific pattern (streaks, progress, workout cards, leaderboard rows) called out in the brief even where the export only shows one strong example. Token names refer to [`tokens.md`](./tokens.md).

Suggested implementation location for each is noted so this doc can double as the `/components` folder map (see `layout-patterns.md` §3 for the full folder proposal).

---

## 1. App Shell

### 1.1 Bottom Tab Bar (`components/ui/BottomNav`)
Fixed, translucent (`bg-surface/85` + `backdrop-blur-xl`), top hairline, 5 items, height 64px (`h-16`).
- **Items:** Workout (sports_gymnastics) · Training Path (map) · Active Session (timer) · Leaderboard (leaderboard) · Profile (person).
- **States:** active = ember text + bold label (+ small pulsing dot underneath on roadmap-2); inactive = muted (`text-muted`) with hover→primary text.
- **Composition:** icon (20–22px) + `label-technical` caption, min tap target 54×44px.
- **Screens:** home, leaderboard, roadmap-1/2/3. **Absent** on active_workout_session (replaced by a stack header with back button) and onboarding (no chrome at all — full-bleed flow).

### 1.2 Header — Tab variant (`components/ui/AppHeader`)
Fixed, translucent, height 64px. Logo mark + "FITFAM" wordmark (leading edge), streak pill (center-ish), profile avatar (trailing edge, 32–36px circle, sometimes with a gradient ring).
- **Screens:** home, leaderboard, roadmap-1/2/3.

### 1.3 Header — Stack variant (`components/ui/StackHeader`)
Fixed, translucent. Back button (44×44 tap target, mirrored arrow icon) + page title (`headline-sm`) + profile avatar. No logo, no streak pill, no bottom nav on the page that owns this header.
- **Screens:** active_workout_session.

### 1.4 Onboarding shell (`shell-type="mobile_blank"`)
No fixed header/nav at all — content flows edge-to-edge with a sticky bottom CTA area (`sticky bottom-0` + backdrop blur) instead of a persistent tab bar.
- **Screens:** onboarding_level_selection.

---

## 2. Gamification primitives (the app-specific patterns called out in the brief)

### 2.1 Streak Badge/Pill (`components/fitness/StreakPill`)
Pill (`rounded-full`), flame icon (`local_fire_department`, filled variant when emphasized) + day count + "days" label. Ember-tinted: `bg-{ember}/15`, `border-{ember}/30`, `text-{ember}`.
- **Variants:** compact (header, icon + number only) vs. full (stat card, number + "days" + delta caption).
- **Screens:** home (header + stat card), leaderboard (header + user's own row, paired with a "+N to podium" caption).

### 2.2 Points/Score Display (`components/fitness/PointsDisplay`)
Large bold numeral (`metric-md`/`headline` scale, Heebo, tabular where live) + small trailing unit label ("נק'"/"pts"). Often paired with a delta chip (`trending_up` icon + "+N this week", volt-colored).
- **Screens:** home (stat card), leaderboard (weekly total, podium cards, every leaderboard row).

### 2.3 Progress Ring / Bar (`components/fitness/ProgressBar`)
Linear track (`bg-surface-high`, 4–8px tall, `rounded-full`) + filled portion, either solid ember or an ember→volt gradient. No circular "ring" variant appears in the export — only linear bars (inside roadmap mission cards and the roadmap overview header). Document circular rings as a **gap to design** if the product needs a ring-style workout completion indicator.
- **Screens:** roadmap-1/2/3 (mission card mini progress, header overview progress).

### 2.4 Training Roadmap Node / Path Map (`components/fitness/RoadmapPath` + `RoadmapNode`)
The single most distinctive, most-iterated component in the export (3 full visual explorations of the same screen).

> ✅ **Build target confirmed:** `training_roadmap_path_3` (Obsidian Kinetic skin) is the final, up-to-date design for this screen — the user continued refining it directly in Stitch after the rest of the app. Use its colors (`tokens.md §1.5`) and its absolute-positioned node layout. `training_roadmap_path_1` and `path_2` are superseded explorations, kept for history only — do not build from them. `obsidian_kinetic/DESIGN.md` is the companion spec for this screen's color/elevation/shape details.

Structure (consistent across all 3 explorations, skin aside):
- A winding **SVG dashed track** (`viewBox` per-screen, cubic bezier path) rendered behind the nodes, color-shifting from volt (completed) → ember (active) → neutral (locked).
- **Node states**, each a circular/rounded-square badge (56–80px) with a small numbered sub-badge:
  - *Completed*: volt fill, `check` icon, glow shadow.
  - *Active*: ember fill/gradient, `bolt`/`electric_bolt` icon, animated pulse ring (`animate-ping`/custom `pulse-ring` keyframe), paired with a **mission card** (title, subtitle, mini progress bar, "Continue" CTA button) — this is the only node type with an attached card in all 3 variants.
  - *Locked*: neutral/surface fill, `lock` icon, reduced opacity (0.5–0.75).
  - *Milestone/boss*: distinct centered layout (not alternating L/R), `military_tech` icon, larger badge, always locked-styled until reached.
- **Layout:** nodes alternate left/right ("serpentine"/Duolingo-style) down the page, following the SVG path.
- **Screens:** training_roadmap_path_1/2/3 (three skins of the same component; build from **path_3** — see inconsistencies.md #1, now resolved).

### 2.5 Workout/Exercise Card
Two distinct sub-patterns:
- **List item variant** (`components/fitness/SessionListItem`): icon chip (discipline-colored) + title + protocol subtitle + meta row (duration • distance/reps, separated by a `•`) + trailing status pill (locked/planned/completed, each with its own icon+color). Screens: home ("upcoming schedule"), roadmap ("next workout" bottom intel card, condensed — no status pill, just a "פירוט" link).
- **Hero/session card variant** (`components/fitness/TodaySessionCard`): live-status badge row, title+subtitle, 3-column telemetry mini-grid (duration/calories/load, each with icon+label+value+unit), 2-column exercise chip grid, full-width primary CTA. Screens: home dashboard only — but structurally this is the template for "today's workout."

### 2.5b Active Set / Exercise session components (`components/fitness/`)
Unique to `active_workout_session`, but each piece is independently reusable:
- **Session progress bar** (`SessionProgressBar`): "Block 02/04" label + intensity tag + % complete + 4-segment bar (segment states: complete=volt, active=ember+ring, upcoming=muted/dimmed).
- **Exercise hero card** (`ExerciseHeroCard`): background photo w/ bottom gradient fade, exercise-tag pill + heart-rate pill (top row), large exercise name, protocol/rest info row.
- **Live timer readout** (`SetTimer`): huge tabular numeral (52px) + "SEC" unit, auto-rest note below.
- **Number stepper** (`NumberStepper`): circular `-`/`+` buttons flanking a large tabular digit; active/press state swaps bg to ember-container + darker text; used for weight (2.5kg steps) and reps (1-rep steps).
- **Set status row** (`SetRow`): numbered circular index badge + label + `dir="ltr"` value ("100 KG × 6") + trailing status (completed=`check_circle`+volt, active=spinning `sync`+ember (left border accent), pending=`hourglass_empty`+muted, dimmed).
- **Next-exercise teaser** (`NextUpCard`): icon chip + "next in sequence" label + name + trailing chevron button. Echoed in a similar shape by the roadmap's bottom "next workout" card.

### 2.6 Leaderboard Row (`components/fitness/LeaderboardRow`)
Rank badge (circle, 24px) + avatar (40px) + name + role/discipline tag chip + secondary meta line ("6 workouts this week • running & strength") + trailing points + "points" caption.
- **Rank badge coloring:** #1 = gold (`#eab308`, one-off, intentional), #2/#3 = neutral dark badge, others = plain neutral.
- **Current-user variant:** distinct card style (`active-user-card`: ember-tinted bg `#1c1514` + ember border), larger avatar with ember ring, extra streak chip + "+N to podium" caption, white (not default) name text.
- **Screens:** leaderboard_progress (full list + top-3 podium variant below).

### 2.7 Podium (Top 3) (`components/fitness/Podium`)
3-column grid, center column (1st place) visually elevated (`-translate-y-2`, larger avatar, gold ring, bigger rank badge, bold points in volt), side columns (2nd/3rd) smaller, neutral badges.
- **Screens:** leaderboard_progress only.

### 2.8 Mini Bar Chart (`components/fitness/WeeklyBarChart`)
7-column daily bar chart, hover-reveals value label, peak day auto-highlighted (solid accent vs. others at 40–60% opacity), one bar rendered dashed/muted as a "goal" reference.
- **Screens:** leaderboard_progress only (weekly points breakdown).

### 2.9 Readiness / Biometric Row (`components/fitness/ReadinessRow`)
Icon chip + label + status caption (color-coded, e.g. volt "Excellent") + large trailing percentage.
- **Screens:** home dashboard (HRV readiness) — single occurrence, but flagged per the brief as a likely recurring pattern; document now so future biometric rows (sleep, recovery) reuse it.

### 2.10 Achievement / Milestone badge
No dedicated "trophy unlocked" screen exists in the export. The closest analogues are the roadmap's `military_tech` milestone node (§2.4) and the leaderboard's gold rank badge (§2.6). **Gap:** a standalone achievement/badge-unlock component (e.g. a modal or toast) is not represented — needs new design work, not extraction.

---

## 3. Onboarding-specific components

### 3.1 Level Select Card (`components/onboarding/LevelCard`)
Radio-style card: icon chip + title + subtitle + trailing chevron. Selected state = solid ember fill (`#ff4322` in this screen's literal usage), glow shadow, trailing icon swaps to `check`, JS toggles single-select across the group.
- **Screens:** onboarding_level_selection.

### 3.2 Goal Chip (multi-select) (`components/onboarding/GoalChip`)
Pill/rounded-rect toggle chip: icon (`add`/`check`) + label. Selected = filled text + volt check icon; unselected = muted outline. Multiple can be active at once (unlike LevelCard).
- **Screens:** onboarding_level_selection.

### 3.3 Micro Metric Strip
3-up inline stat row (no cards, just a shared rounded container with dividers) used as onboarding social-proof ("4 disciplines / 100% accuracy / PRO load"). Simpler sibling of the home dashboard's 3-up stat card grid (§4.1) — same information density, no borders between cells.

---

## 4. Generic UI primitives

### 4.1 Stat Card (`components/ui/StatCard`)
Bordered card (`rounded-lg`, `surface` bg): label + trend icon (top row) → big numeral (middle) → caption/delta (bottom). Used in a 3-column grid.
- **Screens:** home dashboard (points/streak/missed workouts).

### 4.2 Buttons (`components/ui/Button`)
- **Primary:** full-width, ember fill, black/dark text, bold, `rounded-lg`, `active:scale-[0.98–0.99]`. Loading state swaps label+icon for a spinner + "Loading..." text (seen via inline JS on the home dashboard CTA). Success state swaps to volt fill + check icon then reverts (seen on the workout "complete set" button).
- **Secondary/Ghost:** transparent or `surface-raised` bg, bordered, muted text → primary text on hover/press.
- **Icon button:** 44×44 minimum tap target, circular or `rounded` square, used for back nav, chevrons, +/- steppers.
- **Screens:** all.

### 4.3 Tag / Chip (`components/ui/Chip`)
Small `rounded`/`rounded-md` pill, muted bg (`surface-raised` or `#27272a`), text label — used for discipline tags ("אתלט עילית"), protocol tags, filter chips. Distinct from the interactive GoalChip (§3.2) in that most instances here are read-only labels, not toggles.

### 4.4 Segmented Tab Switcher (`components/ui/SegmentedControl`)
Rounded-full track, 2–3 equal-width buttons, active segment gets filled pill bg + shadow + small pulsing status dot; inactive segments are plain text.
- **Screens:** leaderboard_progress (weekly/monthly/all-time).

### 4.5 Avatar
Circular image, 32–56px depending on context, optional gradient or solid ring border (ember for "you", neutral for others, gold for #1 podium).

### 4.6 Motivation/Promo Banner (`components/ui/PromoBanner`)
Background photo + bottom gradient fade, caption + title, trailing affordance (chevron or button). Two sub-variants: full hero banner with image (home dashboard "focus goal" banner) and compact card banner without image (leaderboard "weekend sprint" CTA card).

---

## 5. Brand assets found in the export

| Asset | Format | Notes |
|---|---|---|
| `fitfam_vector_logo_mark/code.html` | inline SVG | Clean geometric "F" + lightning-bolt mark, 120×120 viewBox, `#121214` bg tile, `#fafafa` F, `#ff4322` bolt. **Best candidate for the real app icon/favicon.** |
| `fitfam_brand_logo/screen.png` | raster PNG | Alternate logo lockup/exploration — used as the actual `<img>` source in most screen headers (a hosted Google-CDN URL, not this local file). |
| Home dashboard header | inline markup | Uses a *third* logo execution: a plain orange rounded-square with "FF" text, no relation to the SVG mark. |

**Three different logo executions exist in the export** — see inconsistencies.md #4. Whichever is chosen, export it as `public/logo.svg` (prefer the vector mark — it's resolution-independent and matches the ember accent) plus a `public/icon-{192,512}.png` PWA icon pair generated from it.

Mood/reference images (not UI, keep as design references only, do not ship in the app bundle):
- `athletic_portrait_photo_of_a_focused_hybrid_athlete_.../screen.png`
- `atmospheric_outdoor_street_workout_calisthenics_park_.../screen.png`
- `stylized_animated_cartoon_illustration_of_an_outdoor_calisthenics_.../screen.png`

These are AI-generated mood-board photography/illustration used as background imagery in the roadmap variants (blurred, gradient-overlaid) and are stand-ins for real brand photography — not final assets.
