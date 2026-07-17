import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, useColorScheme, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/StatusBadge';
import { buildingStatusConfig } from '@/constants/statusConfig';
import type { Building, BuildingStatus } from '@/lib/api/types';
import { useBuildings } from '@/lib/api/useBuildings';

const STATUS_LEGEND = Object.entries(buildingStatusConfig) as [
  BuildingStatus,
  (typeof buildingStatusConfig)[BuildingStatus],
][];

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

  // The map renders in the system appearance, so the legend follows it rather than the app theme.
  const isDark = useColorScheme() !== 'light';
  const legendTextColor = isDark ? '#ffffff' : '#000000';

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
            pinColor={buildingStatusConfig[building.status].color}
            onPress={() => setSelected(building)}
          />
        ))}
      </MapView>

      <SafeAreaView
        edges={['top']}
        pointerEvents="box-none"
        className="absolute inset-x-0 top-0">
        <View className="px-6 pt-2">
          <View
            pointerEvents="none"
            className="gap-2 self-start rounded-2xl border px-3 py-2.5"
            style={{
              backgroundColor: isDark ? 'rgba(21,21,31,0.9)' : 'rgba(255,255,255,0.9)',
              borderColor: isDark ? '#2A2A40' : 'rgba(0,0,0,0.12)',
            }}>
            {STATUS_LEGEND.map(([status, { label, color }]) => (
              <View key={status} className="flex-row items-center gap-2">
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: color,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)',
                  }}
                />
                <Text className="font-body text-body-sm" style={{ color: legendTextColor }}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
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
