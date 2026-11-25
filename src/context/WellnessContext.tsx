import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import {
  NavigationTab,
  UserProfile,
  ScreenTimeData,
  FocusSessionSummary,
  WellnessScoreData,
  ActivityTimelineItem,
  DayActivityData,
  RecommendedWellnessAction,
  WellnessInsightItem,
  MoodEntry,
  FocusTimerMode,
  FocusTimerState,
  HydrationLog,
  ActivityCategory,
} from '../types';
import {
  AdaptiveReminder,
  NotificationToast,
  NotificationSettings,
  ContextualWellnessRecommendation,
  ReminderEffectivenessStats,
} from '../types/reminders';
import {
  ActivityEvent,
  FocusSessionRecord,
  HydrationRecord,
  DateFilterOption,
} from '../types/tracking';
import {
  mockUserProfile,
  initialScreenTimeData,
  initialFocusSummary,
  initialWellnessScore,
  initialReminders,
  initialActivityTimeline,
  weeklyActivityData,
  initialWellnessActions,
  initialInsights,
  initialMoodEntries,
} from '../data/mockData';
import { storage } from '../services/storage/indexedDb';
import { workPatternService, getDateKey } from '../services/tracking/workPatternService';
import {
  wellnessReminderService,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '../services/reminders/wellnessReminderService';
import { useAppActiveTimeTracker } from '../hooks/useAppActiveTimeTracker';

interface TrackingStateInfo {
  isTracking: boolean;
  isIdle: boolean;
  isVisible: boolean;
  inAppActiveSeconds: number;
  continuousActiveSeconds: number;
  sessionMinutes: number;
}

interface WellnessContextType {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Storage Initialization state
  isStorageInitialized: boolean;

  // User
  user: UserProfile;
  updateUserGoals: (goals: Partial<UserProfile['dailyGoals']>) => void;

  // Screen Time & Wellness Score
  screenTime: ScreenTimeData;
  wellnessScore: WellnessScoreData;
  recalculateWellnessScore: () => void;

  // Focus Summary & Timer
  focusSummary: FocusSessionSummary;
  focusTimer: FocusTimerState;
  isTimerModalOpen: boolean;
  setIsTimerModalOpen: (open: boolean) => void;
  setTimerMode: (mode: FocusTimerMode) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  toggleSound: () => void;
  setActiveTaskName: (name: string) => void;

  // Hydration
  hydration: HydrationLog;
  logGlassOfWater: () => void;
  removeGlassOfWater: () => void;

  // Adaptive Reminders
  reminders: AdaptiveReminder[];
  completeReminder: (id: string) => Promise<void>;
  snoozeReminder: (id: string, snoozeMinutes?: number) => Promise<void>;
  dismissReminder: (id: string) => Promise<void>;

  // In-App Toast Notifications
  toasts: NotificationToast[];
  dismissToast: (id: string) => void;
  completeToast: (toast: NotificationToast) => Promise<void>;
  snoozeToast: (toast: NotificationToast, snoozeMinutes?: number) => Promise<void>;

  // Notification & Scheduling Settings
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  browserPermission: NotificationPermission | 'unsupported';
  requestBrowserNotificationPermission: () => Promise<boolean>;

  // Reminder Effectiveness Statistics
  reminderStats: ReminderEffectivenessStats;
  refreshReminderStats: () => Promise<void>;

  // Contextual Recommendations (with explicit "Why" explanations)
  contextualRecommendations: ContextualWellnessRecommendation[];
  toggleContextualRecommendation: (id: string) => Promise<void>;

  // Activity Timeline & Filtering
  timeline: ActivityTimelineItem[];
  timelineCategoryFilter: 'all' | ActivityCategory;
  setTimelineCategoryFilter: (filter: 'all' | ActivityCategory) => void;
  timelineDateFilter: DateFilterOption;
  setTimelineDateFilter: (filter: DateFilterOption) => void;
  addTimelineItem: (
    item: Omit<ActivityTimelineItem, 'id' | 'timestamp' | 'timeDisplay'>
  ) => Promise<void>;

  // Weekly visualization
  weeklyActivity: DayActivityData[];
  weeklyMetric: 'screenTime' | 'focus' | 'wellness';
  setWeeklyMetric: (metric: 'screenTime' | 'focus' | 'wellness') => void;

  // Recommended Actions (Sprint 1 backward compatible)
  recommendedActions: RecommendedWellnessAction[];
  toggleActionCompletion: (id: string) => void;

  // Mood Log
  moodEntries: MoodEntry[];
  logMood: (level: 1 | 2 | 3 | 4 | 5, label: string, note?: string) => void;

  // Insights
  insights: WellnessInsightItem[];

  // Real-time tracking status & storage tools
  trackingStatus: TrackingStateInfo;
  clearAllStoredData: () => Promise<void>;
  exportStoredData: () => Promise<string>;
  refreshAnalytics: () => Promise<void>;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

const TIMER_DURATIONS: Record<FocusTimerMode, number> = {
  focus: 25 * 60, // 25 min
  shortBreak: 5 * 60, // 5 min
  longBreak: 15 * 60, // 15 min
};

// Play a gentle, soothing chime using Web Audio API
const playCalmChime = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, ctx.currentTime); // 528 Hz harmonic
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch {
    // Gracefully handle browsers blocking unprompted audio
  }
};

