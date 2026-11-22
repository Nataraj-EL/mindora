import React from 'react';

interface ProgressBarProps {
  value: number; // current value
  max?: number;
  label?: string;
  sublabel?: string;
  colorClass?: string;
  trackClass?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

const heightStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  colorClass = 'bg-sage-600',
  trackClass = 'bg-sand-200/80',
  size = 'md',
  showPercentage = false,
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  return (
    <div className="w-full">
      {(label || showPercentage || sublabel) && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          {label && <span className="font-medium text-stone-700">{label}</span>}
          {sublabel && <span className="text-stone-400">{sublabel}</span>}
          {showPercentage && <span className="font-semibold text-stone-700 ml-auto">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full ${trackClass} ${heightStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};
