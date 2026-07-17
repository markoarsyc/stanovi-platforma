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
  verificationRequestSchema,
  type VerificationRequestFormValues,
} from '@/lib/profile/schemas';

interface VerificationModalProps {
  visible: boolean;
  investor: InvestorProfile;
  userId: string | undefined;
  onClose: () => void;
}

export function VerificationModal({
  visible,
  investor,
  userId,
  onClose,
}: VerificationModalProps) {
  const { requestVerification } = useProfileMutations(userId, true);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<VerificationRequestFormValues>({
    resolver: zodResolver(verificationRequestSchema),
    defaultValues: {
      companyName: investor.companyName,
      tin: investor.tin ?? '',
    },
  });

  useEffect(() => {
    if (visible) {
      reset({ companyName: investor.companyName, tin: investor.tin ?? '' });
    }
  }, [visible, investor, reset]);

  const onValid = async (values: VerificationRequestFormValues) => {
    setSubmitting(true);
    try {
      await requestVerification.mutateAsync({ id: investor.id, payload: values });
      onClose();
      Alert.alert('Uspešno', 'Zahtev za verifikaciju je poslat.');
    } catch {
      Alert.alert('Greška', 'Slanje zahteva nije uspelo. Pokušajte ponovo.');
    } finally {
      setSubmitting(false);
    }
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
                Verifikacija profila
              </Text>
              <Text className="mt-2 text-center font-body text-body-sm text-muted">
                Unesite zvanične podatke vaše kompanije za proveru.
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
              </View>

              <View className="mt-8 flex-row items-center justify-center gap-6">
                <View style={{ width: 180 }}>
                  <GradientButton
                    title="Pošalji zahtev"
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
