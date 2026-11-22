import { storage } from '../storage/indexedDb';
import {
  ActivityEvent,
  FocusSessionRecord,
  HydrationRecord,
  AppUsageRecord,
  WorkPatternAnalytics,
  DateFilterOption,
} from '../../types/tracking';
import { ActivityCategory, DayActivityData } from '../../types';

export const getDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayTime = (date: Date = new Date()): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

class WorkPatternService {
  /**
   * Record a structured activity event into IndexedDB
   */
  async recordActivity(
    activity: Omit<ActivityEvent, 'id' | 'timestamp' | 'dateKey' | 'timeDisplay'> & {
      timestamp?: string;
    }
  ): Promise<ActivityEvent> {
    const now = activity.timestamp ? new Date(activity.timestamp) : new Date();
    const event: ActivityEvent = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now.toISOString(),
      dateKey: getDateKey(now),
      timeDisplay: formatDisplayTime(now),
    };

    await storage.saveActivity(event);
    return event;
  }

  /**
   * Record completed Pomodoro or Deep Focus session
   */
  async recordFocusSession(session: {
    taskName: string;
    mode: 'focus' | 'shortBreak' | 'longBreak';
    durationMinutes: number;
    startedAt: string;
    completedAt: string;
  }): Promise<FocusSessionRecord> {
    const dateKey = getDateKey(new Date(session.completedAt));
    const record: FocusSessionRecord = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dateKey,
      taskName: session.taskName,
      mode: session.mode,
      durationMinutes: session.durationMinutes,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      isCompleted: true,
    };

    await storage.saveFocusSession(record);

    // Also link to activity stream
    await this.recordActivity({
      type: session.mode === 'focus' ? 'focus' : 'break',
      category: session.mode === 'focus' ? 'focus' : 'break',
      title:
        session.mode === 'focus'
          ? `Focus Session: ${session.taskName}`
          : 'Restorative Break Completed',
      description:
        session.mode === 'focus'
          ? `Completed ${session.durationMinutes} min deep work interval.`
          : `Took ${session.durationMinutes} min conscious screen pause.`,
      durationMinutes: session.durationMinutes,
      impact: session.mode === 'focus' ? 'positive' : 'restorative',
    });

    return record;
  }

  /**
   * Record hydration event
   */
  async recordHydration(amountMl = 250): Promise<HydrationRecord> {
    const now = new Date();
    const record: HydrationRecord = {
      id: `hyd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now.toISOString(),
      dateKey: getDateKey(now),
      amountMl,
    };

    await storage.saveHydrationLog(record);

    await this.recordActivity({
      type: 'hydration',
      category: 'hydration',
      title: 'Hydration Intake Logged',
      description: `Consumed ${amountMl}ml fresh water to maintain cognitive hydration.`,
      impact: 'restorative',
    });

    return record;
  }

  /**
   * Update continuous in-app usage record
   */
  async recordAppUsageHeartbeat(activeSecondsDelta: number, isContinuous: boolean): Promise<AppUsageRecord> {
    const todayKey = getDateKey();
    const existing = await storage.getAppUsage(todayKey);

    const activeSeconds = (existing?.activeSeconds || 0) + activeSecondsDelta;
    const continuousActiveSeconds = isContinuous
      ? (existing?.continuousActiveSeconds || 0) + activeSecondsDelta
      : 0;

    const record: AppUsageRecord = {
      id: todayKey,
      dateKey: todayKey,
      activeSeconds,
      idleSeconds: existing?.idleSeconds || 0,
      continuousActiveSeconds,
      lastActiveTimestamp: new Date().toISOString(),
    };

    await storage.saveAppUsage(record);
    return record;
  }

  /**
   * Query filtered activities based on date range, category, and text query
   */
  async getFilteredActivities(
    dateFilter: DateFilterOption = 'today',
    category: 'all' | ActivityCategory = 'all',
    searchQuery = ''
  ): Promise<ActivityEvent[]> {
    const allActivities = await storage.getActivities();
    const today = new Date();
    const todayKey = getDateKey(today);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getDateKey(yesterday);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return allActivities.filter((item) => {
      // 1. Date filter
      if (dateFilter === 'today' && item.dateKey !== todayKey) return false;
      if (dateFilter === 'yesterday' && item.dateKey !== yesterdayKey) return false;
      if (dateFilter === 'past_7_days') {
        const itemDate = new Date(item.timestamp);
        if (itemDate < sevenDaysAgo) return false;
      }

      // 2. Category filter
      if (category !== 'all' && item.category !== category) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }

  /**
   * Calculate comprehensive daily work-pattern analytics
   */
  async calculateDailyAnalytics(dateKey: string = getDateKey()): Promise<WorkPatternAnalytics> {
    const focusSessions = await storage.getFocusSessions(dateKey);
    const activities = await storage.getActivities(dateKey);
    const hydrations = await storage.getHydrationLogs(dateKey);
    const appUsage = await storage.getAppUsage(dateKey);

    // Completed focus sessions
    const completedFocus = focusSessions.filter((s) => s.mode === 'focus' && s.isCompleted);
    const todayFocusMinutes = completedFocus.reduce((acc, s) => acc + s.durationMinutes, 0);
    const todayFocusSessionsCount = completedFocus.length;
    const averageSessionLengthMinutes =
      todayFocusSessionsCount > 0
        ? Math.round(todayFocusMinutes / todayFocusSessionsCount)
        : 25;

    // Breaks
    const breakActivities = activities.filter(
      (a) => a.category === 'break' || a.category === 'movement'
    );
    const todayBreakMinutes = breakActivities.reduce(
      (acc, a) => acc + (a.durationMinutes || 5),
      0
    );
    const todayBreaksCount = breakActivities.length;

    // Hydration
    const todayHydrationMl = hydrations.reduce((acc, h) => acc + h.amountMl, 0);

    // In-app active duration
    const todayInAppActiveMinutes = Math.round((appUsage?.activeSeconds || 0) / 60);
    const continuousActiveMinutes = Math.round(
      (appUsage?.continuousActiveSeconds || 0) / 60
    );
    const isProlongedFocus = continuousActiveMinutes >= 50;

    // Ratio
    const focusToBreakRatio =
      todayBreakMinutes > 0
        ? `${(todayFocusMinutes / todayBreakMinutes).toFixed(1)}:1`
        : `${todayFocusMinutes}:0`;

    // Weekly trend
    const weeklyActivity = await this.calculateWeeklyActivityTrend();

    return {
      todayFocusMinutes,
      todayFocusSessionsCount,
      todayBreakMinutes,
      todayBreaksCount,
      averageSessionLengthMinutes,
      todayHydrationMl,
      todayInAppActiveMinutes,
      continuousActiveMinutes,
      isProlongedFocus,
      focusToBreakRatio,
      weeklyActivity,
    };
  }

  /**
   * Calculate 7-day weekly activity trend from real stored data
   */
  async calculateWeeklyActivityTrend(): Promise<DayActivityData[]> {
    const today = new Date();
    const result: DayActivityData[] = [];

    // Calculate dates for the last 7 days (oldest to today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = getDateKey(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isToday = i === 0;

      const sessions = await storage.getFocusSessions(dateKey);
      const activities = await storage.getActivities(dateKey);
      const hydrations = await storage.getHydrationLogs(dateKey);

      const focusMinutes = sessions
        .filter((s) => s.mode === 'focus')
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      const focusHours = Number((focusMinutes / 60).toFixed(1));

      const breaksCount = activities.filter(
        (a) => a.category === 'break' || a.category === 'movement'
      ).length;

      // Base estimated screen hours: focus sessions + app active + baseline activities
      const estimatedScreenHours = Number(
        (focusHours > 0 ? focusHours * 1.8 + breaksCount * 0.2 : 0).toFixed(1)
      );

      // Score computation
      let score = 0;
      if (focusHours > 0 || breaksCount > 0 || hydrations.length > 0) {
        score = Math.min(
          Math.round(65 + focusHours * 6 + breaksCount * 3 + hydrations.length * 2),
          98
        );
      }

      result.push({
        dayName,
        shortDate,
        screenTimeHours: estimatedScreenHours,
        focusHours,
        breakCount: breaksCount,
        wellnessScore: score,
        isToday,
      });
    }

    return result;
  }

  /**
   * Clear all persisted data
   */
  async clearAllData(): Promise<void> {
    await storage.clearAllData();
  }

  /**
   * Export all recorded data as JSON
   */
  async exportData(): Promise<string> {
    const activities = await storage.getActivities();
    const focusSessions = await storage.getFocusSessions();
    const hydrations = await storage.getHydrationLogs();
    const moods = await storage.getMoodEntries();

    const payload = {
      exportVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      activities,
      focusSessions,
      hydrationLogs: hydrations,
      moodEntries: moods,
    };

    return JSON.stringify(payload, null, 2);
  }
}

export const workPatternService = new WorkPatternService();
