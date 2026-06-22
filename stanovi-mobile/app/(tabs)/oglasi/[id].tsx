import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApartmentCard } from '@/components/ApartmentCard';
import { ApartmentGalleryModal } from '@/components/ApartmentGalleryModal';
import { InvestorContactModal } from '@/components/InvestorContactModal';
import { GradientButton } from '@/components/ui/GradientButton';
import { useBuildingDetail } from '@/lib/api/useBuildings';
import { useReservationMutations } from '@/lib/api/useReservations';
import { useAuth } from '@/lib/auth/AuthContext';
import type { Apartment } from '@/lib/api/types';

export default function BuildingDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isBuyer } = useAuth();

  const { data: building, isLoading, isError } = useBuildingDetail(id);
  const { create: createReservation } = useReservationMutations();

  const [contactVisible, setContactVisible] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

  const handleReserve = () => {
    if (!selectedApartment) return;
    const apartment = selectedApartment;
    Alert.alert(
      'Rezervacija stana',
      `Da li ste sigurni da želite da rezervišete stan ${apartment.aptNo}?`,
      [
        { text: 'Otkaži', style: 'cancel' },
        {
          text: 'Rezerviši',
          onPress: () => {
            createReservation.mutate(apartment.id, {
              onSuccess: () => {
                setSelectedApartment(null);
                Alert.alert('Uspešno', `Stan ${apartment.aptNo} je rezervisan.`);
              },
              onError: () => {
                Alert.alert('Greška', 'Rezervacija nije uspela. Pokušajte ponovo.');
              },
            });
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="hsl(239, 84%, 67%)" />
      </View>
    );
  }

  if (isError || !building) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-8" edges={['top']}>
        <Ionicons name="alert-circle-outline" size={48} color="#9A9AB0" />
        <Text className="mt-3 text-center font-body text-body-base text-muted">
          Projekat nije pronađen.
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-body-medium text-body-base text-primary">Nazad</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const cover = [...building.images].sort((a, b) => a.displayOrder - b.displayOrder)[0];
  const apartmentCount = building.apartments.length;

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="relative h-80 w-full">
          {cover ? (
            <Image
              source={{ uri: cover.imageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-border">
              <Ionicons name="business-outline" size={56} color="#9A9AB0" />
            </View>
          )}

          <LinearGradient
            colors={['rgba(11,11,18,0.4)', 'transparent', 'rgba(11,11,18,0.95)']}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />

          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={{ position: 'absolute', top: insets.top + 8, left: 16 }}
            className="h-10 w-10 items-center justify-center rounded-full"
            // Slight scrim so the arrow stays visible over light images.
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(11,11,18,0.5)' }}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </View>
          </Pressable>

          <View className="absolute inset-x-0 bottom-0 p-6">
            <Text className="font-display text-h1 text-white" numberOfLines={2}>
              {building.title}
            </Text>
            <View className="mt-2 flex-row items-center gap-1">
              <Ionicons name="location-outline" size={16} color="#9A9AB0" />
              <Text className="font-body text-body-base text-muted">
                {building.address}, {building.location.name}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center gap-1">
              <Ionicons name="home-outline" size={16} color="hsl(260, 80%, 75%)" />
              <Text className="font-body-medium text-body-base text-accent">
                {apartmentCount} {apartmentCount === 1 ? 'stan' : 'stanova'}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 pt-5">
          <GradientButton
            title="Kontakt investitora"
            onPress={() => setContactVisible(true)}
          />

          {building.description ? (
            <Text className="mt-6 font-body text-body-base text-foreground">
              {building.description}
            </Text>
          ) : null}

          <Text className="mb-3 mt-7 font-display text-h2 text-foreground">
            Stanovi ({apartmentCount})
          </Text>

          {apartmentCount > 0 ? (
            <View className="gap-3">
              {building.apartments.map((apartment) => (
                <ApartmentCard
                  key={apartment.id}
                  apartment={apartment}
                  onPress={() => setSelectedApartment(apartment)}
                />
              ))}
            </View>
          ) : (
            <View className="items-center rounded-2xl border border-border bg-surface py-8">
              <Ionicons name="home-outline" size={40} color="#9A9AB0" />
              <Text className="mt-2 text-center font-body text-body-base text-muted">
                Trenutno nema stanova u ovom projektu.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <InvestorContactModal
        investor={building.investor}
        visible={contactVisible}
        onClose={() => setContactVisible(false)}
      />

      <ApartmentGalleryModal
        apartment={selectedApartment}
        onClose={() => setSelectedApartment(null)}
        onReserve={isBuyer ? handleReserve : undefined}
        reserving={createReservation.isPending}
      />
    </View>
  );
}
