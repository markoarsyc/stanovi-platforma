import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { GradientButton } from '@/components/ui/GradientButton';
import { uploadApartmentImage } from '@/lib/api/apartments.service';
import type { Apartment } from '@/lib/api/types';
import { useInvestorMutations } from '@/lib/api/useInvestorPanel';
import { pickImages } from '@/lib/investor/imagePicker';
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
  const queryClient = useQueryClient();
  const { createApartment, updateApartment } = useInvestorMutations();

  const [pickedImage, setPickedImage] = useState<string | null>(null);
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
    setPickedImage(null);
    onClose();
  };

  const handlePickImage = async () => {
    const uris = await pickImages(false);
    if (uris.length) setPickedImage(uris[0]);
  };

  const onValid = async (values: ApartmentFormValues) => {
    setSubmitting(true);
    try {
      let apartmentId = apartment?.id;
      if (isEditing && apartment) {
        await updateApartment.mutateAsync({ id: apartment.id, payload: values });
      } else {
        const created = await createApartment.mutateAsync({ ...values, buildingId });
        apartmentId = created.id;
      }
      if (pickedImage && apartmentId) {
        await uploadApartmentImage(apartmentId, pickedImage).catch(() => {});
        await queryClient.invalidateQueries({ queryKey: ['apartment-images', apartmentId] });
        await queryClient.invalidateQueries({ queryKey: ['investor-buildings'] });
        await queryClient.invalidateQueries({ queryKey: ['buildings'] });
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
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerClassName="px-6 pb-10"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Pressable
              onPress={handleClose}
              hitSlop={12}
              className="mt-2 h-10 w-10 justify-center">
              <Ionicons name="arrow-back" size={26} color="hsl(239, 84%, 67%)" />
            </Pressable>

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

              <View
                className="border border-dashed bg-surface p-4"
                style={{ borderRadius: 24, borderColor: '#3A3A63' }}>
                {pickedImage ? (
                  <View className="mb-3 flex-row">
                    <View className="relative">
                      <Image
                        source={{ uri: pickedImage }}
                        style={{ width: 80, height: 80, borderRadius: 12 }}
                        contentFit="cover"
                      />
                      <Pressable
                        onPress={() => setPickedImage(null)}
                        hitSlop={6}
                        className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-black/80">
                        <Ionicons name="close" size={14} color="#ffffff" />
                      </Pressable>
                    </View>
                  </View>
                ) : null}
                <Pressable onPress={handlePickImage} className="items-center py-4">
                  <Ionicons name="image-outline" size={28} color="hsl(239, 84%, 67%)" />
                  <Text className="mt-2 font-body text-body-base text-muted">Dodaj sliku</Text>
                </Pressable>
              </View>
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
    </Modal>
  );
}