export const WellnessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isStorageInitialized, setIsStorageInitialized] = useState(false);
  const [user, setUser] = useState<UserProfile>(mockUserProfile);
  const [screenTime, setScreenTime] = useState<ScreenTimeData>(initialScreenTimeData);
  const [wellnessScore, setWellnessScore] = useState<WellnessScoreData>(initialWellnessScore);
  const [focusSummary, setFocusSummary] = useState<FocusSessionSummary>(initialFocusSummary);

  // Reminders state
  const [reminders, setReminders] = useState<AdaptiveReminder[]>(initialReminders);

  // In-App Toast state
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  // Notification Settings & Permissions
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>(
    wellnessReminderService.getBrowserPermissionStatus()
  );

  // Reminder Effectiveness Stats
  const [reminderStats, setReminderStats] = useState<ReminderEffectivenessStats>({
    totalGenerated: 12,
    totalCompleted: 9,
    totalSnoozed: 4,
    totalDismissed: 2,
    complianceRate: 82,
    mostCompliantCategory: 'Hydration & Eye Care',
    averageResponseTimeSeconds: 38,
  });

  // Hydration state
  const [hydration, setHydration] = useState<HydrationLog>({
    currentGlasses: 5,
    targetGlasses: 8,
    glassSizeMl: 250,
    lastLoggedTime: '4:15 PM',
  });

  // Timeline & filtering
  const [timeline, setTimeline] = useState<ActivityTimelineItem[]>(initialActivityTimeline);
  const [timelineCategoryFilter, setTimelineCategoryFilter] = useState<'all' | ActivityCategory>('all');
  const [timelineDateFilter, setTimelineDateFilter] = useState<DateFilterOption>('today');

  // Weekly visualization
  const [weeklyActivity, setWeeklyActivity] = useState<DayActivityData[]>(weeklyActivityData);
  const [weeklyMetric, setWeeklyMetric] = useState<'screenTime' | 'focus' | 'wellness'>('focus');

  // Contextual Recommendations (with explicit "Why" reasoning)
  const [contextualRecommendations, setContextualRecommendations] = useState<
    ContextualWellnessRecommendation[]
  >([]);

  // Recommended actions (Sprint 1 fallback)
  const [recommendedActions, setRecommendedActions] = useState<RecommendedWellnessAction[]>(
    initialWellnessActions
  );

  // Mood Entries
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(initialMoodEntries);
  const [insights] = useState<WellnessInsightItem[]>(initialInsights);

  // Active in-app usage tracker hook
  const trackingStatus = useAppActiveTimeTracker(true);

  // Focus Timer
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [focusTimer, setFocusTimer] = useState<FocusTimerState>({
    mode: 'focus',
    totalDurationSeconds: TIMER_DURATIONS.focus,
    remainingSeconds: TIMER_DURATIONS.focus,
    isRunning: false,
    sessionsCompletedToday: 4,
    soundEnabled: true,
    activeTaskName: 'Deep Flow & Mindful Design',
  });

  const remindersRef = useRef(reminders);
  remindersRef.current = reminders;

  const notificationSettingsRef = useRef(notificationSettings);
  notificationSettingsRef.current = notificationSettings;

  // Refresh reminder statistics from storage
  const refreshReminderStats = useCallback(async () => {
    try {
      const stats = await wellnessReminderService.getEffectivenessStats();
      setReminderStats(stats);
    } catch {
      // Graceful fallback
    }
  }, []);

  // Compute and refresh daily/weekly analytics from real IndexedDB storage
  const refreshAnalytics = useCallback(async () => {
    try {
      const todayKey = getDateKey();
      const analytics = await workPatternService.calculateDailyAnalytics(todayKey);
      const storedActivities = await workPatternService.getFilteredActivities(
        timelineDateFilter,
        timelineCategoryFilter
      );
      const storedHydrations = await storage.getHydrationLogs(todayKey);
      const storedMoods = await storage.getMoodEntries();
      const storedReminders = await storage.getReminders();

      // Update timeline
      if (storedActivities.length > 0) {
        setTimeline(storedActivities);
      }

      // Update reminders from storage
      if (storedReminders.length > 0) {
        setReminders(storedReminders);
      }

      // Update focus summary from actual database records
      if (analytics.todayFocusSessionsCount > 0 || analytics.todayFocusMinutes > 0) {
        setFocusSummary((prev) => ({
          ...prev,
          completedSessions: analytics.todayFocusSessionsCount,
          totalFocusMinutes: analytics.todayFocusMinutes,
          averageSessionLengthMinutes: analytics.averageSessionLengthMinutes,
        }));
      }

      // Update hydration count from actual records
      if (storedHydrations.length > 0) {
        const lastEntry = storedHydrations[storedHydrations.length - 1];
        setHydration((prev) => ({
          ...prev,
          currentGlasses: storedHydrations.length,
          lastLoggedTime: new Date(lastEntry.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
      }

      // Update weekly trend
      if (analytics.weeklyActivity.length > 0) {
        setWeeklyActivity(analytics.weeklyActivity);
      }

      // Update mood entries
      if (storedMoods.length > 0) {
        setMoodEntries(storedMoods);
      }

      // Update screen time in-app vs estimated workday total
      setScreenTime((prev) => {
        const inAppMinutes = Math.max(
          Math.round(trackingStatus.inAppActiveSeconds / 60),
          analytics.todayInAppActiveMinutes
        );
        const continuousMinutes = Math.max(
          Math.round(trackingStatus.continuousActiveSeconds / 60),
          analytics.continuousActiveMinutes,
          prev.activeContinuousMinutes
        );

        return {
          ...prev,
          inAppActiveMinutes: inAppMinutes,
          activeContinuousMinutes: continuousMinutes,
        };
      });

      // Update contextual recommendations
      const recs = wellnessReminderService.generateContextualRecommendations({
        continuousActiveMinutes: Math.round(trackingStatus.continuousActiveSeconds / 60),
        hydrationCount: storedHydrations.length || 5,
        targetHydration: user.dailyGoals.hydrationGlasses,
        completedFocusSessions: analytics.todayFocusSessionsCount || 4,
      });
      setContextualRecommendations(recs);

      await refreshReminderStats();
    } catch {
      // Graceful fallback
    }
  }, [
    timelineDateFilter,
    timelineCategoryFilter,
    trackingStatus.inAppActiveSeconds,
    trackingStatus.continuousActiveSeconds,
    user.dailyGoals.hydrationGlasses,
    refreshReminderStats,
  ]);

  // Initial Storage Hydration & Seeding
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        const todayKey = getDateKey();
        const isSeeded = await storage.isDataSeeded();

        if (!isSeeded) {
          // Convert initial mock data into database records
          const initialEvents: ActivityEvent[] = initialActivityTimeline.map((item) => ({
            ...item,
            type: item.category,
            dateKey: todayKey,
          }));

          const initialSessions: FocusSessionRecord[] = [
            {
              id: 'sess_1',
              dateKey: todayKey,
              taskName: 'Mindora system architecture & core state synchronization',
              mode: 'focus',
              durationMinutes: 25,
              startedAt: new Date(Date.now() - 3600000).toISOString(),
              completedAt: new Date(Date.now() - 2100000).toISOString(),
              isCompleted: true,
            },
            {
              id: 'sess_2',
              dateKey: todayKey,
              taskName: 'Sprint planning and user journey workflow mapping',
              mode: 'focus',
              durationMinutes: 25,
              startedAt: new Date(Date.now() - 7200000).toISOString(),
              completedAt: new Date(Date.now() - 5700000).toISOString(),
              isCompleted: true,
            },
            {
              id: 'sess_3',
              dateKey: todayKey,
              taskName: 'Database schema refinement and API payload specification',
              mode: 'focus',
              durationMinutes: 25,
              startedAt: new Date(Date.now() - 14400000).toISOString(),
              completedAt: new Date(Date.now() - 12900000).toISOString(),
              isCompleted: true,
            },
            {
              id: 'sess_4',
              dateKey: todayKey,
              taskName: 'Day Start & Intent Setting Block',
              mode: 'focus',
              durationMinutes: 25,
              startedAt: new Date(Date.now() - 21600000).toISOString(),
              completedAt: new Date(Date.now() - 20100000).toISOString(),
              isCompleted: true,
            },
          ];

          const initialHydrations: HydrationRecord[] = Array.from({ length: 5 }).map(
            (_, idx) => ({
              id: `hyd_seed_${idx}`,
              timestamp: new Date(Date.now() - (5 - idx) * 3600000).toISOString(),
              dateKey: todayKey,
              amountMl: 250,
            })
          );

          const initialMoods = initialMoodEntries.map((m) => ({
            ...m,
            dateKey: todayKey,
          }));

          await storage.seedInitialDataset(
            initialEvents,
            initialSessions,
            initialHydrations,
            initialMoods
          );

          // Seed initial reminders into reminders store
          for (const rem of initialReminders) {
            await storage.saveReminder(rem);
          }
        }

        // Restore custom user settings & notification settings if present
        const savedGoals = await storage.getSetting<UserProfile['dailyGoals']>('user_goals');
        if (savedGoals) {
          setUser((prev) => ({
            ...prev,
            dailyGoals: {
              ...prev.dailyGoals,
              ...savedGoals,
            },
          }));
        }

        const savedNotifSettings = await storage.getSetting<NotificationSettings>('notification_settings');
        if (savedNotifSettings) {
          setNotificationSettings(savedNotifSettings);
        }

        await refreshAnalytics();
        setIsStorageInitialized(true);
      } catch {
        setIsStorageInitialized(true);
      }
    };

    initializeStorage();
  }, [refreshAnalytics]);

  // Periodic Adaptive Reminder Evaluation Loop (Runs every 15 seconds)
  useEffect(() => {
    if (!isStorageInitialized) return;

    const evaluationInterval = setInterval(async () => {
      try {
        const continuousMinutes = Math.floor(trackingStatus.continuousActiveSeconds / 60);
        const inAppMinutes = Math.floor(trackingStatus.inAppActiveSeconds / 60);

        const { newReminders, toastsToTrigger } = await wellnessReminderService.evaluateAdaptiveReminders({
          continuousActiveMinutes: continuousMinutes,
          inAppActiveMinutes: inAppMinutes,
          isTimerRunning: focusTimer.isRunning,
          isIdle: trackingStatus.isIdle,
          isVisible: trackingStatus.isVisible,
          hydrationCount: hydration.currentGlasses,
          targetHydration: user.dailyGoals.hydrationGlasses,
          settings: notificationSettingsRef.current,
          existingReminders: remindersRef.current,
        });

        if (newReminders.length > 0) {
          setReminders((prev) => [...newReminders, ...prev]);

          // Play gentle chime if sound enabled
          if (notificationSettingsRef.current.soundAlertsEnabled) {
            playCalmChime();
          }
        }

        if (toastsToTrigger.length > 0 && notificationSettingsRef.current.inAppToastsEnabled) {
          setToasts((prev) => [...toastsToTrigger, ...prev].slice(0, 4)); // max 4 toasts on screen
        }
      } catch {
        // Non-blocking reminder evaluation
      }
    }, 15000);

    return () => clearInterval(evaluationInterval);
  }, [
    isStorageInitialized,
    trackingStatus.continuousActiveSeconds,
    trackingStatus.inAppActiveSeconds,
    trackingStatus.isIdle,
    trackingStatus.isVisible,
    focusTimer.isRunning,
    hydration.currentGlasses,
    user.dailyGoals.hydrationGlasses,
  ]);

  // Update notification settings
  const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    const updated = {
      ...notificationSettings,
      ...settings,
    };
    setNotificationSettings(updated);
    await storage.saveSetting('notification_settings', updated);
  };

  // Request browser notification permission
  const requestBrowserNotificationPermission = async (): Promise<boolean> => {
    const granted = await wellnessReminderService.requestBrowserNotificationPermission();
    setBrowserPermission(granted ? 'granted' : 'denied');
    if (granted) {
      await updateNotificationSettings({ browserNotificationsEnabled: true });
    }
    return granted;
  };

  // Toast actions
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const completeToast = async (toast: NotificationToast) => {
    dismissToast(toast.id);
    if (toast.reminderId) {
      await completeReminder(toast.reminderId);
    }
  };

  const snoozeToast = async (toast: NotificationToast, snoozeMinutes = 15) => {
    dismissToast(toast.id);
    if (toast.reminderId) {
      await snoozeReminder(toast.reminderId, snoozeMinutes);
    }
  };

  // Reminders management
  const completeReminder = async (id: string) => {
    const { updatedReminders } = await wellnessReminderService.completeReminder(id, reminders);
    setReminders(updatedReminders);

    // If it was a hydration reminder, increment hydration count in state
    const completed = updatedReminders.find((r) => r.id === id);
    if (completed?.category === 'hydration') {
      const now = new Date();
      setHydration((prev) => ({
        ...prev,
        currentGlasses: Math.min(prev.currentGlasses + 1, 16),
        lastLoggedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    }

    await refreshAnalytics();
    recalculateWellnessScore();
  };

  const snoozeReminder = async (id: string, snoozeMinutes = 15) => {
    const updated = await wellnessReminderService.snoozeReminder(id, snoozeMinutes, reminders);
    setReminders(updated);
    await refreshAnalytics();
  };

  const dismissReminder = async (id: string) => {
    const updated = await wellnessReminderService.dismissReminder(id, reminders);
    setReminders(updated);
    await refreshAnalytics();
  };

  // Contextual Recommendations toggle
  const toggleContextualRecommendation = async (id: string) => {
    setContextualRecommendations((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          const nextState = !rec.isCompleted;
          if (nextState) {
            workPatternService.recordActivity({
              type: rec.category === 'hydration' ? 'hydration' : 'break',
              category: rec.category === 'hydration' ? 'hydration' : rec.category === 'movement' ? 'movement' : 'break',
              title: `Completed: ${rec.title}`,
              description: `${rec.instruction} (Trigger: ${rec.reason})`,
              impact: 'restorative',
              durationMinutes: parseInt(rec.timeEstimate, 10) || 2,
            }).catch(() => {});
          }
          return { ...rec, isCompleted: nextState };
        }
        return rec;
      })
    );
    recalculateWellnessScore();
  };

  // Sync real-time in-app screen time into state
  useEffect(() => {
    setScreenTime((prev) => {
      const activeMinutes = Math.floor(trackingStatus.inAppActiveSeconds / 60);
      return {
        ...prev,
        inAppActiveMinutes: Math.max(activeMinutes, prev.inAppActiveMinutes),
      };
    });
  }, [trackingStatus.inAppActiveSeconds]);

  const updateUserGoals = (goals: Partial<UserProfile['dailyGoals']>) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        dailyGoals: {
          ...prev.dailyGoals,
          ...goals,
        },
      };
      storage.saveSetting('user_goals', updated.dailyGoals).catch(() => {});
      return updated;
    });
  };

  const addTimelineItem = useCallback(
    async (item: Omit<ActivityTimelineItem, 'id' | 'timestamp' | 'timeDisplay'>) => {
      const created = await workPatternService.recordActivity({
        type: item.category,
        category: item.category,
        title: item.title,
        description: item.description,
        durationMinutes: item.durationMinutes,
        impact: item.impact,
      });

      setTimeline((prev) => [created, ...prev]);
    },
    []
  );

  const recalculateWellnessScore = useCallback(() => {
    setWellnessScore((prev) => {
      const hydRatio = Math.min(hydration.currentGlasses / hydration.targetGlasses, 1);
      const focusRatio = Math.min(focusSummary.completedSessions / focusSummary.targetSessions, 1);
      const newOverall = Math.round(75 + hydRatio * 12 + focusRatio * 10);
      return {
        ...prev,
        overall: Math.min(newOverall, 98),
        statusLabel: newOverall >= 85 ? 'Harmonious & Sustainable' : 'Good Progress',
      };
    });
  }, [hydration.currentGlasses, hydration.targetGlasses, focusSummary.completedSessions, focusSummary.targetSessions]);

  // Log Glass of Water with persistence
  const logGlassOfWater = async () => {
    const now = new Date();
    const timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setHydration((prev) => {
      const nextCount = Math.min(prev.currentGlasses + 1, 16);
      return {
        ...prev,
        currentGlasses: nextCount,
        lastLoggedTime: timeDisplay,
      };
    });

    await workPatternService.recordHydration(250);

    // Refresh timeline after hydration
    const updatedActivities = await workPatternService.getFilteredActivities(
      timelineDateFilter,
      timelineCategoryFilter
    );
    setTimeline(updatedActivities);

    // Auto-complete active hydration reminders
    const hydReminder = reminders.find(
      (r) => r.category === 'hydration' && r.status !== 'completed' && r.status !== 'dismissed'
    );
    if (hydReminder) {
      await completeReminder(hydReminder.id);
    }

    recalculateWellnessScore();
  };

  const removeGlassOfWater = () => {
    setHydration((prev) => ({
      ...prev,
      currentGlasses: Math.max(prev.currentGlasses - 1, 0),
    }));
    recalculateWellnessScore();
  };

  // Actions management (Sprint 1 fallback)
  const toggleActionCompletion = (id: string) => {
    setRecommendedActions((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          const nextState = !act.isCompleted;
          if (nextState) {
            addTimelineItem({
              title: `Action: ${act.title}`,
              description: act.description,
              category:
                act.category === 'hydration'
                  ? 'hydration'
                  : act.category === 'stretch'
                  ? 'movement'
                  : 'wellbeing',
              impact: 'restorative',
            });
          }
          return { ...act, isCompleted: nextState };
        }
        return act;
      })
    );
    recalculateWellnessScore();
  };

  // Mood Logging with persistence
  const logMood = async (level: 1 | 2 | 3 | 4 | 5, label: string, note?: string) => {
    const emojis: Record<number, string> = {
      1: '🌧️',
      2: '☁️',
      3: '🌤️',
      4: '🌿',
      5: '✨',
    };
    const now = new Date();
    const timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayKey = getDateKey(now);

    const newEntry: MoodEntry = {
      id: `mood_${Date.now()}`,
      level,
      label,
      emoji: emojis[level] || '🌿',
      note,
      timestamp: timeDisplay,
    };

    setMoodEntries((prev) => [newEntry, ...prev]);

    await storage.saveMoodEntry({ ...newEntry, dateKey: todayKey });

    await addTimelineItem({
      title: `Wellness Check-in: ${label}`,
      description: note || `Logged state of mind as ${label}.`,
      category: 'wellbeing',
      impact: 'positive',
    });
  };

  // Timer controls
  const setTimerMode = (mode: FocusTimerMode) => {
    const duration = TIMER_DURATIONS[mode];
    setFocusTimer((prev) => ({
      ...prev,
      mode,
      totalDurationSeconds: duration,
      remainingSeconds: duration,
      isRunning: false,
    }));
  };

  const startTimer = () => {
    setFocusTimer((prev) => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setFocusTimer((prev) => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setFocusTimer((prev) => ({
      ...prev,
      isRunning: false,
      remainingSeconds: prev.totalDurationSeconds,
    }));
  };

  const skipTimer = () => {
    if (focusTimer.mode === 'focus') {
      setTimerMode('shortBreak');
    } else {
      setTimerMode('focus');
    }
  };

  const toggleSound = () => {
    setFocusTimer((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const setActiveTaskName = (name: string) => {
    setFocusTimer((prev) => ({ ...prev, activeTaskName: name }));
  };

  // Clear all stored activity data (Privacy & User control)
  const clearAllStoredData = async () => {
    await workPatternService.clearAllData();
    setTimeline([]);
    setReminders([]);
    setToasts([]);
    setFocusSummary({
      totalFocusMinutes: 0,
      targetFocusMinutes: 150,
      completedSessions: 0,
      targetSessions: 6,
      currentStreakDays: 1,
      averageSessionLengthMinutes: 25,
    });
    setHydration({
      currentGlasses: 0,
      targetGlasses: 8,
      glassSizeMl: 250,
      lastLoggedTime: null,
    });
    setMoodEntries([]);
    setWeeklyActivity((prev) =>
      prev.map((d) => (d.isToday ? { ...d, focusHours: 0, breakCount: 0, wellnessScore: 60 } : d))
    );
    setScreenTime((prev) => ({
      ...prev,
      inAppActiveMinutes: 0,
      activeContinuousMinutes: 0,
    }));
  };

  // Export recorded data as JSON
  const exportStoredData = async () => {
    return await workPatternService.exportData();
  };

  // Timer tick effect with automated persistence
  useEffect(() => {
    if (!focusTimer.isRunning) return;

    const interval = setInterval(() => {
      setFocusTimer((prev) => {
        if (prev.remainingSeconds <= 1) {
          if (prev.soundEnabled) {
            playCalmChime();
          }

          if (prev.mode === 'focus') {
            const sessionMins = Math.round(prev.totalDurationSeconds / 60);

            // Persist focus session to IndexedDB
            const now = new Date();
            const startedAt = new Date(now.getTime() - prev.totalDurationSeconds * 1000).toISOString();
            workPatternService
              .recordFocusSession({
                taskName: prev.activeTaskName,
                mode: 'focus',
                durationMinutes: sessionMins,
                startedAt,
                completedAt: now.toISOString(),
              })
              .then(() => {
                refreshAnalytics();
              })
              .catch(() => {});

            setFocusSummary((fs) => ({
              ...fs,
              completedSessions: fs.completedSessions + 1,
              totalFocusMinutes: fs.totalFocusMinutes + sessionMins,
              averageSessionLengthMinutes: Math.round(
                (fs.totalFocusMinutes + sessionMins) / (fs.completedSessions + 1)
              ),
            }));

            // Automatically transition to short break
            return {
              ...prev,
              mode: 'shortBreak',
              totalDurationSeconds: TIMER_DURATIONS.shortBreak,
              remainingSeconds: TIMER_DURATIONS.shortBreak,
              isRunning: false,
              sessionsCompletedToday: prev.sessionsCompletedToday + 1,
            };
          } else {
            // Completed break
            addTimelineItem({
              title: 'Mindful Break Completed',
              description: 'Took intentional restorative screen pause. Ready for next block.',
              durationMinutes: Math.round(prev.totalDurationSeconds / 60),
              category: 'break',
              impact: 'restorative',
            });

            return {
              ...prev,
              mode: 'focus',
              totalDurationSeconds: TIMER_DURATIONS.focus,
              remainingSeconds: TIMER_DURATIONS.focus,
              isRunning: false,
            };
          }
        }

        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [focusTimer.isRunning, addTimelineItem, refreshAnalytics]);

  return (
    <WellnessContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isStorageInitialized,
        user,
        updateUserGoals,
        screenTime,
        wellnessScore,
        recalculateWellnessScore,
        focusSummary,
        focusTimer,
        isTimerModalOpen,
        setIsTimerModalOpen,
        setTimerMode,
        startTimer,
        pauseTimer,
        resetTimer,
        skipTimer,
        toggleSound,
        setActiveTaskName,
        hydration,
        logGlassOfWater,
        removeGlassOfWater,
        reminders,
        completeReminder,
        snoozeReminder,
        dismissReminder,
        toasts,
        dismissToast,
        completeToast,
        snoozeToast,
        notificationSettings,
        updateNotificationSettings,
        browserPermission,
        requestBrowserNotificationPermission,
        reminderStats,
        refreshReminderStats,
        contextualRecommendations,
        toggleContextualRecommendation,
        timeline,
        timelineCategoryFilter,
        setTimelineCategoryFilter,
        timelineDateFilter,
        setTimelineDateFilter,
        addTimelineItem,
        weeklyActivity,
        weeklyMetric,
        setWeeklyMetric,
        recommendedActions,
        toggleActionCompletion,
        moodEntries,
        logMood,
        insights,
        trackingStatus,
        clearAllStoredData,
        exportStoredData,
        refreshAnalytics,
      }}
    >
      {children}
    </WellnessContext.Provider>
  );
};

export const useWellness = () => {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
};
