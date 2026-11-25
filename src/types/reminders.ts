export type ReminderCategory =
  | 'hydration'
  | 'eye-break'
  | 'posture'
  | 'movement'
  | 'breathing'
  | 'rest';

export type ReminderPriority = 'routine' | 'medium' | 'high' | 'critical';

export type ReminderStatus = 'pending' | 'due' | 'snoozed' | 'completed' | 'dismissed';

export interface AdaptiveReminder {
  id: string;
  title: string;
  description: string;
  category: ReminderCategory;
  priority: ReminderPriority;
  status: ReminderStatus;
  createdAt: string; // ISO-8601
  dueAt: string;     // ISO-8601
  snoozedUntil?: string; // ISO-8601
  completedAt?: string;  // ISO-8601
  dismissedAt?: string;  // ISO-8601
  triggerReason: string; // e.g. "Continuous screen focus: 52 mins"
  actionLabel?: string;  // e.g. "Take 20s Eye Break"
  durationEstimateMinutes?: number;
  effectivenessFeedback?: 'helpful' | 'neutral' | 'unhelpful';

  // Sprint 1 backwards compatibility fields
  dueTime?: string;
  urgency?: 'routine' | 'due-soon' | 'overdue';
  isCompleted?: boolean;
}

export type ReminderItem = AdaptiveReminder;

export interface NotificationToast {
  id: string;
  reminderId?: string;
  title: string;
  message: string;
  category: ReminderCategory;
  priority: ReminderPriority;
  timestamp: string;
  triggerReason?: string;
  durationMs?: number; // 0 for persistent until dismissed
  actions?: Array<{
    label: string;
    action: 'complete' | 'snooze' | 'dismiss';
    snoozeMinutes?: number;
  }>;
}

export interface NotificationSettings {
  inAppToastsEnabled: boolean;
  browserNotificationsEnabled: boolean;
  soundAlertsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "12:30" (24-hr format)
  quietHoursEnd: string;   // e.g. "13:30" (24-hr format)
  frequencyIntervalMinutes: number; // e.g. 30, 45, 60
  categoryPreferences: Record<ReminderCategory, boolean>;
}

export interface ContextualWellnessRecommendation {
  id: string;
  title: string;
  category: ReminderCategory;
  timeEstimate: string;
  energyImpact: 'Deep Reset' | 'Gentle Boost' | 'Physical Relief';
  reason: string;        // Explicit "Why this is recommended"
  instruction: string;   // Actionable step-by-step guidance
  priorityScore: number; // Dynamic ranking based on fatigue metrics
  isCompleted: boolean;
}

export interface ReminderEffectivenessStats {
  totalGenerated: number;
  totalCompleted: number;
  totalSnoozed: number;
  totalDismissed: number;
  complianceRate: number; // Percentage 0 - 100
  mostCompliantCategory: string;
  averageResponseTimeSeconds: number;
}
