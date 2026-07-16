import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import * as apartmentsService from '@/api/services/apartments.service';
import type { ApartmentModel } from '@/shared/types/building-detail.types';

export const useInvestorApartmentModel = () => {
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const uploadApartmentModel = useCallback(
    async (apartmentId: string, file: File): Promise<boolean> => {
      try {
        setModelLoading(true);
        setModelError(null);
        await apartmentsService.uploadApartmentModel(apartmentId, file);
        toast.success('3D model dodan!');
        return true;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }> | Error;
        const statusCode = (axiosErr as AxiosError)?.response?.status || 'unknown';
        const errorMessage = (axiosErr as AxiosError<{ message?: string }>)?.response?.data?.message || (axiosErr instanceof Error ? axiosErr.message : 'Greška pri dodavanju 3D modela');
        const detailedMessage = `Greška (${statusCode}): ${errorMessage}`;
        setModelError(detailedMessage);
        toast.error(detailedMessage);
        return false;
      } finally {
        setModelLoading(false);
      }
    },
    []
  );

  const deleteApartmentModel = useCallback(
    async (apartmentId: string): Promise<boolean> => {
      try {
        setModelLoading(true);
        setModelError(null);
        await apartmentsService.deleteApartmentModel(apartmentId);
        toast.success('3D model obrisan!');
        return true;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }> | Error;
        const statusCode = (axiosErr as AxiosError)?.response?.status || 'unknown';
        const errorMessage = (axiosErr as AxiosError<{ message?: string }>)?.response?.data?.message || (axiosErr instanceof Error ? axiosErr.message : 'Greška pri brisanju 3D modela');
        const detailedMessage = `Greška (${statusCode}): ${errorMessage}`;
        setModelError(detailedMessage);
        toast.error(detailedMessage);
        return false;
      } finally {
        setModelLoading(false);
      }
    },
    []
  );

  const getApartmentModel = useCallback(
    async (apartmentId: string): Promise<ApartmentModel | null> => {
      try {
        setModelLoading(true);
        setModelError(null);
        const model = await apartmentsService.getApartmentModel(apartmentId);
        return model;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }> | Error;
        const statusCode = (axiosErr as AxiosError)?.response?.status || 'unknown';
        const errorMessage = (axiosErr as AxiosError<{ message?: string }>)?.response?.data?.message || (axiosErr instanceof Error ? axiosErr.message : 'Greška pri učitavanju 3D modela');
        const detailedMessage = `Greška (${statusCode}): ${errorMessage}`;
        setModelError(detailedMessage);
        toast.error(detailedMessage);
        return null;
      } finally {
        setModelLoading(false);
      }
    },
    []
  );

  return {
    modelLoading,
    modelError,
    uploadApartmentModel,
    deleteApartmentModel,
    getApartmentModel,
  };
};
