import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApartmentFormModal } from '@/components/investor/ApartmentFormModal';
import { BuildingFormModal } from '@/components/investor/BuildingFormModal';
import { InvestorBuildingCard } from '@/components/investor/InvestorBuildingCard';
import { GradientText } from '@/components/ui/GradientText';
import type { Apartment, InvestorBuilding } from '@/lib/api/types';
import { useInvestorBuildings, useLocations } from '@/lib/api/useInvestorPanel';

interface BuildingFormState {
  open: boolean;
  editing: InvestorBuilding | null;
}

interface ApartmentFormState {
  open: boolean;
  buildingId: string | null;
  editing: Apartment | null;
}

export default function ProjektiScreen() {
  const { data: buildings, isLoading, isError } = useInvestorBuildings();
  const { data: locations } = useLocations();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [buildingForm, setBuildingForm] = useState<BuildingFormState>({
    open: false,
    editing: null,
  });
  const [apartmentForm, setApartmentForm] = useState<ApartmentFormState>({
    open: false,
    buildingId: null,
    editing: null,
  });

  const openCreateBuilding = () => setBuildingForm({ open: true, editing: null });
  const openEditBuilding = (building: InvestorBuilding) =>
    setBuildingForm({ open: true, editing: building });
  const closeBuildingForm = () => setBuildingForm({ open: false, editing: null });

  const openCreateApartment = (buildingId: string) =>
    setApartmentForm({ open: true, buildingId, editing: null });
  const openEditApartment = (buildingId: string, apartment: Apartment) =>
    setApartmentForm({ open: true, buildingId, editing: apartment });
  const closeApartmentForm = () =>
    setApartmentForm({ open: false, buildingId: null, editing: null });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <FlatList
        data={buildings ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-5 pb-28 pt-2"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-5">
            <Text className="font-display text-h1 text-foreground">Moji</Text>
            <GradientText className="font-display text-h1">projekti</GradientText>
            <Text className="mt-1 font-body text-body-base text-muted">
              Upravljajte vašim projektima i stanovima
            </Text>

            <Pressable
              onPress={openCreateBuilding}
              className="mt-4 flex-row items-center justify-center gap-2 self-start rounded-full border px-5 py-2.5"
              style={{ borderColor: 'hsl(239, 84%, 67%)' }}>
              <Ionicons name="add" size={18} color="hsl(239, 84%, 67%)" />
              <Text className="font-body-medium text-button text-primary">Novi projekat</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-4">
            <InvestorBuildingCard
              building={item}
              isExpanded={expandedId === item.id}
              onToggle={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
              onEdit={() => openEditBuilding(item)}
              onAddApartment={() => openCreateApartment(item.id)}
              onEditApartment={(apartment) => openEditApartment(item.id, apartment)}
            />
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-20">
              <ActivityIndicator color="hsl(239, 84%, 67%)" />
              <Text className="mt-3 font-body text-body-base text-muted">
                Učitavanje projekata...
              </Text>
            </View>
          ) : isError ? (
            <View className="items-center py-20">
              <Ionicons name="alert-circle-outline" size={40} color="#9A9AB0" />
              <Text className="mt-3 text-center font-body text-body-base text-muted">
                Greška pri učitavanju projekata.
              </Text>
            </View>
          ) : (
            <View className="items-center py-20">
              <Ionicons name="business-outline" size={40} color="#9A9AB0" />
              <Text className="mt-3 text-center font-body text-body-base text-muted">
                Nemate još projekata. Dodajte prvi.
              </Text>
            </View>
          )
        }
      />

      {buildingForm.open ? (
        <BuildingFormModal
          visible={buildingForm.open}
          building={buildingForm.editing}
          locations={locations ?? []}
          onClose={closeBuildingForm}
        />
      ) : null}

      {apartmentForm.open && apartmentForm.buildingId ? (
        <ApartmentFormModal
          visible={apartmentForm.open}
          buildingId={apartmentForm.buildingId}
          apartment={apartmentForm.editing}
          onClose={closeApartmentForm}
        />
      ) : null}
    </SafeAreaView>
  );
}
