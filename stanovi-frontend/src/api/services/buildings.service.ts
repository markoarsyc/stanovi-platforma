import api from '../axios';
import type { Building } from '@/shared/types/entity/building.entity';
import type { Apartment } from '@/shared/types/entity/apartment.entity';
import type { BuildingImage } from '@/shared/types/building-detail.types';
import type { Location } from '@/shared/types/entity/location.entity';

interface BuildingWithApartments extends Building {
  apartments: Apartment[];
  images?: BuildingImage[];
  location: Location;
}

export const getBuildings = async () => {
  const response = await api.get('/buildings');
  return response.data;
};

export const getBuildingById = async (id: string) => {
  const response = await api.get(`/buildings/${id}`);
  return response.data;
};

export const getInvestorBuildings = async (): Promise<BuildingWithApartments[]> => {
  const response = await api.get('/buildings/investor/my-buildings');
  return response.data;
};

export const createBuilding = async (data: Omit<Building, 'id'>) => {
  const response = await api.post('/buildings', data);
  return response.data;
};

export const updateBuilding = async (id: string, data: Partial<Omit<Building, 'id'>>) => {
  const response = await api.patch(`/buildings/${id}`, data);
  return response.data;
};

export const deleteBuilding = async (id: string) => {
  await api.delete(`/buildings/${id}`);
};

// Building Images API
export const uploadBuildingImage = async (buildingId: string, file: File): Promise<BuildingImage> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post(`/buildings/${buildingId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getBuildingImages = async (buildingId: string): Promise<BuildingImage[]> => {
  const response = await api.get(`/buildings/${buildingId}/images`);
  return response.data;
};

export const deleteBuildingImage = async (buildingId: string, imageId: string): Promise<void> => {
  await api.delete(`/buildings/${buildingId}/images/${imageId}`);
};

export const reorderBuildingImages = async (buildingId: string, imageIds: string[]): Promise<void> => {
  await api.patch(`/buildings/${buildingId}/images/reorder`, { imageIds });
};