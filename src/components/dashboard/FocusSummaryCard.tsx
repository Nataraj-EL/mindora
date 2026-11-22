import React from 'react';
import { Target, Play, Pause, Flame, Clock, Maximize2 } from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';

export const FocusSummaryCard: React.FC = () => {
  const {
    focusSummary,
    focusTimer,
    setIsTimerModalOpen,
    startTimer,
    pauseTimer,
  } = useWellness();

  const totalFocusHours = (focusSummary.totalFocusMinutes / 60).toFixed(1);
  const targetFocusHours = (focusSummary.targetFocusMinutes / 60).toFixed(1);

  // Remaining time in current timer block
  const mins = Math.floor(focusTimer.remainingSeconds / 60);
  const secs = focusTimer.remainingSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <Card className="flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Focus Sessions</h3>
              <p className="text-xs text-stone-500">Deep work blocks & flow state</p>
            </div>
          </div>
          <Badge variant="amber" size="sm" icon={<Flame className="w-3 h-3 text-amber-600" />}>
            {focusSummary.currentStreakDays}d Streak
          </Badge>
        </div>

        {/* Big Metric Display */}
        <div className="flex items-baseline justify-between mt-3 mb-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-stone-900 tracking-tight">
              {focusSummary.completedSessions}
            </span>
            <span className="text-stone-500 text-sm">/ {focusSummary.targetSessions} sessions</span>
          </div>
          <span className="text-xs font-semibold text-stone-700 bg-sand-100 px-2 py-0.5 rounded-md">
            {totalFocusHours}h of {targetFocusHours}h goal
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <ProgressBar
            value={focusSummary.completedSessions}
            max={focusSummary.targetSessions}
            colorClass="bg-sage-600"
            size="sm"
          />
        </div>

        {/* Active Session Status / Quick Timer Preview */}
        <div className="mt-4 p-3.5 rounded-xl bg-sand-50/80 border border-sand-200/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-stone-700 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  focusTimer.isRunning ? 'bg-sage-600 animate-pulse' : 'bg-stone-300'
                }`}
              />
              {focusTimer.mode === 'focus' ? 'Active Focus Block' : 'Rest Break'}
            </span>
            <span className="font-mono text-stone-600 font-semibold">{timeFormatted}</span>
          </div>
          <p className="text-[11px] text-stone-500 truncate mb-2">
            Task: {focusTimer.activeTaskName}
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant={focusTimer.isRunning ? 'secondary' : 'primary'}
              onClick={() => (focusTimer.isRunning ? pauseTimer() : startTimer())}
              icon={
                focusTimer.isRunning ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )
              }
            >
              {focusTimer.isRunning ? 'Pause' : 'Start Focus'}
            </Button>
            <button
              onClick={() => setIsTimerModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 hover:text-stone-800 px-2 py-1 rounded-md hover:bg-sand-100 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Full Timer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-5 pt-3 border-t border-sand-100 flex items-center justify-between text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          Avg 25 min Pomodoro
        </span>
        <span className="font-medium text-sage-800">2 sessions remaining</span>
      </div>
    </Card>
  );
};
