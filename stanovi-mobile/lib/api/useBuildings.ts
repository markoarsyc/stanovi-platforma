import { useQuery } from '@tanstack/react-query';

import { getBuildingById, getBuildings } from '@/lib/api/buildings.service';

export function useBuildings() {
  return useQuery({
    queryKey: ['buildings'],
    queryFn: getBuildings,
  });
}

export function useBuildingDetail(id: string) {
  return useQuery({
    queryKey: ['building', id],
    queryFn: () => getBuildingById(id),
    enabled: !!id,
  });
}
