import { api } from '@/lib/api/client';
import type { BuyerProfile, InvestorProfile } from '@/lib/api/types';

export interface UpdateBuyerPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateInvestorPayload {
  companyName?: string;
  tin?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export async function getBuyerByUserId(userId: string): Promise<BuyerProfile> {
  const { data } = await api.get<BuyerProfile>(`/buyers/user/${userId}`);
  return data;
}

export async function getInvestorByUserId(userId: string): Promise<InvestorProfile> {
  const { data } = await api.get<InvestorProfile>(`/investors/user/${userId}`);
  return data;
}

export async function updateBuyer(
  id: string,
  payload: UpdateBuyerPayload,
): Promise<BuyerProfile> {
  const { data } = await api.patch<BuyerProfile>(`/buyers/${id}`, payload);
  return data;
}

export async function updateInvestor(
  id: string,
  payload: UpdateInvestorPayload,
): Promise<InvestorProfile> {
  const { data } = await api.patch<InvestorProfile>(`/investors/${id}`, payload);
  return data;
}

export async function uploadBuyerPhoto(id: string, uri: string): Promise<BuyerProfile> {
  const form = new FormData();
  form.append('image', { uri, name: 'photo.jpg', type: 'image/jpeg' } as never);
  const { data } = await api.post<BuyerProfile>(`/buyers/${id}/photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function uploadInvestorPhoto(
  id: string,
  uri: string,
): Promise<InvestorProfile> {
  const form = new FormData();
  form.append('image', { uri, name: 'photo.jpg', type: 'image/jpeg' } as never);
  const { data } = await api.post<InvestorProfile>(`/investors/${id}/photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteBuyerPhoto(id: string): Promise<BuyerProfile> {
  const { data } = await api.delete<BuyerProfile>(`/buyers/${id}/photo`);
  return data;
}

export async function deleteInvestorPhoto(id: string): Promise<InvestorProfile> {
  const { data } = await api.delete<InvestorProfile>(`/investors/${id}/photo`);
  return data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await api.patch('/auth/password', payload);
}
