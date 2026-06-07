import React from 'react';
import { cn } from '@/shared/utils/cn';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseClass =
  'w-full rounded-lg border border-border bg-secondary px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(baseClass, className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';
