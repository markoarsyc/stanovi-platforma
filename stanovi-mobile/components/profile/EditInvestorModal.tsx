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
import type { InvestorProfile } from '@/lib/api/types';
import {
  investorProfileSchema,
  type InvestorProfileFormValues,
} from '@/lib/profile/schemas';

interface EditInvestorModalProps {
  visible: boolean;
  investor: InvestorProfile;
  userId: string | undefined;
  onClose: () => void;
}

const VERIFICATION_WARNING =
  'Izmenom naziva kompanije ili PIB-a Vaš profil postaje neverifikovan i moraćete ponovo da se verifikujete.';

export function EditInvestorModal({
  visible,
  investor,
  userId,
  onClose,
}: EditInvestorModalProps) {
  const { updateProfile } = useProfileMutations(userId, true);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<InvestorProfileFormValues>({
    resolver: zodResolver(investorProfileSchema),
    defaultValues: {
      companyName: investor.companyName,
      tin: investor.tin ?? '',
      contactEmail: investor.contactEmail,
      contactPhone: investor.contactPhone,
    },
  });

  useEffect(() => {
    if (visible) {
      reset({
        companyName: investor.companyName,
        tin: investor.tin ?? '',
        contactEmail: investor.contactEmail,
        contactPhone: investor.contactPhone,
      });
    }
  }, [visible, investor, reset]);

  const save = async (values: InvestorProfileFormValues) => {
    setSubmitting(true);
    try {
      await updateProfile.mutateAsync({ id: investor.id, payload: values });
      onClose();
    } catch {
      Alert.alert('Greška', 'Čuvanje podataka nije uspelo. Pokušajte ponovo.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmSave = (values: InvestorProfileFormValues) => {
    Alert.alert('Potvrda', 'Da li ste sigurni da želite da sačuvate izmene?', [
      { text: 'Otkaži', style: 'cancel' },
      { text: 'Sačuvaj', onPress: () => save(values) },
    ]);
  };

  const onValid = (values: InvestorProfileFormValues) => {
    const identityChanged =
      values.companyName !== investor.companyName ||
      (values.tin ?? '') !== (investor.tin ?? '');

    if (investor.isVerified && identityChanged) {
      Alert.alert('Upozorenje', VERIFICATION_WARNING, [
        { text: 'Otkaži', style: 'cancel' },
        { text: 'Nastavi', style: 'destructive', onPress: () => confirmSave(values) },
      ]);
      return;
    }

    confirmSave(values);
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
                  name="companyName"
                  placeholder="Naziv kompanije"
                  icon="business-outline"
                  autoCapitalize="words"
                />
                <FormInput
                  control={control}
                  name="tin"
                  placeholder="PIB"
                  icon="pricetag-outline"
                />
                <FormInput
                  control={control}
                  name="contactEmail"
                  placeholder="Kontakt email"
                  icon="mail-outline"
                  keyboardType="email-address"
                />
                <FormInput
                  control={control}
                  name="contactPhone"
                  placeholder="Kontakt telefon"
                  icon="call-outline"
                  keyboardType="phone-pad"
                />
              </View>

              {investor.isVerified ? (
                <View
                  className="mt-5 flex-row items-start gap-2 border bg-surface p-3"
                  style={{ borderRadius: 16, borderColor: '#F59E0B66' }}>
                  <Text className="flex-1 font-body text-body-sm text-muted">
                    {VERIFICATION_WARNING}
                  </Text>
                </View>
              ) : null}

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
