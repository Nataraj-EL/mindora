import React from 'react';
import { Droplets, Plus, Minus, Clock } from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';

export const HydrationTrackerCard: React.FC = () => {
  const { hydration, logGlassOfWater, removeGlassOfWater } = useWellness();

  const totalMl = hydration.currentGlasses * hydration.glassSizeMl;
  const targetMl = hydration.targetGlasses * hydration.glassSizeMl;
  const percentage = Math.min(
    Math.round((hydration.currentGlasses / hydration.targetGlasses) * 100),
    100
  );

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 text-calm-water">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Hydration Balance</h3>
              <p className="text-xs text-stone-500">Target: {targetMl}ml / day</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-calm-water bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
            {percentage}% Reached
          </span>
        </div>

        {/* Big Metric Display */}
        <div className="flex items-baseline justify-between mt-3 mb-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-stone-900 tracking-tight">
              {hydration.currentGlasses}
            </span>
            <span className="text-stone-500 text-sm">/ {hydration.targetGlasses} glasses</span>
          </div>
          <span className="text-xs font-semibold text-stone-600 bg-sand-100 px-2 py-0.5 rounded-md">
            {totalMl} ml logged
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <ProgressBar
            value={hydration.currentGlasses}
            max={hydration.targetGlasses}
            colorClass="bg-calm-water"
            size="sm"
          />
        </div>

        {/* Visual Glass Dots */}
        <div className="mt-4 flex items-center justify-between gap-1 p-2 rounded-xl bg-sand-50/90 border border-sand-200/60">
          {Array.from({ length: hydration.targetGlasses }).map((_, idx) => {
            const isFilled = idx < hydration.currentGlasses;
            return (
              <div
                key={idx}
                className={`flex-1 h-7 rounded-md flex items-center justify-center transition-all ${
                  isFilled
                    ? 'bg-calm-water/15 text-calm-water border border-calm-water/30'
                    : 'bg-white border border-sand-200 text-stone-300'
                }`}
                title={`Glass ${idx + 1} (250ml)`}
              >
                <Droplets
                  className={`w-3.5 h-3.5 ${
                    isFilled ? 'fill-calm-water text-calm-water' : 'text-stone-300'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="mt-5 pt-3 border-t border-sand-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span>Last: {hydration.lastLoggedTime || 'Just started'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={removeGlassOfWater}
            disabled={hydration.currentGlasses <= 0}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-sand-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border border-sand-200"
            title="Remove 1 glass"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={logGlassOfWater}
            className="flex items-center gap-1 text-xs font-semibold text-white bg-calm-water hover:bg-[#2C6B8B] px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Glass</span>
          </button>
        </div>
      </div>
    </Card>
  );
};
