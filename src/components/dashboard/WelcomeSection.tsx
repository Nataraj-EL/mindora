import React, { useState } from 'react';
import { Sun, Smile, CheckCircle2 } from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Badge } from '../common/Badge';

export const WelcomeSection: React.FC = () => {
  const { user, focusSummary, screenTime, wellnessScore, logMood } = useWellness();
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [moodSuccess, setMoodSuccess] = useState(false);

  // Derive time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleMoodSelect = (level: 1 | 2 | 3 | 4 | 5, label: string) => {
    logMood(level, label);
    setShowMoodPicker(false);
    setMoodSuccess(true);
    setTimeout(() => setMoodSuccess(false), 3000);
  };

  const screenHours = (screenTime.totalMinutes / 60).toFixed(1);
  const focusHours = (focusSummary.totalFocusMinutes / 60).toFixed(1);

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-sand-200/90 p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-sage-50 to-transparent pointer-events-none rounded-tr-2xl" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Personalized Greeting & Vibe */}
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="sage" icon={<Sun className="w-3.5 h-3.5 text-sage-700" />}>
              Mindful Flow Cadence
            </Badge>
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {wellnessScore.statusLabel}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            {getGreeting()}, {user.name.split(' ')[0]}
          </h2>

          <p className="text-sm text-stone-600 leading-relaxed">
            You’ve logged <strong className="text-stone-900 font-semibold">{focusHours}h of deep focus</strong> across{' '}
            <strong className="text-stone-900 font-semibold">{focusSummary.completedSessions} sessions</strong> today. Your work rhythm is currently balanced and sustainable.
          </p>

          {/* Quick stats chips */}
          <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-stone-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sand-100/70 border border-sand-200/60 font-medium">
              Screen Time: <strong className="text-stone-800">{screenHours}h</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sand-100/70 border border-sand-200/60 font-medium">
              Streak: <strong className="text-stone-800">{focusSummary.currentStreakDays} days</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sand-100/70 border border-sand-200/60 font-medium">
              Score: <strong className="text-sage-700">{wellnessScore.overall}/100</strong>
            </span>
          </div>
        </div>

        {/* Right: Mood Check-in Widget */}
        <div className="shrink-0 flex flex-col items-start md:items-end gap-2 bg-sand-50/70 p-4 rounded-xl border border-sand-200/60 min-w-[220px]">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-stone-500" />
              State of Mind
            </span>
            {moodSuccess && (
              <span className="text-[11px] text-sage-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-sage-600" /> Logged!
              </span>
            )}
          </div>

          {!showMoodPicker ? (
            <div className="w-full flex items-center justify-between gap-3 mt-1">
              <span className="text-xs text-stone-600">Feeling centered?</span>
              <button
                onClick={() => setShowMoodPicker(true)}
                className="text-xs font-semibold text-sage-700 hover:text-sage-800 bg-white hover:bg-sand-100 px-3 py-1.5 rounded-lg border border-sand-200 shadow-2xs transition-colors cursor-pointer"
              >
                Log Check-in
              </button>
            </div>
          ) : (
            <div className="w-full space-y-2 mt-1">
              <span className="text-[11px] text-stone-500">How is your energy right now?</span>
              <div className="flex items-center justify-between gap-1">
                {[
                  { level: 1 as const, emoji: '🌧️', label: 'Drained' },
                  { level: 2 as const, emoji: '☁️', label: 'Tired' },
                  { level: 3 as const, emoji: '🌤️', label: 'Balanced' },
                  { level: 4 as const, emoji: '🌿', label: 'Energized' },
                  { level: 5 as const, emoji: '✨', label: 'Thriving' },
                ].map((item) => (
                  <button
                    key={item.level}
                    onClick={() => handleMoodSelect(item.level, item.label)}
                    title={item.label}
                    className="p-1.5 text-lg hover:scale-125 transition-transform bg-white rounded-lg border border-sand-200 hover:border-sage-400 cursor-pointer"
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMoodPicker(false)}
                className="text-[11px] text-stone-400 hover:text-stone-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
