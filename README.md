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

### Sprint 4: AI-Powered Wellness Personalization & Adaptive Daily Planning (Completed)
- **Modular Server-Side AIService & LLM Integration**:
  - Abstract `IAIProvider` interface with working **Google Gemini API** (`gemini-1.5-flash`) integration and support for OpenAI and Ollama.
  - Strict security isolation: API keys reside exclusively on the server and are never exposed in frontend code.
  - Dual server integration: standalone Node.js server (`server/index.mjs`) and zero-overhead Vite dev server middleware plugin (`mindoraAiServerPlugin`).
- **Deterministic Fallback Engine (`DeterministicFallbackEngine`)**:
  - High-accuracy local rule-based intelligence ensuring seamless offline operation, error resilience, and complete functionality when external AI is unavailable or unconfigured.
  - Dynamically adjusts focus intervals (25m Pomodoro sprints vs 45m deep flow) based on detected strain and fatigue.
- **Personalized Daily Wellness Plan (`DailyWellnessPlanCard`)**:
  - Interactive dashboard card with recommended focus blocks, restorative breaks, hydration milestones, eye-care pacing, and movement protocols.
  - One-click "Start Sprint" focus timer launching directly from planned focus blocks.
  - Real-time ritual completion progress bar with automatic timeline logging.
- **AI Insights Dashboard (`InsightsView`)**:
  - Full behavioral analytics dashboard clearly differentiating **✨ AI Observations** from **📊 Measured Telemetry**.
  - Weekly behavioral summary with Circadian Peak Flow (09:30 - 11:45 AM) and Post-Prandial Fatigue Dip windows.
  - Prioritized wellness improvement opportunities and intervention adherence statistics.
- **Privacy & Safety Invariants**:
  - User consent controls in Settings with data minimization (anonymized numeric metrics only; zero keystrokes, zero screenshots, zero private notes).
  - Prominent Non-Medical Disclaimer banner ensuring wellness advice is never presented as clinical or medical conclusions.
- **IndexedDB v3 Storage**:
  - Added `ai_daily_plans`, `ai_insights_cache`, and `ai_recommendations_history` object stores to persist plans and prevent repetitive suggestions across refreshes.

### Sprint 5: Conversational AI Wellness Companion & Guided Resets (Completed)
- **Dedicated AI Wellness Companion View (`CompanionView`)**:
  - Full-featured conversational chat interface added to desktop Sidebar and Mobile Navigation.
  - Multi-session drawer supporting session creation, renaming, deletion, and permanent history erasure.
  - Typing indicators, timestamps, message copy tools, and clean responsive layout.
- **Context-Aware Coaching & Metric Grounding**:
  - Deeply integrated with `ConversationService` and server-side endpoint `POST /api/ai/chat`.
  - With explicit user consent, provides telemetry context (focus minutes, sessions completed, screen time, hydration, strain) to give tailored advice without inventing false metrics.
- **Interactive Guided Resets (`GuidedExperienceCard`)**:
  - Structured interactive players embedded directly within chat bubbles.
  - Supports **4-7-8 Parasympathetic Breathing**, **20-20-20 Ocular Relief**, **Desk Neck & Shoulder Stretches**, and **Focus-Session Preparation**.
  - Includes real-time countdown timers, step progress bars, pause/resume, and automatic logging of completed rituals to the activity timeline.
- **Strict Crisis Safeguards & Medical Boundaries**:
  - Automated crisis language detection with immediate 24/7 hotline resources (988 Lifeline, 111 NHS, Crisis Text Line 741741, `findahelpline.com`).
  - Clear lifestyle ergonomics framing with zero clinical diagnoses or psychological treatment claims.
- **IndexedDB v4 Storage**:
  - Added `conversations` and `conversation_messages` object stores with complete offline deterministic conversation fallback.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: React 18 + TypeScript (Strict Type Safety)
