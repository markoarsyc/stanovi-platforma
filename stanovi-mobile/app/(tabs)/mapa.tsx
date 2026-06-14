import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/StatusBadge';
import { GradientText } from '@/components/ui/GradientText';
import { buildingStatusConfig } from '@/constants/statusConfig';
import type { Building } from '@/lib/api/types';
import { useBuildings } from '@/lib/api/useBuildings';

// Centered on Belgrade — all locations are Belgrade municipalities.
const BELGRADE_REGION = {
  latitude: 44.8125,
  longitude: 20.4612,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3,
};

export default function MapScreen() {
  const router = useRouter();
  const { data: buildings, isLoading, isError } = useBuildings({});
  const [selected, setSelected] = useState<Building | null>(null);

  const mapped = useMemo(
    () =>
      (buildings ?? []).filter(
        (b): b is Building & { latitude: number; longitude: number } =>
          b.latitude != null && b.longitude != null,
      ),
    [buildings],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="hsl(239, 84%, 67%)" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Ionicons name="alert-circle-outline" size={48} color="#9A9AB0" />
        <Text className="mt-3 text-center font-body text-body-base text-muted">
          Došlo je do greške pri učitavanju mape.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <MapView style={{ flex: 1 }} initialRegion={BELGRADE_REGION}>
        {/* Note: a MapView onPress to clear `selected` is intentionally omitted —
            on iOS a marker tap also fires the map's onPress, which would clear
            the selection before the card can show. Dismiss via the X button. */}
        {mapped.map((building) => (
          <Marker
            key={building.id}
            coordinate={{ latitude: building.latitude, longitude: building.longitude }}
            onPress={() => setSelected(building)}
          />
        ))}
      </MapView>

      <SafeAreaView
        edges={['top']}
        pointerEvents="box-none"
        className="absolute inset-x-0 top-0">
        <View className="px-6 pt-2">
          <GradientText className="font-display text-h2">Mapa projekata</GradientText>
        </View>
      </SafeAreaView>

      {selected && (
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 bottom-0 px-4 pb-32">
          <View className="rounded-3xl border border-border bg-surface p-6">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 font-display text-h3 text-white" numberOfLines={2}>
                {selected.title}
              </Text>
              <Pressable onPress={() => setSelected(null)} hitSlop={8}>
                <Ionicons name="close" size={24} color="#9A9AB0" />
              </Pressable>
            </View>

            <View className="mt-2 flex-row items-center gap-1">
              <Ionicons name="location-outline" size={14} color="#9A9AB0" />
              <Text className="flex-1 font-body text-body-sm text-muted" numberOfLines={2}>
                {selected.address}, {selected.location.name}
              </Text>
            </View>

            <View className="mt-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-1">
                <Ionicons name="home-outline" size={14} color="hsl(260, 80%, 75%)" />
                <Text className="font-body-medium text-body-sm text-accent">
                  {selected._count.apartments}{' '}
                  {selected._count.apartments === 1 ? 'stan' : 'stanova'}
                </Text>
              </View>
              <StatusBadge status={buildingStatusConfig[selected.status]} />
            </View>

            <Pressable
              onPress={() => router.push(`/(tabs)/oglasi/${selected.id}` as never)}
              className="mt-4 items-center rounded-2xl bg-primary py-3.5"
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
              <Text className="font-body-medium text-body-base text-white">
                Prikaži projekat
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
