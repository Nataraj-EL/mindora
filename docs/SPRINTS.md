# Mindora — Sprint Roadmaps & Execution Log

---

## 🏁 Sprint 1: Foundation & Dashboard (Completed)

**Objective**: Establish the production-grade application foundation, modern calming design system, and a comprehensive, fully interactive mental wellness dashboard with working focus timers, reminders, and activity streams.

### Deliverables & Achievements

- [x] **Project Infrastructure & Tooling**:
  - Initialized React 18, TypeScript (strict mode), Vite 6, and Tailwind CSS.
  - Configured modular project architecture under `src/` (components, context, data, styles, types, views).
  - Configured zero-dependency Web Audio API harmonic sound generator for zen focus intervals.

- [x] **Calm Wellness Design System**:
  - Implemented grounding palette: `#FAF9F5` warm sand canvas, `#3D6B42` muted sage green primary, and subtle clay/water accents.
  - Eliminated harsh stark whites, distracting high-contrast gradients, and heavy glassmorphism.
  - Ensured fully responsive layouts across mobile drawers, bottom thumb bars, and desktop multi-column grids.

- [x] **Interactive Dashboard Suite**:
  - **Personalized Welcome Banner**: Contextual time-of-day greeting, summary metrics, and 5-point state-of-mind logger.
  - **Screen-Time Overview**: Active display exposure, category breakdown (Focus & Code, Architecture, Team Sync, Documentation), continuous strain threshold warning, and fatigue delta vs yesterday.
  - **Focus Session Summary & Streak**: Target session progress, 7-day streak badge, and one-click session triggers.
  - **Working Focus Session Timer**: 25m Focus / 5m Short Break / 15m Long Break intervals, circular countdown visual, custom intention input, pause/resume/skip controls, and automatic activity stream logging upon completion.
  - **Daily Wellness Score (87/100)**: Dimensional breakdown (Physical, Mental Focus, Rhythm, Rest Recovery) and AI wellness observations.
  - **Hydration Balance Tracker**: Interactive glass logging (+ / -), daily 2,000ml target progress, and last-logged timestamp.
  - **Break & Habit Reminders**: Filterable prompts with 15-minute snooze controls and one-click completion.
  - **Weekly Wellness Cadence**: 7-day visualization with dynamic metric switcher (Focus Hours, Screen Hours, Wellness Score).
  - **Recommended Wellness Actions**: Interactive protocols (4-7-8 breathing, neck release, eye depth shift) with completion toggles.
  - **Chronological Activity Timeline**: Real-time event log with category filtering and custom activity entry drawer.

- [x] **Comprehensive View Architecture**:
  - `Dashboard`: Core daily hub.
  - `My Wellness`: Deep-dive dimension scores, live 4-7-8 breathing coach, and mood journal.
  - `Activity`: Searchable and filterable activity history with JSON export.
  - `Insights`: Cognitive flow window mapping, fatigue pattern analysis, and actionable advice.
  - `Settings`: Daily target configuration, break intervals, and audio preferences.

- [x] **Verification & Quality Assurance**:
  - Clean TypeScript compilation with `noEmit` (0 errors).
  - Production build verification with Vite (0 warnings, optimized bundles).
  - Accessibility review (semantic elements, ARIA attributes, keyboard escape dismissal).

---

## 🔮 Sprint 2: Work-Pattern Analysis & Telemetry Engine (Upcoming)

**Objective**: Connect local workstation telemetry to automatically detect screen fatigue, continuous app usage, and keyboard/mouse ergonomics without compromising privacy.

### Planned Scope:
- **Local Workstation Daemon**: Lightweight background service (Electron or native OS agent) monitoring foreground app context.
- **Micro-Strain Calculation**: Exponential decay formula measuring eye and muscle fatigue based on uninterrupted display sessions.
- **Contextual Notification Triggers**: OS-level gentle prompts triggered at natural task completion boundaries (e.g., git commit, IDE window minimize).
- **Offline Persistence**: Local storage and IndexedDB repository for rolling 30-day activity logs.

---

## 🔮 Sprint 3: Adaptive AI Recommendation Engine (Upcoming)

**Objective**: Integrate on-device or privacy-preserving LLM capabilities to deliver hyper-personalized wellness advice and conversational check-ins.

### Planned Scope:
- **Circadian Modeling**: Machine learning algorithms identifying individual chronotypes (lark vs night-owl) and adjusting focus recommendations accordingly.
- **Mindora Conversational Guide**: Calming wellness companion offering reflective debriefs after intense work blocks.
- **Biometric Wearable Connectors**: Optional sync with Apple Health, Garmin, or Oura for heart rate variability (HRV) and sleep readiness correlation.

---

## 🔮 Sprint 4: Multi-Device Sync & Team Wellness (Upcoming)

**Objective**: Enable cross-device continuity and optional team-level wellness boundaries.

### Planned Scope:
- **Encrypted Synchronization**: Zero-knowledge end-to-end encrypted backup between laptop and mobile.
- **Focus Shielding**: Automatic status synchronization to Slack/Teams ("Elena is in a Deep Focus block until 11:30 AM").
- **Team Boundary Health**: Anonymous team-level indicators to prevent weekend messaging and meeting overload.
