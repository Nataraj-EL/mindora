import React from 'react';
import {
  LayoutDashboard,
  HeartPulse,
  Clock,
  Sparkles,
  Settings,
  Play,
  Pause,
  Leaf,
  Droplets,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { NavigationTab } from '../../types';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wellness', label: 'My Wellness', icon: HeartPulse, badge: '87' },
  { id: 'activity', label: 'Activity', icon: Clock },
  { id: 'insights', label: 'Insights', icon: Sparkles, badge: '4' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    user,
    focusTimer,
    setIsTimerModalOpen,
    startTimer,
    pauseTimer,
    hydration,
  } = useWellness();

  // Format timer remaining mm:ss
  const mins = Math.floor(focusTimer.remainingSeconds / 60);
  const secs = focusTimer.remainingSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-sand-50/80 border-r border-sand-200/80 h-screen sticky top-0 px-4 py-6 justify-between select-none">
      {/* Top: Logo & Nav */}
      <div className="flex flex-col gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-sage-700 flex items-center justify-center text-white shadow-xs">
            <Leaf className="w-5 h-5 text-sage-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-lg tracking-tight text-stone-900">Mindora</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-sage-100 text-sage-800">
                AI Wellness
              </span>
            </div>
            <p className="text-xs text-stone-500 font-normal">Mindful Work Companion</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-sage-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100/90'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-stone-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-sage-600/70 text-sage-50'
                        : 'bg-sand-200 text-stone-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Middle/Bottom: Focus Companion Widget */}
      <div className="flex flex-col gap-4">
        {/* Ambient Focus Session Mini-Pod */}
        <div className="bg-white rounded-2xl p-4 border border-sand-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-stone-500 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  focusTimer.isRunning ? 'bg-sage-500 animate-pulse' : 'bg-stone-300'
                }`}
              />
              {focusTimer.mode === 'focus' ? 'Focus Block' : 'Rest Break'}
            </span>
            <span className="text-[11px] text-stone-400 font-mono">
              #{focusTimer.sessionsCompletedToday + 1} Today
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <div className="font-mono text-2xl font-semibold text-stone-800 tracking-tight">
              {timeFormatted}
            </div>
            <span className="text-xs text-stone-500 truncate max-w-[90px]">
              {focusTimer.mode === 'focus' ? 'Flow State' : 'Rest'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => (focusTimer.isRunning ? pauseTimer() : startTimer())}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                focusTimer.isRunning
                  ? 'bg-sand-100 hover:bg-sand-200 text-stone-800'
                  : 'bg-sage-700 hover:bg-sage-800 text-white'
              }`}
            >
              {focusTimer.isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start
                </>
              )}
            </button>
            <button
              onClick={() => setIsTimerModalOpen(true)}
              className="py-1.5 px-2.5 bg-sand-100 hover:bg-sand-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              title="Expand Focus Timer"
            >
              Expand
            </button>
          </div>
        </div>

        {/* Quick Hydration Metric */}
        <div className="flex items-center justify-between px-3 py-2 bg-sand-100/60 rounded-xl border border-sand-200/60 text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <Droplets className="w-3.5 h-3.5 text-calm-water" />
            <span>Hydration</span>
          </div>
          <span className="font-semibold text-stone-800">
            {hydration.currentGlasses} / {hydration.targetGlasses} glasses
          </span>
        </div>

        {/* User Profile Mini */}
        <div className="flex items-center gap-3 pt-3 border-t border-sand-200/70">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border border-sand-300"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-stone-900 truncate">{user.name}</span>
            <span className="text-[11px] text-stone-500 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Optimal Balance
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
