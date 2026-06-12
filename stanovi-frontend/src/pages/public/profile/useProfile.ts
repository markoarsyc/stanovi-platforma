import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getBuyerInfoByUserId } from '@/api/services/buyer.service';
import { getInvestorInfoByUserId } from '@/api/services/investor.service';
import type { Buyer } from '@/shared/types/entity/buyer.entity';
import type { Investor } from '@/shared/types/entity/investor.entity';

interface UseProfileResult {
  buyer: Buyer | null;
  investor: Investor | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useProfile = (): UseProfileResult => {
  const { user, isInvestor } = useAuth();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        if (isInvestor) {
          const data = await getInvestorInfoByUserId(user.id);
          if (!cancelled) setInvestor(data);
        } else {
          const data = await getBuyerInfoByUserId(user.id);
          if (!cancelled) setBuyer(data);
        }
      } catch {
        if (!cancelled) setError('Greška pri učitavanju profila. Pokušajte ponovo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [user, isInvestor, reloadKey]);

  return { buyer, investor, loading, error, refetch };
};
