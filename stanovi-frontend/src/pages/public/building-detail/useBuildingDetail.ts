import { useCallback, useEffect, useState } from 'react';
import { getBuildingById } from '@/api/services/buildings.service';
import { getInvestorInfo } from '@/api/services/investor.service';
import type {
  BuildingDetail,
  ApartmentDetail,
  InvestorInfo,
} from '@/shared/types/building-detail.types';

interface UseBuildingDetailResult {
  building: BuildingDetail | null;
  apartments: ApartmentDetail[];
  investor: InvestorInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBuildingDetail = (id: string | undefined): UseBuildingDetailResult => {
  const [building, setBuilding] = useState<BuildingDetail | null>(null);
  const [apartments, setApartments] = useState<ApartmentDetail[]>([]);
  const [investor, setInvestor] = useState<InvestorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!id) {
      setError('Projekat nije pronađen.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const buildingData = await getBuildingById(id);
        if (cancelled) return;
        setBuilding(buildingData);
        if (Array.isArray(buildingData.apartments)) {
          setApartments(buildingData.apartments);
        }

        if (buildingData.investorId) {
          try {
            const investorData = await getInvestorInfo(buildingData.investorId);
            if (!cancelled) setInvestor(investorData);
          } catch {
            // Investor info is optional — render page without it.
          }
        }
      } catch {
        if (!cancelled) setError('Greška pri učitavanju podataka. Pokušajte ponovo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return { building, apartments, investor, loading, error, refetch };
};
