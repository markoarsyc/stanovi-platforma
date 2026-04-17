import api from '../axios';
import type { Building } from '@/shared/types/entity/building.entity';
import type { Apartment } from '@/shared/types/entity/apartment.entity';

interface BuildingWithApartments extends Building {
  apartments: Apartment[];
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