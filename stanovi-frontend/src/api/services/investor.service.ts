import api from '../axios';
import type { Investor } from '@/shared/types/entity/investor.entity';

export const getInvestorInfo = async (investorId: string) => {
  const response = await api.get(`/investors/${investorId}`);
  return response.data;
};

export const getInvestorInfoByUserId = async (userId: string): Promise<Investor> => {
  const response = await api.get<Investor>(`/investors/user/${userId}`);
  return response.data;
};

export const requestInvestorVerification = async (investorId: string, { companyName, tin }: { companyName: string; tin: string }) => {
  const response = await api.post(`/investors/${investorId}/request-verification`, { companyName, tin });
  return response.data;
};

export const getVerificationRequests = async () => {
  const response = await api.get('/investors/verification-requests');
  return response.data;
};

export const handleVerificationRequest = async (requestId: string, isApproved: boolean) => {
  const response = await api.patch(`/investors/verification-requests/${requestId}`, { isApproved });
  return response.data;
};


