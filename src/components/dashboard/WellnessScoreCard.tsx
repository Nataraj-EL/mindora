import React from 'react';
import { HeartPulse, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';

export const WellnessScoreCard: React.FC = () => {
  const { wellnessScore } = useWellness();
  const { dimensions } = wellnessScore;

  return (
    <Card className="flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Daily Wellness Score</h3>
              <p className="text-xs text-stone-500">Holistic ergonomics & cognitive health</p>
            </div>
          </div>
          <Badge variant="sage" size="sm" icon={<ShieldCheck className="w-3 h-3 text-sage-600" />}>
            Optimal Balance
          </Badge>
        </div>

        {/* Big Score Header */}
        <div className="flex items-center justify-between my-4 p-4 rounded-xl bg-sand-50/90 border border-sand-200/70">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-stone-900 tracking-tight">
                {wellnessScore.overall}
              </span>
              <span className="text-sm font-semibold text-stone-400">/ 100</span>
            </div>
            <span className="text-xs font-medium text-sage-800">
              {wellnessScore.statusLabel}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            <span>+{wellnessScore.deltaVsYesterday} pts</span>
          </div>
        </div>

        {/* Score Dimension Breakdown */}
        <div className="space-y-3 mt-4">
          <ProgressBar
            value={dimensions.mentalFocus.score}
            label={dimensions.mentalFocus.name}
            showPercentage
            colorClass="bg-sage-600"
            size="sm"
          />
          <ProgressBar
            value={dimensions.workRhythm.score}
            label={dimensions.workRhythm.name}
            showPercentage
            colorClass="bg-sage-500"
            size="sm"
          />
          <ProgressBar
            value={dimensions.physical.score}
            label={dimensions.physical.name}
            showPercentage
            colorClass="bg-amber-600"
            size="sm"
          />
          <ProgressBar
            value={dimensions.restRecovery.score}
            label={dimensions.restRecovery.name}
            showPercentage
            colorClass="bg-calm-water"
            size="sm"
          />
        </div>
      </div>

      {/* AI Observation Quote */}
      <div className="mt-5 pt-3.5 border-t border-sand-100">
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-sage-50/60 border border-sage-200/50 text-xs text-stone-700 leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 text-sage-600 shrink-0 mt-0.5" />
          <span>{wellnessScore.aiObservation}</span>
        </div>
      </div>
    </Card>
  );
};
