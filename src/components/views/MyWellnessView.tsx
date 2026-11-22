import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Smile,
  Wind,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';

export const MyWellnessView: React.FC = () => {
  const { wellnessScore, moodEntries, logMood, addTimelineItem } = useWellness();
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [moodNote, setMoodNote] = useState('');
  const [moodFeedback, setMoodFeedback] = useState(false);

  // Breathing Guide state
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [phaseSeconds, setPhaseSeconds] = useState(4);

  const moodOptions: { level: 1 | 2 | 3 | 4 | 5; label: string; emoji: string }[] = [
    { level: 1, label: 'Exhausted', emoji: '🌧️' },
    { level: 2, label: 'Fatigued', emoji: '☁️' },
    { level: 3, label: 'Balanced', emoji: '🌤️' },
    { level: 4, label: 'Energized', emoji: '🌿' },
    { level: 5, label: 'Peak Flow', emoji: '✨' },
  ];

  const handleMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const opt = moodOptions.find((m) => m.level === selectedMood);
    if (!opt) return;
    logMood(opt.level, opt.label, moodNote.trim() || undefined);
    setMoodNote('');
    setMoodFeedback(true);
    setTimeout(() => setMoodFeedback(false), 3000);
  };

  // Breathing exercise interval
  useEffect(() => {
    if (!isBreathingActive) return;

    let timer: ReturnType<typeof setTimeout>;
    if (phaseSeconds > 1) {
      timer = setTimeout(() => setPhaseSeconds((s) => s - 1), 1000);
    } else {
      if (breathPhase === 'Inhale') {
        setBreathPhase('Hold');
        setPhaseSeconds(7);
      } else if (breathPhase === 'Hold') {
        setBreathPhase('Exhale');
        setPhaseSeconds(8);
      } else {
        setBreathPhase('Inhale');
        setPhaseSeconds(4);
      }
    }

    return () => clearTimeout(timer);
  }, [isBreathingActive, breathPhase, phaseSeconds]);

  const toggleBreathing = () => {
    if (isBreathingActive) {
      setIsBreathingActive(false);
      setBreathPhase('Inhale');
      setPhaseSeconds(4);
    } else {
      setIsBreathingActive(true);
      setBreathPhase('Inhale');
      setPhaseSeconds(4);
      addTimelineItem({
        title: '4-7-8 Breathing Started',
        description: 'Initiated parasympathetic calming breath sequence.',
        category: 'break',
        impact: 'restorative',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-sand-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="sage" icon={<ShieldCheck className="w-3.5 h-3.5 text-sage-600" />}>
              Holistic Ergonomics & Vitals
            </Badge>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Mindora Wellness Sanctuary
            </h2>
            <p className="text-sm text-stone-600 max-w-xl leading-relaxed">
              Tracking your mind-body stamina to prevent burnout before it starts. Consistent micro-pauses preserve peak cognitive stamina throughout high-intensity technical work.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-sand-50 p-4 rounded-xl border border-sand-200/70">
            <div className="text-center">
              <span className="block text-3xl font-extrabold text-stone-900">
                {wellnessScore.overall}
              </span>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Wellness Index
              </span>
            </div>
            <div className="h-8 w-px bg-sand-200" />
            <div className="text-center">
              <span className="block text-3xl font-extrabold text-sage-700">
                +{wellnessScore.deltaVsYesterday}
              </span>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Trend Today
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Parasympathetic Reset (4-7-8 Breathing) */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  4-7-8 Parasympathetic Reset
                </h3>
                <p className="text-xs text-stone-500">Proven nervous system calming exercise</p>
              </div>
            </div>
            <Badge variant="sage" size="sm">
              Live Coach
            </Badge>
          </div>

          {/* Guided Circle Animation */}
          <div className="flex flex-col items-center justify-center my-6">
            <div
              className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
                isBreathingActive
                  ? breathPhase === 'Inhale'
                    ? 'scale-110 bg-sage-100/90 border-2 border-sage-500 text-sage-900'
                    : breathPhase === 'Hold'
                    ? 'scale-105 bg-amber-100/90 border-2 border-amber-500 text-amber-900'
                    : 'scale-90 bg-sky-100/90 border-2 border-sky-500 text-sky-900'
                  : 'bg-sand-100/70 border border-sand-200 text-stone-600'
              }`}
            >
              <span className="text-xs uppercase tracking-widest font-bold">
                {isBreathingActive ? breathPhase : 'Ready'}
              </span>
              <span className="text-3xl font-bold font-mono mt-1">
                {isBreathingActive ? `${phaseSeconds}s` : '3 min'}
              </span>
              {isBreathingActive && (
                <span className="text-[10px] text-stone-500 mt-0.5">
                  {breathPhase === 'Inhale'
                    ? 'Through nose'
                    : breathPhase === 'Hold'
                    ? 'Retain gently'
                    : 'Slow mouth exhale'}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-500 text-center max-w-xs mt-4">
              {isBreathingActive
                ? 'Follow the prompt rhythm. Relax your shoulders and soften your gaze.'
                : 'Take 3 minutes to activate your vagal nerve and lower screen-induced mental fatigue.'}
            </p>

            <div className="mt-5 flex gap-2">
              <Button
                variant={isBreathingActive ? 'secondary' : 'primary'}
                onClick={toggleBreathing}
                icon={isBreathingActive ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              >
                {isBreathingActive ? 'End Session' : 'Start 4-7-8 Breathing'}
              </Button>
            </div>
          </div>
        </Card>

        {/* State of Mind & Mood Pulse */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
                <Smile className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Emotional & Energy Pulse</h3>
                <p className="text-xs text-stone-500">Record subjective energy levels</p>
              </div>
            </div>
            {moodFeedback && (
              <span className="text-xs text-sage-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Logged!
              </span>
            )}
          </div>

          <form onSubmit={handleMoodSubmit} className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {moodOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.level}
                  onClick={() => setSelectedMood(opt.level)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    selectedMood === opt.level
                      ? 'bg-sage-100/80 border-sage-500 shadow-2xs font-bold text-stone-900'
                      : 'bg-white border-sand-200 hover:border-sand-300 text-stone-600'
                  }`}
                >
                  <span className="text-2xl mb-1">{opt.emoji}</span>
                  <span className="text-[11px] truncate w-full text-center">{opt.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Reflective note (optional)
              </label>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="What factors contributed to your state of mind just now?"
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-sand-200 bg-sand-50/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
              />
            </div>

            <Button type="submit" size="sm" variant="primary">
              Log Energy Level
            </Button>
          </form>

          {/* Past entries */}
          <div className="mt-5 pt-4 border-t border-sand-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-2">
              Recent Check-ins Today
            </span>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {moodEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-sand-50/80 text-xs border border-sand-200/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{entry.emoji}</span>
                    <span className="font-semibold text-stone-800">{entry.label}</span>
                    {entry.note && (
                      <span className="text-stone-500 truncate max-w-[180px]">
                        — {entry.note}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">{entry.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Wellness Dimensions Deep Dive */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Wellness Dimensions Index</h3>
              <p className="text-xs text-stone-500">Multi-factor cognitive and biological metrics</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(wellnessScore.dimensions).map(([key, dim]) => (
            <div
              key={key}
              className="p-4 rounded-xl border border-sand-200/90 bg-sand-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-stone-900">{dim.name}</span>
                  <span className="text-sm font-bold font-mono text-sage-800">{dim.score}%</span>
                </div>
                <ProgressBar
                  value={dim.score}
                  max={100}
                  colorClass={dim.score >= 85 ? 'bg-sage-600' : 'bg-amber-500'}
                  size="sm"
                />
              </div>
              <p className="text-xs text-stone-500 mt-2.5 leading-relaxed">{dim.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
