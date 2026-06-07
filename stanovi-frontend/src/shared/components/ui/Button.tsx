import React from 'react';
import { cn } from '@/shared/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-indigo text-primary-foreground shadow-indigo transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100',
  secondary:
    'border border-border text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50',
  ghost:
    'text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors',
  danger:
    'bg-red-600 text-white hover:bg-red-700 transition-colors active:scale-95 disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}) => (
  <button
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-lg font-body font-semibold',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
