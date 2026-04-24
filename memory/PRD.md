# Get Fit Faster — PRD

## Overview
A frontend-only React Native (Expo) mobile fitness tracker with a premium glassmorphism UI and static demo data. Originally requested as a Flutter app; user chose Option A (React Native Expo build) for live preview.

## Scope
- No backend, no database, no authentication — all data is hardcoded.
- 4 screens navigated via bottom tab bar (expo-router).

## Screens
1. **Home (`/`)** — "Good Morning, User" greeting, featured Steps card (6,540 / 10,000 with glowing gradient progress bar), Calories (320 kcal) + Water (2.5L) side-by-side, Weekly Insight card with mini bar chart.
2. **Activity (`/activity`)** — Summary strip (95 min, 12 km, 680 kcal) + 3 activity cards: Running (30 min/3 km), Walking (45 min/4 km), Cycling (20 min/5 km), each with gradient progress bar.
3. **Diet (`/diet`)** — Daily Totals card + 3 image-backed meal cards (Breakfast, Lunch, Dinner) with calories + protein/carbs/fat macros.
4. **Profile (`/profile`)** — Avatar, "John Doe", stats row (175 cm / 70 kg / -5 kg goal), Active Goal card "Lose 5 kg" with progress, 6-row settings list, Log Out button.

## Design
- Dark Jewel / Crystal Glassmorphism theme (`#05050A` base, `#4F46E5` → `#7C3AED` ambient blobs).
- `expo-blur` BlurView glass cards, 24px rounded corners, 1px translucent borders.
- `lucide-react-native` icons, `expo-linear-gradient` for progress bars & chart bars.

## Tech Stack
- Expo SDK 54 + expo-router (file-based routing + bottom-tabs)
- React Native 0.81, TypeScript
- Reusable components: `GlassCard`, `GlowBackground` (in `/app/frontend/src/components/`)

## Testing
- `testing_agent_v3_expo`: 100% pass (27 testIDs, 4 screens, bottom tab nav all verified).
