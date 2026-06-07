import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 24, className, label }) => (
  <div className={cn('flex items-center justify-center gap-2', className)}>
    <Loader2 size={size} className="animate-spin text-muted-foreground" />
    {label && <span className="font-body text-sm text-muted-foreground">{label}</span>}
  </div>
);
