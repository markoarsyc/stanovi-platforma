import { api } from '@/lib/api/client';
import type { Reservation } from '@/lib/api/types';

export async function createReservation(apartmentId: string): Promise<Reservation> {
  const { data } = await api.post<Reservation>('/reservations', { apartmentId });
  return data;
}

export async function getMyReservations(): Promise<Reservation[]> {
  const { data } = await api.get<Reservation[]>('/reservations/me');
  return data;
}

export async function getBuildingReservations(
  buildingId: string,
): Promise<Reservation[]> {
  const { data } = await api.get<Reservation[]>('/reservations', {
    params: { buildingId },
  });
  return data;
}

export async function cancelReservation(id: string): Promise<Reservation> {
  const { data } = await api.patch<Reservation>(`/reservations/${id}/cancel`);
  return data;
}
