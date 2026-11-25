import React from 'react';
import { WellnessProvider, useWellness } from './context/WellnessContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './components/views/DashboardView';
import { MyWellnessView } from './components/views/MyWellnessView';
import { ActivityView } from './components/views/ActivityView';
import { InsightsView } from './components/views/InsightsView';
import { CompanionView } from './components/views/CompanionView';
import { SettingsView } from './components/views/SettingsView';

const MainViewRenderer: React.FC = () => {
  const { activeTab } = useWellness();

  switch (activeTab) {
    case 'dashboard':
      return <DashboardView />;
    case 'wellness':
      return <MyWellnessView />;
    case 'activity':
      return <ActivityView />;
    case 'insights':
      return <InsightsView />;
    case 'companion':
      return <CompanionView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
};

export const App: React.FC = () => {
  return (
    <WellnessProvider>
      <AppLayout>
        <MainViewRenderer />
      </AppLayout>
    </WellnessProvider>
  );
};

export default App;
