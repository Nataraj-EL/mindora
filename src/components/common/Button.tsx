import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft-sage' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-sage-700 text-white hover:bg-sage-800 active:bg-sage-900 shadow-xs focus-visible:ring-2 focus-visible:ring-sage-500/50',
  'soft-sage':
    'bg-sage-100 text-sage-900 hover:bg-sage-200 active:bg-sage-300 focus-visible:ring-2 focus-visible:ring-sage-400',
  secondary:
    'bg-sand-100 text-stone-800 hover:bg-sand-200 active:bg-sand-300 border border-sand-300/60 focus-visible:ring-2 focus-visible:ring-stone-400',
  outline:
    'bg-transparent text-stone-700 hover:bg-sand-100 border border-sand-300 active:bg-sand-200 focus-visible:ring-2 focus-visible:ring-stone-400',
  ghost:
    'bg-transparent text-stone-600 hover:text-stone-900 hover:bg-sand-100/80 active:bg-sand-200 focus-visible:ring-2 focus-visible:ring-stone-400',
  danger:
    'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 focus-visible:ring-2 focus-visible:ring-red-400',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-medium',
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium',
  md: 'text-sm px-4 py-2 rounded-xl gap-2 font-medium',
  lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 font-medium',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-150 outline-none select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
    </button>
  );
};
