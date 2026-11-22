import { ActivityCategory, DayActivityData, FocusTimerMode } from './index';

export interface ActivityEvent {
  id: string;
  type: ActivityCategory;
  category: ActivityCategory;
  title: string;
  description: string;
  timestamp: string; // ISO-8601
  dateKey: string; // YYYY-MM-DD
  timeDisplay: string; // e.g. "4:45 PM"
  durationMinutes?: number;
  impact: 'positive' | 'neutral' | 'restorative';
  metadata?: Record<string, unknown>;
}

export interface FocusSessionRecord {
  id: string;
  dateKey: string; // YYYY-MM-DD
  taskName: string;
  mode: FocusTimerMode;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
  isCompleted: boolean;
}

export interface HydrationRecord {
  id: string;
  timestamp: string;
  dateKey: string; // YYYY-MM-DD
  amountMl: number;
}

export interface AppUsageRecord {
  id: string;
  dateKey: string; // YYYY-MM-DD
  activeSeconds: number;
  idleSeconds: number;
  continuousActiveSeconds: number;
  lastActiveTimestamp: string;
}

export interface WorkPatternAnalytics {
  todayFocusMinutes: number;
  todayFocusSessionsCount: number;
  todayBreakMinutes: number;
  todayBreaksCount: number;
  averageSessionLengthMinutes: number;
  todayHydrationMl: number;
  todayInAppActiveMinutes: number;
  continuousActiveMinutes: number;
  isProlongedFocus: boolean;
  focusToBreakRatio: string;
  weeklyActivity: DayActivityData[];
}

export interface TrackingStatus {
  isTracking: boolean;
  isIdle: boolean;
  mode: 'in_app_only' | 'simulated_full_workday';
  source: 'browser_active_telemetry' | 'desktop_telemetry_stub';
  activeSessionDurationSeconds: number;
  lastInteractionTime: number;
}

export type DateFilterOption = 'today' | 'yesterday' | 'past_7_days' | 'all';
