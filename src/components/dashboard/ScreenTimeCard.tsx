import React, { useState } from 'react';
import { Monitor, TrendingDown, AlertCircle, CheckCircle2, Info, Activity } from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';

export const ScreenTimeCard: React.FC = () => {
  const { screenTime, trackingStatus } = useWellness();
  const [showExplanation, setShowExplanation] = useState(false);

  const totalHours = Math.floor(screenTime.totalMinutes / 60);
  const totalMins = screenTime.totalMinutes % 60;
  const targetHours = Math.floor(screenTime.maxTargetMinutes / 60);
  const targetMins = screenTime.maxTargetMinutes % 60;

  const inAppMinutes = Math.max(
    Math.floor(trackingStatus.inAppActiveSeconds / 60),
    screenTime.inAppActiveMinutes
  );

  const isNearLimit = screenTime.totalMinutes >= screenTime.maxTargetMinutes * 0.85;
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
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-stone-900">Workday Screen Time</h3>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer"
                  title="How screen time is calculated"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-stone-500">Estimated total & verified in-app presence</p>
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

        {/* Informative Explanation Banner */}
        {showExplanation && (
          <div className="mb-3 p-3 rounded-xl bg-sand-100/80 border border-sand-200/90 text-[11px] text-stone-700 leading-relaxed">
            <p className="font-semibold text-stone-900 mb-0.5">Tracking Distinction:</p>
            <p className="mb-1">
              • <strong>In-App Active Time:</strong> Directly measured presence inside Mindora ({inAppMinutes}m today).
            </p>
            <p>
              • <strong>Workday Estimate:</strong> Modeled total screen exposure combining your completed focus blocks, break intervals, and daily baseline.
            </p>
          </div>
        )}

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

        {/* Distinct In-App Active Badge & Continuous Strain Status */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {/* Verified In-App Metric */}
          <div className="p-2.5 rounded-xl bg-sand-50/80 border border-sand-200/80 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-500 flex items-center gap-1">
              <Activity className="w-3 h-3 text-sage-600" />
              Verified In-App
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-stone-900 font-mono">{inAppMinutes}m</span>
              <span className="text-[10px] text-stone-400">tracked</span>
            </div>
          </div>

          {/* Continuous Session Alert */}
          <div
            className={`p-2.5 rounded-xl border flex flex-col justify-between ${
              isContinuousHigh
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : 'bg-sand-50/80 border-sand-200/80 text-stone-700'
            }`}
          >
            <span className="text-[10px] uppercase font-semibold tracking-wider text-stone-500 flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isContinuousHigh ? 'bg-amber-500 animate-pulse' : 'bg-sage-500'
                }`}
              />
              Current Stretch
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-bold font-mono">
                {screenTime.activeContinuousMinutes}m
              </span>
              <span className="text-[10px] text-stone-500">
                {isContinuousHigh ? 'Strain Risk' : '< 50m safe'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mt-4 pt-3.5 border-t border-sand-100">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-2">
          Workday Distribution
        </span>

        {/* Segmented Bar */}
        <div className="h-2 w-full rounded-full overflow-hidden flex bg-sand-200/60 mb-2.5">
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
