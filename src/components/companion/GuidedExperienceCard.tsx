import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Wind,
  Eye,
  Activity,
  Heart,
  Target,
} from 'lucide-react';
import { GuidedExperienceData } from '../../types/conversation';
import { useWellness } from '../../context/WellnessContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface GuidedExperienceCardProps {
  experience: GuidedExperienceData;
}

export const GuidedExperienceCard: React.FC<GuidedExperienceCardProps> = ({ experience }) => {
  const { addTimelineItem } = useWellness();
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepSecondsRemaining, setStepSecondsRemaining] = useState(
    experience.steps[0]?.durationSeconds || 10
  );
  const [isCompleted, setIsCompleted] = useState(experience.isCompleted || false);

  const currentStep = experience.steps[currentStepIndex] || experience.steps[0];

  useEffect(() => {
    if (!isActive || isCompleted) return;

    const interval = setInterval(() => {
      setStepSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Advance to next step or complete
          if (currentStepIndex + 1 < experience.steps.length) {
            const nextIdx = currentStepIndex + 1;
            setCurrentStepIndex(nextIdx);
            return experience.steps[nextIdx].durationSeconds;
          } else {
            // Completed all steps
            setIsActive(false);
            setIsCompleted(true);
            addTimelineItem({
              title: `Guided: ${experience.title}`,
              description: `Completed conversational guided wellness reset (${Math.max(1, Math.round(experience.durationSeconds / 60))}m).`,
              category: experience.category,
              impact: 'restorative',
            });
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isCompleted, currentStepIndex, experience, addTimelineItem]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setStepSecondsRemaining(experience.steps[0]?.durationSeconds || 10);
    setIsCompleted(false);
  };

  const getIcon = () => {
    switch (experience.type) {
      case 'breathing_478':
        return <Wind className="w-4 h-4 text-teal-600" />;
      case 'eye_relaxation_202020':
        return <Eye className="w-4 h-4 text-sky-600" />;
      case 'neck_shoulder_stretch':
        return <Activity className="w-4 h-4 text-sage-600" />;
      case 'focus_prep':
        return <Target className="w-4 h-4 text-amber-600" />;
      default:
        return <Heart className="w-4 h-4 text-rose-600" />;
    }
  };

  return (
    <div className="mt-3 p-4 rounded-xl bg-white border border-sand-200/90 shadow-xs max-w-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sand-100">
            {getIcon()}
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 tracking-tight">
              {experience.title}
            </h4>
            <span className="text-[10px] text-stone-500">
              Guided Protocol • {Math.round(experience.durationSeconds / 60)} min
            </span>
          </div>
        </div>

        {isCompleted ? (
          <Badge variant="sage" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-sage-600" />}>
            Completed
          </Badge>
        ) : (
          <Badge variant="sand" size="sm">
            Interactive
          </Badge>
        )}
      </div>

      {/* Progress across steps */}
      <div className="flex gap-1.5 mb-3">
        {experience.steps.map((st, idx) => (
          <div
            key={st.stepIndex}
            className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
              idx < currentStepIndex || isCompleted
                ? 'bg-sage-600'
                : idx === currentStepIndex
                ? 'bg-sage-400 animate-pulse'
                : 'bg-sand-200'
            }`}
          />
        ))}
      </div>

      {/* Active step display */}
      <div className="p-3 rounded-lg bg-sand-50/80 border border-sand-200/60 mb-3 text-xs">
        <div className="flex items-center justify-between font-semibold text-stone-800 mb-1">
          <span>
            Step {currentStepIndex + 1} of {experience.steps.length}: {currentStep.label}
          </span>
          <span className="font-mono text-sage-800 font-bold">
            {isCompleted ? 'Done' : `${stepSecondsRemaining}s`}
          </span>
        </div>
        <p className="text-stone-600 text-[11px] leading-relaxed">
          {isCompleted ? 'Reset completed! Your vagal & physical stamina has been restored.' : currentStep.instruction}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {!isCompleted ? (
            isActive ? (
              <Button size="sm" variant="outline" onClick={handlePause} icon={<Pause className="w-3 h-3" />}>
                Pause
              </Button>
            ) : (
              <Button size="sm" variant="primary" onClick={handleStart} icon={<Play className="w-3 h-3 fill-current" />}>
                {currentStepIndex > 0 ? 'Resume' : 'Start Session'}
              </Button>
            )
          ) : (
            <span className="text-xs text-sage-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Logged to activity timeline
            </span>
          )}
        </div>

        <button
          onClick={handleReset}
          className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-sand-100 transition-colors cursor-pointer text-xs flex items-center gap-1"
          title="Reset timer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
