# Mindora 🌿

**AI-Powered Personalized Mental Wellness Companion**

Mindora helps knowledge workers, engineers, and digital creators maintain healthier work habits through real-time work-pattern analysis, adaptive wellness reminders, cognitive cadence insights, and restorative actions.

---

## 🧘 Project Vision

Modern digital work frequently leads to cognitive fatigue, eye strain, physical tension, and burnout due to uninterrupted screen blocks and fragmented context-switching. 

**Mindora** acts as a mindful companion running alongside your daily work rituals. Instead of disruptive alarms or generic timers, Mindora introduces an intentional cadence:
- **Balance deep focus** with biological recovery.
- **Surface proactive micro-resets** before fatigue compounds.
- **Maintain sustainable energy** across long design, development, and engineering sessions.
- **Protect user privacy** with client-side local persistence and zero invasive keylogging.

---

## 🚀 Sprint Milestones

### Sprint 1: Foundation & Dashboard (Completed)
- **Modern Calming Design System**: Warm sand palette (`#FAF9F5`), muted sage greens (`#3D6B42`), and clean responsive layouts without distracting animations.
- **Interactive Wellness Dashboard**: Personalized welcome banner, workday screen-time overview, focus session summary, wellness score gauge (87/100), hydration tracker, break reminders, weekly bar chart, recommended wellness actions, and activity stream.
- **Working Pomodoro Engine**: 25m Focus / 5m Short Break / 15m Long Break intervals, circular countdown visual, and native Web Audio 528Hz harmonic singing bowl chime.
- **Supporting Views**: My Wellness, Activity, Insights, and Settings.

### Sprint 2: Work-Pattern Tracking & Storage Engine (Completed)
- **Persistent Storage (IndexedDB)**: Engineered zero-dependency `MindoraStorage` across 6 Object Stores (`activities`, `focus_sessions`, `hydration_logs`, `app_usage`, `mood_entries`, `user_settings`). Restores state across browser refreshes and restarts without losing history.
- **Decoupled Telemetry Pipeline**: Built `BrowserInAppTelemetryProvider` to monitor tab visibility (`document.visibilityState`) and user presence/idle states. Structured under `ITelemetryProvider` contract for future desktop daemon integration.
- **Work Pattern Analytics**:
  - Live calculation of daily focus duration and completed session counts.
  - Real-time tracking of average session lengths.
  - Work-to-break rhythm ratio analysis.
  - **Dual Screen-Time Metrics**: Distinguishes **Verified In-App Active Time** (directly tracked presence inside Mindora) from **Estimated Workday Screen Time** (modeled full day exposure).
  - Prolonged continuous focus session warnings ($\ge 50$ min strain threshold).
- **Date-Based Activity Filtering**: Query and filter activity history by **Today**, **Yesterday**, **Past 7 Days**, or **All Time**, alongside category filters and real-time search.
- **Privacy & Sovereignty**:
  - Live header tracking indicator (`● Tracking: In-App Active` / `Tracking: Idle`).
  - Zero keystroke collection, zero screenshot capture, and local-only data retention.
  - One-click **Clear Stored Activity Data** with confirmation modal in Settings and Activity views.
  - Full **Export JSON Archive** for complete user data portability.

### Sprint 3: Adaptive Wellness Reminder Engine (Completed)
- **Modular Wellness Reminder Service**: Fully decoupled `WellnessReminderService` supporting hydration, eye-care (20-20-20), movement, posture, breathing, and rest reminders.
- **Intelligent Evaluation & Throttling**:
  - Continuous focus duration, session strain, inactivity, and hydration deficit tracking.
  - Multi-tier anti-spam throttling: 15-minute category cooldowns, 5-minute global cooldown, and 1-intervention limit per evaluation cycle.
  - Smart Quiet Hours enforcement with wrap-around midnight support (e.g., 21:00 to 07:00).
- **Personalized & Explainable Interventions**:
  - Contextual recommendations with explicit "Why this is recommended" explanations (e.g. continuous focus strain, hydration target deficit).
  - Step-by-step actionable instructions and estimated completion times.
