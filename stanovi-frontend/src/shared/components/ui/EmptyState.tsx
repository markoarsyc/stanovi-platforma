import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center',
      className,
    )}
  >
    {Icon && <Icon size={48} className="text-muted-foreground" />}
    <p className="mt-4 font-body text-muted-foreground">{title}</p>
    {description && (
      <p className="mt-1 font-body text-sm text-muted-foreground/70">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
