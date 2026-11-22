import React from 'react';
import {
  Bell,
  Droplets,
  Play,
  Menu,
  Clock,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Button } from '../common/Button';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const {
    activeTab,
    focusTimer,
    setIsTimerModalOpen,
    startTimer,
    logGlassOfWater,
    reminders,
    setActiveTab,
  } = useWellness();

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Mindful Work Dashboard',
      subtitle: 'Balance cognitive stamina with restorative pacing',
    },
    wellness: {
      title: 'My Wellness Journey',
      subtitle: 'Daily score dimensions, emotional pulse, and holistic rhythm',
    },
    activity: {
      title: 'Activity & Screen Cadence',
      subtitle: 'Complete chronological history and screen time distribution',
    },
    insights: {
      title: 'AI Wellness Insights',
      subtitle: 'Personalized ergonomics, peak focus hours, and fatigue patterns',
    },
    settings: {
      title: 'Preferences & Work Rituals',
      subtitle: 'Configure daily goals, reminders, and circadian boundaries',
    },
  };

  const currentMeta = titles[activeTab] || titles.dashboard;
  const pendingRemindersCount = reminders.filter((r) => !r.isCompleted).length;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F5]/95 backdrop-blur-xs border-b border-sand-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Current Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-sand-100 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
              {currentMeta.title}
            </h1>
            <p className="hidden sm:block text-xs text-stone-500 font-normal">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Today Date Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-sand-100/80 text-stone-700 rounded-xl text-xs font-medium border border-sand-200/70">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{todayFormatted}</span>
          </div>

          {/* Quick Hydration Action */}
          <button
            onClick={logGlassOfWater}
            title="Quick log 1 glass of water (250ml)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-sand-100 text-stone-700 border border-sand-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Droplets className="w-3.5 h-3.5 text-calm-water fill-calm-water/20" />
            <span className="hidden sm:inline">Log</span>
            <span>+250ml</span>
          </button>

          {/* Focus Timer Trigger Button */}
          <Button
            size="sm"
            variant={focusTimer.isRunning ? 'soft-sage' : 'primary'}
            onClick={() => {
              if (focusTimer.isRunning) {
                setIsTimerModalOpen(true);
              } else {
                startTimer();
              }
            }}
            icon={
              focusTimer.isRunning ? (
                <span className="w-2 h-2 rounded-full bg-sage-600 animate-pulse" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )
            }
          >
            <span className="hidden sm:inline">
              {focusTimer.isRunning ? 'Focusing...' : 'Start Focus'}
            </span>
            <span className="sm:hidden">{focusTimer.isRunning ? 'Focus' : 'Start'}</span>
          </Button>

          {/* Reminders / Notifications Alert Icon */}
          <button
            onClick={() => setActiveTab('dashboard')}
            title={`${pendingRemindersCount} pending wellness reminders`}
            className="relative p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-sand-100 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {pendingRemindersCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-[#FAF9F5]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
