import React from 'react';
import { WelcomeSection } from '../dashboard/WelcomeSection';
import { ScreenTimeCard } from '../dashboard/ScreenTimeCard';
import { FocusSummaryCard } from '../dashboard/FocusSummaryCard';
import { WellnessScoreCard } from '../dashboard/WellnessScoreCard';
import { HydrationTrackerCard } from '../dashboard/HydrationTrackerCard';
import { RemindersCard } from '../dashboard/RemindersCard';
import { WeeklyActivityCard } from '../dashboard/WeeklyActivityCard';
import { ActivityTimelineCard } from '../dashboard/ActivityTimelineCard';
import { WellnessActionsCard } from '../dashboard/WellnessActionsCard';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Personalized Welcome Section */}
      <WelcomeSection />

      {/* 2. Primary Metrics Row: Screen Time, Focus Summary, Daily Wellness Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ScreenTimeCard />
        <FocusSummaryCard />
        <WellnessScoreCard />
      </div>

      {/* 3. Hydration & Reminders Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HydrationTrackerCard />
        <RemindersCard />
      </div>

      {/* 4. Weekly Activity Cadence & Recommended Wellness Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyActivityCard />
        <WellnessActionsCard />
      </div>

      {/* 5. Chronological Activity Timeline */}
      <ActivityTimelineCard />
    </div>
  );
};
