import { useQuery } from '@tanstack/react-query';

import {
  getBuildingById,
  getBuildings,
  type BuildingFilters,
} from '@/lib/api/buildings.service';

export function useBuildings(filters: BuildingFilters = {}) {
  return useQuery({
    queryKey: ['buildings', filters],
    queryFn: () => getBuildings(filters),
  });
}

export function useBuildingDetail(id: string) {
  return useQuery({
    queryKey: ['building', id],
    queryFn: () => getBuildingById(id),
    enabled: !!id,
  });
}
