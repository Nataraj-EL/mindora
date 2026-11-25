import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Circle, Clock, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const WellnessActionsCard: React.FC = () => {
  const {
    contextualRecommendations,
    toggleContextualRecommendation,
    recommendedActions,
    toggleActionCompletion,
  } = useWellness();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // If contextualRecommendations are available, prioritize them
  const hasContextual = contextualRecommendations && contextualRecommendations.length > 0;
  const items = hasContextual ? contextualRecommendations : recommendedActions;
  const completedCount = items.filter((a) => a.isCompleted).length;

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

  const handleToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasContextual) {
      toggleContextualRecommendation(id);
    } else {
      toggleActionCompletion(id);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-stone-900">Personalized Interventions</h3>
                <span className="text-[10px] font-medium text-sage-800 bg-sage-100/70 px-2 py-0.5 rounded-md">
                  Adaptive
                </span>
              </div>
              <p className="text-xs text-stone-500">Targeted protocols prioritized by your fatigue state</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-sage-800 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-100">
            {completedCount} of {items.length} completed
          </span>
        </div>

        {/* Action items list */}
        <div className="space-y-2.5 mt-4">
          {items.map((action) => {
            const isExpanded = expandedId === action.id;
            const isContextualItem = 'reason' in action;
            const reason = isContextualItem ? action.reason : null;
            const instruction = isContextualItem ? action.instruction : null;

            return (
              <div
                key={action.id}
                onClick={() => toggleExpand(action.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  action.isCompleted
                    ? 'bg-sand-50/60 border-sand-200/60 opacity-75'
                    : 'bg-white border-sand-200/90 hover:border-sage-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      aria-label={action.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      onClick={(e) => handleToggle(action.id, e)}
                      className="mt-0.5 text-stone-400 hover:text-sage-700 transition-colors shrink-0"
                    >
                      {action.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-sage-600 fill-sage-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300 hover:text-sage-600" />
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

                      {/* Explicit "Why" Reason */}
                      {reason && (
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-sage-900 bg-sage-50/70 px-2 py-0.5 rounded-md border border-sage-200/50">
                          <Sparkles className="w-3 h-3 text-sage-600 shrink-0" />
                          <span className="truncate">
                            <strong>Why:</strong> {reason}
                          </span>
                        </div>
                      )}

                      {'description' in action && !reason && (
                        <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                          {action.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] text-stone-400 font-medium font-mono">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{action.timeEstimate}</span>
                    </div>
                    {instruction && (
                      <span className="text-stone-400 hover:text-stone-700">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable Step-by-Step Guidance */}
                {isExpanded && instruction && (
                  <div className="mt-1 pt-2 border-t border-sand-100 text-[11px] text-stone-700 leading-relaxed bg-sand-50/60 p-2.5 rounded-lg animate-in fade-in duration-200">
                    <span className="font-semibold text-stone-900 block mb-1">
                      Actionable Instructions:
                    </span>
                    <p>{instruction}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          Prioritized dynamically from work cadence
        </span>
        <span className="text-sage-700 font-medium">Auto-calibrated</span>
      </div>
    </Card>
  );
};
