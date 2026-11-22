import { useCallback } from 'react';
import { workPatternService } from '../services/tracking/workPatternService';
import { ActivityEvent, FocusSessionRecord, DateFilterOption } from '../types/tracking';
import { ActivityCategory } from '../types';

export const useWorkPatternTracker = () => {
  const logActivity = useCallback(
    async (
      activity: Omit<ActivityEvent, 'id' | 'timestamp' | 'dateKey' | 'timeDisplay'> & {
        timestamp?: string;
      }
    ) => {
      return await workPatternService.recordActivity(activity);
    },
    []
  );

  const logFocusSession = useCallback(
    async (session: {
      taskName: string;
      mode: 'focus' | 'shortBreak' | 'longBreak';
      durationMinutes: number;
      startedAt: string;
      completedAt: string;
    }): Promise<FocusSessionRecord> => {
      return await workPatternService.recordFocusSession(session);
    },
    []
  );

  const logHydration = useCallback(async (amountMl = 250) => {
    return await workPatternService.recordHydration(amountMl);
  }, []);

  const getFilteredActivities = useCallback(
    async (
      dateFilter: DateFilterOption = 'today',
      category: 'all' | ActivityCategory = 'all',
      query = ''
    ) => {
      return await workPatternService.getFilteredActivities(dateFilter, category, query);
    },
    []
  );

  const getDailyAnalytics = useCallback(async (dateKey?: string) => {
    return await workPatternService.calculateDailyAnalytics(dateKey);
  }, []);

  const clearAllData = useCallback(async () => {
    return await workPatternService.clearAllData();
  }, []);

  const exportData = useCallback(async () => {
    return await workPatternService.exportData();
  }, []);

  return {
    logActivity,
    logFocusSession,
    logHydration,
    getFilteredActivities,
    getDailyAnalytics,
    clearAllData,
    exportData,
  };
};
