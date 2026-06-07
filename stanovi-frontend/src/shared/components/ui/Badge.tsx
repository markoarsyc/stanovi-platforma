import React from 'react';
import { cn } from '@/shared/utils/cn';
import type { StatusConfig } from '@/shared/constants/statusConfig';

interface BadgeProps {
  variant: StatusConfig;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  showIcon = false,
  size = 'md',
  className,
}) => {
  const Icon = variant.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-body font-semibold uppercase',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        variant.badgeClassName,
        className,
      )}
    >
      {showIcon && <Icon size={size === 'sm' ? 10 : 12} />}
      {variant.label}
    </span>
  );
};
