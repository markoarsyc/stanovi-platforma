import React from 'react';
import { cn } from '@/shared/utils/cn';

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, className }) => (
  <div
    className={cn(
      'rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-center font-body text-sm text-destructive',
      className,
    )}
  >
    {message}
  </div>
);
