export type NavigationTab = 'dashboard' | 'wellness' | 'activity' | 'insights' | 'companion' | 'settings';

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  email: string;
  avatarUrl: string;
  joinedDate: string;
  timezone: string;
  dailyGoals: {
    maxScreenTimeMinutes: number;
    targetFocusMinutes: number;
    hydrationGlasses: number;
    breaksCount: number;
  };
}

export interface ScreenTimeCategoryBreakdown {
  category: string;
  minutes: number;
  percentage: number;
  color: string;
}

export interface ScreenTimeData {
  totalMinutes: number;
  inAppActiveMinutes: number; // Actual tracked in-app time in Mindora
  maxTargetMinutes: number;
  activeContinuousMinutes: number;
  continuousStrainThresholdMinutes: number;
  changeVsYesterdayMinutes: number; // positive = more screen time, negative = less
  isEstimatedSystemTotal: boolean;
  categories: ScreenTimeCategoryBreakdown[];
}

export interface FocusSessionSummary {
  totalFocusMinutes: number;
  targetFocusMinutes: number;
  completedSessions: number;
  targetSessions: number;
  currentStreakDays: number;
  averageSessionLengthMinutes: number;
}

export type FocusTimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface FocusTimerState {
  mode: FocusTimerMode;
  totalDurationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  sessionsCompletedToday: number;
  soundEnabled: boolean;
  activeTaskName: string;
}

export interface HydrationLog {
  currentGlasses: number;
  targetGlasses: number;
  glassSizeMl: number;
  lastLoggedTime: string | null;
}

export interface WellnessScoreDimension {
  name: string;
  score: number;
  weight: number;
  description: string;
  status: 'optimal' | 'good' | 'attention';
}

export interface WellnessScoreData {
  overall: number; // 0 - 100
  deltaVsYesterday: number;
  statusLabel: string;
  badgeVariant: 'optimal' | 'good' | 'strained';
  dimensions: {
    physical: WellnessScoreDimension;
    mentalFocus: WellnessScoreDimension;
    workRhythm: WellnessScoreDimension;
    restRecovery: WellnessScoreDimension;
  };
  aiObservation: string;
}

export * from './reminders';
export * from './ai';
export * from './conversation';

export type ActivityCategory = 'focus' | 'break' | 'hydration' | 'movement' | 'wellbeing';

export interface ActivityTimelineItem {
  id: string;
  timestamp: string;
  timeDisplay: string;
  title: string;
  description: string;
  durationMinutes?: number;
  category: ActivityCategory;
  impact: 'positive' | 'neutral' | 'restorative';
}

export interface DayActivityData {
  dayName: string;
  shortDate: string;
  screenTimeHours: number;
  focusHours: number;
  breakCount: number;
  wellnessScore: number;
  isToday: boolean;
}

export interface RecommendedWellnessAction {
  id: string;
  title: string;
  category: 'breathing' | 'hydration' | 'stretch' | 'eye-care' | 'mindfulness';
  timeEstimate: string;
  energyImpact: 'Deep Reset' | 'Gentle Boost' | 'Physical Relief';
  description: string;
  isCompleted: boolean;
}

export interface MoodEntry {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  label: string;
  emoji: string;
  note?: string;
  timestamp: string;
}

export interface WellnessInsightItem {
  id: string;
  type: 'rhythm' | 'fatigue' | 'focus' | 'recovery';
  title: string;
  summary: string;
  recommendation: string;
  metricBadge: string;
  priority: 'high' | 'medium' | 'info';
}
