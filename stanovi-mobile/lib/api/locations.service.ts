import { api } from '@/lib/api/client';
import type { Location } from '@/lib/api/types';

export async function getLocations(): Promise<Location[]> {
  const { data } = await api.get<Location[]>('/locations');
  return data;
}
