import api from '../axios';
import type { Reservation } from '@/shared/types/entity/reservation.entity';

export const createReservation = async (
  apartmentId: string,
): Promise<Reservation> => {
  const response = await api.post('/reservations', { apartmentId });
  return response.data;
};

export const getMyReservations = async (): Promise<Reservation[]> => {
  const response = await api.get('/reservations/me');
  return response.data;
};

export const getBuildingReservations = async (
  buildingId: string,
): Promise<Reservation[]> => {
  const response = await api.get('/reservations', {
    params: { buildingId },
  });
  return response.data;
};

export const cancelReservation = async (
  id: string,
): Promise<Reservation> => {
  const response = await api.patch(`/reservations/${id}/cancel`);
  return response.data;
};
