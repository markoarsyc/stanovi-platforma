import api from '../axios';
import type { ApartmentDetail, ApartmentImage } from '@/shared/types/building-detail.types';

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

export const createApartment = async (data: Omit<ApartmentDetail, 'id'>) => {
  const response = await api.post('/apartments', data);
  return response.data;
};

export const updateApartment = async (id: string, data: Partial<Omit<ApartmentDetail, 'id'>>) => {
  const response = await api.patch(`/apartments/${id}`, data);
  return response.data;
};

export const deleteApartment = async (id: string) => {
  await api.delete(`/apartments/${id}`);
};

export const uploadApartmentImage = async (apartmentId: string, file: File): Promise<ApartmentImage> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post(`/apartments/${apartmentId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getApartmentImages = async (apartmentId: string): Promise<ApartmentImage[]> => {
  const response = await api.get(`/apartments/${apartmentId}/images`);
  return response.data;
};

export const deleteApartmentImage = async (apartmentId: string, imageId: string): Promise<void> => {
  await api.delete(`/apartments/${apartmentId}/images/${imageId}`);
};

export const reorderApartmentImages = async (apartmentId: string, imageIds: string[]): Promise<void> => {
  await api.patch(`/apartments/${apartmentId}/images/reorder`, { imageIds });
};
