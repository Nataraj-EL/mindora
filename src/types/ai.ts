export type AIProviderType = 'gemini' | 'openai' | 'ollama' | 'fallback' | 'custom';

export interface AIHealthStatus {
  available: boolean;
  provider: AIProviderType;
  model?: string;
  serverVersion?: string;
  error?: string;
}

export interface AIConsentSettings {
  hasConsented: boolean;
  consentedAt: string | null;
  allowAnonymizedMetrics: boolean;
}

export interface PlanFocusBlock {
  id: string;
  title: string;
  startTime: string; // e.g. "09:30"
  endTime: string;   // e.g. "11:00"
  durationMinutes: number;
  targetGoal: string;
  isCompleted: boolean;
}

export interface PlanBreakInterval {
  id: string;
  title: string;
  scheduledTime: string; // e.g. "11:00"
  durationMinutes: number;
  type: 'micro' | 'posture' | 'hydration' | 'restorative' | 'meal';
  isCompleted: boolean;
}

export interface PlanMovementRecommendation {
  id: string;
  title: string;
  targetWindow: 'morning' | 'midday' | 'afternoon';
  durationMinutes: number;
  description: string;
  isCompleted: boolean;
}

export interface PlanRecoverySuggestion {
  id: string;
  title: string;
  category: 'breathing' | 'meditation' | 'nature' | 'unplug';
  guidance: string;
  isCompleted: boolean;
}

export interface DailyWellnessPlan {
  id: string;
  dateKey: string;
  generatedAt: string;
  source: 'ai' | 'deterministic_fallback';
  providerUsed?: string;
  summary: string;
  focusBlocks: PlanFocusBlock[];
  breakIntervals: PlanBreakInterval[];
  hydrationGoal: {
    targetMl: number;
    glassesCount: number;
    intervalMinutes: number;
    currentGlasses: number;
  };
  eyeCareSchedule: {
    rule: string;
    intervalMinutes: number;
    targetPromptCount: number;
    completedCount: number;
  };
  movementRecommendations: PlanMovementRecommendation[];
  recoverySuggestions: PlanRecoverySuggestion[];
}

export interface AIPatternObservation {
  id: string;
  category: 'focus' | 'fatigue' | 'rhythm' | 'hydration' | 'recovery';
  observation: string;
  evidenceMetric: string;
  isAiGenerated: boolean; // clearly distinguishes AI vs directly measured metrics
  suggestedAdjustment: string;
}

export interface WeeklyBehavioralSummary {
  focusTrend: string;
  circadianPeakWindow: string;
  fatigueDropWindow: string;
  breakComplianceRate: number; // 0 - 100 percentage
  hydrationConsistencyRate: number; // 0 - 100 percentage
  keyTakeaway: string;
}

export interface ImprovementOpportunity {
  id: string;
  area: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  rationale: string;
}

export interface AIInsightsDashboardData {
  generatedAt: string;
  source: 'ai' | 'deterministic_fallback';
  patternObservations: AIPatternObservation[];
  weeklySummary: WeeklyBehavioralSummary;
  improvementOpportunities: ImprovementOpportunity[];
  recommendationEffectivenessSummary: {
    totalDelivered: number;
    acceptedCount: number;
    adherencePercentage: number;
    feedbackNotes: string;
  };
  medicalDisclaimer: string;
}

export interface AIPersonalizationPayload {
  userGoals: {
    maxScreenTimeMinutes: number;
    targetFocusMinutes: number;
    hydrationGlasses: number;
    breaksCount: number;
  };
  todayMetrics: {
    focusMinutes: number;
    focusSessionCount: number;
    averageSessionMinutes: number;
    screenTimeMinutes: number;
    inAppActiveMinutes: number;
    continuousStrainMinutes: number;
    hydrationGlasses: number;
    breakCount: number;
    wellnessScore: number;
  };
  recentMoodSummary?: {
    latestMoodLevel: number;
    latestMoodLabel: string;
    averageMoodScore: number;
  };
  weeklyAggregates?: {
    dailyAverages: {
      screenTimeHours: number;
      focusHours: number;
      wellnessScore: number;
    };
  };
  recentRecommendationHashes?: string[];
}
