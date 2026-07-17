import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { GradientButton } from '@/components/ui/GradientButton';
import type { Apartment } from '@/lib/api/types';
import { useInvestorMutations } from '@/lib/api/useInvestorPanel';
import { apartmentSchema, type ApartmentFormValues } from '@/lib/investor/schemas';

interface ApartmentFormModalProps {
  visible: boolean;
  buildingId: string;
  apartment: Apartment | null;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { label: 'Dostupan', value: 'AVAILABLE' as const },
  { label: 'Rezervisan', value: 'RESERVED' as const },
];

export function ApartmentFormModal({
  visible,
  buildingId,
  apartment,
  onClose,
}: ApartmentFormModalProps) {
  const isEditing = !!apartment;
  const { createApartment, updateApartment } = useInvestorMutations();

  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApartmentFormValues>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: apartment
      ? {
          aptNo: apartment.aptNo,
          floor: apartment.floor,
          rooms: apartment.rooms,
          area: Number(apartment.area),
          price: Number(apartment.price),
          status: apartment.status,
        }
      : {
          aptNo: '',
          floor: undefined,
          rooms: undefined,
          area: undefined,
          price: undefined,
          status: 'AVAILABLE',
        },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onValid = async (values: ApartmentFormValues) => {
    setSubmitting(true);
    try {
      if (isEditing && apartment) {
        await updateApartment.mutateAsync({ id: apartment.id, payload: values });
      } else {
        await createApartment.mutateAsync({ ...values, buildingId });
      }
      handleClose();
    } catch {
      Alert.alert('Greška', 'Čuvanje stana nije uspelo. Pokušajte ponovo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerClassName="px-6 pb-10 pt-2"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text className="mt-2 text-center font-display text-h2 text-foreground">
              {isEditing ? 'Izmeni stan' : 'Dodaj novi stan'}
            </Text>

            <View className="mt-6 gap-4">
              <FormInput
                control={control}
                name="aptNo"
                placeholder="Broj stana"
                icon="home-outline"
                autoCapitalize="characters"
              />
              <FormInput
                control={control}
                name="floor"
                placeholder="Sprat"
                icon="layers-outline"
                numeric
              />
              <FormInput
                control={control}
                name="rooms"
                placeholder="Broj soba"
                icon="bed-outline"
                numeric
              />
              <FormInput
                control={control}
                name="area"
                placeholder="Površina (m²)"
                icon="resize-outline"
                numeric
              />
              <FormInput
                control={control}
                name="price"
                placeholder="Cena (€)"
                icon="pricetag-outline"
                numeric
              />

              <Controller
                control={control}
                name="status"
                render={({ field: { onChange, value } }) => (
                  <FormSelect
                    placeholder="Status"
                    icon="flag-outline"
                    options={STATUS_OPTIONS}
                    value={value}
                    onChange={onChange}
                    error={errors.status?.message}
                  />
                )}
              />

            </View>

            <View className="mt-8 flex-row items-center justify-center gap-6">
              <View style={{ width: 180 }}>
                <GradientButton
                  title={isEditing ? 'Sačuvaj izmene' : 'Dodaj stan'}
                  onPress={handleSubmit(onValid)}
                  loading={submitting}
                />
              </View>
              <Pressable onPress={handleClose} hitSlop={8}>
                <Text className="font-body-medium text-button text-primary">Otkaži</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
