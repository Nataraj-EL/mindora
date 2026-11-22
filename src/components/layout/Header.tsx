import React, { useState } from 'react';
import {
  Bell,
  Droplets,
  Play,
  Menu,
  Clock,
  Shield,
  Check,
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
    trackingStatus,
  } = useWellness();

  const [showPrivacyTooltip, setShowPrivacyTooltip] = useState(false);

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
      title: 'Activity & Work Patterns',
      subtitle: 'Persistent chronological history and in-app presence tracking',
    },
    insights: {
      title: 'AI Wellness Insights',
      subtitle: 'Personalized ergonomics, peak focus hours, and fatigue patterns',
    },
    settings: {
      title: 'Preferences & Work Rituals',
      subtitle: 'Configure daily goals, reminders, storage, and privacy boundaries',
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
          {/* Live Privacy Tracking Status Indicator */}
          <div className="relative">
            <button
              onClick={() => setShowPrivacyTooltip(!showPrivacyTooltip)}
              onMouseEnter={() => setShowPrivacyTooltip(true)}
              onMouseLeave={() => setShowPrivacyTooltip(false)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-sand-100/90 hover:bg-sand-200/80 border border-sand-200 text-stone-700 transition-colors cursor-pointer"
              title="Click to view tracking privacy policy"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  trackingStatus.isIdle
                    ? 'bg-amber-400'
                    : 'bg-emerald-500 animate-pulse'
                }`}
              />
              <span className="hidden xl:inline">Tracking:</span>
              <span className="font-semibold text-stone-800">
                {trackingStatus.isIdle ? 'Idle' : 'In-App Active'}
              </span>
              <Shield className="w-3 h-3 text-stone-400 ml-0.5" />
            </button>

            {/* Privacy Details Popover */}
            {showPrivacyTooltip && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3.5 rounded-xl bg-white border border-sand-200 shadow-xl text-xs z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-1.5 font-semibold text-stone-900 mb-1.5">
                  <Shield className="w-4 h-4 text-sage-700" />
                  <span>Privacy-Preserving Telemetry</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed mb-2">
                  Mindora measures active time in this tab and completed focus sessions. We <strong>never</strong> record keystrokes, screenshots, or personal files.
                </p>
                <div className="space-y-1 text-[11px] text-stone-500 border-t border-sand-100 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600" /> Local IndexedDB persistence
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600" /> Zero cloud telemetry or leaks
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Today Date Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-sand-100/80 text-stone-700 rounded-xl text-xs font-medium border border-sand-200/70">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{todayFormatted}</span>
          </div>

          {/* Quick Hydration Action */}
          <button
            onClick={logGlassOfWater}
            title="Quick log 1 glass of water (250ml) to IndexedDB"
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

          {/* Reminders Alert */}
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
