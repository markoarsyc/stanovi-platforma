import api from '../axios';

export const getInvestorInfo = async (investorId: string) => {
  const response = await api.get(`/investors/${investorId}`);
  return response.data;
};

export const getInvestorInfoByUserId = async (userId: string) => {
  const response = await api.get(`/investors/user/${userId}`);
  return response.data;
};

export const requestInvestorVerification = async (investorId: string, { companyName, tin }: { companyName: string; tin: string }) => {
  const response = await api.post(`/investors/${investorId}/request-verification`, { companyName, tin });
  return response.data;
};


