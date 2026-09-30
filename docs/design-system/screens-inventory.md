# Screens Inventory

Everything found under `/design-reference/` in the Stitch export, and what to do with each item.

## Coded screens (`code.html` + `screen.png` pairs)

| Folder | Screen name | Shell type | Palette direction | Key components used | Notes |
|---|---|---|---|---|---|
| `fitfam_home_dashboard` | Home / Today's Workout Dashboard | `mobile_tab` | A — Legacy | AppHeader, BottomNav, StreakPill, StatCard×3, TodaySessionCard, ReadinessRow, SessionListItem×3, PromoBanner | Most complete/representative screen — best reference for the "default" component look. |
| `fitfam_active_workout_session` | Active Workout / Live Set Logging | `mobile_stack` | A — Legacy | StackHeader, SessionProgressBar, ExerciseHeroCard, SetTimer, NumberStepper×2, SetRow×4, NextUpCard, Button (primary/ghost) | Only screen with no bottom nav; only screen demonstrating live/loading/success button states via inline JS. |
| `fitfam_leaderboard_progress` | Leaderboard & Weekly Progress | `mobile_tab` | A — Legacy (with alt blue `#38bdf8`) | AppHeader, BottomNav, SegmentedControl, PointsDisplay, WeeklyBarChart, Podium, LeaderboardRow×6 (incl. current-user variant) | Richest data-viz screen; only place the gold rank accent and current-user card variant appear. |
| `fitfam_onboarding_level_selection` | Onboarding — Fitness Level & Goals | `mobile_blank` | A — Legacy (ember literal `#ff4322`) | LevelCard×4 (single-select), GoalChip×4 (multi-select), Micro Metric Strip, sticky Button | Only screen with no persistent header/nav; only place the `mobile_blank` shell appears. |
| `fitfam_training_roadmap_path_1` | Training Roadmap — Variant 1 *(superseded)* | `mobile_tab` | A — Legacy | AppHeader, BottomNav, RoadmapPath (6 nodes: completed/completed/active/locked/locked/milestone), NextUpCard | Baseline/first-pass roadmap skin; softer glow, uses config-token colors more than literals. Kept for history only — not the build target. |
| `fitfam_training_roadmap_path_2` | Training Roadmap — Variant 2 ("Kinetic Obsidian") *(superseded)* | `mobile_tab` | B — Kinetic Obsidian | AppHeader, BottomNav, RoadmapPath (same 6-node structure, different skin), calisthenics-specific node motifs (pull-up bar, dip bars, rings icons) | Most visually elaborate variant — glow rings, gradient path, gradient CTA. Matches `kinetic_obsidian/DESIGN.md` exactly. Kept for history only — not the build target. |
| `fitfam_training_roadmap_path_3` | Training Roadmap — Variant 3 ("Obsidian Kinetic") ✅ **BUILD TARGET** | `mobile_tab` | C — Obsidian Kinetic | AppHeader, BottomNav, RoadmapPath (absolutely-positioned node layout instead of flex-stack — a 4th layout technique for the same component), NextUpCard | **Confirmed final design for this screen** — refined directly with the user in Stitch after the rest of the app. Nodes positioned via absolute `top`/`left` coordinates rather than flow layout (needs rework for variable content length in the real build). Matches `obsidian_kinetic/DESIGN.md` exactly. Has the `font-heebo` bug (see inconsistencies.md #5) — reimplement fonts properly, don't copy that class. |

## Brand / logo assets

| Folder | Format | Use |
|---|---|---|
| `fitfam_vector_logo_mark` | inline SVG (`code.html`) | Recommended canonical logo — see inconsistencies.md #4. |
| `fitfam_brand_logo` | `screen.png` only | Alternate logo lockup exploration; currently what's actually referenced (via hosted placeholder URL) in most screen headers. |

## Mood / reference imagery (not UI — design references only)

| Folder | Likely use |
|---|---|
| `athletic_portrait_photo_of_a_focused_hybrid_athlete_male_late_20s_with_intense` | Athlete portrait mood reference (marketing/onboarding hero imagery direction). |
| `atmospheric_outdoor_street_workout_calisthenics_park_at_dusk_or_twilight._pull` | Background photo used (blurred) behind `fitfam_training_roadmap_path_1`. |
| `stylized_animated_cartoon_illustration_of_an_outdoor_calisthenics_street` | Background illustration used (blurred) behind `fitfam_training_roadmap_path_2`. |

`fitfam_training_roadmap_path_3` uses its own separate twilight-park photo (hosted placeholder URL, not present as a local export file).

## Written specs (not screens)

| File | What it is |
|---|---|
| `kinetic_obsidian/DESIGN.md` | AI-authored design-system brief matching palette Direction B (roadmap-2) exactly. |
| `obsidian_kinetic/DESIGN.md` | AI-authored design-system brief matching palette Direction C (roadmap-3) exactly. |

## Screens the export does NOT contain (gaps for future Stitch passes or original design work)

- Sign-up / login / auth
- Profile / settings page (linked in bottom nav as `athlete-profile` but no screen exists)
- Workout summary / post-session recap ("great job" screen)
- Achievement/badge unlock moment
- Empty states (no workouts scheduled, no leaderboard data, offline)
- Error states
- Exercise library / search
- Notifications
- Social/community feed (despite the Instagram/TikTok community context in the brief)
