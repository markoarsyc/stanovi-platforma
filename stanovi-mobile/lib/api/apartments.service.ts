import { api } from '@/lib/api/client';
import type { Apartment, ApartmentImage, ApartmentModel, ApartmentStatus } from '@/lib/api/types';

export interface ApartmentPayload {
  buildingId: string;
  aptNo: string;
  floor: number;
  rooms: number;
  area: number;
  price: number;
  status: ApartmentStatus;
}

export async function getApartmentsByBuilding(buildingId: string): Promise<Apartment[]> {
  const { data } = await api.get<Apartment[]>('/apartments', { params: { buildingId } });
  return data;
}

export async function createApartment(payload: ApartmentPayload): Promise<Apartment> {
  const { data } = await api.post<Apartment>('/apartments', payload);
  return data;
}

export async function updateApartment(
  id: string,
  payload: Partial<Omit<ApartmentPayload, 'buildingId'>>,
): Promise<Apartment> {
  const { data } = await api.patch<Apartment>(`/apartments/${id}`, payload);
  return data;
}

export async function deleteApartment(id: string): Promise<void> {
  await api.delete(`/apartments/${id}`);
}

export async function getApartmentImages(apartmentId: string): Promise<ApartmentImage[]> {
  const { data } = await api.get<ApartmentImage[]>(`/apartments/${apartmentId}/images`);
  return data;
}

export async function uploadApartmentImage(
  apartmentId: string,
  uri: string,
): Promise<ApartmentImage> {
  const form = new FormData();
  form.append('image', { uri, name: 'image.jpg', type: 'image/jpeg' } as never);
  const { data } = await api.post<ApartmentImage>(`/apartments/${apartmentId}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteApartmentImage(
  apartmentId: string,
  imageId: string,
): Promise<void> {
  await api.delete(`/apartments/${apartmentId}/images/${imageId}`);
}

export async function getApartmentModel(apartmentId: string): Promise<ApartmentModel | null> {
  const { data } = await api.get<ApartmentModel | null>(`/apartments/${apartmentId}/model`);
  return data ?? null;
}

export async function uploadApartmentModel(
  apartmentId: string,
  uri: string,
  name: string,
): Promise<ApartmentModel> {
  const form = new FormData();
  form.append('model', { uri, name, type: 'application/octet-stream' } as never);
  const { data } = await api.post<ApartmentModel>(`/apartments/${apartmentId}/model`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteApartmentModel(apartmentId: string): Promise<void> {
  await api.delete(`/apartments/${apartmentId}/model`);
}
