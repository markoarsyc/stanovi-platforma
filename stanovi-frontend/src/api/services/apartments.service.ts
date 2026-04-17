import api from '../axios';
import type { Apartment } from '@/shared/types/entity/apartment.entity';

export const getApartmentsByBuildingId = async (buildingId: string) => {
  const response = await api.get(`/apartments`, {
    params: { buildingId },
  });
  return response.data;
};

export const getApartmentById = async (id: string) => {
  const response = await api.get(`/apartments/${id}`);
  return response.data;
};

export const createApartment = async (data: Omit<Apartment, 'id'>) => {
  const response = await api.post('/apartments', data);
  return response.data;
};

export const updateApartment = async (id: string, data: Partial<Omit<Apartment, 'id'>>) => {
  const response = await api.patch(`/apartments/${id}`, data);
  return response.data;
};

export const deleteApartment = async (id: string) => {
  await api.delete(`/apartments/${id}`);
};
