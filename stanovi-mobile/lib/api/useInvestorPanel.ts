import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createApartment,
  deleteApartment,
  deleteApartmentImage,
  deleteApartmentModel,
  getApartmentImages,
  getApartmentModel,
  updateApartment,
  uploadApartmentImage,
  uploadApartmentModel,
  type ApartmentPayload,
} from '@/lib/api/apartments.service';
import {
  createBuilding,
  deleteBuilding,
  deleteBuildingImage,
  getInvestorBuildings,
  setBuildingCoverImage,
  updateBuilding,
  uploadBuildingImage,
  type BuildingPayload,
} from '@/lib/api/buildings.service';
import { getLocations } from '@/lib/api/locations.service';

const INVESTOR_BUILDINGS_KEY = ['investor-buildings'];
// Public listings (Oglasi) cache; must be refreshed when an investor changes data.
const PUBLIC_BUILDINGS_KEY = ['buildings'];

export function useInvestorBuildings() {
  return useQuery({
    queryKey: INVESTOR_BUILDINGS_KEY,
    queryFn: getInvestorBuildings,
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: getLocations,
  });
}

export function useApartmentImages(apartmentId: string | null) {
  return useQuery({
    queryKey: ['apartment-images', apartmentId],
    queryFn: () => getApartmentImages(apartmentId as string),
    enabled: !!apartmentId,
  });
}

export function useInvestorMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: INVESTOR_BUILDINGS_KEY });
    queryClient.invalidateQueries({ queryKey: PUBLIC_BUILDINGS_KEY });
  };

  const createBuildingMutation = useMutation({
    mutationFn: createBuilding,
    onSuccess: invalidate,
  });

  const updateBuildingMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BuildingPayload> }) =>
      updateBuilding(id, payload),
    onSuccess: invalidate,
  });

  const deleteBuildingMutation = useMutation({
    mutationFn: deleteBuilding,
    onSuccess: invalidate,
  });

  const createApartmentMutation = useMutation({
    mutationFn: createApartment,
    onSuccess: invalidate,
  });

  const updateApartmentMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<ApartmentPayload, 'buildingId'>>;
    }) => updateApartment(id, payload),
    onSuccess: invalidate,
  });

  const deleteApartmentMutation = useMutation({
    mutationFn: deleteApartment,
    onSuccess: invalidate,
  });

  return {
    createBuilding: createBuildingMutation,
    updateBuilding: updateBuildingMutation,
    deleteBuilding: deleteBuildingMutation,
    createApartment: createApartmentMutation,
    updateApartment: updateApartmentMutation,
    deleteApartment: deleteApartmentMutation,
  };
}

export function useBuildingImageMutations(buildingId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: INVESTOR_BUILDINGS_KEY });
    queryClient.invalidateQueries({ queryKey: PUBLIC_BUILDINGS_KEY });
  };

  const upload = useMutation({
    mutationFn: (uri: string) => uploadBuildingImage(buildingId, uri),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (imageId: string) => deleteBuildingImage(buildingId, imageId),
    onSuccess: invalidate,
  });

  const setCover = useMutation({
    mutationFn: (imageId: string) => setBuildingCoverImage(buildingId, imageId),
    onSuccess: invalidate,
  });

  return { upload, remove, setCover };
}

export function useApartmentImageMutations(apartmentId: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['apartment-images', apartmentId] });

  const upload = useMutation({
    mutationFn: (uri: string) => uploadApartmentImage(apartmentId, uri),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (imageId: string) => deleteApartmentImage(apartmentId, imageId),
    onSuccess: invalidate,
  });

  return { upload, remove };
}

export function useApartmentModel(apartmentId: string | null) {
  return useQuery({
    queryKey: ['apartment-model', apartmentId],
    queryFn: () => getApartmentModel(apartmentId!),
    enabled: !!apartmentId,
  });
}

export function useApartmentModelMutations(apartmentId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['apartment-model', apartmentId] });
    // The model is embedded in both listing responses, so they go stale too.
    queryClient.invalidateQueries({ queryKey: INVESTOR_BUILDINGS_KEY });
    queryClient.invalidateQueries({ queryKey: PUBLIC_BUILDINGS_KEY });
  };

  const upload = useMutation({
    mutationFn: ({ uri, name }: { uri: string; name: string }) =>
      uploadApartmentModel(apartmentId, uri, name),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: () => deleteApartmentModel(apartmentId),
    onSuccess: invalidate,
  });

  return { upload, remove };
}
