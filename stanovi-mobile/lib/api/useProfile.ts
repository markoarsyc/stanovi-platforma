import { useQuery } from '@tanstack/react-query';

import { getBuyerByUserId, getInvestorByUserId } from '@/lib/api/profile.service';

export function useBuyerProfile(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['buyer', userId],
    queryFn: () => getBuyerByUserId(userId as string),
    enabled: enabled && !!userId,
  });
}

export function useInvestorProfile(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['investor', userId],
    queryFn: () => getInvestorByUserId(userId as string),
    enabled: enabled && !!userId,
  });
}
