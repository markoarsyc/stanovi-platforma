import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BookMarked, Building2 } from 'lucide-react';
import {
  Badge,
  Button,
  Spinner,
  EmptyState,
  ErrorAlert,
  ConfirmDialog,
} from '@/shared/components/ui';
import {
  getMyReservations,
  cancelReservation,
} from '@/api/services/reservations.service';
import { reservationStatusConfig } from '@/shared/constants/statusConfig';
import { formatDate, formatPrice } from '@/shared/utils/format';
import type { Reservation } from '@/shared/types/entity/reservation.entity';

export const ReservationsSection: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [toCancel, setToCancel] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getMyReservations();
      setReservations(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

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
    } catch {
      toast.error('Greška pri otkazivanju rezervacije.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h3 className="mb-4 font-display text-xl font-bold text-foreground">
        Moje rezervacije
      </h3>

      {loading ? (
        <div className="py-8">
          <Spinner label="Učitavanje rezervacija..." />
        </div>
      ) : error ? (
        <ErrorAlert message="Greška pri učitavanju rezervacija." />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="Nemate nijednu rezervaciju."
        />
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-lg font-bold text-foreground">
                    Stan {reservation.apartment?.aptNo ?? '—'}
                  </h4>
                  <Badge
                    variant={reservationStatusConfig[reservation.status]}
                    showIcon
                    size="sm"
                  />
                </div>
                <p className="mt-1 flex items-center gap-1 font-body text-sm text-muted-foreground">
                  <Building2 size={14} />
                  {reservation.apartment?.building?.title ?? 'Projekat'}
                </p>
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  {reservation.apartment
                    ? `${formatPrice(reservation.apartment.price)} · `
                    : ''}
                  Rezervisano: {formatDate(
                    reservation.createdAt,
                    { day: 'numeric', month: 'long', year: 'numeric' },
                    'sr-Latn-RS',
                  )}
                </p>
              </div>
              {reservation.status === 'ACTIVE' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setToCancel(reservation)}
                >
                  Otkaži
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toCancel}
        title="Otkazivanje rezervacije"
        description={
          toCancel
            ? `Da li ste sigurni da želite da otkažete rezervaciju za stan ${toCancel.apartment?.aptNo ?? ''}?`
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
