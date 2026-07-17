import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  changePassword,
  deleteBuyerPhoto,
  deleteInvestorPhoto,
  getBuyerByUserId,
  getInvestorByUserId,
  requestInvestorVerification,
  updateBuyer,
  updateInvestor,
  uploadBuyerPhoto,
  uploadInvestorPhoto,
  type RequestVerificationPayload,
  type UpdateBuyerPayload,
  type UpdateInvestorPayload,
} from '@/lib/api/profile.service';
import type { BuyerProfile, InvestorProfile } from '@/lib/api/types';

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

export function useProfileMutations(userId: string | undefined, isInvestor: boolean) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [isInvestor ? 'investor' : 'buyer', userId],
    });
  };

  const updateProfile = useMutation<
    BuyerProfile | InvestorProfile,
    Error,
    { id: string; payload: UpdateBuyerPayload | UpdateInvestorPayload }
  >({
    mutationFn: ({ id, payload }) =>
      isInvestor
        ? updateInvestor(id, payload as UpdateInvestorPayload)
        : updateBuyer(id, payload as UpdateBuyerPayload),
    onSuccess: invalidate,
  });

  const uploadPhoto = useMutation<
    BuyerProfile | InvestorProfile,
    Error,
    { id: string; uri: string }
  >({
    mutationFn: ({ id, uri }) =>
      isInvestor ? uploadInvestorPhoto(id, uri) : uploadBuyerPhoto(id, uri),
    onSuccess: invalidate,
  });

  const removePhoto = useMutation<
    BuyerProfile | InvestorProfile,
    Error,
    { id: string }
  >({
    mutationFn: ({ id }) =>
      isInvestor ? deleteInvestorPhoto(id) : deleteBuyerPhoto(id),
    onSuccess: invalidate,
  });

  const changeProfilePassword = useMutation({
    mutationFn: changePassword,
  });

  const requestVerification = useMutation<
    void,
    Error,
    { id: string; payload: RequestVerificationPayload }
  >({
    mutationFn: ({ id, payload }) => requestInvestorVerification(id, payload),
    onSuccess: invalidate,
  });

  return {
    updateProfile,
    uploadPhoto,
    removePhoto,
    changeProfilePassword,
    requestVerification,
  };
}
