import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import { buildingStatusConfig } from '@/constants/statusConfig';
import type { Building } from '@/lib/api/types';
import { getCoverImage } from '@/lib/buildingImages';

interface BuildingCardProps {
  building: Building;
}

export function BuildingCard({ building }: BuildingCardProps) {
  const router = useRouter();

  const cover = getCoverImage(building.images);
  const apartmentCount = building._count.apartments;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/oglasi/${building.id}` as never)}
      className="overflow-hidden rounded-3xl bg-surface"
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <View className="relative h-56 w-full">
        {cover ? (
          <Image
            source={{ uri: cover.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-border">
            <Ionicons name="business-outline" size={48} color="#9A9AB0" />
          </View>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(11,11,18,0.25)', 'rgba(21,21,31,0.95)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View className="absolute right-3 top-3">
          <StatusBadge status={buildingStatusConfig[building.status]} />
        </View>

        <View className="absolute inset-x-0 bottom-0 p-4">
          <Text className="font-display text-h3 text-white" numberOfLines={1}>
            {building.title}
          </Text>

          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="location-outline" size={14} color="#9A9AB0" />
            <Text className="font-body text-body-sm text-muted" numberOfLines={1}>
              {building.address}, {building.location.name}
            </Text>
          </View>

          <View className="mt-2 flex-row items-center gap-1">
            <Ionicons name="home-outline" size={14} color="hsl(260, 80%, 75%)" />
            <Text className="font-body-medium text-body-sm text-accent">
              {apartmentCount} {apartmentCount === 1 ? 'stan' : 'stanova'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
