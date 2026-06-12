import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import { apartmentStatusConfig } from '@/constants/statusConfig';
import type { Apartment } from '@/lib/api/types';
import { formatPrice } from '@/lib/format';

interface ApartmentCardProps {
  apartment: Apartment;
  onPress: () => void;
}

export function ApartmentCard({ apartment, onPress }: ApartmentCardProps) {
  const cover = [...apartment.images].sort((a, b) => a.displayOrder - b.displayOrder)[0];

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <View className="h-20 w-20 overflow-hidden rounded-xl bg-border">
        {cover ? (
          <Image
            source={{ uri: cover.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="image-outline" size={28} color="#9A9AB0" />
          </View>
        )}
      </View>

      <View className="flex-1">
        <Text className="font-body-medium text-h5 text-foreground">Stan {apartment.aptNo}</Text>
        <Text className="mt-0.5 font-body text-body-sm text-muted">
          Sprat {apartment.floor}. · {apartment.rooms} sobe · {Number(apartment.area)} m²
        </Text>
        <Text className="mt-1 font-body-medium text-body-base text-accent">
          {formatPrice(apartment.price)}
        </Text>
      </View>

      <StatusBadge status={apartmentStatusConfig[apartment.status]} />
    </Pressable>
  );
}
