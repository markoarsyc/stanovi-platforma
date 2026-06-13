import { api } from '@/lib/api/client';
import type {
  Building,
  BuildingDetail,
  BuildingImage,
  BuildingStatus,
  InvestorBuilding,
} from '@/lib/api/types';

export async function getBuildings(): Promise<Building[]> {
  const { data } = await api.get<Building[]>('/buildings');
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
