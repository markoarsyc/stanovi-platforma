import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { ApartmentImageManagerModal } from '@/components/investor/ApartmentImageManagerModal';
import { ApartmentModelManagerModal } from '@/components/investor/ApartmentModelManagerModal';
import { BuildingReservations } from '@/components/investor/BuildingReservations';
import { StatusBadge } from '@/components/StatusBadge';
import { apartmentStatusConfig, buildingStatusConfig } from '@/constants/statusConfig';
import type { Apartment, InvestorBuilding } from '@/lib/api/types';
import { useBuildingImageMutations, useInvestorMutations } from '@/lib/api/useInvestorPanel';
import { getCoverImage, sortImages } from '@/lib/buildingImages';
import { pickImages } from '@/lib/investor/imagePicker';
import { formatDate, formatPrice } from '@/lib/format';

const COVER_COLOR = 'hsl(38, 92%, 50%)';

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
  const [apartmentForModel, setApartmentForModel] = useState<Apartment | null>(null);

  const cover = getCoverImage(building.images);
  const apartmentCount = building.apartments.length;
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

  const handleSetCover = (imageId: string) => {
    if (imageId === cover?.id) return;
    buildingImages.setCover.mutate(imageId);
  };

  const sortedImages = sortImages(building.images);

  return (
    <View className="overflow-hidden rounded-3xl bg-surface">
      {/* Header row */}
      <View className="flex-row items-start gap-3 p-4">
        <Pressable onPress={onToggle}>
          <View className="h-16 w-16 overflow-hidden rounded-2xl bg-border">
            {cover ? (
              <Image source={{ uri: cover.imageUrl }} style={{ flex: 1 }} contentFit="cover" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="business-outline" size={24} color="#9A9AB0" />
              </View>
            )}
          </View>
        </Pressable>

        <View className="flex-1">
          <Pressable onPress={onToggle}>
            <Text className="font-display text-h3 text-foreground" numberOfLines={1}>
              {building.title}
            </Text>
            <Text className="mt-0.5 font-body text-body-sm text-muted" numberOfLines={1}>
              {building.address}
            </Text>
            <Text className="font-body text-body-sm text-muted" numberOfLines={1}>
              {building.location.name}
            </Text>
            <Text className="mt-0.5 font-body text-body-sm text-accent" numberOfLines={1}>
              {apartmentCount} {apartmentCount === 1 ? 'stan' : 'stanova'} · {status.label} · Rok:{' '}
              {formatDate(building.dueDate)}
            </Text>
          </Pressable>

          <View
            className="mt-2 flex-row items-center border-t pt-1"
            style={{ borderTopColor: '#2A2A40' }}>
            <ActionButton icon="pencil" label="Izmeni" onPress={onEdit} />
            <ActionButton icon="trash-outline" label="Obriši" onPress={handleDelete} destructive />
          </View>
        </View>

        <View className="self-center">
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

          {sortedImages.length > 0 ? (
            <Text className="mb-2 font-body text-body-sm text-muted">
              Zadrži sliku duže da je postaviš kao naslovnu.
            </Text>
          ) : null}

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
              {sortedImages.map((img) => {
                const isCover = img.id === cover?.id;
                const isSettingCover =
                  buildingImages.setCover.isPending && buildingImages.setCover.variables === img.id;

                return (
                  <View key={img.id} className="relative">
                    <Pressable
                      onLongPress={() => handleSetCover(img.id)}
                      delayLongPress={400}
                      disabled={isCover || buildingImages.setCover.isPending}
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                      <Image
                        source={{ uri: img.imageUrl }}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 16,
                          borderWidth: isCover ? 2 : 0,
                          borderColor: COVER_COLOR,
                        }}
                        contentFit="cover"
                      />
                      {isCover ? (
                        <View
                          className="absolute bottom-1 left-1 flex-row items-center gap-0.5 rounded-full px-1.5 py-0.5"
                          style={{ backgroundColor: COVER_COLOR }}>
                          <Ionicons name="star" size={9} color="#ffffff" />
                          <Text className="font-body-medium text-white" style={{ fontSize: 9 }}>
                            Naslovna
                          </Text>
                        </View>
                      ) : null}
                      {isSettingCover ? (
                        <View
                          className="absolute inset-0 items-center justify-center"
                          style={{ borderRadius: 16, backgroundColor: 'rgba(11,11,18,0.6)' }}>
                          <ActivityIndicator color="#ffffff" />
                        </View>
                      ) : null}
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteImage(img.id)}
                      hitSlop={6}
                      className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-black/80">
                      <Ionicons name="close" size={14} color="#ffffff" />
                    </Pressable>
                  </View>
                );
              })}
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
                  onManageModel={() => setApartmentForModel(apartment)}
                />
              ))}
            </View>
          )}

          {/* Reservations */}
          <BuildingReservations buildingId={building.id} enabled={isExpanded} />
        </View>
      ) : null}

      <ApartmentImageManagerModal
        apartment={apartmentForImages}
        onClose={() => setApartmentForImages(null)}
      />

      <ApartmentModelManagerModal
        apartment={apartmentForModel}
        onClose={() => setApartmentForModel(null)}
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
  onManageModel: () => void;
}

function ApartmentRow({
  apartment,
  onEdit,
  onDelete,
  onManageImages,
  onManageModel,
}: ApartmentRowProps) {
  return (
    <View
      className="rounded-2xl bg-background p-3.5"
      style={{ borderWidth: 1, borderColor: '#2A2A40' }}>
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 font-body-medium text-h5 text-foreground" numberOfLines={1}>
          Stan {apartment.aptNo}
        </Text>
        <StatusBadge status={apartmentStatusConfig[apartment.status]} />
      </View>

      <Text className="mt-1 font-body text-body-sm text-muted">
        Sprat {apartment.floor} · {Number(apartment.area)} m² · {apartment.rooms}-soban ·{' '}
        {formatPrice(apartment.price)}
      </Text>

      <View
        className="mt-3 flex-row items-center justify-between border-t pt-1"
        style={{ borderTopColor: '#2A2A40' }}>
        <ActionButton icon="images-outline" label="Slike" onPress={onManageImages} />
        <ActionButton icon="cube-outline" label="3D" onPress={onManageModel} />
        <ActionButton icon="pencil" label="Izmeni" onPress={onEdit} />
        <ActionButton icon="trash-outline" label="Obriši" onPress={onDelete} destructive />
      </View>
    </View>
  );
}

const DESTRUCTIVE = 'hsl(0, 70%, 60%)';

function ActionButton({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const color = destructive ? DESTRUCTIVE : 'hsl(239, 84%, 67%)';
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center gap-1 py-2"
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <Ionicons name={icon} size={19} color={color} />
      <Text className="font-body text-body-sm" style={{ color }} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
