import React from 'react';

export type BadgeVariant =
  | 'sage'
  | 'sand'
  | 'clay'
  | 'sky'
  | 'amber'
  | 'stone'
  | 'success'
  | 'warning';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  sage: 'bg-sage-100 text-sage-900 border-sage-200/80',
  sand: 'bg-sand-100 text-sand-800 border-sand-300/70',
  clay: 'bg-clay-100 text-clay-900 border-clay-200/80',
  sky: 'bg-sky-50 text-sky-900 border-sky-200',
  amber: 'bg-amber-50 text-amber-900 border-amber-200',
  stone: 'bg-stone-100 text-stone-700 border-stone-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-orange-50 text-orange-900 border-orange-200',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'sage',
  size = 'md',
  className = '',
  icon,
}) => {
  const sizeStyles =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 tracking-tight'
      : 'text-xs px-2.5 py-1 tracking-normal font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${variantStyles[variant]} ${sizeStyles} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
