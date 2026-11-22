import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';

export const WeeklyActivityCard: React.FC = () => {
  const { weeklyActivity, weeklyMetric, setWeeklyMetric } = useWellness();
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Maximum value for scaling the bars cleanly
  const getMaxScale = () => {
    switch (weeklyMetric) {
      case 'focus':
        return 4; // hours
      case 'screenTime':
        return 8; // hours
      case 'wellness':
        return 100; // score
    }
  };

  const getDayValue = (day: (typeof weeklyActivity)[0]) => {
    switch (weeklyMetric) {
      case 'focus':
        return day.focusHours;
      case 'screenTime':
        return day.screenTimeHours;
      case 'wellness':
        return day.wellnessScore;
    }
  };

  const formatValue = (val: number) => {
    if (weeklyMetric === 'wellness') return `${val} pts`;
    return `${val}h`;
  };

  const maxScale = getMaxScale();

  return (
    <Card className="flex flex-col justify-between">
      <div>
        {/* Header with Metric Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Weekly Wellness Cadence</h3>
              <p className="text-xs text-stone-500">Screen time & restorative balance trend</p>
            </div>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1 p-1 bg-sand-100 rounded-xl text-xs self-start sm:self-auto">
            <button
              onClick={() => setWeeklyMetric('focus')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                weeklyMetric === 'focus'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Focus Hours
            </button>
            <button
              onClick={() => setWeeklyMetric('screenTime')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                weeklyMetric === 'screenTime'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Screen Hours
            </button>
            <button
              onClick={() => setWeeklyMetric('wellness')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                weeklyMetric === 'wellness'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Wellness Score
            </button>
          </div>
        </div>

        {/* Bar Visualization Container */}
        <div className="pt-4 pb-2">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {weeklyActivity.map((day) => {
              const val = getDayValue(day);
              const heightPct = val > 0 ? Math.min((val / maxScale) * 100, 100) : 0;
              const isHovered = hoveredDay === day.dayName;

              return (
                <div
                  key={day.dayName}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredDay(day.dayName)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Tooltip on Hover */}
                  <div
                    className={`absolute -top-10 z-20 px-2 py-1 rounded-md bg-stone-900 text-white text-[11px] font-mono pointer-events-none transition-all shadow-md whitespace-nowrap ${
                      isHovered ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-1'
                    }`}
                  >
                    {day.dayName}: {formatValue(val)}
                  </div>

                  {/* The Bar */}
                  <div className="w-full max-w-[36px] bg-sand-100 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ease-out ${
                        day.isToday
                          ? 'bg-sage-600 group-hover:bg-sage-700'
                          : val > 0
                          ? 'bg-sand-400 group-hover:bg-sand-500'
                          : 'bg-transparent'
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-xs block ${
                        day.isToday
                          ? 'font-bold text-sage-900'
                          : 'text-stone-500 font-medium'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-light">
                      {day.shortDate.split(' ')[1]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="mt-4 pt-3 border-t border-sand-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-sage-600 inline-block" />
            Today (In Progress)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-stone-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-sand-400 inline-block" />
            Past Days
          </span>
        </div>
        <span className="text-stone-600 font-medium">Weekly Average: 84 Score</span>
      </div>
    </Card>
  );
};
