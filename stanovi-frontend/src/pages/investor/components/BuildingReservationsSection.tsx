import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BookMarked } from 'lucide-react';
import {
  Button,
  Spinner,
  EmptyState,
  ErrorAlert,
  ConfirmDialog,
} from '@/shared/components/ui';
import {
  getBuildingReservations,
  cancelReservation,
} from '@/api/services/reservations.service';
import { formatDate } from '@/shared/utils/format';
import type { Reservation } from '@/shared/types/entity/reservation.entity';

interface BuildingReservationsSectionProps {
  buildingId: string;
  onChanged?: () => void;
}

const headerCellClass =
  'px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground';

export const BuildingReservationsSection: React.FC<
  BuildingReservationsSectionProps
> = ({ buildingId, onChanged }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [toCancel, setToCancel] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getBuildingReservations(buildingId);
      setReservations(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async () => {
    if (!toCancel) return;
    setCancelling(true);
    try {
      await cancelReservation(toCancel.id);
      toast.success('Rezervacija je otkazana.');
      setToCancel(null);
      load();
      onChanged?.();
    } catch {
      toast.error('Greška pri otkazivanju rezervacije.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="border-t border-border p-6">
      <div className="mb-4 flex items-center gap-2">
        <BookMarked size={18} className="text-primary" />
        <h4 className="font-display text-lg font-semibold">Rezervacije</h4>
      </div>

      {loading ? (
        <div className="py-8">
          <Spinner label="Učitavanje rezervacija..." />
        </div>
      ) : error ? (
        <ErrorAlert message="Greška pri učitavanju rezervacija." />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="Nema rezervisanih stanova u ovom projektu."
          className="py-10"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className={headerCellClass}>Stan</th>
                <th className={headerCellClass}>Kupac</th>
                <th className={headerCellClass}>Telefon</th>
                <th className={headerCellClass}>Datum</th>
                <th className={headerCellClass}>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-b border-border">
                  <td className="px-4 py-3 font-body text-sm font-medium text-foreground">
                    {reservation.apartment?.aptNo ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-muted-foreground">
                    {reservation.buyer
                      ? `${reservation.buyer.firstName} ${reservation.buyer.lastName}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-muted-foreground">
                    {reservation.buyer?.phone ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-muted-foreground">
                    {formatDate(
                      reservation.createdAt,
                      { day: 'numeric', month: 'long', year: 'numeric' },
                      'sr-Latn-RS',
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setToCancel(reservation)}
                    >
                      Otkaži
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!toCancel}
        title="Otkazivanje rezervacije"
        description={
          toCancel
            ? `Da li ste sigurni da želite da otkažete rezervaciju za stan ${toCancel.apartment?.aptNo ?? ''}? Stan će ponovo postati dostupan.`
            : undefined
        }
        confirmLabel="Otkaži rezervaciju"
        isSubmitting={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setToCancel(null)}
      />
    </div>
  );
};
