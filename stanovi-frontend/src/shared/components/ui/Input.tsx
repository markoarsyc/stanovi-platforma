import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: LucideIcon;
}

const baseClass =
  'w-full rounded-lg border border-border bg-secondary px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ leadingIcon: Icon, className, ...props }, ref) => {
    if (!Icon) {
      return <input ref={ref} className={cn(baseClass, className)} {...props} />;
    }
    return (
      <div className="relative w-full">
        <Icon
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={ref}
          className={cn(baseClass, 'pl-10', className)}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = 'Input';
