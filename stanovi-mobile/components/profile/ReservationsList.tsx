import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import { reservationStatusConfig } from '@/constants/statusConfig';
import { useMyReservations, useReservationMutations } from '@/lib/api/useReservations';
import { formatDate, formatPrice } from '@/lib/format';
import type { Reservation } from '@/lib/api/types';

interface ReservationsListProps {
  enabled: boolean;
}

export function ReservationsList({ enabled }: ReservationsListProps) {
  const { data: reservations, isLoading, isError } = useMyReservations(enabled);
  const { cancel } = useReservationMutations();

  const confirmCancel = (reservation: Reservation) => {
    Alert.alert(
      'Otkazivanje rezervacije',
      `Da li ste sigurni da želite da otkažete rezervaciju za stan ${reservation.apartment?.aptNo ?? ''}?`,
      [
        { text: 'Nazad', style: 'cancel' },
        {
          text: 'Otkaži rezervaciju',
          style: 'destructive',
          onPress: () => {
            cancel.mutate(reservation.id, {
              onError: () =>
                Alert.alert('Greška', 'Otkazivanje nije uspelo. Pokušajte ponovo.'),
            });
          },
        },
      ],
    );
  };

  return (
    <View className="mt-8">
      <Text className="mb-3 font-display text-h2 text-foreground">Rezervacije</Text>

      {isLoading ? (
        <View className="items-center rounded-2xl border border-border bg-surface py-8">
          <ActivityIndicator color="hsl(239, 84%, 67%)" />
        </View>
      ) : isError ? (
        <View className="items-center rounded-2xl border border-border bg-surface py-8">
          <Ionicons name="alert-circle-outline" size={36} color="#9A9AB0" />
          <Text className="mt-2 text-center font-body text-body-base text-muted">
            Greška pri učitavanju rezervacija.
          </Text>
        </View>
      ) : !reservations || reservations.length === 0 ? (
        <View className="items-center rounded-2xl border border-border bg-surface py-8">
          <Ionicons name="bookmark-outline" size={40} color="#9A9AB0" />
          <Text className="mt-2 text-center font-body text-body-base text-muted">
            Trenutno nemate rezervacija.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {reservations.map((reservation) => (
            <View
              key={reservation.id}
              className="rounded-2xl border border-border bg-surface p-4">
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <Text className="font-body-medium text-h5 text-foreground">
                    Stan {reservation.apartment?.aptNo ?? '—'}
                  </Text>
                  <Text className="mt-0.5 font-body text-body-sm text-muted">
                    {reservation.apartment?.building?.title ?? 'Projekat'}
                  </Text>
                  <Text className="mt-1 font-body text-body-sm text-muted">
                    {reservation.apartment
                      ? `${formatPrice(reservation.apartment.price)} · `
                      : ''}
                    {formatDate(
                      reservation.createdAt,
                      { day: 'numeric', month: 'long', year: 'numeric' },
                      'sr-Latn-RS',
                    )}
                  </Text>
                </View>
                <StatusBadge status={reservationStatusConfig[reservation.status]} />
              </View>

              {reservation.status === 'ACTIVE' ? (
                <Pressable
                  onPress={() => confirmCancel(reservation)}
                  disabled={cancel.isPending}
                  className="mt-3 h-11 flex-row items-center justify-center gap-2 rounded-full border border-border active:opacity-80">
                  <Ionicons name="close-circle-outline" size={18} color="#f87171" />
                  <Text className="font-body-medium text-body-sm" style={{ color: '#f87171' }}>
                    Otkaži rezervaciju
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
