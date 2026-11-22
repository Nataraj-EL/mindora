import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'section' | 'article';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  as: Component = 'div',
}) => {
  return (
    <Component
      className={`bg-white rounded-2xl border border-sand-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </Component>
  );
};
