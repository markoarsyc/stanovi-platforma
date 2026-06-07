import {
  Clock,
  Zap,
  CheckCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  BuildingStatus,
  ApartmentStatus,
} from '../types/building-detail.types';

export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  textClassName: string;
  badgeClassName: string;
}

export const buildingStatusConfig: Record<BuildingStatus, StatusConfig> = {
  PLANNED: {
    label: 'Planirano',
    icon: Clock,
    textClassName: 'text-accent',
    badgeClassName: 'bg-accent/20 text-accent',
  },
  IN_PROGRESS: {
    label: 'U Izgradnji',
    icon: Zap,
    textClassName: 'text-primary',
    badgeClassName: 'bg-primary/20 text-primary',
  },
  COMPLETED: {
    label: 'Završeno',
    icon: CheckCircle,
    textClassName: 'text-green-400',
    badgeClassName: 'bg-green-500/20 text-green-400',
  },
};

export const apartmentStatusConfig: Record<ApartmentStatus, StatusConfig> = {
  AVAILABLE: {
    label: 'Dostupan',
    icon: CheckCircle,
    textClassName: 'text-green-400',
    badgeClassName: 'bg-green-500/20 text-green-400',
  },
  RESERVED: {
    label: 'Rezervisan',
    icon: Clock,
    textClassName: 'text-accent',
    badgeClassName: 'bg-accent/20 text-accent',
  },
};

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const verificationStatusConfig: Record<VerificationStatus, StatusConfig> = {
  PENDING: {
    label: 'Na čekanju',
    icon: Clock,
    textClassName: 'text-amber-500',
    badgeClassName: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  },
  APPROVED: {
    label: 'Odobren',
    icon: CheckCircle2,
    textClassName: 'text-emerald-500',
    badgeClassName: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  },
  REJECTED: {
    label: 'Odbijen',
    icon: XCircle,
    textClassName: 'text-red-500',
    badgeClassName: 'bg-red-500/10 text-red-500 border border-red-500/20',
  },
};
