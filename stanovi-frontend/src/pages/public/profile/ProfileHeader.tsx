import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface ProfileHeaderProps {
  displayName: string;
  roleLabel: string;
  fallbackChar: string;
  isVerified?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  displayName,
  roleLabel,
  fallbackChar,
  isVerified = false,
}) => {
  const initial = (displayName?.[0] ?? fallbackChar ?? '?').toUpperCase();

  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-indigo text-2xl font-bold text-primary-foreground">
          {initial}
        </div>
        {isVerified && (
          <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
            <BadgeCheck size={20} className="fill-blue-500/20 text-blue-500" />
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-3xl text-foreground">{displayName}</h1>
          {isVerified && <BadgeCheck size={20} className="text-blue-500" />}
        </div>
        <p className="font-body text-sm text-muted-foreground">{roleLabel}</p>
      </div>
    </div>
  );
};
