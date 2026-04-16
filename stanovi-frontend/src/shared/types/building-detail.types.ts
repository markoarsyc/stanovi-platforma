export type BuildingStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
export type ApartmentStatus = 'AVAILABLE' | 'RESERVED';

export interface ApartmentDetail {
  id: string;
  aptNo: string;
  floor: number;
  rooms: number;
  area: number;
  price: number;
  status: ApartmentStatus;
  buildingId: string;
  createdAt?: string;
}

export interface LocationInfo {
  id: number;
  name: string;
}

export interface InvestorInfo {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  isVerified: boolean;
}

export interface BuildingDetail {
  id: string;
  title: string;
  address: string;
  description?: string;
  image_url?: string | null;
  dueDate: string | Date;
  status: BuildingStatus;
  createdAt?: string;
  updatedAt?: string;
  location?: LocationInfo;
  apartments?: ApartmentDetail[];
  investorId?: string;
  investor?: InvestorInfo;
}

export const statusConfig = {
  PLANNED: {
    label: 'Planirano',
    icon: 'Clock',
    className: 'text-accent',
  },
  IN_PROGRESS: {
    label: 'U Izgradnji',
    icon: 'Zap',
    className: 'text-primary',
  },
  COMPLETED: {
    label: 'Završeno',
    icon: 'CheckCircle',
    className: 'text-green-400',
  },
  AVAILABLE: {
    label: 'Dostupan',
    icon: 'CheckCircle',
    className: 'text-green-400',
  },
  RESERVED: {
    label: 'Rezervisan',
    icon: 'Clock',
    className: 'text-accent',
  },
} as const;
