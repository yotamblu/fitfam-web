---
name: Obsidian Kinetic
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#e6bdb5'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#ad8881'
  outline-variant: '#5d403a'
  surface-tint: '#ffb4a5'
  primary: '#ffb4a5'
  on-primary: '#650b00'
  primary-container: '#ff5637'
  on-primary-container: '#590800'
  inverse-primary: '#ba1c00'
  secondary: '#a4d64c'
  on-secondary: '#233600'
  secondary-container: '#719e13'
  on-secondary-container: '#1e2f00'
  tertiary: '#7bd0ff'
  on-tertiary: '#00354a'
  tertiary-container: '#009bd1'
  on-tertiary-container: '#002d40'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a5'
  on-primary-fixed: '#3e0400'
  on-primary-fixed-variant: '#8e1300'
  secondary-fixed: '#bff365'
  secondary-fixed-dim: '#a4d64c'
  on-secondary-fixed: '#131f00'
  on-secondary-fixed-variant: '#354e00'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-hero:
    fontFamily: Rubik
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 60px
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Rubik
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  metric-numeral:
    fontFamily: Rubik
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Rubik
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Rubik
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Rubik
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Rubik
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Rubik
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Rubik
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-prominent:
    fontFamily: Rubik
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-technical:
    fontFamily: Rubik
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
  telemetry-unit:
    fontFamily: Rubik
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is engineered for elite hybrid athletes, calisthenics practitioners, and tactical strength trainers who measure performance in load, velocity, and strict form. The aesthetic repudiates generic SaaS templates, bubble-soft health apps, and synthetic AI-generated illustrations. Instead, it embodies the visceral discipline of cold iron, chalked hands, and raw human movement.

The aesthetic fuses **Precision Brutalism** with **High-Performance Kinetic Editorial**—reminiscent of bespoke analog timing systems, high-altitude chronographs, and field-grade training notebooks:
- **Atmosphere:** Deep, matte obsidian spaces punctuated by disciplined, razor-sharp kinetic bursts. 
- **Voice & Posture:** Unforgiving, authoritative, and direct. UI density favors dense athletic logs, telemetry readouts, rep tempos, and strict execution cues over excessive negative space.
- **Visual Discipline:** Zero blurry multi-color gradients, zero amorphous ambient blobs, zero faux-3D clay renders, and zero decorative glassmorphism. Surfaces are physical, defined by technical hairline borders and mechanical contrast tiers.

## Colors

The palette operates on strict structural discipline, maintaining deep stealth darkness so that functional telemetry and state transitions snap immediately into focal view.

### Base Matrix (Obsidian & Charcoal)
- **Canvas Base (`#09090b`):** The absolute grounding layer. Pure matte carbon void.
- **Card / Surface Base (`#121214`):** Primary structural surface for modules, logs, and telemetry panels.
- **Elevated Interactive Surface (`#18181b`):** For active set bars, segmented controls, table headers, and modal sheets.
- **Structural Hairlines (`#27272a`):** Crisp 1px borders providing architectural integrity.
- **Subtle Surface Highlight (`#3f3f46`):** Secondary rules, hover states, and inactive track indicators.

### Editorial Typography Scale
- **High-Stance Off-White (`#fafafa`):** Primary metrics, max rep indicators, active titles.
- **Technical Subdued (`#a1a1aa`):** Set breakdown notes, secondary labels, equipment tags.
- **Muted Telemetry (`#71717a`):** Inactive unit indicators (kg, s, bpm), timestamps, past log dates.

### Functional Signal Accents
- **Ember Spark (`#ff4322`):** High-tension kinetic accent. Limited strictly to a maximum of **one** filled solid action per view (e.g., "LOG SET", "START INTERVAL"). Solid `#ff4322` buttons must always take dense `#09090b` type for maximum contrast.
- **Volt Signal (`#bef264` / `#d9f99d`):** Strictly reserved for completed sets, PR confirmations, and boolean validation checks. Never deployed as broad filled buttons.
- **Aero Info (`#38bdf8`):** Allocated exclusively for pacing markers, heart-rate zones, dynamic line charts, and velocity drop-off curves.

## Typography

Typography prioritizes high-impact athletic legibility across bilingual Hebrew and Latin interfaces.

- **Weight Hierarchy:** Bold weights (700, 800) anchor telemetry numbers, movement names, and set metrics. Middle weights (500, 600) designate secondary states and tabular headers. Normal weight (400) remains unencumbered for technical exercise prescriptions, coach cues, and log history.
- **Metric Formatting:** Tabular figures (`font-variant-numeric: tabular-nums`) must be enforced across all timers, weight trackers, rep counters, and interval splits to prevent horizontal jitter during live workouts.
- **RTL & LTR Balance:** All metric suffixes (kg, reps, s, bpm, rpe) sit flush with the primary numeral with tightened kerning. For Hebrew contextual text, alignment mirrors natural flow without losing technical data grid rigidity.

## Layout & Spacing

The structural layout utilizes a strict, high-density fluid grid built for athletic field conditions—operable with one thumb while under physical strain.

