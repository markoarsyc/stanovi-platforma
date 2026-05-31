import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import * as buildingsService from '@/api/services/buildings.service';
import type { Building } from '@/shared/types/entity/building.entity';
import type { BuildingImage } from '@/shared/types/building-detail.types';

type BuildingWithApartments = Awaited<ReturnType<typeof buildingsService.getInvestorBuildings>>[number];

export const useInvestorBuildings = () => {
  const [buildings, setBuildings] = useState<BuildingWithApartments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await buildingsService.getInvestorBuildings();
      setBuildings(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch buildings';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBuilding = useCallback(
    async (data: Omit<Building, 'id'>) => {
      try {
        await buildingsService.createBuilding(data);
        toast.success('Projekat dodat!');
        await fetchBuildings();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Greška pri dodavanju projekta';
        toast.error(message);
        return false;
      }
    },
    [fetchBuildings]
  );

  const updateBuilding = useCallback(
    async (id: string, data: Partial<Omit<Building, 'id'>>) => {
      try {
        await buildingsService.updateBuilding(id, data);
        toast.success('Projekat ažuriran!');
        await fetchBuildings();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Greška pri ažuriranju projekta';
        toast.error(message);
        return false;
      }
    },
    [fetchBuildings]
  );

  const deleteBuilding = useCallback(
    async (id: string) => {
      try {
        await buildingsService.deleteBuilding(id);
        toast.success('Projekat obrisan!');
        await fetchBuildings();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Greška pri brisanju projekta';
        toast.error(message);
        return false;
      }
    },
    [fetchBuildings]
  );

  const uploadBuildingImage = useCallback(
    async (buildingId: string, file: File) => {
      try {
        setImageLoading(true);
        setImageError(null);
        const image = await buildingsService.uploadBuildingImage(buildingId, file);
        toast.success('Slika dodana!');

        // Update local state with new image
        setBuildings((prevBuildings) =>
          prevBuildings.map((building) =>
            building.id === buildingId
              ? {
                  ...building,
                  images: [...(building.images || []), image] as BuildingImage[],
                }
              : building
          )
        );

        return image;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Greška pri dodavanju slike';
        setImageError(message);
        toast.error(message);
        throw err;
      } finally {
        setImageLoading(false);
      }
    },
    []
  );

  const deleteBuildingImage = useCallback(
    async (buildingId: string, imageId: string) => {
      try {
        setImageLoading(true);
        setImageError(null);
        console.log(`[DELETE IMAGE] Starting delete request for image ${imageId} from building ${buildingId}`);
        await buildingsService.deleteBuildingImage(buildingId, imageId);
        console.log(`[DELETE IMAGE] Successfully deleted image ${imageId}`);
        toast.success('Slika obrisana!');

        // Update local state by removing the image
        setBuildings((prevBuildings) =>
          prevBuildings.map((building) =>
            building.id === buildingId
              ? {
                  ...building,
                  images: (building.images || []).filter((img: BuildingImage) => img.id !== imageId) as BuildingImage[],
                }
              : building
          )
        );
      } catch (err) {
        const statusCode = (err as Record<string, unknown>)?.response?.status || 'unknown';
        const errorMessage = (err as Record<string, unknown>)?.response?.data?.message || (err instanceof Error ? err.message : 'Greška pri brisanju slike');
        const detailedMessage = `Greška (${statusCode}): ${errorMessage}`;
        console.error(`[DELETE IMAGE ERROR] Status: ${statusCode}, Message: ${errorMessage}`, err);
        setImageError(detailedMessage);
        toast.error(detailedMessage);
        throw err;
      } finally {
        setImageLoading(false);
      }
    },
    []
  );

  return {
    buildings,
    loading,
    error,
    imageError,
    imageLoading,
    fetchBuildings,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    uploadBuildingImage,
    deleteBuildingImage,
  };
};
