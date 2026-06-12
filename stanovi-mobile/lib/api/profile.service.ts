import { api } from '@/lib/api/client';
import type { BuyerProfile, InvestorProfile } from '@/lib/api/types';

export async function getBuyerByUserId(userId: string): Promise<BuyerProfile> {
  const { data } = await api.get<BuyerProfile>(`/buyers/user/${userId}`);
  return data;
}

export async function getInvestorByUserId(userId: string): Promise<InvestorProfile> {
  const { data } = await api.get<InvestorProfile>(`/investors/user/${userId}`);
  return data;
}
