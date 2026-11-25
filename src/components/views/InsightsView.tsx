import React from 'react';
import {
  Sparkles,
  Zap,
  Compass,
  ArrowRight,
  RotateCw,
  TrendingUp,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';

export const InsightsView: React.FC = () => {
  const {
    aiInsights,
    isAiGeneratingInsights,
    refreshAiInsights,
    aiConsent,
    aiHealth,
    setActiveTab,
  } = useWellness();

  const isAiSource = aiInsights?.source === 'ai';

  const getImpactBadge = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return <Badge variant="warning" size="sm">High Leverage</Badge>;
      case 'medium':
        return <Badge variant="sage" size="sm">Recommended</Badge>;
      default:
        return <Badge variant="sand" size="sm">Gradual Shift</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Provider Status & Refresh Action */}
      <div className="bg-white rounded-2xl border border-sand-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="sage" icon={<Sparkles className="w-3.5 h-3.5 text-sage-600" />}>
                Behavioral Ergonomics & AI Insights
              </Badge>
              {isAiSource ? (
                <Badge variant="sage" size="sm">
                  ✨ Powered by {aiHealth.provider || 'Gemini'}
                </Badge>
              ) : (
                <Badge variant="sand" size="sm">
                  🌱 Local Deterministic Engine
                </Badge>
              )}
              {!aiConsent.hasConsented && (
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Local Privacy Mode
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Cognitive Rhythm & Pattern Analysis
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Mindora models your work stamina over rolling workday intervals, isolating micro-fatigue thresholds before cumulative eye strain, headaches, or focus degradation compound.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAiInsights}
              isLoading={isAiGeneratingInsights}
              icon={<RotateCw className={`w-3.5 h-3.5 ${isAiGeneratingInsights ? 'animate-spin' : ''}`} />}
            >
              Analyze Work Patterns
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Medical Safety & Privacy Notice */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-stone-700 leading-relaxed">
          <span className="font-semibold text-amber-900 block mb-0.5">
            Non-Medical Lifestyle Ergonomics Notice
          </span>
          Mindora's insights, daily plans, and recommendations are designed exclusively for workday productivity, cognitive pacing, and physical ergonomics. They are not clinical diagnoses, psychological treatments, or medical advice.
        </div>
      </div>

      {/* 3. Weekly Behavioral Summary Card */}
      {aiInsights && (
        <Card className="border border-sand-200/90">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  Weekly Behavioral Summary & Circadian Rhythm
                </h3>
                <p className="text-xs text-stone-500">
                  Synthesized across multi-day telemetry logs
                </p>
              </div>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">
              Updated {new Date(aiInsights.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Focus Cadence Window */}
            <div className="p-4 rounded-xl bg-sand-50/70 border border-sand-200/80">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                Circadian Peak Flow
              </span>
              <span className="text-base font-bold text-stone-900 block">
                {aiInsights.weeklySummary.circadianPeakWindow}
              </span>
              <span className="text-[11px] text-stone-500 mt-1 block">
                Highest focus retention window with lowest distraction rate.
              </span>
            </div>

            {/* Fatigue Dip Window */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
                Post-Prandial Fatigue Dip
              </span>
              <span className="text-base font-bold text-amber-950 block">
                {aiInsights.weeklySummary.fatigueDropWindow}
              </span>
              <span className="text-[11px] text-amber-800/80 mt-1 block">
                Natural metabolic slowdown. Optimal for light triage or walking breaks.
              </span>
            </div>

            {/* Compliance Gauges */}
            <div className="p-4 rounded-xl bg-sage-50/70 border border-sage-200/80 space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-stone-700">Break Compliance</span>
                  <span className="text-sage-800">{aiInsights.weeklySummary.breakComplianceRate}%</span>
                </div>
                <ProgressBar value={aiInsights.weeklySummary.breakComplianceRate} colorClass="bg-sage-600" />
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-stone-700">Hydration Pacing</span>
                  <span className="text-teal-800">{aiInsights.weeklySummary.hydrationConsistencyRate}%</span>
                </div>
                <ProgressBar value={aiInsights.weeklySummary.hydrationConsistencyRate} colorClass="bg-teal-600" />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-sand-200 text-xs">
            <span className="font-semibold text-stone-900 block mb-1">
              Key Behavioral Takeaway:
            </span>
            <p className="text-stone-700 leading-relaxed">
              {aiInsights.weeklySummary.keyTakeaway}
            </p>
          </div>
        </Card>
      )}

      {/* 4. Pattern Observations Grid (Clearly differentiating AI Observations vs Measured Telemetry) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-900">
            Work-Pattern Observations
          </h3>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sage-500" />
              <span>✨ AI-Generated Observation</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              <span>📊 Measured Telemetry</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights?.patternObservations.map((obs) => (
            <Card key={obs.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sand-100 text-stone-700">
                    {obs.category}
                  </span>
                  {obs.isAiGenerated ? (
                    <Badge variant="sage" size="sm" icon={<Sparkles className="w-3 h-3 text-sage-600" />}>
                      AI Observation
                    </Badge>
                  ) : (
                    <Badge variant="sand" size="sm">
                      Measured Telemetry
                    </Badge>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-stone-900 mb-1.5">
                  {obs.observation}
                </h4>

                <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-3">
                  <Activity className="w-3.5 h-3.5 text-stone-400" />
                  <span>Telemetry Evidence: <strong>{obs.evidenceMetric}</strong></span>
                </div>

                <div className="p-3 rounded-lg bg-sand-50 border border-sand-200 text-xs">
                  <span className="font-semibold text-stone-800 block mb-0.5">
                    Suggested Adaptation:
                  </span>
                  <p className="text-stone-600 leading-relaxed">
                    {obs.suggestedAdjustment}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">Contextual Ergonomics</span>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sage-700 hover:text-sage-900 transition-colors cursor-pointer"
                >
                  <span>Apply in Daily Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. Wellness Improvement Opportunities */}
      {aiInsights && aiInsights.improvementOpportunities.length > 0 && (
        <Card className="border border-sand-200/90">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Prioritized Wellness Improvement Opportunities
              </h3>
              <p className="text-xs text-stone-500">
                High-leverage habits to sustain cognitive longevity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {aiInsights.improvementOpportunities.map((opp) => (
              <div key={opp.id} className="p-3.5 rounded-xl bg-sand-50/70 border border-sand-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-stone-900">{opp.area}</span>
                    {getImpactBadge(opp.impact)}
                  </div>
                  <p className="text-stone-700 font-medium mb-1.5 leading-relaxed">
                    {opp.action}
                  </p>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    {opp.rationale}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 6. Recommendation Effectiveness Summary */}
      {aiInsights && (
        <Card className="border border-sand-200/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Intervention & Recommendation Effectiveness
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {aiInsights.recommendationEffectivenessSummary.feedbackNotes}
              </p>
            </div>

            <div className="flex items-center gap-6 bg-sand-50 p-3 rounded-xl border border-sand-200/70">
              <div className="text-center">
                <span className="block text-xl font-bold text-stone-900">
                  {aiInsights.recommendationEffectivenessSummary.totalDelivered}
                </span>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                  Delivered
                </span>
              </div>
              <div className="h-6 w-px bg-sand-200" />
              <div className="text-center">
                <span className="block text-xl font-bold text-sage-700">
                  {aiInsights.recommendationEffectivenessSummary.acceptedCount}
                </span>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                  Completed
                </span>
              </div>
              <div className="h-6 w-px bg-sand-200" />
              <div className="text-center">
                <span className="block text-xl font-bold text-teal-700">
                  {aiInsights.recommendationEffectivenessSummary.adherencePercentage}%
                </span>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                  Adherence
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 7. Circadian Cadence Map */}
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
                Modeled biological stamina windows across technical workdays
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
            <span className="font-semibold text-stone-800 block">Morning Ramp (8:00 - 9:30 AM)</span>
            <span className="text-stone-500 text-[11px] mt-1 block">
              Low cognitive load. Best for intent setting, hydration, and architectural reading.
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
