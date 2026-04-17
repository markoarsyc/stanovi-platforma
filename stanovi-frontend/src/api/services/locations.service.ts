import api from '../axios';
import type { Location } from '@/shared/types/entity/location.entity';

export const getLocations = async (): Promise<Location[]> => {
  const response = await api.get('/locations');
  return response.data;
};