- **Dual Notification System**:
  - Native browser Web Notifications API integration with explicit user permission controls.
  - Non-intrusive floating in-app toast stack with Snooze (15m), Dismiss, and Complete actions.
  - Interactive header notification center bell with live unread badge and quick actions.
- **IndexedDB v2 Persistence**: Added `reminders` and `notification_history` object stores to persist reminder lifecycle states, snooze timers, and compliance history across refreshes.
- **Effectiveness & Compliance Metrics**: Live statistics widget tracking completion rates, snooze frequencies, and total wellness actions completed.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: React 18 + TypeScript (Strict Type Safety)
- **Client-Side Storage**: Native IndexedDB (`mindora_wellness_db` v2) with zero third-party bundle overhead
- **Styling**: Tailwind CSS with custom calming wellness theme tokens
- **Build Tool**: Vite 6 (ultra-fast HMR and optimized production bundles)
- **Icons**: Lucide React
- **Audio Synthesis**: Native Web Audio API (528Hz harmonic oscillator)
- **Telemetry Engine**: Modular `WorkPatternService` + `BrowserInAppTelemetryProvider` decoupled from presentation layer
- **Adaptive Reminder Engine**: Decoupled `WellnessReminderService` + Web Notifications API + in-app toast stack

---

## 📦 Getting Started

### Prerequisites
- Node.js `v18.0.0` or higher (tested on Node v22)
- npm `v9.0.0` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:Nataraj-EL/mindora.git
   cd mindora
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Run TypeScript type-checking**:
   ```bash
   npm run type-check
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

6. **Preview the production build**:
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```
mindora/
├── docs/
│   ├── architecture.md           # System architecture, storage decisions, and telemetry contracts
│   └── SPRINTS.md                # Sprint roadmaps and changelogs
├── src/
│   ├── components/
│   │   ├── common/               # Atomic UI components (Badge, Button, Card, ToastContainer, etc.)
│   │   ├── layout/               # Header (with notification center), Sidebar, MobileNav, AppLayout
│   │   ├── dashboard/            # RemindersCard, WellnessActionsCard, ScreenTimeCard, FocusSummaryCard, etc.
│   │   └── views/                # DashboardView, MyWellnessView, ActivityView, InsightsView, SettingsView
│   ├── context/
│   │   └── WellnessContext.tsx   # Central state, storage hydration, reminder loop & analytics synchronization
│   ├── data/
│   │   └── mockData.ts           # Initial baseline and seeding dataset
│   ├── hooks/
│   │   ├── useAppActiveTimeTracker.ts  # Presence heartbeat and in-app time tracker
│   │   └── useWorkPatternTracker.ts    # Reusable analytics and logging hook
│   ├── services/
│   │   ├── reminders/
│   │   │   └── wellnessReminderService.ts # Adaptive reminders, anti-spam throttling, quiet hours & recommendations
│   │   ├── storage/
│   │   │   └── indexedDb.ts      # Type-safe native IndexedDB storage engine (v2 with reminders & history)
│   │   └── tracking/
│   │       ├── telemetryInterfaces.ts  # ITelemetryProvider and BrowserInAppTelemetryProvider
│   │       └── workPatternService.ts   # WorkPatternService analytics and event engine
│   ├── styles/
│   │   └── index.css             # Tailwind base directives and calm styling
│   ├── types/
│   │   ├── index.ts              # Core domain models
│   │   ├── reminders.ts          # Adaptive reminder, notification toast, effectiveness & recommendation types
│   │   └── tracking.ts           # ActivityEvent, FocusSessionRecord, Analytics, and Telemetry types
│   ├── App.tsx                   # Main view router
│   └── main.tsx                  # Application entry point
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🔒 Privacy Invariants

1. **Local-Only Storage**: Telemetry and sessions are persisted exclusively in client-side IndexedDB.
2. **Zero Keystroke Logging**: The application measures only user presence timestamps to compute active vs idle state; key values are never inspected.
3. **Zero Screenshot / Pixel Scraping**: Mindora never attempts to record screen pixels or application contents.
4. **Transparent Tracking State**: A persistent status badge in the header shows whether tracking is active or idle.
5. **Right to Erasure**: Users can permanently erase all stored sessions at any time with a single click.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