- **Client-Side Storage**: Native IndexedDB (`mindora_wellness_db` v4) with 12 dedicated Object Stores
- **Styling**: Tailwind CSS with custom calming wellness theme tokens
- **Build Tool**: Vite 6 (ultra-fast HMR and optimized production bundles)
- **Server Layer**: Node.js HTTP server (`server/index.mjs`) + Vite dev middleware plugin
- **AI Intelligence**: Server-side Google Gemini REST integration (`gemini-1.5-flash`), OpenAI, Ollama, and `DeterministicFallbackEngine`
- **Conversational Companion**: Modular `ConversationService` with crisis safeguards and guided reset players
- **Icons**: Lucide React
- **Audio Synthesis**: Native Web Audio API (528Hz harmonic oscillator)
- **Telemetry Engine**: Modular `WorkPatternService` + `BrowserInAppTelemetryProvider`
- **Adaptive Reminder Engine**: Decoupled `WellnessReminderService` + Web Notifications API + in-app toast stack

---

## 📦 Getting Started

### Prerequisites
- Node.js `v18.0.0` or higher (tested on Node v22)
- npm `v9.0.0` or higher

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone git@github.com:Nataraj-EL/mindora.git
   cd mindora
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional for External AI)**:
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key if you wish to use cloud AI (`GEMINI_API_KEY=...`).
   *Note: If no API key is configured or consent is denied, Mindora seamlessly runs on its built-in local deterministic intelligence engine.*

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Run the standalone backend server (Optional / Production)**:
   ```bash
   npm run server
   ```

6. **Run TypeScript type-checking**:
   ```bash
   npm run type-check
   ```

7. **Build for production**:
   ```bash
   npm run build
   ```

8. **Preview the production build**:
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```
mindora/
├── .env.example                  # Environment configuration template
├── docs/
│   ├── architecture.md           # System architecture, storage schema v3, and security invariants
│   └── SPRINTS.md                # Sprint roadmaps and execution logs
├── server/
│   ├── aiRouter.mjs              # Server AI router (/api/ai/* endpoints)
│   ├── aiService.mjs             # Modular LLM providers (Gemini, OpenAI, Ollama)
│   └── index.mjs                 # Standalone Node HTTP server
├── src/
│   ├── components/
│   │   ├── common/               # Atomic UI components (Badge, Button, Card, ToastContainer, etc.)
│   │   ├── companion/            # GuidedExperienceCard (Interactive reset timers)
│   │   ├── layout/               # Header, Sidebar, MobileNav, AppLayout
│   │   ├── dashboard/            # DailyWellnessPlanCard, RemindersCard, WellnessActionsCard, etc.
│   │   └── views/                # DashboardView, MyWellnessView, ActivityView, InsightsView, CompanionView, SettingsView
│   ├── context/
│   │   └── WellnessContext.tsx   # Central state, daily plan, AI insights & storage hydration
│   ├── data/
│   │   └── mockData.ts           # Initial baseline and seeding dataset
│   ├── hooks/
│   │   ├── useAppActiveTimeTracker.ts  # Presence heartbeat and in-app time tracker
│   │   └── useWorkPatternTracker.ts    # Reusable analytics and logging hook
│   ├── services/
│   │   ├── ai/
│   │   │   ├── aiService.ts      # Client-side AI orchestrator, consent & network handler
│   │   │   └── deterministicFallbackEngine.ts # Rule-based local intelligence fallback
│   │   ├── conversation/
│   │   │   └── conversationService.ts # Conversational companion, crisis detection & fallback
│   │   ├── reminders/
│   │   │   └── wellnessReminderService.ts # Adaptive reminders, anti-spam throttling & quiet hours
│   │   ├── storage/
│   │   │   └── indexedDb.ts      # Native IndexedDB storage engine (v4 with conversations & messages)
│   │   └── tracking/
│   │       ├── telemetryInterfaces.ts  # ITelemetryProvider and BrowserInAppTelemetryProvider
│   │       └── workPatternService.ts   # WorkPatternService analytics and event engine
│   ├── styles/
│   │   └── index.css             # Tailwind base directives and calm styling
│   ├── types/
│   │   ├── index.ts              # Core domain models
│   │   ├── ai.ts                 # Daily plan, AI insights, payload & provider types
│   │   ├── conversation.ts       # Chat message, conversation session & guided experience types
│   │   ├── reminders.ts          # Adaptive reminder, notification toast & effectiveness types
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
