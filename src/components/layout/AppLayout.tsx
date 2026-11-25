import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { FocusTimerModal } from '../dashboard/FocusTimerModal';
import { ToastContainer } from '../common/ToastContainer';
import { useWellness } from '../../context/WellnessContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toasts, dismissToast, completeToast, snoozeToast } = useWellness();

  return (
    <div className="min-h-screen flex bg-[#FAF9F5] text-stone-800">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Mobile Nav Overlays */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Working Focus Session Modal */}
      <FocusTimerModal />

      {/* Live In-App Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        onComplete={completeToast}
        onSnooze={snoozeToast}
      />
    </div>
  );
};
