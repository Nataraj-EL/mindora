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
  - Safe automatic seeding of initial baseline history with complete restoration across page reloads.
- [x] **Decoupled Telemetry Pipeline**:
  - Defined `ITelemetryProvider` contract and built `BrowserInAppTelemetryProvider` to monitor tab visibility and presence/idle states.
  - Prepared `IDesktopTelemetryProvider` interface stub for future desktop daemons.
  - Created reusable tracking hooks: `useAppActiveTimeTracker` and `useWorkPatternTracker`.
- [x] **Work Pattern Analytics**:
  - Live calculation of daily and weekly focus durations, completed session counts, and average session lengths.
  - Dual screen-time metrics: Verified In-App Active Time vs. Estimated Workday Screen Time.
  - Automatic detection of prolonged continuous focus sessions ($\ge 50$ min warning).
- [x] **Activity Dashboard Enhancements & Privacy**:
  - Date-based filtering (**Today**, **Yesterday**, **Past 7 Days**, **All Time**) and instant search.
  - Transparent tracking pill (`● Tracking: In-App Active` / `Tracking: Idle`).
  - User controls to **Clear Stored Activity Data** and **Export JSON Archive**.

---

## 🏁 Sprint 3: Adaptive Wellness Reminder Engine & Intelligent Interventions (Completed)

**Objective**: Build an adaptive wellness reminder engine that analyses actual work patterns and delivers timely, personalized, and explainable wellness interventions.

### Deliverables & Achievements
- [x] **Intelligent Reminder Engine (`WellnessReminderService`)**:
  - Engineered modular, UI-independent `WellnessReminderService`.
  - Comprehensive category coverage: `hydration`, `eye-break` (20-20-20 rule), `movement`, `posture`, `breathing`, and `rest`.
  - Generated reminders using actual tracked metrics: continuous screen focus duration, hydration deficit, and time since last pause.
  - Prioritized classification: `routine`, `medium`, `high`, `critical`.
- [x] **Adaptive Scheduling & Anti-Spam Throttling**:
  - Implemented category cooldowns (15 min per category) and global cooldowns (5 min between any alerts).
  - Duplicate notification suppression (prevents duplicate pending/snoozed alerts).
  - Inactivity and background suppression: pauses alerts when tab is hidden or user is idle $> 60$s.
  - Fully configurable **Quiet Hours** with boundary wrap-around (e.g. lunch hour `12:30` - `13:30` or evening hours).
  - Rescheduling workflows for **Snooze** (+15m, +30m) and **Dismiss**.
- [x] **Personalized Recommendations with Explicit "Why" Explanations**:
  - Replaced generic suggestions with evidence-based interventions dynamically ranked by fatigue score.
  - Explicit explanation badge on every card: *"Why this is recommended"* (e.g. *"Critical: You have been looking at screens for 52 uninterrupted minutes without looking away"*).
  - Expandable actionable guidance with step-by-step physical and vagal relief instructions.
- [x] **Multi-Channel Notification System**:
  - Built actionable in-app [`ToastContainer`](file:///home/nataraj/Downloads/Projects/mindora/src/components/common/ToastContainer.tsx) with calm styling and immediate action buttons (`Mark Done`, `Snooze 15m`, `Dismiss`).
  - Integrated native browser Web Notifications API (`Notification.requestPermission()`, `new Notification()`) with explicit permission toggle.
  - Enhanced Header with interactive Due Reminders drawer and notification badge.
  - Upgraded IndexedDB to `v2` with `reminders` and `notification_history` stores.
- [x] **Wellness Dashboard Integration & Adherence Analytics**:
  - Updated `RemindersCard` with **Due**, **Upcoming**, and **Done** tabs.
  - Added live intervention compliance statistics: compliance rate adherence %, total completed vs. snoozed vs. dismissed, and top compliant category.
  - Synchronized completion: completing interventions updates daily scores, logs to activity timeline, and auto-increments hydration.
- [x] **Quality Assurance & Verification**:
  - Automated test script verifying generation thresholds, anti-spam cooldowns, snooze/completion states, quiet hours, and recommendations ranking.
  - Clean TypeScript compilation with strict options (`npm run type-check`).
  - Production build verification with Vite (`npm run build`).

---

## 🔮 Sprint 4: Desktop Telemetry Daemon & Multi-Device Sync (Upcoming)

**Objective**: Provide optional system-wide application tracking via a lightweight native agent and encrypted synchronization.

### Planned Scope:
- **Native Desktop Agent (Electron/Rust)**: Implements `IDesktopTelemetryProvider` to track system-wide foreground application names (e.g. VS Code, Figma, Slack) without browser sandbox limits.
- **Zero-Knowledge Sync**: End-to-end encrypted backup between workstation and mobile devices.
- **Focus Shielding**: Automated status sync to communication apps ("Elena is in a Deep Focus block until 11:30 AM").
- **Team Boundary Health**: Anonymous team-level indicators to prevent meeting overload.

---

## 🔮 Sprint 5: Conversational AI & Circadian Chronotyping (Upcoming)

**Objective**: Integrate on-device or privacy-preserving LLM capabilities to deliver hyper-personalized wellness advice and reflective check-in debriefs.

### Planned Scope:
- **Circadian Modeling Engine**: Algorithmic detection of personal chronotypes (lark vs night owl) and cognitive peak windows.
- **Mindora Conversational Reflection**: On-device natural language companion for mindful end-of-day retrospectives.
- **Biometric Connectors**: Optional local sync with health wearables (HRV and sleep readiness scores).
