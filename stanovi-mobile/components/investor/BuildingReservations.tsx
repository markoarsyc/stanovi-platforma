import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import {
  useBuildingReservations,
  useReservationMutations,
} from '@/lib/api/useReservations';
import { formatDate } from '@/lib/format';
import type { Reservation } from '@/lib/api/types';

interface BuildingReservationsProps {
  buildingId: string;
  enabled: boolean;
}

export function BuildingReservations({ buildingId, enabled }: BuildingReservationsProps) {
  const { data: reservations, isLoading, isError } = useBuildingReservations(
    buildingId,
    enabled,
  );
  const { cancel } = useReservationMutations();

  const confirmCancel = (reservation: Reservation) => {
    Alert.alert(
      'Otkazivanje rezervacije',
      `Da li ste sigurni da želite da otkažete rezervaciju za stan ${reservation.apartment?.aptNo ?? ''}? Stan će ponovo postati dostupan.`,
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
    <View className="mt-4">
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name="bookmark-outline" size={16} color="hsl(239, 84%, 67%)" />
        <Text className="font-display text-body-base text-foreground">Rezervacije</Text>
      </View>

      {isLoading ? (
        <View className="py-4">
          <ActivityIndicator color="hsl(239, 84%, 67%)" />
        </View>
      ) : isError ? (
        <Text className="py-3 text-center font-body text-body-sm text-muted">
          Greška pri učitavanju rezervacija.
        </Text>
      ) : !reservations || reservations.length === 0 ? (
        <Text className="py-3 text-center font-body text-body-sm text-muted">
          Nema rezervisanih stanova.
        </Text>
      ) : (
        <View className="gap-2">
          {reservations.map((reservation) => (
            <View
              key={reservation.id}
              className="flex-row items-center gap-2 rounded-2xl bg-background px-3 py-2.5"
              style={{ borderWidth: 1, borderColor: '#2A2A40' }}>
              <View className="flex-1">
                <Text className="font-body-medium text-body-base text-foreground">
                  Stan {reservation.apartment?.aptNo ?? '—'}
                </Text>
                <Text className="font-body text-body-sm text-muted">
                  {reservation.buyer
                    ? `${reservation.buyer.firstName} ${reservation.buyer.lastName} · ${reservation.buyer.phone}`
                    : '—'}
                </Text>
                <Text className="font-body text-body-sm text-muted">
                  {formatDate(
                    reservation.createdAt,
                    { day: 'numeric', month: 'long', year: 'numeric' },
                    'sr-Latn-RS',
                  )}
                </Text>
              </View>
              <Pressable
                onPress={() => confirmCancel(reservation)}
                disabled={cancel.isPending}
                hitSlop={8}
                className="h-9 w-9 items-center justify-center">
                <Ionicons name="close-circle-outline" size={20} color="#f87171" />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
