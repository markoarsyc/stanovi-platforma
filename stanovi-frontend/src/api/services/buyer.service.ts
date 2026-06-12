import api from '../axios';
import type { Buyer } from '@/shared/types/entity/buyer.entity';

export const getBuyerInfoByUserId = async (userId: string): Promise<Buyer> => {
  const response = await api.get<Buyer>(`/buyers/user/${userId}`);
  return response.data;
};
