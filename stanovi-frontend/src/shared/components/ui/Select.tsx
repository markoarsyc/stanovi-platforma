import React from 'react';
import { cn } from '@/shared/utils/cn';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const baseClass =
  'w-full rounded-lg border border-border bg-secondary px-4 py-3 font-body text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(baseClass, className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
