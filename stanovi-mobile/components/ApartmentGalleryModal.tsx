import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/StatusBadge';
import { apartmentStatusConfig } from '@/constants/statusConfig';
import type { Apartment } from '@/lib/api/types';
import { formatPrice } from '@/lib/format';

interface ApartmentGalleryModalProps {
  apartment: Apartment | null;
  onClose: () => void;
}

export function ApartmentGalleryModal({ apartment, onClose }: ApartmentGalleryModalProps) {
  const images = apartment
    ? [...apartment.images].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  return (
    <Modal
      visible={!!apartment}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        {apartment ? (
          <>
            <View className="flex-row items-start justify-between px-5 pb-3 pt-2">
              <View className="flex-1 pr-3">
                <Text className="font-display text-h3 text-foreground">
                  Stan br. {apartment.aptNo} — {apartment.rooms}-soban
                </Text>
                <Text className="mt-1 font-body text-body-sm text-muted">
                  Sprat {apartment.floor}. · {Number(apartment.area)} m² · {formatPrice(apartment.price)}
                </Text>
                <View className="mt-2">
                  <StatusBadge status={apartmentStatusConfig[apartment.status]} />
                </View>
              </View>

              <Pressable onPress={onClose} hitSlop={12} className="h-10 w-10 items-center justify-center">
                <Ionicons name="close" size={28} color="hsl(230, 25%, 92%)" />
              </Pressable>
            </View>

            {images.length > 0 ? (
              <ScrollView
                contentContainerClassName="px-5 pb-8 gap-4"
                showsVerticalScrollIndicator={false}>
                {images.map((img) => (
                  <Image
                    key={img.id}
                    source={{ uri: img.imageUrl }}
                    style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 16 }}
                    contentFit="cover"
                    transition={200}
                  />
                ))}
              </ScrollView>
            ) : (
              <View className="flex-1 items-center justify-center px-8">
                <Ionicons name="images-outline" size={48} color="#9A9AB0" />
                <Text className="mt-3 text-center font-body text-body-base text-muted">
                  Nema dostupnih slika za ovaj stan.
                </Text>
              </View>
            )}
          </>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}
