import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Apartment } from '@/lib/api/types';
import { useApartmentImageMutations, useApartmentImages } from '@/lib/api/useInvestorPanel';
import { pickImages } from '@/lib/investor/imagePicker';

interface ApartmentImageManagerModalProps {
  apartment: Apartment | null;
  onClose: () => void;
}

export function ApartmentImageManagerModal({
  apartment,
  onClose,
}: ApartmentImageManagerModalProps) {
  const apartmentId = apartment?.id ?? '';
  const { data: images, isLoading } = useApartmentImages(apartment?.id ?? null);
  const { upload, remove } = useApartmentImageMutations(apartmentId);

  const handleAdd = async () => {
    const uris = await pickImages(true);
    for (const uri of uris) {
      await upload.mutateAsync(uri).catch(() => {});
    }
  };

  const handleRemove = (imageId: string) => {
    Alert.alert('Obriši sliku', 'Da li ste sigurni?', [
      { text: 'Otkaži', style: 'cancel' },
      { text: 'Obriši', style: 'destructive', onPress: () => remove.mutate(imageId) },
    ]);
  };

  const sorted = images ? [...images].sort((a, b) => a.displayOrder - b.displayOrder) : [];

  return (
    <Modal
      visible={!!apartment}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
          <Text className="font-display text-h3 text-foreground">
            Slike — Stan {apartment?.aptNo}
          </Text>
          <Pressable onPress={onClose} hitSlop={12} className="h-10 w-10 items-center justify-center">
            <Ionicons name="close" size={28} color="hsl(230, 25%, 92%)" />
          </Pressable>
        </View>

        <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={handleAdd}
            disabled={upload.isPending}
            className="mb-5 items-center border border-dashed bg-surface py-6"
            style={{ borderRadius: 24, borderColor: '#3A3A63' }}>
            {upload.isPending ? (
              <ActivityIndicator color="hsl(239, 84%, 67%)" />
            ) : (
              <>
                <Ionicons name="images-outline" size={28} color="hsl(239, 84%, 67%)" />
                <Text className="mt-2 font-body text-body-base text-muted">Dodaj slike</Text>
              </>
            )}
          </Pressable>

          {isLoading ? (
            <ActivityIndicator color="hsl(239, 84%, 67%)" />
          ) : sorted.length === 0 ? (
            <Text className="text-center font-body text-body-sm text-muted">
              Nema uploadovanih slika
            </Text>
          ) : (
            <View className="gap-4">
              {sorted.map((img) => (
                <View key={img.id} className="relative">
                  <Image
                    source={{ uri: img.imageUrl }}
                    style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 16 }}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={() => handleRemove(img.id)}
                    hitSlop={6}
                    className="absolute right-2 top-2 h-9 w-9 items-center justify-center rounded-full bg-black/70">
                    <Ionicons name="trash-outline" size={18} color="#ffffff" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
