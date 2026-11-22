import React from 'react';
import {
  Sparkles,
  Zap,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const InsightsView: React.FC = () => {
  const { insights, setActiveTab } = useWellness();

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="warning" size="sm">High Impact</Badge>;
      case 'medium':
        return <Badge variant="sage" size="sm">Recommended</Badge>;
      default:
        return <Badge variant="sand" size="sm">Observation</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-sand-200/90 p-6 sm:p-7 shadow-xs">
        <div className="max-w-2xl space-y-2">
          <Badge variant="sage" icon={<Sparkles className="w-3.5 h-3.5 text-sage-600" />}>
            Pattern Analysis Engine
          </Badge>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Cognitive Rhythm & Wellness Insights
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Mindora models your work stamina over rolling 7-day intervals, detecting micro-fatigue thresholds before eye strain, headaches, or decision paralysis set in.
          </p>
        </div>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <Card key={insight.id} className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-sand-100 text-stone-700">
                  {insight.metricBadge}
                </span>
                {getPriorityBadge(insight.priority)}
              </div>

              <h3 className="text-base font-semibold text-stone-900 mb-2">
                {insight.title}
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {insight.summary}
              </p>

              {/* Action recommendation box */}
              <div className="p-3.5 rounded-xl bg-sage-50/70 border border-sage-200/60 text-xs">
                <span className="font-semibold text-sage-900 block mb-1">
                  Target Protocol:
                </span>
                <p className="text-stone-700 leading-relaxed">
                  {insight.recommendation}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-sand-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">Continuous AI assessment</span>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sage-700 hover:text-sage-900 transition-colors cursor-pointer"
              >
                <span>Apply In Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Circadian Cadence Map */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Cognitive Flow Windows (24-Hour Map)
              </h3>
              <p className="text-xs text-stone-500">
                Identified energy peaks and biological dips
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
            <span className="font-semibold text-stone-800 block">Morning Ramp (8:00 - 9:30 AM)</span>
            <span className="text-stone-500 text-[11px] mt-1 block">
              Low mental load. Ideal for intent setting, hydration, and architectural reading.
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sage-900">Peak Window (9:30 - 11:45 AM)</span>
              <Zap className="w-3.5 h-3.5 text-sage-600 fill-sage-600/30" />
            </div>
            <span className="text-stone-700 text-[11px] block">
              94% focus retention. Reserve for deep code, problem-solving, and design architecture.
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="font-semibold text-amber-900 block">Circadian Dip (1:30 - 2:30 PM)</span>
            <span className="text-stone-600 text-[11px] mt-1 block">
              Natural post-prandial drop. Take an outdoor daylight walk or light administrative triage.
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
            <span className="font-semibold text-stone-800 block">Second Flow (3:00 - 5:00 PM)</span>
            <span className="text-stone-500 text-[11px] mt-1 block">
              Secondary focus peak. Best executed with 25m Pomodoros and mandatory eye breaks.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
