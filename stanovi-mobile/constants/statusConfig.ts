import type {
  ApartmentStatus,
  BuildingStatus,
  ReservationStatus,
} from '@/lib/api/types';

export interface StatusEntry {
  label: string;
  // Solid color used for the badge background.
  color: string;
}

export const buildingStatusConfig: Record<BuildingStatus, StatusEntry> = {
  PLANNED: { label: 'Planirano', color: 'hsl(45, 93%, 58%)' },
  IN_PROGRESS: { label: 'U izgradnji', color: 'hsl(239, 84%, 67%)' },
  COMPLETED: { label: 'Završeno', color: 'hsl(150, 60%, 45%)' },
};

export const apartmentStatusConfig: Record<ApartmentStatus, StatusEntry> = {
  AVAILABLE: { label: 'Dostupan', color: 'hsl(150, 60%, 45%)' },
  RESERVED: { label: 'Rezervisan', color: 'hsl(0, 70%, 60%)' },
};

export const reservationStatusConfig: Record<ReservationStatus, StatusEntry> = {
  ACTIVE: { label: 'Aktivna', color: 'hsl(150, 60%, 45%)' },
  CANCELLED: { label: 'Otkazana', color: '#9A9AB0' },
};
