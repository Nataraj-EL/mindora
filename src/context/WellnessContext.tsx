import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  NavigationTab,
  UserProfile,
  ScreenTimeData,
  FocusSessionSummary,
  WellnessScoreData,
  ReminderItem,
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

  // Reminders
  reminders: ReminderItem[];
  completeReminder: (id: string) => void;
  snoozeReminder: (id: string) => void;
  dismissReminder: (id: string) => void;

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

  // Recommended Actions
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
  const [reminders, setReminders] = useState<ReminderItem[]>(initialReminders);

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

  // Recommended actions
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

      // Update timeline
      if (storedActivities.length > 0) {
        setTimeline(storedActivities);
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
    } catch {
      // Graceful fallback
    }
  }, [timelineDateFilter, timelineCategoryFilter, trackingStatus.inAppActiveSeconds, trackingStatus.continuousActiveSeconds]);

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
        }

        // Restore custom user settings if present
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

        await refreshAnalytics();
        setIsStorageInitialized(true);
      } catch {
        setIsStorageInitialized(true);
      }
    };

    initializeStorage();
  }, [refreshAnalytics]);

  // Re-run filter when category or date filter changes
  useEffect(() => {
    if (isStorageInitialized) {
      workPatternService
        .getFilteredActivities(timelineDateFilter, timelineCategoryFilter)
        .then((items) => {
          setTimeline(items);
        })
        .catch(() => {});
    }
  }, [timelineDateFilter, timelineCategoryFilter, isStorageInitialized]);

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

    // Check if hydration reminder is active and complete it
    setReminders((prev) =>
      prev.map((r) =>
        r.category === 'hydration' && !r.isCompleted
          ? { ...r, isCompleted: true, dueTime: `Completed at ${timeDisplay}` }
          : r
      )
    );

    recalculateWellnessScore();
  };

  const removeGlassOfWater = () => {
    setHydration((prev) => ({
      ...prev,
      currentGlasses: Math.max(prev.currentGlasses - 1, 0),
    }));
    recalculateWellnessScore();
  };

  // Reminders management
  const completeReminder = (id: string) => {
    const now = new Date();
    const timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isCompleted: true, dueTime: `Completed at ${timeDisplay}` } : r))
    );

    const targetReminder = reminders.find((r) => r.id === id);
    if (targetReminder) {
      addTimelineItem({
        title: `Completed: ${targetReminder.title}`,
        description: targetReminder.description,
        category:
          targetReminder.category === 'hydration'
            ? 'hydration'
            : targetReminder.category === 'movement'
            ? 'movement'
            : 'break',
        impact: 'restorative',
      });
    }
    recalculateWellnessScore();
  };

  const snoozeReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, dueTime: 'Snoozed for 15 mins', urgency: 'routine' }
          : r
      )
    );
  };

  const dismissReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Actions management
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
