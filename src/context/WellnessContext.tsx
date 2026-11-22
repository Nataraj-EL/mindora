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

interface WellnessContextType {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

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

  // Activity Timeline
  timeline: ActivityTimelineItem[];
  timelineCategoryFilter: 'all' | ActivityCategory;
  setTimelineCategoryFilter: (filter: 'all' | ActivityCategory) => void;
  addTimelineItem: (
    item: Omit<ActivityTimelineItem, 'id' | 'timestamp' | 'timeDisplay'>
  ) => void;

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
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
  const [user, setUser] = useState<UserProfile>(mockUserProfile);
  const [screenTime] = useState<ScreenTimeData>(initialScreenTimeData);
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

  // Weekly visualization
  const [weeklyActivity] = useState<DayActivityData[]>(weeklyActivityData);
  const [weeklyMetric, setWeeklyMetric] = useState<'screenTime' | 'focus' | 'wellness'>('focus');

  // Recommended actions
  const [recommendedActions, setRecommendedActions] = useState<RecommendedWellnessAction[]>(
    initialWellnessActions
  );

  // Mood Entries
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>(initialMoodEntries);
  const [insights] = useState<WellnessInsightItem[]>(initialInsights);

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

  const updateUserGoals = (goals: Partial<UserProfile['dailyGoals']>) => {
    setUser((prev) => ({
      ...prev,
      dailyGoals: {
        ...prev.dailyGoals,
        ...goals,
      },
    }));
  };

  const addTimelineItem = useCallback(
    (item: Omit<ActivityTimelineItem, 'id' | 'timestamp' | 'timeDisplay'>) => {
      const now = new Date();
      const timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newItem: ActivityTimelineItem = {
        ...item,
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: now.toISOString(),
        timeDisplay,
      };
      setTimeline((prev) => [newItem, ...prev]);
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

  // Log Glass of Water
  const logGlassOfWater = () => {
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

    addTimelineItem({
      title: 'Hydration Logged',
      description: 'Logged 250ml water intake. Staying consistently hydrated aids focus.',
      category: 'hydration',
      impact: 'restorative',
    });

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

  // Mood Logging
  const logMood = (level: 1 | 2 | 3 | 4 | 5, label: string, note?: string) => {
    const emojis: Record<number, string> = {
      1: '🌧️',
      2: '☁️',
      3: '🌤️',
      4: '🌿',
      5: '✨',
    };
    const now = new Date();
    const timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newEntry: MoodEntry = {
      id: `mood_${Date.now()}`,
      level,
      label,
      emoji: emojis[level] || '🌿',
      note,
      timestamp: timeDisplay,
    };

    setMoodEntries((prev) => [newEntry, ...prev]);

    addTimelineItem({
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
    // Transition to opposite mode
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

  // Timer tick effect
  useEffect(() => {
    if (!focusTimer.isRunning) return;

    const interval = setInterval(() => {
      setFocusTimer((prev) => {
        if (prev.remainingSeconds <= 1) {
          // Completed
          if (prev.soundEnabled) {
            playCalmChime();
          }

          if (prev.mode === 'focus') {
            // Completed a focus session
            const sessionMins = Math.round(prev.totalDurationSeconds / 60);
            setFocusSummary((fs) => ({
              ...fs,
              completedSessions: fs.completedSessions + 1,
              totalFocusMinutes: fs.totalFocusMinutes + sessionMins,
            }));

            addTimelineItem({
              title: 'Focus Session Completed',
              description: `Completed ${sessionMins} min session on: ${prev.activeTaskName}`,
              durationMinutes: sessionMins,
              category: 'focus',
              impact: 'positive',
            });

            // Automatically suggest short break
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
  }, [focusTimer.isRunning, addTimelineItem]);

  return (
    <WellnessContext.Provider
      value={{
        activeTab,
        setActiveTab,
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
        addTimelineItem,
        weeklyActivity,
        weeklyMetric,
        setWeeklyMetric,
        recommendedActions,
        toggleActionCompletion,
        moodEntries,
        logMood,
        insights,
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
