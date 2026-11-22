import React from 'react';
import {
  LayoutDashboard,
  HeartPulse,
  Clock,
  Sparkles,
  Settings,
  X,
  Leaf,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { NavigationTab } from '../../types';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, user } = useWellness();

  const handleTabClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    onClose();
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wellness' as const, label: 'My Wellness', icon: HeartPulse },
    { id: 'activity' as const, label: 'Activity', icon: Clock },
    { id: 'insights' as const, label: 'Insights', icon: Sparkles },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Off-canvas slideover for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 left-0 w-72 bg-[#FAF9F5] shadow-2xl flex flex-col justify-between p-6 z-10 border-r border-sand-200">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sage-700 flex items-center justify-center text-white">
                    <Leaf className="w-5 h-5 text-sage-100" />
                  </div>
                  <div>
                    <span className="font-bold text-lg text-stone-900">Mindora</span>
                    <p className="text-xs text-stone-500">Wellness Companion</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-sand-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links */}
              <nav className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-sage-700 text-white font-semibold'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3 pt-4 border-t border-sand-200">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border border-sand-300"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-stone-900 truncate">{user.name}</span>
                <span className="text-xs text-stone-500 truncate">{user.title}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom bar for quick mobile switching */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-sand-200/90 px-3 py-2 flex items-center justify-around select-none shadow-lg"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                isActive ? 'text-sage-700 font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-sage-100 text-sage-800' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
