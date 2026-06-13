import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
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
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { GradientButton } from '@/components/ui/GradientButton';
import { uploadBuildingImage } from '@/lib/api/buildings.service';
import type { InvestorBuilding, Location } from '@/lib/api/types';
import { useInvestorMutations } from '@/lib/api/useInvestorPanel';
import { pickImages } from '@/lib/investor/imagePicker';
import { buildingSchema, type BuildingFormValues } from '@/lib/investor/schemas';

interface BuildingFormModalProps {
  visible: boolean;
  building: InvestorBuilding | null;
  locations: Location[];
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { label: 'Planiran', value: 'PLANNED' as const },
  { label: 'U izgradnji', value: 'IN_PROGRESS' as const },
  { label: 'Završen', value: 'COMPLETED' as const },
];

// Local yyyy-mm-dd (avoids the UTC shift toISOString would cause for TZ ahead of UTC).
function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Backend/Prisma needs a full ISO-8601 DateTime; expand the picked yyyy-mm-dd to UTC midnight.
function toISODateTime(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).toISOString();
}

export function BuildingFormModal({
  visible,
  building,
  locations,
  onClose,
}: BuildingFormModalProps) {
  const isEditing = !!building;
  const queryClient = useQueryClient();
  const { createBuilding, updateBuilding } = useInvestorMutations();

  const [pickedImages, setPickedImages] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: building
      ? {
          title: building.title,
          locationId: building.locationId ?? building.location.id,
          address: building.address,
          description: building.description ?? '',
          dueDate: toISODate(new Date(building.dueDate)),
          status: building.status,
        }
      : {
          title: '',
          locationId: 0,
          address: '',
          description: '',
          dueDate: '',
          status: 'PLANNED',
        },
  });

  const handleClose = () => {
    reset();
    setPickedImages([]);
    onClose();
  };

  const handleAddImages = async () => {
    const uris = await pickImages(true);
    if (uris.length) setPickedImages((prev) => [...prev, ...uris]);
  };

  const uploadPicked = async (buildingId: string) => {
    for (const uri of pickedImages) {
      await uploadBuildingImage(buildingId, uri).catch(() => {});
    }
    await queryClient.invalidateQueries({ queryKey: ['investor-buildings'] });
    await queryClient.invalidateQueries({ queryKey: ['buildings'] });
  };

  const onValid = async (values: BuildingFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        description: values.description || undefined,
        dueDate: toISODateTime(values.dueDate),
      };
      if (isEditing && building) {
        await updateBuilding.mutateAsync({ id: building.id, payload });
        if (pickedImages.length) await uploadPicked(building.id);
      } else {
        const created = await createBuilding.mutateAsync(payload);
        if (pickedImages.length) await uploadPicked(created.id);
      }
      handleClose();
    } catch {
      Alert.alert('Greška', 'Čuvanje projekta nije uspelo. Pokušajte ponovo.');
    } finally {
      setSubmitting(false);
    }
  };

  const onDateChange = (
    onChange: (value: string) => void,
    event: DateTimePickerEvent,
    date?: Date,
  ) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'set' && date) onChange(toISODate(date));
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
              {isEditing ? 'Izmeni projekat' : 'Dodaj novi projekat'}
            </Text>

            <View className="mt-6 gap-4">
              <FormInput
                control={control}
                name="title"
                placeholder="Naziv projekta"
                icon="business-outline"
                autoCapitalize="sentences"
              />

              <Controller
                control={control}
                name="locationId"
                render={({ field: { onChange, value } }) => (
                  <FormSelect
                    placeholder="Izaberite opštinu"
                    icon="location-outline"
                    options={locations.map((l) => ({ label: l.name, value: l.id }))}
                    value={value || null}
                    onChange={onChange}
                    error={errors.locationId?.message}
                  />
                )}
              />

              <FormInput
                control={control}
                name="address"
                placeholder="Adresa"
                icon="map-outline"
                autoCapitalize="sentences"
              />

              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className="border bg-surface px-5 py-3"
                    style={{ borderRadius: 24, borderColor: '#3A3A63' }}>
                    <TextInput
                      className="font-body text-body-base text-foreground"
                      placeholder="Opis projekta"
                      placeholderTextColor="#9A9AB0"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      numberOfLines={4}
                      style={{ minHeight: 96, textAlignVertical: 'top' }}
                    />
                  </View>
                )}
              />

              <Controller
                control={control}
                name="dueDate"
                render={({ field: { onChange, value } }) => (
                  <View className="w-full">
                    <Pressable
                      onPress={() => setShowDatePicker(true)}
                      className="w-full flex-row items-center gap-3 border bg-surface px-5"
                      style={{
                        height: 52,
                        borderRadius: 40,
                        borderColor: errors.dueDate ? '#F87171' : '#3A3A63',
                      }}>
                      <Ionicons name="calendar-outline" size={18} color="hsl(239, 84%, 67%)" />
                      <Text
                        className={`flex-1 font-body text-body-base ${value ? 'text-foreground' : 'text-muted'}`}>
                        {value || 'Rok završetka'}
                      </Text>
                    </Pressable>
                    {errors.dueDate ? (
                      <Text className="mt-1 px-5 font-body text-body-sm text-red-400">
                        {errors.dueDate.message}
                      </Text>
                    ) : null}
                    {showDatePicker ? (
                      <DateTimePicker
                        value={value ? new Date(value) : new Date()}
                        mode="date"
                        minimumDate={new Date()}
                        onChange={(event, date) => onDateChange(onChange, event, date)}
                      />
                    ) : null}
                  </View>
                )}
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

              <ImagePickerField images={pickedImages} onAdd={handleAddImages} onRemove={(i) =>
                setPickedImages((prev) => prev.filter((_, idx) => idx !== i))
              } />
            </View>

            <View className="mt-8 flex-row items-center justify-center gap-6">
              <View style={{ width: 200 }}>
                <GradientButton
                  title={isEditing ? 'Sačuvaj izmene' : 'Sačuvaj projekat'}
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

interface ImagePickerFieldProps {
  images: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}

function ImagePickerField({ images, onAdd, onRemove }: ImagePickerFieldProps) {
  return (
    <View
      className="border border-dashed bg-surface p-4"
      style={{ borderRadius: 24, borderColor: '#3A3A63' }}>
      {images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row gap-3">
            {images.map((uri, index) => (
              <View key={`${uri}-${index}`} className="relative">
                <Image
                  source={{ uri }}
                  style={{ width: 80, height: 80, borderRadius: 12 }}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => onRemove(index)}
                  hitSlop={6}
                  className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-black/80">
                  <Ionicons name="close" size={14} color="#ffffff" />
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}
      <Pressable onPress={onAdd} className="items-center py-4">
        <Ionicons name="images-outline" size={28} color="hsl(239, 84%, 67%)" />
        <Text className="mt-2 font-body text-body-base text-muted">Dodaj slike</Text>
      </Pressable>
    </View>
  );
}
