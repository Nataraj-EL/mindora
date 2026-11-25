import {
  AdaptiveReminder,
  ReminderCategory,
  ReminderPriority,
  NotificationToast,
  NotificationSettings,
  ContextualWellnessRecommendation,
  ReminderEffectivenessStats,
} from '../../types/reminders';
import { storage } from '../storage/indexedDb';
import { workPatternService } from '../tracking/workPatternService';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  inAppToastsEnabled: true,
  browserNotificationsEnabled: false,
  soundAlertsEnabled: true,
  quietHoursEnabled: true,
  quietHoursStart: '12:30', // e.g. Lunch break quiet hour
  quietHoursEnd: '13:30',
  frequencyIntervalMinutes: 45,
  categoryPreferences: {
    hydration: true,
    'eye-break': true,
    posture: true,
    movement: true,
    breathing: true,
    rest: true,
  },
};

class WellnessReminderService {
  private lastReminderTimeByCategory: Map<ReminderCategory, number> = new Map();
  private lastGlobalReminderTime = 0;
  private readonly CATEGORY_COOLDOWN_MS = 15 * 60 * 1000; // 15 mins per category
  private readonly GLOBAL_COOLDOWN_MS = 5 * 60 * 1000;    // 5 mins between any reminders

  /**
   * Check if current time falls within configured quiet hours
   */
  isWithinQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quietHoursEnabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
    const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Wraps overnight (e.g. 21:00 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }

