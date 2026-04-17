import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import * as buildingsService from '@/api/services/buildings.service';
import type { Building } from '@/shared/types/entity/building.entity';
import type { Apartment } from '@/shared/types/entity/apartment.entity';

interface BuildingWithApartments extends Building {
  apartments: Apartment[];
}

export const useInvestorBuildings = () => {
  const [buildings, setBuildings] = useState<BuildingWithApartments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    buildings,
    loading,
    error,
    fetchBuildings,
    createBuilding,
    updateBuilding,
    deleteBuilding,
  };
};
