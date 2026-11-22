import React, { useState } from 'react';
import {
  User,
  Bell,
  CheckCircle2,
  Clock,
  Droplets,
  Target,
  Monitor,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const SettingsView: React.FC = () => {
  const { user, updateUserGoals, focusTimer, toggleSound } = useWellness();

  const [maxScreenHours, setMaxScreenHours] = useState(
    (user.dailyGoals.maxScreenTimeMinutes / 60).toString()
  );
  const [targetFocusHours, setTargetFocusHours] = useState(
    (user.dailyGoals.targetFocusMinutes / 60).toString()
  );
  const [hydrationGlasses, setHydrationGlasses] = useState(
    user.dailyGoals.hydrationGlasses.toString()
  );
  const [breaksCount, setBreaksCount] = useState(
    user.dailyGoals.breaksCount.toString()
  );

  const [reminderInterval, setReminderInterval] = useState('45');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserGoals({
      maxScreenTimeMinutes: Math.round(parseFloat(maxScreenHours || '6') * 60),
      targetFocusMinutes: Math.round(parseFloat(targetFocusHours || '2.5') * 60),
      hydrationGlasses: parseInt(hydrationGlasses || '8', 10),
      breaksCount: parseInt(breaksCount || '6', 10),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-sand-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Settings & Workday Rituals
            </h2>
            <p className="text-sm text-stone-500">
              Customize daily targets, break cadences, and sensory feedback
            </p>
          </div>
          {savedSuccess && (
            <span className="text-xs font-semibold text-sage-800 bg-sage-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sage-600" /> Changes saved
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-sand-100 text-stone-700">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">User Profile</h3>
              <p className="text-xs text-stone-500">Local workstation identity</p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-sand-50/70 border border-sand-200/60 mb-4">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs mb-3"
            />
            <h4 className="font-bold text-stone-900 text-sm">{user.name}</h4>
            <p className="text-xs text-stone-500">{user.title}</p>
            <span className="text-[11px] text-stone-400 font-mono mt-1">{user.email}</span>
          </div>

          <div className="space-y-2 text-xs text-stone-600">
            <div className="flex justify-between py-1.5 border-b border-sand-100">
              <span>Timezone</span>
              <span className="font-medium text-stone-800">{user.timezone}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sand-100">
              <span>Member Since</span>
              <span className="font-medium text-stone-800">{user.joinedDate}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>System Role</span>
              <span className="font-medium text-stone-800">Lead Engineer</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Daily Targets & Habit Frequencies */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Daily Wellness Goals</h3>
                <p className="text-xs text-stone-500">
                  Calibrate thresholds to match your workload stamina
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-stone-400" />
                    Max Screen Time (Hours/day)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="2"
                    max="14"
                    value={maxScreenHours}
                    onChange={(e) => setMaxScreenHours(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-sand-50/70 border border-sand-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Recommended: 6.0 - 7.0 hours
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-stone-400" />
                    Target Focus Blocks (Hours/day)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="8"
                    value={targetFocusHours}
                    onChange={(e) => setTargetFocusHours(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-sand-50/70 border border-sand-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Equates to ~6 deep 25-minute Pomodoros
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-calm-water" />
                    Hydration Goal (Glasses / 250ml each)
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="16"
                    value={hydrationGlasses}
                    onChange={(e) => setHydrationGlasses(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-sand-50/70 border border-sand-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Current target: {parseInt(hydrationGlasses || '8', 10) * 250} ml
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    Intentional Restorative Breaks
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="15"
                    value={breaksCount}
                    onChange={(e) => setBreaksCount(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-sand-50/70 border border-sand-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Screen pauses, outdoor steps, or eye rests
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary">
                  Update Daily Targets
                </Button>
              </div>
            </form>
          </Card>

          {/* Sensory & Notification Preferences */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  Sensory & Adaptive Cadence
                </h3>
                <p className="text-xs text-stone-500">Gentle cues and sound feedback</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50/70 border border-sand-200/60">
                <div>
                  <span className="font-semibold text-stone-800 block">
                    Zen Tibetan Singing Bowl Chime
                  </span>
                  <span className="text-stone-500 text-[11px]">
                    Harmonic 528Hz synthesis upon session and break completion
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    focusTimer.soundEnabled
                      ? 'bg-sage-700 text-white'
                      : 'bg-sand-200 text-stone-600 hover:bg-sand-300'
                  }`}
                >
                  {focusTimer.soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50/70 border border-sand-200/60">
                <div>
                  <span className="font-semibold text-stone-800 block">
                    Adaptive Break Prompts
                  </span>
                  <span className="text-stone-500 text-[11px]">
                    Automatic reminders after sustained continuous screen stretches
                  </span>
                </div>
                <select
                  value={reminderInterval}
                  onChange={(e) => setReminderInterval(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-sand-200 bg-white font-medium text-stone-800"
                >
                  <option value="30">Every 30 mins</option>
                  <option value="45">Every 45 mins (Recommended)</option>
                  <option value="60">Every 60 mins</option>
                  <option value="90">Every 90 mins</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
