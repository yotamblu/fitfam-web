---
name: Kinetic Obsidian
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#e5beb6'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#ac8981'
  outline-variant: '#5c403a'
  surface-tint: '#ffb4a5'
  primary: '#ffb4a5'
  on-primary: '#640c00'
  primary-container: '#ff5636'
  on-primary-container: '#580900'
  inverse-primary: '#b91e00'
  secondary: '#bdf532'
  on-secondary: '#263500'
  secondary-container: '#a2d801'
  on-secondary-container: '#425a00'
  tertiary: '#9fcaff'
  on-tertiary: '#003258'
  tertiary-container: '#3695ea'
  on-tertiary-container: '#002b4d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a5'
  on-primary-fixed: '#3e0400'
  on-primary-fixed-variant: '#8e1500'
  secondary-fixed: '#bdf532'
  secondary-fixed-dim: '#a2d801'
  on-secondary-fixed: '#141f00'
  on-secondary-fixed-variant: '#384e00'
  tertiary-fixed: '#d1e4ff'
  tertiary-fixed-dim: '#9fcaff'
  on-tertiary-fixed: '#001d36'
  on-tertiary-fixed-variant: '#00497d'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  display-hero:
    fontFamily: Rubik
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Rubik
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Rubik
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Rubik
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Rubik
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Rubik
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Rubik
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  metric-display:
    fontFamily: Space Grotesk
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.03em
  metric-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  label-lg:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Rubik
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-technical:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system drives a gamified, mobile-first progressive web application engineered for hybrid athletes competing across running, swimming, strength, calisthenics, and functional racing formats like Hyrox. The aesthetic is built on high-performance dark minimalism: surgical, dense with telemetry, unapologetic, and mature.

Gamification within this ecosystem rejects cartoon tropes, juvenile celebration modals, and confetti bursts. Progression is framed through physiological milestones, tactical telemetry, and visceral athletic momentum. The product mirrors the sensory atmosphere of a high-end black-iron gym, illuminated chronometers, and industrial sports science interfaces.

The design philosophy combines:
- **Precision Dark-Mode Minimalism:** Stark black foundations layered with calibrated dark tonal surfaces and technical hairlines to preserve ocular focus during intense training sessions.
- **Data-Dense Tactility:** High-contrast telemetry readouts, compact data chips, and structural metric grids that communicate vital progress instantly under physical fatigue.
- **Disciplined Dual-Accent Dynamics:** An assertive Ember red-orange dedicated strictly to driving kinetic action and active streaks, offset by an electric Volt green restricted exclusively to completion states, verification, and achievements.

The tone of voice in Hebrew is direct, measured, and resolute—delivering coaching feedback with the authority of an elite performance director.

## Colors

The palette leverages an obsidian base combined with ultra-focused kinetic highlights. Every color serves a distinct operational purpose:

### Surface Hierarchy
- **Canvas Base (`#0a0a0b`):** True-black background maximizing display contrast and battery efficiency on mobile OLED screens.
- **Surface (`#151517`):** Base container canvas for list items, default workout cards, and segmented structural blocks.
- **Surface Raised (`#1f1f22`):** Elevated modules, bottom navigation docks, floating action toolbars, and active workout logs.
- **Border / Hairline (`#2a2a2e`):** 1px structural dividing lines isolating high-density telemetry without adding cognitive clutter.

### Typography & Content
- **Text Primary (`#f5f3ef`):** Warm bone-white delivering maximum readability against dark substrates without glare.
- **Text Secondary (`#9a9a9f`):** Low-strain neutral for contextual metadata, target units, and metric labels.
- **Text Faint / Disabled (`#5c5c61`):** Muted tone for inactive states, locked achievements, and micro-grid axes.

### Strategic Accents
- **Brand Accent — Ember (`#ff4f2e` | Pressed: `#ff3b1a`):** Primary driver of action. Exclusively used for primary interactive buttons (CTAs), live workout triggers, and active multi-day streak badges. All typography or icons placed over an Ember fill **must strictly resolve to `#0a0a0b`** for accessible, assertive legibility.
- **Signal Accent — Volt (`#c6ff3d` | Pressed: `#a8e01b`):** Affirmative signal reserved strictly for completion states, checkmarks, finished split times, and tier milestones. **Never used as an action or CTA trigger.** All text or iconography placed over a Volt fill **must strictly resolve to `#0a0a0b`**.
- **Data Telemetry (`#4fa8ff`):** Dedicated to technical data visualizers, comparative split charts, pacing overlays, and structural statistics.
- **Alert / Danger (`#ff5c5c`):** Reserved for missed training intervals, pacing drop-offs, and critical system alerts.

## Typography

The typographic architecture balances Hebrew readability with technical athletic metrics:

- **Hebrew Primary (`Rubik`):** Handles all Hebrew copy across headers, instructional copy, labels, and coaching interactions. Its geometric yet slightly rounded gothic character brings modern authority while remaining clean at small sizes during movement.
- **Technical Telemetry & Western Digits (`Space Grotesk`):** Handles pure numeric readouts, heart rates, pace times (`03:45 / ק"מ`), split targets, and chronometers. Its monoline geometric cadence anchors data dashboards with aerospace-grade precision.

