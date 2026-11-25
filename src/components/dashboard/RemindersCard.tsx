import React, { useState } from 'react';
import {
  Bell,
  Eye,
  Activity,
  Droplets,
  Wind,
  Clock,
  Sparkles,
  Check,
  Moon,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ReminderCategory, ReminderPriority } from '../../types/reminders';

export const RemindersCard: React.FC = () => {
  const {
    reminders,
    completeReminder,
    snoozeReminder,
    dismissReminder,
    notificationSettings,
    reminderStats,
  } = useWellness();

  const [activeTab, setActiveTab] = useState<'due' | 'upcoming' | 'completed'>('due');

  const dueReminders = reminders.filter(
    (r) => r.status === 'due' || (!r.status && !r.isCompleted)
  );
  const upcomingReminders = reminders.filter(
    (r) => r.status === 'pending' || r.status === 'snoozed'
  );
  const completedReminders = reminders.filter(
    (r) => r.status === 'completed' || r.isCompleted
  );

  const displayedList =
    activeTab === 'due'
      ? dueReminders
      : activeTab === 'upcoming'
      ? upcomingReminders
      : completedReminders;

  const getCategoryIcon = (category: ReminderCategory) => {
    switch (category) {
      case 'eye-break':
        return <Eye className="w-4 h-4 text-amber-600" />;
      case 'posture':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'hydration':
        return <Droplets className="w-4 h-4 text-calm-water" />;
      case 'movement':
        return <Activity className="w-4 h-4 text-clay-500" />;
      case 'breathing':
        return <Wind className="w-4 h-4 text-teal-600" />;
      case 'rest':
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getPriorityBadge = (priority?: ReminderPriority) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="warning" size="sm">Critical</Badge>;
      case 'high':
        return <Badge variant="amber" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="sage" size="sm">Medium</Badge>;
      case 'routine':
      default:
        return null;
    }
  };

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Adaptive Wellness Reminders</h3>
              <p className="text-xs text-stone-500">Paced to your continuous work & fatigue</p>
            </div>
          </div>

          {/* 3 Tabs: Due / Upcoming / Done */}
          <div className="flex items-center gap-1 p-0.5 bg-sand-100 rounded-xl text-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('due')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'due'
                  ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Due ({dueReminders.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Upcoming ({upcomingReminders.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Done ({completedReminders.length})
            </button>
          </div>
        </div>

        {/* Quiet Hours Banner if active */}
        {notificationSettings.quietHoursEnabled && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-sand-100/70 border border-sand-200 text-[11px] text-stone-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Moon className="w-3.5 h-3.5 text-stone-500" />
              Quiet Hours Active ({notificationSettings.quietHoursStart} - {notificationSettings.quietHoursEnd})
            </span>
            <span className="text-[10px] text-stone-400">Low-priority prompts deferred</span>
          </div>
        )}

        {/* Reminders list */}
        <div className="space-y-2.5 mt-2 max-h-[380px] overflow-y-auto pr-1">
          {displayedList.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-sand-50/70 border border-dashed border-sand-200">
              <Sparkles className="w-6 h-6 text-sage-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-800">
                {activeTab === 'due'
                  ? 'All caught up on wellness breaks!'
                  : activeTab === 'upcoming'
                  ? 'No scheduled upcoming prompts.'
                  : 'No completed reminders yet today.'}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {activeTab === 'due'
                  ? 'Your next reminder triggers automatically as your focus session continues.'
                  : 'Mindora adapts intervals based on continuous active display time.'}
              </p>
            </div>
          ) : (
            displayedList.map((reminder) => {
              const isDone = reminder.status === 'completed' || reminder.isCompleted;
              return (
                <div
                  key={reminder.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                    isDone
                      ? 'bg-sand-50/50 border-sand-200/50 opacity-70'
                      : reminder.priority === 'critical'
                      ? 'bg-red-50/40 border-red-200/80'
                      : reminder.priority === 'high'
                      ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                      : 'bg-white border-sand-200/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-sand-100/70 shrink-0 mt-0.5">
                        {getCategoryIcon(reminder.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-xs font-semibold ${
                              isDone ? 'line-through text-stone-400' : 'text-stone-900'
                            }`}
                          >
                            {reminder.title}
                          </span>
                          {getPriorityBadge(reminder.priority)}
                          <span className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                            <Clock className="w-2.5 h-2.5" />
                            {reminder.dueTime || (reminder.status === 'snoozed' ? 'Snoozed' : 'Due')}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-snug mt-1">
                          {reminder.description}
                        </p>
                      </div>
                    </div>

                    {!isDone && (
                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        <button
                          onClick={() => snoozeReminder(reminder.id, 15)}
                          className="text-[11px] font-medium text-stone-500 hover:text-stone-800 px-2 py-1 rounded-md hover:bg-sand-100 transition-colors cursor-pointer"
                          title="Snooze for 15 minutes"
                        >
                          Snooze
                        </button>
                        <button
                          onClick={() => dismissReminder(reminder.id)}
                          className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-sand-100 transition-colors cursor-pointer"
                          title="Dismiss reminder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => completeReminder(reminder.id)}
                          className="p-1.5 rounded-lg bg-sage-50 text-sage-700 hover:bg-sage-600 hover:text-white transition-colors cursor-pointer"
                          title="Mark as completed"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Explicit "Why" reasoning pill */}
                  {reminder.triggerReason && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-sand-100/70 border border-sand-200/60 text-[10px] text-stone-600">
                      <Sparkles className="w-3 h-3 text-sage-600 shrink-0" />
                      <span className="truncate">
                        <strong>Why:</strong> {reminder.triggerReason}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reminder Effectiveness Statistics Panel */}
      <div className="mt-4 pt-3.5 border-t border-sand-100">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-stone-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-sage-600" />
            Intervention Compliance
          </span>
          <span className="font-bold text-sage-800 font-mono">
            {reminderStats.complianceRate}% adherence
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-stone-400">
          <span>{reminderStats.totalCompleted} completed ({reminderStats.totalSnoozed} snoozed)</span>
          <span className="text-stone-500 truncate max-w-[140px] text-right">
            Top: {reminderStats.mostCompliantCategory}
          </span>
        </div>
      </div>
    </Card>
  );
};
