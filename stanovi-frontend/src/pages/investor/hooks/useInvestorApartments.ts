import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import * as apartmentsService from '@/api/services/apartments.service';
import type { Apartment } from '@/shared/types/entity/apartment.entity';

export const useInvestorApartments = (onBuildingUpdate?: () => void) => {
  const [apartments, setApartments] = useState<Record<string, Apartment[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApartments = useCallback(async (buildingId: string) => {
    try {
      setLoading(true);
      const data = await apartmentsService.getApartmentsByBuildingId(buildingId);
      setApartments((prev) => ({ ...prev, [buildingId]: data }));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri učitavanju stanova';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createApartment = useCallback(
    async (data: Omit<Apartment, 'id'>) => {
      try {
        await apartmentsService.createApartment(data);
        toast.success('Stan dodat!');
        await fetchApartments(data.buildingId);
        onBuildingUpdate?.();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Greška pri dodavanju stana';
        toast.error(message);
        return false;
      }
    },
    [fetchApartments, onBuildingUpdate]
  );

  const updateApartment = useCallback(
    async (id: string, buildingId: string, data: Partial<Omit<Apartment, 'id'>>) => {
      try {
        await apartmentsService.updateApartment(id, data);
        toast.success('Stan ažuriran!');
        await fetchApartments(buildingId);
        onBuildingUpdate?.();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Greška pri ažuriranju stana';
        toast.error(message);
        return false;
      }
    },
    [fetchApartments, onBuildingUpdate]
  );

  const deleteApartment = useCallback(
    async (id: string, buildingId: string) => {
      try {
        await apartmentsService.deleteApartment(id);
        toast.success('Stan obrisan!');
        await fetchApartments(buildingId);
        onBuildingUpdate?.();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Greška pri brisanju stana';
        toast.error(message);
        return false;
      }
    },
    [fetchApartments, onBuildingUpdate]
  );

  const getMinPrice = (buildingId: string): number | null => {
    const apts = apartments[buildingId];
    if (!apts || apts.length === 0) return null;
    return Math.min(...apts.map((a) => Number(a.price)));
  };

  return {
    apartments,
    loading,
    error,
    fetchApartments,
    createApartment,
    updateApartment,
    deleteApartment,
    getMinPrice,
  };
};
