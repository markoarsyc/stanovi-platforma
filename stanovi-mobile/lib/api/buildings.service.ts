import { api } from '@/lib/api/client';
import type {
  Building,
  BuildingDetail,
  BuildingImage,
  BuildingStatus,
  InvestorBuilding,
} from '@/lib/api/types';

export interface BuildingFilters {
  search?: string;
  locationId?: number;
  status?: BuildingStatus;
  sort?: 'newest' | 'oldest';
}

export async function getBuildings(filters: BuildingFilters = {}): Promise<Building[]> {
  const params: Record<string, string | number> = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.locationId) params.locationId = filters.locationId;
  if (filters.status) params.status = filters.status;
  if (filters.sort) params.sort = filters.sort;

  const { data } = await api.get<Building[]>('/buildings', { params });
  return data;
}

export async function getBuildingById(id: string): Promise<BuildingDetail> {
  const { data } = await api.get<BuildingDetail>(`/buildings/${id}`);
  return data;
}

export interface BuildingPayload {
  title: string;
  locationId: number;
  address: string;
  description?: string;
  dueDate: string;
  status: BuildingStatus;
}

export async function getInvestorBuildings(): Promise<InvestorBuilding[]> {
  const { data } = await api.get<InvestorBuilding[]>('/buildings/investor/my-buildings');
  return data;
}

export async function createBuilding(payload: BuildingPayload): Promise<InvestorBuilding> {
  const { data } = await api.post<InvestorBuilding>('/buildings', payload);
  return data;
}

export async function updateBuilding(
  id: string,
  payload: Partial<BuildingPayload>,
): Promise<InvestorBuilding> {
  const { data } = await api.patch<InvestorBuilding>(`/buildings/${id}`, payload);
  return data;
}

export async function deleteBuilding(id: string): Promise<void> {
  await api.delete(`/buildings/${id}`);
}

export async function uploadBuildingImage(
  buildingId: string,
  uri: string,
): Promise<BuildingImage> {
  const form = new FormData();
  form.append('image', { uri, name: 'image.jpg', type: 'image/jpeg' } as never);
  const { data } = await api.post<BuildingImage>(`/buildings/${buildingId}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteBuildingImage(
  buildingId: string,
  imageId: string,
): Promise<void> {
  await api.delete(`/buildings/${buildingId}/images/${imageId}`);
}
