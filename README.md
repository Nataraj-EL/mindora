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

---

## 🚀 Sprint 1: Foundation & Dashboard

Sprint 1 delivers the production-ready foundation and comprehensive interactive dashboard:

### 1. Modern Wellness Design System
- Calming visual identity built with warm neutrals (`#FAF9F5`), muted sage greens (`#3D6B42`, `#538A58`), sand tones, and subtle terracotta/sky accents.
- Purposefully avoids excessive gradients, heavy glassmorphism, or distracting animations to preserve user focus and calm.
- Fully responsive across desktop, tablet, and mobile with persistent sidebar and touch-friendly navigation.

### 2. Comprehensive Wellness Dashboard
- **Personalized Welcome Section**: Contextual time-of-day greeting, day metrics snapshot, and interactive mood/energy logger.
- **Today's Screen-Time Overview**: Active display exposure, category breakdown (Focus & Code, Architecture Review, Team Sync, Documentation), continuous screen block monitor, and fatigue delta vs yesterday.
- **Focus Session Summary & Streak**: Deep work blocks completed (e.g. 4/6), 7-day consistency streak, and one-click session triggers.
- **Working Focus Session Timer**: Full Pomodoro engine with 25m Focus, 5m Short Break, and 15m Long Break intervals, circular countdown visual, task intention input, and calm Tibetan singing bowl harmonic chime (Web Audio API synthetic oscillator).
- **Daily Wellness Score (87/100)**: Multi-dimensional score breakdown covering Physical Ergonomics (84%), Mental Focus Quality (92%), Work Cadence (89%), and Rest Recovery (82%), accompanied by AI wellness observations.
- **Hydration Tracker Card**: Interactive glass-by-glass logging (+ / -), daily volume tracking (1,250ml / 2,000ml target), and last logged timestamp.
- **Break & Habit Reminders**: Adaptive prompts (hydration check, 20-20-20 eye relaxation, ergonomic shoulder rolls) with Snooze (+15m) and Mark Complete controls.
- **Weekly Activity Cadence**: 7-day visualization with dynamic metric switcher (Focus Hours, Screen Hours, Wellness Score).
- **Recommended Wellness Actions**: Context-aware interventions (4-7-8 parasympathetic breathing, visual depth shifts, sub-occipital neck release) with completion toggles.
- **Chronological Activity Timeline**: Real-time event log with category filtering (Focus, Breaks, Movement, Hydration, Wellbeing) and custom activity entry support.

### 3. Holistic Application Views
- **Dashboard**: Primary operations and high-level vitals.
- **My Wellness**: Deep-dive wellness dimensions, live 4-7-8 breathing coach, and mood history journal.
- **Activity**: Searchable, filterable event history with JSON data export.
- **Insights**: AI-inspired cognitive pattern analysis, peak focus window detection, and circadian cadence mapping.
- **Settings**: Customizable daily goals (screen time limits, target focus blocks, hydration targets), break frequencies, and sensory audio controls.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework**: React 18 + TypeScript (Strict Type Safety)
- **Styling**: Tailwind CSS with custom calming wellness theme extensions
- **Build Tool**: Vite 6 (ultra-fast HMR and optimized production bundles)
- **Icons**: Lucide React
- **Audio Synthesis**: Native Web Audio API (zero external sound dependencies)
- **State Management**: React Context (`WellnessContext`) with encapsulated domain reducers and persistent mock data models

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
│   ├── architecture.md       # Technical architecture specification
│   └── SPRINTS.md            # Sprint tracking and release milestones
├── src/
│   ├── components/
│   │   ├── common/           # Atomic UI elements (Button, Badge, Card, Modal, ProgressBar, CircularProgress)
│   │   ├── layout/           # Sidebar, Header, MobileNav, AppLayout
│   │   ├── dashboard/        # WelcomeSection, ScreenTimeCard, FocusSummaryCard, FocusTimerModal, etc.
│   │   └── views/            # DashboardView, MyWellnessView, ActivityView, InsightsView, SettingsView
│   ├── context/
│   │   └── WellnessContext.tsx # Central wellness state management & actions
│   ├── data/
│   │   └── mockData.ts       # Cohesive realistic wellness dataset
│   ├── styles/
│   │   └── index.css         # Tailwind base directives and calm styling
│   ├── types/
│   │   └── index.ts          # Strongly typed domain entities
│   ├── App.tsx               # View router and layout container
│   └── main.tsx              # Application entry point
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🌿 Wellness Principles

1. **Gentle Accountability**: Encourage positive habit loops rather than punitive warnings.
2. **Cognitive Ergonomics**: Protect flow state by batching notifications at natural transition boundaries.
3. **Calm Aesthetic**: Warm neutrals and soft earthen tones prevent digital overstimulation.
4. **Data Sovereignty**: Zero invasive telemetry; mock data used safely until local AI integration in future sprints.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
