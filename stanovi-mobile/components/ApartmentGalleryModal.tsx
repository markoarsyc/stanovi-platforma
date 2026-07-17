import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Model3DViewer } from '@/components/Model3DViewer';
import { StatusBadge } from '@/components/StatusBadge';
import { GradientButton } from '@/components/ui/GradientButton';
import { apartmentStatusConfig } from '@/constants/statusConfig';
import type { Apartment } from '@/lib/api/types';
import { formatPrice } from '@/lib/format';

interface ApartmentGalleryModalProps {
  apartment: Apartment | null;
  onClose: () => void;
  onReserve?: () => void;
  reserving?: boolean;
}

export function ApartmentGalleryModal({
  apartment,
  onClose,
  onReserve,
  reserving = false,
}: ApartmentGalleryModalProps) {
  const [show3D, setShow3D] = useState(false);

  // Closing the gallery must not leave the nested 3D modal hanging.
  useEffect(() => {
    if (!apartment) setShow3D(false);
  }, [apartment]);

  const images = apartment
    ? [...apartment.images].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];
  const modelUrl = apartment?.model?.modelUrl;

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

            {modelUrl ? (
              <View className="px-5 pb-3">
                <Pressable
                  onPress={() => setShow3D(true)}
                  className="flex-row items-center justify-center gap-2 border border-dashed bg-surface py-3.5"
                  style={{ borderRadius: 20, borderColor: '#3A3A63' }}>
                  <Ionicons name="cube-outline" size={20} color="hsl(239, 84%, 67%)" />
                  <Text className="font-body-medium text-body-base text-primary">
                    Prikaži 3D model
                  </Text>
                </Pressable>
              </View>
            ) : null}

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

            {onReserve ? (
              <View className="px-5 pb-2 pt-1">
                <GradientButton
                  title={apartment.status === 'AVAILABLE' ? 'Rezerviši' : 'Rezervisan'}
                  onPress={onReserve}
                  loading={reserving}
                  disabled={apartment.status !== 'AVAILABLE'}
                />
              </View>
            ) : null}

            {modelUrl ? (
              <Modal
                visible={show3D}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShow3D(false)}>
                <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
                  <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
                    <Text className="font-display text-h3 text-foreground">
                      3D model — Stan {apartment.aptNo}
                    </Text>
                    <Pressable
                      onPress={() => setShow3D(false)}
                      hitSlop={12}
                      className="h-10 w-10 items-center justify-center">
                      <Ionicons name="close" size={28} color="hsl(230, 25%, 92%)" />
                    </Pressable>
                  </View>
                  <Model3DViewer src={modelUrl} />
                </SafeAreaView>
              </Modal>
            ) : null}
          </>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}