### Bi-Directional (BiDi) & RTL Protocol
- The interface root is enforced as `dir="rtl"`. Hebrew copy aligns to the right naturally.
- Metric combinations (e.g., `450 ק״ג` or `1:24:00 שעות`) maintain left-to-right western digit order while preserving Hebrew unit sequence.
- All technical metric clusters (`metric-display`, `metric-md`) use tabular numbers (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during live workout timers and cadence tracking.

## Layout & Spacing

The layout is built for quick thumb-reachability on mobile touchscreens under motion, adhering strictly to a 4px mathematical cadence (4, 8, 12, 16, 24, 32, 48px).

### Grid & Viewport Behavior
- **Mobile First Canvas (Primary < 768px):** Single-column fluid view anchored with a 16px outer margin (`margin: 1rem`) and 12-16px column gutters. The core interactive zone stays within the bottom 60% of the viewport (the thumb zone).
- **Tablet & Dashboard (> 768px):** Constrained 12-column layout with a maximum container width of 1140px, centered with progressive whitespace. Columns aggregate into 4-column metric cards and 8-column data graphs.
- **RTL Axis Alignment:** The horizontal flow starts from right-to-left. Leading spacing aligns rightward; trailing metadata rests on the left margin.
- **Interactive Bounds:** Every tap target has an absolute physical minimum envelope of 44x44px, regardless of the visual token size (e.g., a 24px icon button embeds a 44px hit-box).

## Elevation & Depth

Visual hierarchy is maintained through high-contrast tonal layering rather than heavy ambient drop shadows, preventing muddy interfaces in low-light environments.

- **Level 0 (Base Canvas):** `#0a0a0b` — Background canvas, scroll foundations, and recessed metric wells.
- **Level 1 (Card Baseline):** `#151517` with a structural `1px solid #2a2a2e` perimeter border. Eliminates shadow blur in favor of a crisp architectural edge.
- **Level 2 (Raised Dynamic Modules):** `#1f1f22` paired with `border: 1px solid rgba(255, 255, 255, 0.08)` and an ultra-subtle directional shadow: `0 4px 20px -2px rgba(0, 0, 0, 0.6)`. Used for sticky workout timers, floating summary ribbons, and active reps.
- **Level 3 (Overlays & Action Sheets):** `#1f1f22` framed by a full-bleed top border `1px solid #2a2a2e` resting on a backdrop blur overlay (`backdrop-filter: blur(12px); background-color: rgba(10, 10, 11, 0.8)`).
- **Kinetic Glow Accents:** When a workout is active or a PR is logged, cards may receive a 1px border of Ember (`#ff4f2e`) or Volt (`#c6ff3d`) accompanied by a faint colored aura: `0 0 16px -4px rgba(255, 79, 46, 0.25)`.

## Shapes

The shape system expresses structured discipline:

- **Inputs & Data Wells (8px):** Structural text fields, numerical input boxes, split tables, and chart nodes utilize a compact 8px radius.
- **Surface Cards & Training Tiles (14px):** Standard performance cards, workout overview panels, and leaderboard rows adopt a 14px radius for a balanced, modern edge.
- **Modals & Bottom Action Sheets (22px):** Top corners of contextual drawers, bottom sheets, and confirmation dialogues scale to 22px to soften screen boundaries.
- **Kinetic Pills (999px):** All actionable command buttons, active streak counter pills, level status badges, and filter chips use a full pill radius to signify tactile interactability.

## Components

### Buttons & Actions
- **Primary CTA Button:** Pill-shaped (999px), filled with Ember (`#ff4f2e`), pressed state (`#ff3b1a`). Text and icons are strictly `#0a0a0b` at `label-lg` weight. Minimum height: 50px.
- **Secondary Action Button:** Pill-shaped (999px), Surface Raised fill (`#1f1f22`), bordered with `1px solid #2a2a2e`. Text color `#f5f3ef`. Pressed state deepens to `#151517`.
- **Ghost / Utility Button:** 0px background, padding horizontal 16px, text `#9a9a9f`, hover/pressed text `#f5f3ef`.

### Badges, Pills & Chips
- **Streak Badges:** Pill-shaped, Ember tint background (`rgba(255, 79, 46, 0.12)`), Ember border (`rgba(255, 79, 46, 0.3)`), Ember text (`#ff4f2e`), featuring the active streak count in Western digits.
- **Completion Badges:** Pill-shaped, Volt background (`#c6ff3d`), text `#0a0a0b`, accompanied by an affirmative 1.5px checkmark. Used exclusively post-effort.
- **Filter Chips:** 999px pill, Surface (`#151517`), border `1px solid #2a2a2e`, text `#9a9a9f`. Active selection switches border to `#ff4f2e` with primary text `#f5f3ef`.

### Cards & Workout Modules
- Built on `14px` border radius, `#151517` background, and `1px solid #2a2a2e` perimeter.
- Header row positions the workout title on the far right (Hebrew title) and elapsed duration or pacing target on the far left (Western digits, `Space Grotesk`).
- Internal metric telemetry grids inside cards sit within recessed wells (`#0a0a0b` with 8px radius).

### Inputs & Number Steppers
- Height 48px, 8px radius, Surface background (`#151517`), border `1px solid #2a2a2e`.
- Focus state switches border to `1px solid #ff4f2e` without visual outline bleed.
- Steppers for weights (ק״ג) and repetitions (חזרות) feature tactile `-` and `+` pill triggers flanking a centered `Space Grotesk` tabular digit value.

### RTL Iconography Protocol
- Icons are 1.5px to 2px stroke width, monochrome `#9a9a9f` default, shifting to `#f5f3ef` when active.
- Directional icons (arrows, chevrons, progression lines, timeline runs) must be mirrored along the vertical axis to accurately reflect right-to-left momentum. Symmetrical icons (heart rate, dumbbell, stopwatch, flame) remain unmirrored.