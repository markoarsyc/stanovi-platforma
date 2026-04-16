import api from '../axios';

export const getInvestorInfo = async (investorId: string) => {
  const response = await api.get(`/investors/${investorId}`);
  return response.data;
};
