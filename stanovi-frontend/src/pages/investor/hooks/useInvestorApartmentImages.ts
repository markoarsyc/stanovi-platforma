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
        await apartmentsService.uploadApartmentImage(apartmentId, file);
        toast.success('Plan arhitekture dodan!');
        return true;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }> | Error;
        const statusCode = (axiosErr as AxiosError)?.response?.status || 'unknown';
        const errorMessage = (axiosErr as AxiosError<{ message?: string }>)?.response?.data?.message || (axiosErr instanceof Error ? axiosErr.message : 'Greška pri dodavanju plana');
        const detailedMessage = `Greška (${statusCode}): ${errorMessage}`;
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
        await apartmentsService.deleteApartmentImage(apartmentId, imageId);
        toast.success('Plan obrisan!');
        return true;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }> | Error;
        const statusCode = (axiosErr as AxiosError)?.response?.status || 'unknown';
        const errorMessage = (axiosErr as AxiosError<{ message?: string }>)?.response?.data?.message || (axiosErr instanceof Error ? axiosErr.message : 'Greška pri brisanju plana');
        const detailedMessage = `Greška (${statusCode}): ${errorMessage}`;
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
        const images = await apartmentsService.getApartmentImages(apartmentId);
        return images;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }> | Error;
        const statusCode = (axiosErr as AxiosError)?.response?.status || 'unknown';
        const errorMessage = (axiosErr as AxiosError<{ message?: string }>)?.response?.data?.message || (axiosErr instanceof Error ? axiosErr.message : 'Greška pri učitavanju planova');
        const detailedMessage = `Greška (${statusCode}): ${errorMessage}`;
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
        await apartmentsService.reorderApartmentImages(apartmentId, imageIds);
        toast.success('Redosled promenjen!');
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }> | Error;
        const statusCode = (axiosErr as AxiosError)?.response?.status || 'unknown';
        const errorMessage = (axiosErr as AxiosError<{ message?: string }>)?.response?.data?.message || (axiosErr instanceof Error ? axiosErr.message : 'Greška pri promenji redosleda');
        const detailedMessage = `Greška (${statusCode}): ${errorMessage}`;
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
