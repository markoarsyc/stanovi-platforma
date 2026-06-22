import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancelReservation,
  createReservation,
  getBuildingReservations,
  getMyReservations,
} from '@/lib/api/reservations.service';

const MY_RESERVATIONS_KEY = ['reservations', 'me'];

function buildingReservationsKey(buildingId: string) {
  return ['building-reservations', buildingId];
}

export function useMyReservations(enabled: boolean) {
  return useQuery({
    queryKey: MY_RESERVATIONS_KEY,
    queryFn: getMyReservations,
    enabled,
  });
}

export function useBuildingReservations(buildingId: string, enabled: boolean) {
  return useQuery({
    queryKey: buildingReservationsKey(buildingId),
    queryFn: () => getBuildingReservations(buildingId),
    enabled: enabled && !!buildingId,
  });
}

export function useReservationMutations() {
  const queryClient = useQueryClient();
  // Reserving/cancelling changes apartment status, so refresh listings too.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
    queryClient.invalidateQueries({ queryKey: ['building-reservations'] });
    queryClient.invalidateQueries({ queryKey: ['building'] });
    queryClient.invalidateQueries({ queryKey: ['buildings'] });
    queryClient.invalidateQueries({ queryKey: ['investor-buildings'] });
  };

  const create = useMutation({
    mutationFn: (apartmentId: string) => createReservation(apartmentId),
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => cancelReservation(id),
    onSuccess: invalidate,
  });

  return { create, cancel };
}
