# Mindora — Sprint Roadmaps & Execution Log

---

## 🏁 Sprint 1: Foundation & Dashboard (Completed)

**Objective**: Establish the production-grade application foundation, modern calming design system, and a comprehensive mental wellness dashboard with working focus timers, reminders, and activity streams.

### Deliverables & Achievements
- [x] **Project Infrastructure & Tooling**: Initialized React 18, TypeScript (strict mode), Vite 6, and Tailwind CSS.
- [x] **Calm Wellness Design System**: Warm sand palette (`#FAF9F5`), muted sage greens (`#3D6B42`), and clean responsive layouts.
- [x] **Interactive Dashboard**: Welcome section, screen-time card, focus summary card, Pomodoro focus timer modal with Web Audio 528Hz chime, wellness score breakdown, hydration tracker, reminders with snooze, weekly chart, and activity timeline.
- [x] **Comprehensive Views**: Dashboard, My Wellness, Activity, Insights, Settings.
- [x] **Documentation & Push**: Initial architecture and sprint documentation committed and pushed to `main`.

---

## 🏁 Sprint 2: Work-Pattern Tracking & Storage Engine (Completed)

**Objective**: Implement persistent work-pattern tracking and activity monitoring in local storage, replacing static mock interactions with live calculated application telemetry while preserving user privacy.

### Deliverables & Achievements
- [x] **Client-Side Persistent Storage (IndexedDB)**:
  - Engineered zero-dependency `MindoraStorage` on native IndexedDB (`mindora_wellness_db` v1).
  - Implemented 6 structured Object Stores: `activities`, `focus_sessions`, `hydration_logs`, `app_usage`, `mood_entries`, and `user_settings`.
  - Added indexed querying by `dateKey` (`YYYY-MM-DD`), `category`, and timestamps.
  - Safe automatic seeding of initial demo dataset on first run without overwriting future user data.
  - Complete state restoration across page reloads and browser restarts.

- [x] **Decoupled Telemetry Pipeline**:
  - Defined `ITelemetryProvider` and `TelemetryMetadata` contracts in `telemetryInterfaces.ts`.
  - Implemented `BrowserInAppTelemetryProvider` to monitor tab visibility (`document.visibilityState`) and presence/idle states.
  - Prepared `IDesktopTelemetryProvider` interface stub for future native desktop daemon integration.
  - Created reusable tracking hooks: `useAppActiveTimeTracker` and `useWorkPatternTracker`.

- [x] **Work Pattern Analytics (`WorkPatternService`)**:
  - Live calculation of daily and weekly focus durations directly from completed session records.
  - Real-time tracking of average focus session length (`totalFocusMinutes / completedSessions`).
  - Analysis of work-to-break rhythm ratios (e.g., `4.2:1`).
  - Dual screen-time metrics: Verified In-App Active Time vs. Estimated Workday Screen Time.
  - Automatic detection of prolonged continuous focus sessions ($\ge 50$ min threshold warning).

- [x] **Enhanced Activity Dashboard**:
  - Added date-based filtering (**Today**, **Yesterday**, **Past 7 Days**, **All Time**).
  - Real-time search query filtering over event titles and descriptions.
  - Dynamic 7-day weekly activity visualization populated from real IndexedDB day aggregates.
  - Real-time in-app presence counter and session time in dashboard headers and screen time cards.
  - Thoughtfully designed empty states for empty search queries or dates without activity.

- [x] **Privacy & User Data Sovereignty**:
  - Live tracking status pill in header (`● Tracking: In-App Active` / `Tracking: Idle`).
  - Guaranteed privacy invariant: strictly **zero keystroke collection**, zero screenshot capture, and zero external transmission.
  - User controls to **Clear Stored Activity Data** with confirmation modal in Settings and Activity views.
  - User controls to **Export JSON Archive** for complete data portability.

- [x] **Quality Assurance & Build**:
  - Clean TypeScript compilation with strict options (`npm run type-check`).
  - Production build verification with Vite (`npm run build`).

---

## 🔮 Sprint 3: Adaptive AI Recommendation Engine (Upcoming)

**Objective**: Integrate on-device or privacy-preserving LLM capabilities to deliver hyper-personalized wellness advice, adaptive reminder pacing, and reflective check-in debriefs.

### Planned Scope:
- **Circadian Modeling Engine**: Algorithmic detection of personal energy peaks and cognitive fatigue windows based on logged multi-day patterns.
- **Adaptive Break Scheduling**: Automatically shifts reminder intervals dynamically based on focus block intensity (e.g. shortening focus intervals after high continuous strain).
- **Mindora Conversational Reflection**: On-device natural language companion for mindful end-of-day retrospectives.
- **Biometric Connectors**: Optional local sync with health wearables (HRV and sleep readiness scores).

---

## 🔮 Sprint 4: Desktop Telemetry Daemon & Multi-Device Sync (Upcoming)

**Objective**: Provide optional system-wide application tracking via a lightweight native agent and encrypted synchronization.

### Planned Scope:
- **Native Desktop Agent (Electron/Rust)**: Implements `IDesktopTelemetryProvider` to track system-wide foreground application names (e.g. VS Code, Figma, Slack) without browser sandbox limits.
- **Zero-Knowledge Sync**: End-to-end encrypted backup between laptop and mobile.
- **Focus Shielding**: Automated status sync to communication apps ("Elena is in a Deep Focus block until 11:30 AM").
- **Team Boundary Health**: Anonymous team-level indicators to prevent meeting overload.
