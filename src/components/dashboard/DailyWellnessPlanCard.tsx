import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  RotateCw,
  Coffee,
  Activity,
  Heart,
  Droplets,
  Eye,
  Play,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';

export const DailyWellnessPlanCard: React.FC = () => {
  const {
    dailyPlan,
    isAiGeneratingPlan,
    generateDailyPlan,
    togglePlanItem,
    aiConsent,
    setTimerMode,
    setActiveTaskName,
    setIsTimerModalOpen,
  } = useWellness();

  const [activeTab, setActiveTab] = useState<'focus' | 'breaks' | 'movement' | 'recovery'>('focus');

  if (!dailyPlan) {
    return (
      <Card className="border border-sand-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sage-600" />
            <h3 className="text-sm font-semibold text-stone-900">Personalized Daily Wellness Plan</h3>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => generateDailyPlan(true)}
            isLoading={isAiGeneratingPlan}
          >
            Generate Today's Plan
          </Button>
        </div>
      </Card>
    );
  }

  // Calculate overall progress across all plan rituals
  const totalItems =
    dailyPlan.focusBlocks.length +
    dailyPlan.breakIntervals.length +
    dailyPlan.movementRecommendations.length +
    dailyPlan.recoverySuggestions.length;

  const completedItems =
    dailyPlan.focusBlocks.filter((b) => b.isCompleted).length +
    dailyPlan.breakIntervals.filter((b) => b.isCompleted).length +
    dailyPlan.movementRecommendations.filter((m) => m.isCompleted).length +
    dailyPlan.recoverySuggestions.filter((r) => r.isCompleted).length;

  const completionPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleStartFocusSprint = (title: string) => {
    setActiveTaskName(title);
    setTimerMode('focus');
    setIsTimerModalOpen(true);
  };

  const isAiSource = dailyPlan.source === 'ai';

  return (
    <Card className="border border-sand-200/90 shadow-xs relative overflow-hidden">
      {/* Header with Title, Source Badge, and Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-lg bg-sage-50 text-sage-700">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              Personalized Daily Wellness Plan
            </h3>
            {isAiSource ? (
              <Badge variant="sage" size="sm" icon={<Sparkles className="w-3 h-3 text-sage-600" />}>
                ✨ AI-Powered ({dailyPlan.providerUsed || 'Gemini'})
              </Badge>
            ) : (
              <Badge variant="sand" size="sm">
                🌱 Local Adaptive Engine
              </Badge>
            )}
            {!aiConsent.hasConsented && (
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Local Privacy Mode
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
            {dailyPlan.summary}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateDailyPlan(true)}
            isLoading={isAiGeneratingPlan}
            icon={<RotateCw className={`w-3.5 h-3.5 ${isAiGeneratingPlan ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            Refresh Plan
          </Button>
        </div>
      </div>

      {/* Daily Plan Progress Bar */}
      <div className="mb-5 p-3 rounded-xl bg-sand-50/80 border border-sand-200/60">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-stone-700">Ritual Adherence Progress</span>
          <span className="font-semibold text-sage-800">
            {completedItems} of {totalItems} rituals completed ({completionPct}%)
          </span>
        </div>
        <ProgressBar
          value={completionPct}
          colorClass={completionPct >= 80 ? 'bg-sage-600' : completionPct >= 40 ? 'bg-teal-600' : 'bg-amber-600'}
        />
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-1.5 border-b border-sand-200/80 pb-3 mb-4 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('focus')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'focus'
              ? 'bg-sage-600 text-white shadow-xs'
              : 'bg-sand-100 text-stone-600 hover:bg-sand-200 hover:text-stone-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Focus Blocks ({dailyPlan.focusBlocks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('breaks')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'breaks'
              ? 'bg-sage-600 text-white shadow-xs'
              : 'bg-sand-100 text-stone-600 hover:bg-sand-200 hover:text-stone-900'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Restorative Breaks ({dailyPlan.breakIntervals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('movement')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'movement'
              ? 'bg-sage-600 text-white shadow-xs'
              : 'bg-sand-100 text-stone-600 hover:bg-sand-200 hover:text-stone-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Movement ({dailyPlan.movementRecommendations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'recovery'
              ? 'bg-sage-600 text-white shadow-xs'
              : 'bg-sand-100 text-stone-600 hover:bg-sand-200 hover:text-stone-900'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Recovery ({dailyPlan.recoverySuggestions.length})</span>
        </button>
      </div>

      {/* Tab 1: Focus Blocks */}
      {activeTab === 'focus' && (
        <div className="space-y-2.5">
          {dailyPlan.focusBlocks.map((block) => (
            <div
              key={block.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                block.isCompleted
                  ? 'bg-sage-50/50 border-sage-200 text-stone-500'
                  : 'bg-white border-sand-200 hover:border-sage-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  onClick={() => togglePlanItem('focus', block.id)}
                  className="mt-0.5 text-sage-600 hover:text-sage-800 transition-colors cursor-pointer shrink-0"
                  aria-label={block.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                >
                  {block.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-sage-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 hover:text-sage-500" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold ${
                        block.isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                      }`}
                    >
                      {block.title}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-sand-100 text-stone-600">
                      {block.startTime} - {block.endTime} ({block.durationMinutes}m)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed truncate">
                    {block.targetGoal}
                  </p>
                </div>
              </div>

              {!block.isCompleted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartFocusSprint(block.title)}
                  icon={<Play className="w-3 h-3 fill-current" />}
                  className="shrink-0 text-xs py-1 px-2.5"
                >
                  Start Sprint
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Restorative Breaks */}
      {activeTab === 'breaks' && (
        <div className="space-y-2.5">
          {dailyPlan.breakIntervals.map((brk) => (
            <div
              key={brk.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                brk.isCompleted
                  ? 'bg-sage-50/50 border-sage-200 text-stone-500'
                  : 'bg-white border-sand-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => togglePlanItem('break', brk.id)}
                  className="text-sage-600 hover:text-sage-800 transition-colors cursor-pointer shrink-0"
                >
                  {brk.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-sage-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 hover:text-amber-500" />
                  )}
                </button>
                <div>
                  <span
                    className={`text-xs font-semibold block ${
                      brk.isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                    }`}
                  >
                    {brk.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-stone-500">
                      Scheduled for {brk.scheduledTime} ({brk.durationMinutes} min)
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-sand-100 text-stone-600">
                      {brk.type}
                    </span>
                  </div>
                </div>
              </div>

              {brk.isCompleted && (
                <Badge variant="sage" size="sm">
                  Restored
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Movement Recommendations */}
      {activeTab === 'movement' && (
        <div className="space-y-2.5">
          {dailyPlan.movementRecommendations.map((mv) => (
            <div
              key={mv.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                mv.isCompleted
                  ? 'bg-sage-50/50 border-sage-200 text-stone-500'
                  : 'bg-white border-sand-200 hover:border-teal-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => togglePlanItem('movement', mv.id)}
                  className="mt-0.5 text-sage-600 hover:text-sage-800 transition-colors cursor-pointer shrink-0"
                >
                  {mv.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-sage-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 hover:text-teal-500" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        mv.isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                      }`}
                    >
                      {mv.title}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {mv.targetWindow} • {mv.durationMinutes}m
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    {mv.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Recovery Suggestions */}
      {activeTab === 'recovery' && (
        <div className="space-y-2.5">
          {dailyPlan.recoverySuggestions.map((rc) => (
            <div
              key={rc.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                rc.isCompleted
                  ? 'bg-sage-50/50 border-sage-200 text-stone-500'
                  : 'bg-white border-sand-200 hover:border-sky-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => togglePlanItem('recovery', rc.id)}
                  className="mt-0.5 text-sage-600 hover:text-sage-800 transition-colors cursor-pointer shrink-0"
                >
                  {rc.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-sage-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 hover:text-sky-500" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        rc.isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                      }`}
                    >
                      {rc.title}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                      {rc.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    {rc.guidance}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Metrics Summary: Hydration & Eye-Care Targets */}
      <div className="mt-4 pt-3 border-t border-sand-200/70 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-sand-50/70">
          <Droplets className="w-4 h-4 text-sky-600" />
          <span className="text-stone-600">
            Target Hydration: <strong>{dailyPlan.hydrationGoal.glassesCount} glasses</strong> ({dailyPlan.hydrationGoal.targetMl}ml)
          </span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-sand-50/70">
          <Eye className="w-4 h-4 text-teal-600" />
          <span className="text-stone-600">
            Eye Pacing: <strong>{dailyPlan.eyeCareSchedule.rule}</strong> (every {dailyPlan.eyeCareSchedule.intervalMinutes}m)
          </span>
        </div>
      </div>
    </Card>
  );
};
