import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import * as apartmentsService from '@/api/services/apartments.service';
import type { ApartmentImage } from '@/shared/types/building-detail.types';

export const useInvestorApartmentImages = () => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const uploadApartmentImage = useCallback(
    async (apartmentId: string, file: File): Promise<boolean> => {
      try {
        setImageLoading(true);
        setImageError(null);
        console.log(`[UPLOAD APARTMENT IMAGE] Starting upload for apartment ${apartmentId}`);
        const image = await apartmentsService.uploadApartmentImage(apartmentId, file);
        console.log(`[UPLOAD APARTMENT IMAGE] Successfully uploaded image ${image.id}`);
        toast.success('Plan arhitekture dodan!');
        return true;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }> | Error;
        const statusCode = (axiosErr as AxiosError)?.response?.status || 'unknown';
        const errorMessage = (axiosErr as AxiosError<{ message?: string }>)?.response?.data?.message || (axiosErr instanceof Error ? axiosErr.message : 'Greška pri dodavanju plana');
        const detailedMessage = `Greška (${statusCode}): ${errorMessage}`;
        console.error(`[UPLOAD APARTMENT IMAGE ERROR] Status: ${statusCode}, Message: ${errorMessage}`, err);
        setImageError(detailedMessage);
        toast.error(detailedMessage);
        return false;
      } finally {
        setImageLoading(false);
      }
    },
    []
  );

  const deleteApartmentImage = useCallback(
    async (apartmentId: string, imageId: string): Promise<boolean> => {
      try {
        setImageLoading(true);
        setImageError(null);
        console.log(`[DELETE APARTMENT IMAGE] Starting delete request for image ${imageId} from apartment ${apartmentId}`);
        await apartmentsService.deleteApartmentImage(apartmentId, imageId);
        console.log(`[DELETE APARTMENT IMAGE] Successfully deleted image ${imageId}`);
        toast.success('Plan obrisan!');
        return true;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }> | Error;
        const statusCode = (axiosErr as AxiosError)?.response?.status || 'unknown';
        const errorMessage = (axiosErr as AxiosError<{ message?: string }>)?.response?.data?.message || (axiosErr instanceof Error ? axiosErr.message : 'Greška pri brisanju plana');
        const detailedMessage = `Greška (${statusCode}): ${errorMessage}`;
        console.error(`[DELETE APARTMENT IMAGE ERROR] Status: ${statusCode}, Message: ${errorMessage}`, err);
        setImageError(detailedMessage);
        toast.error(detailedMessage);
        return false;
      } finally {
        setImageLoading(false);
      }
    },
    []
  );

  const getApartmentImages = useCallback(
    async (apartmentId: string): Promise<ApartmentImage[]> => {
      try {
        setImageLoading(true);
        setImageError(null);
        console.log(`[GET APARTMENT IMAGES] Fetching images for apartment ${apartmentId}`);
        const images = await apartmentsService.getApartmentImages(apartmentId);
        console.log(`[GET APARTMENT IMAGES] Successfully fetched ${images.length} images`);
        return images;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }> | Error;
        const statusCode = (axiosErr as AxiosError)?.response?.status || 'unknown';
        const errorMessage = (axiosErr as AxiosError<{ message?: string }>)?.response?.data?.message || (axiosErr instanceof Error ? axiosErr.message : 'Greška pri učitavanju planova');
        const detailedMessage = `Greška (${statusCode}): ${errorMessage}`;
        console.error(`[GET APARTMENT IMAGES ERROR] Status: ${statusCode}`, err);
        setImageError(detailedMessage);
        toast.error(detailedMessage);
        return [];
      } finally {
        setImageLoading(false);
      }
    },
    []
  );

  const reorderApartmentImages = useCallback(
    async (apartmentId: string, imageIds: string[]) => {
      try {
        setImageLoading(true);
        setImageError(null);
        console.log(`[REORDER APARTMENT IMAGES] Reordering images for apartment ${apartmentId}`);
        await apartmentsService.reorderApartmentImages(apartmentId, imageIds);
        console.log(`[REORDER APARTMENT IMAGES] Successfully reordered`);
        toast.success('Redosled promenjen!');
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }> | Error;
        const statusCode = (axiosErr as AxiosError)?.response?.status || 'unknown';
        const errorMessage = (axiosErr as AxiosError<{ message?: string }>)?.response?.data?.message || (axiosErr instanceof Error ? axiosErr.message : 'Greška pri promenji redosleda');
        const detailedMessage = `Greška (${statusCode}): ${errorMessage}`;
        console.error(`[REORDER APARTMENT IMAGES ERROR]`, err);
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
    imageLoading,
    imageError,
    uploadApartmentImage,
    deleteApartmentImage,
    getApartmentImages,
    reorderApartmentImages,
  };
};
