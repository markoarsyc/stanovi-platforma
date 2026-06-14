import api from '../axios';
import type { Buyer } from '@/shared/types/entity/buyer.entity';

export interface UpdateBuyerData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const getBuyerInfoByUserId = async (userId: string): Promise<Buyer> => {
  const response = await api.get<Buyer>(`/buyers/user/${userId}`);
  return response.data;
};

export const updateBuyer = async (id: string, data: UpdateBuyerData): Promise<Buyer> => {
  const response = await api.patch<Buyer>(`/buyers/${id}`, data);
  return response.data;
};

export const uploadBuyerPhoto = async (id: string, file: File): Promise<Buyer> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<Buyer>(`/buyers/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteBuyerPhoto = async (id: string): Promise<Buyer> => {
  const response = await api.delete<Buyer>(`/buyers/${id}/photo`);
  return response.data;
};
