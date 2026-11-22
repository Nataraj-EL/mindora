import React from 'react';
import { Monitor, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';

export const ScreenTimeCard: React.FC = () => {
  const { screenTime } = useWellness();

  const totalHours = Math.floor(screenTime.totalMinutes / 60);
  const totalMins = screenTime.totalMinutes % 60;
  const targetHours = Math.floor(screenTime.maxTargetMinutes / 60);
  const targetMins = screenTime.maxTargetMinutes % 60;

  const usagePercent = Math.min(
    Math.round((screenTime.totalMinutes / screenTime.maxTargetMinutes) * 100),
    100
  );

  const isNearLimit = usagePercent >= 85;
  const isContinuousHigh =
    screenTime.activeContinuousMinutes >= screenTime.continuousStrainThresholdMinutes;

  return (
    <Card className="flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Today's Screen Time</h3>
              <p className="text-xs text-stone-500">Active display exposure & apps</p>
            </div>
          </div>
          <Badge
            variant={isNearLimit ? 'warning' : 'sage'}
            size="sm"
            icon={isNearLimit ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
          >
            {isNearLimit ? 'Near Limit' : 'Within Budget'}
          </Badge>
        </div>

        {/* Big Metric Display */}
        <div className="flex items-baseline justify-between mt-3 mb-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-stone-900 tracking-tight">
              {totalHours}h {totalMins}m
            </span>
            <span className="text-xs text-stone-500">
              / {targetHours}h {targetMins > 0 ? `${targetMins}m` : ''} limit
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>25m less fatigue</span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-3">
          <ProgressBar
            value={screenTime.totalMinutes}
            max={screenTime.maxTargetMinutes}
            colorClass={isNearLimit ? 'bg-amber-500' : 'bg-sage-600'}
            size="sm"
          />
        </div>

        {/* Continuous Session Fatigue Warning */}
        <div
          className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
            isContinuousHigh
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : 'bg-sand-50/80 border-sand-200/80 text-stone-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isContinuousHigh ? 'bg-amber-500 animate-pulse' : 'bg-sage-500'
              }`}
            />
            <span>
              Continuous Screen Block: <strong>{screenTime.activeContinuousMinutes} mins</strong>
            </span>
          </div>
          <span className="text-[11px] text-stone-500">
            {isContinuousHigh ? 'Break recommended' : 'Under 50m limit'}
          </span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mt-5 pt-4 border-t border-sand-100">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-2.5">
          Work Category Breakdown
        </span>

        {/* Segmented Bar */}
        <div className="h-2 w-full rounded-full overflow-hidden flex bg-sand-200/60 mb-3">
          {screenTime.categories.map((cat) => (
            <div
              key={cat.category}
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
              }}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
              title={`${cat.category}: ${cat.minutes}m (${cat.percentage}%)`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {screenTime.categories.map((cat) => {
            const h = Math.floor(cat.minutes / 60);
            const m = cat.minutes % 60;
            const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
            return (
              <div key={cat.category} className="flex items-center justify-between pr-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-stone-600 truncate text-[11px]">{cat.category}</span>
                </div>
                <span className="font-semibold text-stone-800 text-[11px] shrink-0 ml-1">
                  {timeStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