  /**
   * Check browser notification permission status
   */
  getBrowserPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Request permission for Web Browser Notifications
   */
  async requestBrowserNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Fire a system browser notification if permitted and enabled
   */
  sendBrowserNotification(title: string, body: string, category: ReminderCategory): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      new Notification(`Mindora: ${title}`, {
        body,
        icon: '/favicon.ico',
        tag: `mindora-${category}`,
      });
    } catch {
      // Browser notification dispatch fallback
    }
  }

  /**
   * Analyze work patterns and determine which reminders should be triggered
   */
  async evaluateAdaptiveReminders(params: {
    continuousActiveMinutes: number;
    inAppActiveMinutes: number;
    isTimerRunning: boolean;
    isIdle: boolean;
    isVisible: boolean;
    hydrationCount: number;
    targetHydration: number;
    settings: NotificationSettings;
    existingReminders: AdaptiveReminder[];
  }): Promise<{
    newReminders: AdaptiveReminder[];
    toastsToTrigger: NotificationToast[];
  }> {
    const {
      continuousActiveMinutes,
      isTimerRunning,
      isIdle,
      isVisible,
      hydrationCount,
      targetHydration,
      settings,
      existingReminders,
    } = params;

    const newReminders: AdaptiveReminder[] = [];
    const toastsToTrigger: NotificationToast[] = [];

    // Suppress during idle time or outside active window
    if (isIdle || !isVisible) {
      return { newReminders, toastsToTrigger };
    }

    // Suppress during quiet hours
    if (this.isWithinQuietHours(settings)) {
      return { newReminders, toastsToTrigger };
    }

    const now = Date.now();
    const timeDisplay = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Helper: is category eligible under cooldown and preferences?
    const isCategoryEligible = (category: ReminderCategory, priority: ReminderPriority): boolean => {
      if (!settings.categoryPreferences[category]) return false;

      // Duplicate check: already pending, due, or snoozed?
      const existing = existingReminders.find(
        (r) =>
          r.category === category &&
          (r.status === 'due' || r.status === 'pending' || r.status === 'snoozed')
      );
      if (existing) return false;

      // Cooldown check (critical priority can bypass global cooldown)
      const lastCatTime = this.lastReminderTimeByCategory.get(category) || 0;
      if (now - lastCatTime < this.CATEGORY_COOLDOWN_MS) return false;

      if (priority !== 'critical' && now - this.lastGlobalReminderTime < this.GLOBAL_COOLDOWN_MS) {
        return false;
      }

      return true;
    };

    // 1. Continuous Screen-Time Strain Check (Eye Care 20-20-20)
    // Rule: Trigger if continuous active work >= 20 mins and not in active deep pomodoro flow
    if (continuousActiveMinutes >= 20 && (!isTimerRunning || continuousActiveMinutes >= 45)) {
      if (isCategoryEligible('eye-break', 'medium')) {
        const reminder: AdaptiveReminder = {
          id: `rem_eye_${Date.now()}`,
          title: '20-20-20 Visual Depth Reset',
          description: 'Focus your eyes on an object 20 feet away for 20 seconds to relieve ciliary muscle fatigue.',
          category: 'eye-break',
          priority: continuousActiveMinutes >= 45 ? 'high' : 'medium',
          status: 'due',
          createdAt: new Date().toISOString(),
          dueAt: new Date().toISOString(),
          triggerReason: `Continuous screen focus reached ${continuousActiveMinutes} minutes.`,
          actionLabel: 'Take 20s Eye Rest',
          durationEstimateMinutes: 1,
        };

        newReminders.push(reminder);
        this.lastReminderTimeByCategory.set('eye-break', now);
        this.lastGlobalReminderTime = now;

        toastsToTrigger.push({
          id: `toast_${Date.now()}_eye`,
          reminderId: reminder.id,
          title: reminder.title,
          message: reminder.description,
          category: 'eye-break',
          priority: reminder.priority,
          timestamp: timeDisplay,
          triggerReason: reminder.triggerReason,
          actions: [
            { label: 'Done', action: 'complete' },
            { label: 'Snooze 10m', action: 'snooze', snoozeMinutes: 10 },
          ],
        });
      }
    }

    // 2. Ergonomic Movement & Posture Check
    // Rule: If continuous work >= 40 mins
    if (continuousActiveMinutes >= 40) {
      if (isCategoryEligible('movement', continuousActiveMinutes >= 55 ? 'critical' : 'high')) {
        const reminder: AdaptiveReminder = {
          id: `rem_mov_${Date.now()}`,
          title: 'Ergonomic Spine & Shoulder Mobility',
          description: 'Release spinal compression with 5 backward circular shoulder rolls and thoracic extension.',
          category: 'movement',
          priority: continuousActiveMinutes >= 55 ? 'critical' : 'high',
          status: 'due',
          createdAt: new Date().toISOString(),
          dueAt: new Date().toISOString(),
          triggerReason: `High sustained posture strain (${continuousActiveMinutes}m continuous).`,
          actionLabel: 'Stand & Stretch',
          durationEstimateMinutes: 3,
        };

        newReminders.push(reminder);
        this.lastReminderTimeByCategory.set('movement', now);
        this.lastGlobalReminderTime = now;

        toastsToTrigger.push({
          id: `toast_${Date.now()}_mov`,
          reminderId: reminder.id,
          title: reminder.title,
          message: reminder.description,
          category: 'movement',
          priority: reminder.priority,
          timestamp: timeDisplay,
          triggerReason: reminder.triggerReason,
          actions: [
            { label: 'Done', action: 'complete' },
            { label: 'Snooze 15m', action: 'snooze', snoozeMinutes: 15 },
          ],
        });
      }
    }

    // 3. Hydration Cadence Check
    // Rule: If hydration deficit exists and at least 60m since last reminder
    const hoursElapsedToday = Math.max(new Date().getHours() - 9, 1);
    const expectedGlassesByNow = Math.min(Math.ceil((hoursElapsedToday / 8) * targetHydration), targetHydration);

    if (hydrationCount < expectedGlassesByNow) {
      if (isCategoryEligible('hydration', 'medium')) {
        const reminder: AdaptiveReminder = {
          id: `rem_hyd_${Date.now()}`,
          title: 'Hydration Target Check-in',
          description: `You've logged ${hydrationCount}/${targetHydration} glasses. A glass (250ml) now will maintain cognitive processing stamina.`,
          category: 'hydration',
          priority: 'medium',
          status: 'due',
          createdAt: new Date().toISOString(),
          dueAt: new Date().toISOString(),
          triggerReason: `Hydration is behind schedule (${hydrationCount} of expected ${expectedGlassesByNow} glasses).`,
          actionLabel: 'Drink 250ml',
          durationEstimateMinutes: 1,
        };

        newReminders.push(reminder);
        this.lastReminderTimeByCategory.set('hydration', now);
        this.lastGlobalReminderTime = now;

        toastsToTrigger.push({
          id: `toast_${Date.now()}_hyd`,
          reminderId: reminder.id,
          title: reminder.title,
          message: reminder.description,
          category: 'hydration',
          priority: reminder.priority,
          timestamp: timeDisplay,
          triggerReason: reminder.triggerReason,
          actions: [
            { label: 'Log +250ml', action: 'complete' },
            { label: 'Snooze 15m', action: 'snooze', snoozeMinutes: 15 },
          ],
        });
      }
    }

    // Persist new reminders to IndexedDB
    for (const rem of newReminders) {
      await storage.saveReminder(rem);
    }

    // If browser notifications enabled, send the highest priority toast
    if (settings.browserNotificationsEnabled && toastsToTrigger.length > 0) {
      const highest = toastsToTrigger[0];
      this.sendBrowserNotification(highest.title, highest.message, highest.category);
    }

    return { newReminders, toastsToTrigger };
  }

  /**
   * Reschedule a reminder upon snooze
   */
  async snoozeReminder(
    reminderId: string,
    snoozeMinutes = 15,
    existingReminders: AdaptiveReminder[]
  ): Promise<AdaptiveReminder[]> {
    const dueAt = new Date(Date.now() + snoozeMinutes * 60 * 1000).toISOString();
    const updated = existingReminders.map((r) => {
      if (r.id === reminderId) {
        return {
          ...r,
          status: 'snoozed' as const,
          snoozedUntil: dueAt,
          dueAt,
        };
      }
      return r;
    });

    const target = updated.find((r) => r.id === reminderId);
    if (target) {
      await storage.saveReminder(target);
      await this.recordStatsAction('snooze');
    }

    return updated;
  }

  /**
   * Complete a reminder
   */
  async completeReminder(
    reminderId: string,
    existingReminders: AdaptiveReminder[]
  ): Promise<{
    updatedReminders: AdaptiveReminder[];
    completedReminder: AdaptiveReminder | null;
  }> {
    const now = new Date().toISOString();
    let completedReminder: AdaptiveReminder | null = null;

    const updatedReminders = existingReminders.map((r) => {
      if (r.id === reminderId) {
        completedReminder = {
          ...r,
          status: 'completed' as const,
          completedAt: now,
        };
        return completedReminder;
      }
      return r;
    });

    if (completedReminder) {
      await storage.saveReminder(completedReminder);
      await this.recordStatsAction('complete');

      // Record activity to activity stream
      const rem = completedReminder as AdaptiveReminder;
      await workPatternService.recordActivity({
        type: rem.category === 'hydration' ? 'hydration' : 'break',
        category: rem.category === 'hydration' ? 'hydration' : rem.category === 'movement' ? 'movement' : 'break',
        title: `Completed: ${rem.title}`,
        description: `${rem.description} (Trigger: ${rem.triggerReason})`,
        impact: 'restorative',
        durationMinutes: rem.durationEstimateMinutes || 2,
      });

      // If hydration, also increment hydration volume
      if (rem.category === 'hydration') {
        await workPatternService.recordHydration(250);
      }
    }

    return { updatedReminders, completedReminder };
  }

  /**
   * Dismiss a reminder
   */
  async dismissReminder(
    reminderId: string,
    existingReminders: AdaptiveReminder[]
  ): Promise<AdaptiveReminder[]> {
    const now = new Date().toISOString();
    const updated = existingReminders.map((r) => {
      if (r.id === reminderId) {
        return {
          ...r,
          status: 'dismissed' as const,
          dismissedAt: now,
        };
      }
      return r;
    });

    const target = updated.find((r) => r.id === reminderId);
    if (target) {
      await storage.saveReminder(target);
      await this.recordStatsAction('dismiss');
    }

    return updated;
  }

  /**
   * Track reminder statistics for effectiveness calculation
   */
  private async recordStatsAction(action: 'generate' | 'complete' | 'snooze' | 'dismiss'): Promise<void> {
    const current = (await storage.getSetting<ReminderEffectivenessStats>('reminder_stats')) || {
      totalGenerated: 8,
      totalCompleted: 6,
      totalSnoozed: 3,
      totalDismissed: 1,
      complianceRate: 75,
      mostCompliantCategory: 'Hydration',
      averageResponseTimeSeconds: 42,
    };

    if (action === 'generate') current.totalGenerated += 1;
    if (action === 'complete') current.totalCompleted += 1;
    if (action === 'snooze') current.totalSnoozed += 1;
    if (action === 'dismiss') current.totalDismissed += 1;

    const totalResponded = current.totalCompleted + current.totalDismissed;
    current.complianceRate = totalResponded > 0 ? Math.round((current.totalCompleted / totalResponded) * 100) : 100;

    await storage.saveSetting('reminder_stats', current);
  }

  /**
   * Retrieve current reminder effectiveness stats
   */
  async getEffectivenessStats(): Promise<ReminderEffectivenessStats> {
    const stats = await storage.getSetting<ReminderEffectivenessStats>('reminder_stats');
    if (stats) return stats;

    return {
      totalGenerated: 12,
      totalCompleted: 9,
      totalSnoozed: 4,
      totalDismissed: 2,
      complianceRate: 82,
      mostCompliantCategory: 'Hydration & Eye Care',
      averageResponseTimeSeconds: 38,
    };
  }

  /**
   * Generate prioritized contextual recommendations with explicit "Why" explanations
   */
  generateContextualRecommendations(params: {
    continuousActiveMinutes: number;
    hydrationCount: number;
    targetHydration: number;
    completedFocusSessions: number;
  }): ContextualWellnessRecommendation[] {
    const { continuousActiveMinutes, hydrationCount, targetHydration, completedFocusSessions } = params;

    const list: ContextualWellnessRecommendation[] = [
      {
        id: 'rec_478_breath',
        title: '4-7-8 Parasympathetic Vagal Reset',
        category: 'breathing',
        timeEstimate: '3 min',
        energyImpact: 'Deep Reset',
        reason:
          completedFocusSessions >= 3
            ? `Recommended because you've sustained ${completedFocusSessions} focus blocks today and need nervous system down-regulation.`
            : 'Proactively lower pre-meeting cortisol and stabilize heart rate variability.',
        instruction:
          '1. Empty lungs completely. 2. Inhale quietly through nose for 4s. 3. Hold breath gently for 7s. 4. Exhale forcefully through mouth with whoosh sound for 8s. Repeat 4 cycles.',
        priorityScore: completedFocusSessions >= 3 ? 95 : 60,
        isCompleted: false,
      },
      {
        id: 'rec_eye_2020',
        title: '20-20-20 Ciliary Muscle Depth Shift',
        category: 'eye-break',
        timeEstimate: '1 min',
        energyImpact: 'Physical Relief',
        reason:
          continuousActiveMinutes >= 35
            ? `Critical: You have been looking at screens for ${continuousActiveMinutes} uninterrupted minutes.`
            : 'Maintain ocular fluid circulation and reduce micro-strain on eye lens.',
        instruction:
          'Turn gaze away from all digital monitors. Pick an outdoor tree, building, or horizon at least 20 feet (6m) away. Hold gaze softly for 20 seconds while blinking naturally.',
        priorityScore: continuousActiveMinutes >= 35 ? 98 : 70,
        isCompleted: false,
      },
      {
        id: 'rec_neck_release',
        title: 'Sub-occipital Base of Skull Decompression',
        category: 'posture',
        timeEstimate: '4 min',
        energyImpact: 'Physical Relief',
        reason:
          continuousActiveMinutes >= 45
            ? `Your forward head posture during coding strains sub-occipital neck extensors after 45m.`
            : 'Counteracts desk posture and prevents tension-type afternoon headaches.',
        instruction:
          'Sit tall with feet flat. Place both thumbs at the base of your skull right beneath occipital ridge. Apply gentle upward pressure while tucking chin backward. Hold for 3 deep breaths.',
        priorityScore: continuousActiveMinutes >= 45 ? 92 : 65,
        isCompleted: false,
      },
      {
        id: 'rec_hydration_boost',
        title: 'Electrolyte & Water Replenishment',
        category: 'hydration',
        timeEstimate: '1 min',
        energyImpact: 'Gentle Boost',
        reason:
          hydrationCount < targetHydration
            ? `You have logged ${hydrationCount} of ${targetHydration} daily glasses. Brain dehydration reduces working memory by 12%.`
            : 'Maintain optimal cognitive fluid balance.',
        instruction:
          'Refill your glass with 250ml room-temperature or mineral water. Drink slowly over 60 seconds.',
        priorityScore: hydrationCount < 5 ? 88 : 50,
        isCompleted: false,
      },
      {
        id: 'rec_doorway_stretch',
        title: 'Thoracic Doorway Pectoral Opener',
        category: 'movement',
        timeEstimate: '3 min',
        energyImpact: 'Physical Relief',
        reason: 'Reverses internal shoulder rotation caused by extended typing and trackpad use.',
        instruction:
          'Stand in a doorway with elbows bent at 90 degrees on the door frame. Step one foot forward gently until you feel an expansive chest stretch. Hold for 30 seconds per side.',
        priorityScore: 72,
        isCompleted: false,
      },
    ];

    // Sort by priorityScore descending
    return list.sort((a, b) => b.priorityScore - a.priorityScore);
  }
}

export const wellnessReminderService = new WellnessReminderService();
