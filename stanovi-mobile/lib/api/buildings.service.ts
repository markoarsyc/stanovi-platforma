import { api } from '@/lib/api/client';
import type { Building, BuildingDetail } from '@/lib/api/types';

export async function getBuildings(): Promise<Building[]> {
  const { data } = await api.get<Building[]>('/buildings');
  return data;
}

export async function getBuildingById(id: string): Promise<BuildingDetail> {
  const { data } = await api.get<BuildingDetail>(`/buildings/${id}`);
  return data;
}
