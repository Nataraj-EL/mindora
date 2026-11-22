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
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { ReminderCategory } from '../../types';

export const RemindersCard: React.FC = () => {
  const { reminders, completeReminder, snoozeReminder } = useWellness();
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');

  const pendingReminders = reminders.filter((r) => !r.isCompleted);
  const completedReminders = reminders.filter((r) => r.isCompleted);
  const displayedReminders = filter === 'pending' ? pendingReminders : completedReminders;

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
    }
  };

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Break & Habit Reminders</h3>
              <p className="text-xs text-stone-500">Adaptive prompts tailored to your cadence</p>
            </div>
          </div>

          {/* Tab filter */}
          <div className="flex items-center gap-1 p-0.5 bg-sand-100 rounded-lg text-xs">
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter === 'pending'
                  ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Due ({pendingReminders.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter === 'completed'
                  ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Done ({completedReminders.length})
            </button>
          </div>
        </div>

        {/* Reminders list */}
        <div className="space-y-2.5 mt-4">
          {displayedReminders.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-sand-50/70 border border-dashed border-sand-200">
              <Sparkles className="w-6 h-6 text-sage-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-800">
                {filter === 'pending'
                  ? 'All caught up on wellness breaks!'
                  : 'No completed reminders yet today.'}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {filter === 'pending'
                  ? 'Your next reminder will trigger automatically after your focus block.'
                  : 'Check off reminders as you take intentional pauses.'}
              </p>
            </div>
          ) : (
            displayedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  reminder.isCompleted
                    ? 'bg-sand-50/50 border-sand-200/50 opacity-70'
                    : reminder.urgency === 'due-soon'
                    ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                    : 'bg-white border-sand-200/90'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-sand-100/70 shrink-0 mt-0.5">
                    {getCategoryIcon(reminder.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-semibold ${
                          reminder.isCompleted
                            ? 'line-through text-stone-400'
                            : 'text-stone-900'
                        }`}
                      >
                        {reminder.title}
                      </span>
                      <span className="text-[10px] text-stone-500 flex items-center gap-1 font-medium">
                        <Clock className="w-2.5 h-2.5" />
                        {reminder.dueTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug mt-0.5 line-clamp-2">
                      {reminder.description}
                    </p>
                  </div>
                </div>

                {!reminder.isCompleted && (
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <button
                      onClick={() => snoozeReminder(reminder.id)}
                      className="text-[11px] font-medium text-stone-500 hover:text-stone-800 px-2 py-1 rounded-md hover:bg-sand-100 transition-colors cursor-pointer"
                      title="Snooze for 15 minutes"
                    >
                      Snooze
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
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between text-xs text-stone-400">
        <span>Adaptive reminder interval: 45 min</span>
        <span className="text-sage-700 font-medium">Synced with focus timer</span>
      </div>
    </Card>
  );
};
