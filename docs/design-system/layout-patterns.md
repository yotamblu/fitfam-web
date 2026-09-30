# FitFam Layout Patterns

## 1. Page-level shell conventions

Every exported screen declares a `shell-type` meta tag that determines its chrome — this is a useful signal to preserve as a Next.js layout convention:

| `shell-type` | Header | Bottom nav | Used by | Next.js layout |
|---|---|---|---|---|
| `mobile_tab` | Tab header (logo + streak pill + avatar) | Yes (5-tab bar) | home, leaderboard, roadmap 1/2/3 | `app/(tabs)/layout.tsx` |
| `mobile_stack` | Stack header (back button + title + avatar) | No | active_workout_session | `app/(stack)/layout.tsx` |
| `mobile_blank` | None | None, sticky bottom CTA instead | onboarding_level_selection | `app/(onboarding)/layout.tsx` |

General structure, all shells:
```
<body>
  <header>            fixed top-0, h-16, translucent+blur, safe-area top padding
  <main pt-16 pb-24>  scrollable content, top/bottom padding reserves header/nav height
    <div px-4 flex-col gap-4>   16px gutter, vertical rhythm via gap
  <nav>               fixed bottom-0, translucent+blur, safe-area bottom padding (mobile_tab only)
```

- `pt-safe` / `pb-safe` (env(safe-area-inset-*)) are applied consistently — required for iOS PWA notch/home-indicator support.
- `main`'s first/last child have their margins zeroed (`main>:first-child{margin-top:0}` etc.) so section spacing is fully controlled by the `gap-*` utility on the wrapping flex column, not by margin collapsing — adopt this reset in the real app's global CSS.
- Horizontal scrollbars are hidden globally (`::-webkit-scrollbar{display:none}`) — decide deliberately whether to keep this (hides all scroll affordance, including on wide data tables) or scope it to specific horizontal-scroll strips (chip rows, roadmap phase filter).

## 2. Section / content patterns

### 2.1 Vertical stack rhythm
Every content page is a single-column `flex flex-col` with a consistent `gap-space-lg` (16px) or `gap-space-md` (12px) between major sections — no page uses a CSS grid for macro layout, only for small in-section grids (stat cards, telemetry rows, podium).

### 2.2 Common section order (home dashboard, representative "hub" page)
1. Header (fixed, outside scroll flow)
2. Welcome/date greeting
3. 3-up stat card grid
4. Hero "today's session" card (image-free, data-dense)
5. Single-row biometric/readiness card
6. Vertical list of upcoming session cards
7. Image banner (motivation/goal)

This top-to-bottom "greeting → key stats → primary CTA card → supporting list → soft CTA banner" order is a reasonable template for any future dashboard-style page.

### 2.3 Grid patterns
- **3-column grid** (`grid-cols-3`): stat cards (home), telemetry mini-grid (home hero card, workout hero card), podium (leaderboard).
- **2-column grid** (`grid-cols-2`): exercise chip breakdown (home hero card), stepper pair (workout weight/reps).
- **4-column grid** (`grid-cols-4`): session progress segments (workout header).
- Everything else is `flex` (row or column), not grid — grids are reserved for genuinely fixed-count, equal-width item sets.

### 2.4 List patterns
- **Vertical card list** with uniform spacing (`gap-2`), each item independently bordered/rounded (not a bordered table) — used for scheduled sessions, leaderboard rows.
- **Horizontal scroll strip** (`overflow-x-auto no-scrollbar`, `whitespace-nowrap`): used for the roadmap's phase-filter chips.

### 2.5 Full-bleed background imagery
Two screens (roadmap-2, roadmap-3, and the workout exercise hero card) layer a fixed, low-opacity (20–35%) background photo behind content via `fixed inset-0 pointer-events-none z-0`, topped with a vertical gradient (`from-canvas/90 via-canvas/70-80 to-canvas/95`) and sometimes a `backdrop-blur` scrim. This is a distinct "atmospheric" treatment reserved for the more gamified/emotional screens (roadmap, active exercise) — not used on data-dense utility screens (leaderboard, stat grids).

## 3. Proposed Next.js component folder structure

```
components/
  ui/                        # generic, app-agnostic primitives (§4 in components.md)
    Button.tsx
    Chip.tsx
    SegmentedControl.tsx
    StatCard.tsx
    Avatar.tsx
    PromoBanner.tsx
    AppHeader.tsx
    StackHeader.tsx
    BottomNav.tsx
  fitness/                   # gamified, FitFam-specific components (§2 in components.md)
    StreakPill.tsx
    PointsDisplay.tsx
    ProgressBar.tsx
    RoadmapPath.tsx
    RoadmapNode.tsx
    SessionListItem.tsx
    TodaySessionCard.tsx
    ExerciseHeroCard.tsx
    SessionProgressBar.tsx
    SetTimer.tsx
    NumberStepper.tsx
    SetRow.tsx
    NextUpCard.tsx
    LeaderboardRow.tsx
    Podium.tsx
    WeeklyBarChart.tsx
    ReadinessRow.tsx
  onboarding/
    LevelCard.tsx
    GoalChip.tsx
app/
  (tabs)/
    layout.tsx                # AppHeader + BottomNav shell
    workout/page.tsx          # home dashboard
    training-path/page.tsx    # roadmap
    leaderboard/page.tsx
    profile/page.tsx
  (stack)/
    layout.tsx                 # StackHeader shell, no bottom nav
    active-session/page.tsx
  (onboarding)/
    layout.tsx                 # blank shell, sticky CTA
    level-selection/page.tsx
public/
  logo.svg                     # from fitfam_vector_logo_mark
  icons/                       # PWA icons generated from logo.svg
  fonts/                       # self-hosted Heebo/Assistant (recommended over Google Fonts CDN for PWA offline support)
```

## 4. Things NOT to copy from the export as-is

- The duplicated Google Fonts `<link>` tags and the huge inline `tailwind.config` script block on every page — collapse into one root Tailwind config + a single `next/font` setup.
- The `lh3.googleusercontent.com` (Google-hosted AIDA placeholder) image URLs — these are Stitch's placeholder asset CDN and will break; replace with real/self-hosted assets before shipping.
- Inline `<script>` blocks doing DOM manipulation (timer, stepper, tab-switch logic) — reimplement as React state/hooks, not vanilla DOM scripts.