- **Mobile Viewport (PWA Core):** 4-column structure with an outer margin of `1rem` (16px) and gutter of `1rem`. Screen layout is optimized for top-to-bottom tactical progression: Workout Header -> Timer / Set Matrix -> Dynamic Exercise Card -> Bottom Action Strip.
- **Tablet / Split Viewport (600px - 1023px):** 8-column layout. Left 5 columns dedicated to live workout logging and set telemetry; right 3 columns dedicated to rest interval chronometer, pacing graphs, and form telemetry.
- **Desktop / Coach Hub (1024px+):** 12-column fixed-max system (`1280px` max container) with `2.5rem` margins. High-density data grid allows simultaneous multi-week microcycle views, load curves, and athlete comparison matrices.
- **Thumb-Zone Anchor:** Primary execution targets on mobile maintain a minimum vertical height of 52px, positioned inside the bottom 30% of the device viewport for seamless tactile access.

## Elevation & Depth

Visual hierarchy does not use diffuse, colorful drop shadows or synthetic Gaussian blurs. Depth is achieved via **Mechanical Surface Layering** and **Technical Hairlines**:

1. **Surface 0 (Ground):** `#09090b` canvas. The void layer.
2. **Surface 1 (Structural Containers):** `#121214` bounded by a solid `1px` border of `#27272a`. Flat, monolithic, engineered.
3. **Surface 2 (Interactive Items & Active Sets):** `#18181b` with an inset micro-stroke of `1px solid #3f3f46` or highlighted top border.
4. **Surface 3 (Overlays, Tactical Bottom Sheets, Modals):** `#121214` framed by `1px solid #3f3f46`. Uses a single harsh, low-spread drop shadow: `0 8px 0px 0px rgba(0, 0, 0, 0.7)` for absolute physical separation without cloudiness.
5. **State Illumination:** Active states are indicated by sharp 2px solid accents (Ember `#ff4322` for live action, Volt `#bef264` for verified completion) running along the leading vertical edge of a container, rather than outer glows.

## Shapes

The shape system adopts a **Tactical Industrial** posture with minimal corner radiuses (Soft - `level 1`):

- **Default Elements (Buttons, Inputs, Metric Tiles):** `0.25rem` (4px). Clean, precise, and razor-sharp.
- **Containers & Card Decks (`rounded-lg`):** `0.5rem` (8px). Structural cards and full-width workout modules.
- **Sheets & Modal Units (`rounded-xl`):** `0.75rem` (12px) strictly for top handles of mobile bottom sheets.
- **Data Badges & State Tags:** Crisp `2px` or sharp `4px` corner tags. Rounded pills are prohibited—everything reflects mechanical engineering and industrial instrument panels.

## Components

### 1. Buttons
- **Primary Kinetic Action:** Solid `#ff4322` background, text `#09090b` (weight 700), `4px` corner radius. Height: 52px mobile. Zero shadow. Single action per screen. Active state: slight scale down (`scale(0.98)`) and brightness compression.
- **Secondary Ghost Action:** Transparent background with a `1px` border of `#27272a`, text `#fafafa`. Hover/Active: Background shifts to `#18181b` with border transitioning to `#3f3f46`.
- **Tertiary Utility Action:** Plain text in `#a1a1aa`, with an underline micro-rule or paired with sharp mono-line icons.

### 2. Metric & Set Row Components
- Formatted as dense, high-contrast horizontal strips.
- **Set Inactive:** `#121214` background, `1px solid #27272a`, text `#71717a`.
- **Set Active (In Progress):** `#18181b` background, `1px solid #ff4322`, left border 3px solid `#ff4322`. Weight numerals in `#fafafa`.
- **Set Complete:** `#121214` background, left border 3px solid `#bef264`. Check indicator in `#bef264`.

### 3. Checkboxes & Toggles
- Custom square `20x20px` toggles with `2px` corner radius.
- **Unchecked:** Border `1.5px solid #3f3f46`, background `#09090b`.
- **Checked (Verified Set):** Border `1.5px solid #bef264`, background `#bef264`, inner icon `#09090b` (heavy geometric checkmark).

### 4. Input Fields (Reps / Load / Notes)
- Background `#09090b` inset into cards of `#121214`.
- Border `1px solid #27272a`. On focus: `1px solid #38bdf8` (no fuzzy glow).
- Numerical inputs feature center-aligned, large-scale tabular numerals (`metric-numeral`) with permanent, muted unit badges (`kg`, `sec`) positioned at the trailing edge.

### 5. Chips & Athletic Tags
- Height: 26px. Height for compact tags: 20px.
- Background `#18181b`, border `1px solid #27272a`. Typography in `#a1a1aa` (uppercase, letter-spacing `0.08em`).
- Active / Filtered: Background `#27272a`, border `1px solid #fafafa`, text `#fafafa`.

### 6. Chronometer & Rest Interval Bar
- Fixed bottom persistent tray. Background `#121214`, top border `1px solid #27272a`.
- Countdown displays in massive monospace/tabular figures (`#fafafa`).
- Progress indicated by a 2px razor-thin Volt (`#bef264`) rule moving smoothly across the top edge.

### 7. Iconography & Vector Visuals
- Strictly stroke-based icons (2px stroke weight, sharp terminal caps, zero soft pastel fills).
- No generic athletic avatars or illustrative vector people. Anatomical movement diagrams are rendered as wireframe biomechanical vectors in `#71717a` with active prime-mover muscle groups illuminated in `#ff4322`.