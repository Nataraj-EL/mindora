import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Target,
  Coffee,
  Sparkles,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Modal } from '../common/Modal';
import { CircularProgress } from '../common/CircularProgress';
import { Button } from '../common/Button';
import { FocusTimerMode } from '../../types';

export const FocusTimerModal: React.FC = () => {
  const {
    isTimerModalOpen,
    setIsTimerModalOpen,
    focusTimer,
    setTimerMode,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    toggleSound,
    setActiveTaskName,
  } = useWellness();

  const mins = Math.floor(focusTimer.remainingSeconds / 60);
  const secs = focusTimer.remainingSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const progressValue = focusTimer.totalDurationSeconds - focusTimer.remainingSeconds;

  const modeButtons: { mode: FocusTimerMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'focus', label: 'Deep Focus (25m)', icon: <Target className="w-3.5 h-3.5" /> },
    { mode: 'shortBreak', label: 'Short Break (5m)', icon: <Coffee className="w-3.5 h-3.5" /> },
    { mode: 'longBreak', label: 'Long Break (15m)', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <Modal
      isOpen={isTimerModalOpen}
      onClose={() => setIsTimerModalOpen(false)}
      title="Mindful Focus Timer"
      subtitle="Cadence-based intervals designed to prevent cognitive fatigue"
      maxWidth="md"
    >
      <div className="flex flex-col items-center">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-sand-100 rounded-xl mb-6 max-w-full overflow-x-auto">
          {modeButtons.map((btn) => (
            <button
              key={btn.mode}
              onClick={() => setTimerMode(btn.mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                focusTimer.mode === btn.mode
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Circular Countdown Ring */}
        <div className="my-2 relative">
          <CircularProgress
            value={progressValue}
            max={focusTimer.totalDurationSeconds}
            size={220}
            strokeWidth={12}
            color={focusTimer.mode === 'focus' ? '#3D6B42' : '#3B82A6'}
            trackColor="#ECE8DF"
          >
            <div className="flex flex-col items-center">
              <span className="font-mono text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight">
                {timeFormatted}
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 mt-1">
                {focusTimer.mode === 'focus'
                  ? focusTimer.isRunning
                    ? 'In Flow'
                    : 'Ready'
                  : 'Restorative Break'}
              </span>
            </div>
          </CircularProgress>
        </div>

        {/* Task Title Input */}
        <div className="w-full max-w-sm mt-5 mb-6">
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">
            Focus Intention / Task
          </label>
          <input
            type="text"
            value={focusTimer.activeTaskName}
            onChange={(e) => setActiveTaskName(e.target.value)}
            placeholder="What is your singular priority this block?"
            className="w-full px-3.5 py-2 text-sm bg-sand-50 border border-sand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/40 text-stone-800 placeholder-stone-400 transition-all"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={resetTimer}
            title="Reset timer"
            className="p-2.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-sand-100 transition-colors cursor-pointer border border-sand-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <Button
            size="lg"
            variant="primary"
            onClick={() => (focusTimer.isRunning ? pauseTimer() : startTimer())}
            className="min-w-[140px]"
            icon={
              focusTimer.isRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )
            }
          >
            {focusTimer.isRunning ? 'Pause Flow' : 'Start Flow'}
          </Button>

          <button
            onClick={skipTimer}
            title="Skip to next session"
            className="p-2.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-sand-100 transition-colors cursor-pointer border border-sand-200"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Footer controls: Chime toggle & Session counter */}
        <div className="w-full pt-4 border-t border-sand-200/80 flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium text-stone-700">
            Sessions completed today: <strong>{focusTimer.sessionsCompletedToday}</strong>
          </span>

          <button
            onClick={toggleSound}
            className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            {focusTimer.soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-sage-700" />
                <span>Zen Chime On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-stone-400" />
                <span>Silent Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
