import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { ApartmentImageManagerModal } from '@/components/investor/ApartmentImageManagerModal';
import { StatusBadge } from '@/components/StatusBadge';
import { apartmentStatusConfig, buildingStatusConfig } from '@/constants/statusConfig';
import type { Apartment, InvestorBuilding } from '@/lib/api/types';
import { useBuildingImageMutations, useInvestorMutations } from '@/lib/api/useInvestorPanel';
import { pickImages } from '@/lib/investor/imagePicker';
import { formatPrice } from '@/lib/format';

interface InvestorBuildingCardProps {
  building: InvestorBuilding;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onAddApartment: () => void;
  onEditApartment: (apartment: Apartment) => void;
}

export function InvestorBuildingCard({
  building,
  isExpanded,
  onToggle,
  onEdit,
  onAddApartment,
  onEditApartment,
}: InvestorBuildingCardProps) {
  const { deleteBuilding, deleteApartment } = useInvestorMutations();
  const buildingImages = useBuildingImageMutations(building.id);
  const [apartmentForImages, setApartmentForImages] = useState<Apartment | null>(null);

  const cover = [...(building.images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder)[0];
  const apartmentCount = building.apartments.length;
  const minPrice =
    apartmentCount > 0 ? Math.min(...building.apartments.map((a) => Number(a.price))) : 0;
  const status = buildingStatusConfig[building.status];

  const handleDelete = () => {
    Alert.alert('Obriši projekat', 'Da li ste sigurni da želite da obrišete ovaj projekat?', [
      { text: 'Otkaži', style: 'cancel' },
      {
        text: 'Obriši',
        style: 'destructive',
        onPress: () => deleteBuilding.mutate(building.id),
      },
    ]);
  };

  const handleDeleteApartment = (apartment: Apartment) => {
    Alert.alert('Obriši stan', 'Da li ste sigurni da želite da obrišete ovaj stan?', [
      { text: 'Otkaži', style: 'cancel' },
      {
        text: 'Obriši',
        style: 'destructive',
        onPress: () => deleteApartment.mutate(apartment.id),
      },
    ]);
  };

  const handleAddImages = async () => {
    const uris = await pickImages(true);
    for (const uri of uris) {
      await buildingImages.upload.mutateAsync(uri).catch(() => {});
    }
  };

  const handleDeleteImage = (imageId: string) => {
    Alert.alert('Obriši sliku', 'Da li ste sigurni?', [
      { text: 'Otkaži', style: 'cancel' },
      {
        text: 'Obriši',
        style: 'destructive',
        onPress: () => buildingImages.remove.mutate(imageId),
      },
    ]);
  };

  const sortedImages = [...(building.images ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <View className="overflow-hidden rounded-3xl bg-surface">
      {/* Header row */}
      <View className="flex-row items-center gap-3 p-4">
        <Pressable onPress={onToggle} className="flex-1 flex-row items-center gap-3">
          <View className="h-16 w-16 overflow-hidden rounded-2xl bg-border">
            {cover ? (
              <Image source={{ uri: cover.imageUrl }} style={{ flex: 1 }} contentFit="cover" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="business-outline" size={24} color="#9A9AB0" />
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="font-display text-h3 text-foreground" numberOfLines={1}>
              {building.title}
            </Text>
            <Text className="font-body text-body-sm text-muted" numberOfLines={1}>
              {building.address}, {building.location.name}
            </Text>
            <Text className="mt-0.5 font-body text-body-sm text-accent" numberOfLines={1}>
              {apartmentCount} {apartmentCount === 1 ? 'stan' : 'stanova'} · {status.label}
              {minPrice > 0 ? ` · Od ${formatPrice(minPrice)}` : ''}
            </Text>
          </View>
        </Pressable>

        <View className="flex-row items-center gap-1">
          <IconButton icon="pencil" onPress={onEdit} />
          <IconButton icon="trash-outline" onPress={handleDelete} />
          <IconButton icon={isExpanded ? 'chevron-up' : 'chevron-down'} onPress={onToggle} />
        </View>
      </View>

      {isExpanded ? (
        <View className="border-t px-4 pb-4 pt-4" style={{ borderTopColor: '#2A2A40' }}>
          {/* Project images */}
          <View className="mb-2 flex-row items-center gap-2">
            <Ionicons name="images-outline" size={16} color="hsl(239, 84%, 67%)" />
            <Text className="font-display text-body-base text-foreground">Slike projekta</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleAddImages}
                disabled={buildingImages.upload.isPending}
                className="h-20 w-20 items-center justify-center rounded-2xl border border-dashed"
                style={{ borderColor: '#3A3A63' }}>
                {buildingImages.upload.isPending ? (
                  <ActivityIndicator color="hsl(239, 84%, 67%)" />
                ) : (
                  <Ionicons name="add" size={26} color="hsl(239, 84%, 67%)" />
                )}
              </Pressable>
              {sortedImages.map((img) => (
                <View key={img.id} className="relative">
                  <Image
                    source={{ uri: img.imageUrl }}
                    style={{ width: 80, height: 80, borderRadius: 16 }}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={() => handleDeleteImage(img.id)}
                    hitSlop={6}
                    className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-black/80">
                    <Ionicons name="close" size={14} color="#ffffff" />
                  </Pressable>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Apartments */}
          <View className="mb-2 mt-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="home-outline" size={16} color="hsl(239, 84%, 67%)" />
              <Text className="font-display text-body-base text-foreground">Stanovi</Text>
            </View>
            <Pressable onPress={onAddApartment} hitSlop={8} className="flex-row items-center gap-1">
              <Ionicons name="add-circle-outline" size={18} color="hsl(239, 84%, 67%)" />
              <Text className="font-body-medium text-body-sm text-primary">Dodaj stan</Text>
            </Pressable>
          </View>

          {building.apartments.length === 0 ? (
            <Text className="py-4 text-center font-body text-body-sm text-muted">
              Nema dodatih stanova
            </Text>
          ) : (
            <View className="gap-2">
              {building.apartments.map((apartment) => (
                <ApartmentRow
                  key={apartment.id}
                  apartment={apartment}
                  onEdit={() => onEditApartment(apartment)}
                  onDelete={() => handleDeleteApartment(apartment)}
                  onManageImages={() => setApartmentForImages(apartment)}
                />
              ))}
            </View>
          )}
        </View>
      ) : null}

      <ApartmentImageManagerModal
        apartment={apartmentForImages}
        onClose={() => setApartmentForImages(null)}
      />
    </View>
  );
}

function IconButton({
  icon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} className="h-9 w-9 items-center justify-center">
      <Ionicons name={icon} size={18} color="#9A9AB0" />
    </Pressable>
  );
}

interface ApartmentRowProps {
  apartment: Apartment;
  onEdit: () => void;
  onDelete: () => void;
  onManageImages: () => void;
}

function ApartmentRow({ apartment, onEdit, onDelete, onManageImages }: ApartmentRowProps) {
  return (
    <View
      className="flex-row items-center gap-2 rounded-2xl bg-background px-3 py-2.5"
      style={{ borderWidth: 1, borderColor: '#2A2A40' }}>
      <View className="flex-1">
        <Text className="font-body-medium text-body-base text-foreground">
          Stan {apartment.aptNo}
        </Text>
        <Text className="font-body text-body-sm text-muted">
          Sprat {apartment.floor} · {apartment.rooms}-soban · {Number(apartment.area)} m² ·{' '}
          {formatPrice(apartment.price)}
        </Text>
      </View>
      <StatusBadge status={apartmentStatusConfig[apartment.status]} />
      <IconButton icon="images-outline" onPress={onManageImages} />
      <IconButton icon="pencil" onPress={onEdit} />
      <IconButton icon="trash-outline" onPress={onDelete} />
    </View>
  );
}
