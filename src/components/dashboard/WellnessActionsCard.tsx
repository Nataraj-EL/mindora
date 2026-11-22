import React from 'react';
import { Sparkles, CheckCircle2, Circle, Clock, Flame } from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const WellnessActionsCard: React.FC = () => {
  const { recommendedActions, toggleActionCompletion } = useWellness();

  const completedCount = recommendedActions.filter((a) => a.isCompleted).length;

  const getImpactBadgeVariant = (impact: string) => {
    switch (impact) {
      case 'Deep Reset':
        return 'sage';
      case 'Physical Relief':
        return 'clay';
      case 'Gentle Boost':
      default:
        return 'sand';
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Recommended Wellness Actions</h3>
              <p className="text-xs text-stone-500">AI-curated interventions for current workday</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-sage-800 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-100">
            {completedCount} of {recommendedActions.length} completed
          </span>
        </div>

        {/* Action items list */}
        <div className="space-y-2.5 mt-4">
          {recommendedActions.map((action) => (
            <div
              key={action.id}
              onClick={() => toggleActionCompletion(action.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                action.isCompleted
                  ? 'bg-sand-50/60 border-sand-200/60 opacity-75'
                  : 'bg-white border-sand-200/90 hover:border-sage-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  aria-label={action.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                  className="mt-0.5 text-stone-400 hover:text-sage-700 transition-colors shrink-0"
                >
                  {action.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-sage-600 fill-sage-50" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        action.isCompleted
                          ? 'line-through text-stone-400'
                          : 'text-stone-900'
                      }`}
                    >
                      {action.title}
                    </span>
                    <Badge variant={getImpactBadgeVariant(action.energyImpact)} size="sm">
                      {action.energyImpact}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-stone-400 shrink-0 font-medium">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>{action.timeEstimate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          Completing resets boosts afternoon stamina
        </span>
        <span className="text-sage-700 font-medium cursor-pointer hover:underline">
          View Protocol Guide
        </span>
      </div>
    </Card>
  );
};
