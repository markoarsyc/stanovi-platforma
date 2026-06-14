import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { GradientButton } from '@/components/ui/GradientButton';
import { useProfileMutations } from '@/lib/api/useProfile';
import type { BuyerProfile } from '@/lib/api/types';
import { buyerProfileSchema, type BuyerProfileFormValues } from '@/lib/profile/schemas';

interface EditBuyerModalProps {
  visible: boolean;
  buyer: BuyerProfile;
  userId: string | undefined;
  onClose: () => void;
}

export function EditBuyerModal({ visible, buyer, userId, onClose }: EditBuyerModalProps) {
  const { updateProfile } = useProfileMutations(userId, false);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<BuyerProfileFormValues>({
    resolver: zodResolver(buyerProfileSchema),
    defaultValues: {
      firstName: buyer.firstName,
      lastName: buyer.lastName,
      phone: buyer.phone,
    },
  });

  useEffect(() => {
    if (visible) {
      reset({ firstName: buyer.firstName, lastName: buyer.lastName, phone: buyer.phone });
    }
  }, [visible, buyer, reset]);

  const save = async (values: BuyerProfileFormValues) => {
    setSubmitting(true);
    try {
      await updateProfile.mutateAsync({ id: buyer.id, payload: values });
      onClose();
    } catch {
      Alert.alert('Greška', 'Čuvanje podataka nije uspelo. Pokušajte ponovo.');
    } finally {
      setSubmitting(false);
    }
  };

  const onValid = (values: BuyerProfileFormValues) => {
    Alert.alert('Potvrda', 'Da li ste sigurni da želite da sačuvate izmene?', [
      { text: 'Otkaži', style: 'cancel' },
      { text: 'Sačuvaj', onPress: () => save(values) },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
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
                Izmena podataka
              </Text>

              <View className="mt-6 gap-4">
                <FormInput
                  control={control}
                  name="firstName"
                  placeholder="Ime"
                  icon="person-outline"
                  autoCapitalize="words"
                />
                <FormInput
                  control={control}
                  name="lastName"
                  placeholder="Prezime"
                  icon="person-outline"
                  autoCapitalize="words"
                />
                <FormInput
                  control={control}
                  name="phone"
                  placeholder="Telefon"
                  icon="call-outline"
                  keyboardType="phone-pad"
                />
              </View>

              <View className="mt-8 flex-row items-center justify-center gap-6">
                <View style={{ width: 180 }}>
                  <GradientButton
                    title="Sačuvaj izmene"
                    onPress={handleSubmit(onValid)}
                    loading={submitting}
                  />
                </View>
                <Pressable onPress={onClose} hitSlop={8}>
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
