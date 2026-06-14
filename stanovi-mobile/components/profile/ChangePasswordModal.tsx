import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
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
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/lib/profile/schemas';

interface ChangePasswordModalProps {
  visible: boolean;
  userId: string | undefined;
  isInvestor: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  visible,
  userId,
  isInvestor,
  onClose,
}: ChangePasswordModalProps) {
  const { changeProfilePassword } = useProfileMutations(userId, isInvestor);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (visible) {
      reset({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  }, [visible, reset]);

  const onValid = async (values: ChangePasswordFormValues) => {
    setSubmitting(true);
    try {
      await changeProfilePassword.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      Alert.alert('Uspeh', 'Lozinka je uspešno promenjena.');
      onClose();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        Alert.alert('Greška', 'Pogrešna trenutna lozinka.');
      } else {
        Alert.alert('Greška', 'Promena lozinke nije uspela. Pokušajte ponovo.');
      }
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
                Promena lozinke
              </Text>

              <View className="mt-6 gap-4">
                <FormInput
                  control={control}
                  name="oldPassword"
                  placeholder="Trenutna lozinka"
                  icon="lock-closed-outline"
                  secureTextEntry
                />
                <FormInput
                  control={control}
                  name="newPassword"
                  placeholder="Nova lozinka"
                  icon="lock-closed-outline"
                  secureTextEntry
                />
                <FormInput
                  control={control}
                  name="confirmPassword"
                  placeholder="Potvrdi novu lozinku"
                  icon="lock-closed-outline"
                  secureTextEntry
                />
              </View>

              <View className="mt-8 flex-row items-center justify-center gap-6">
                <View style={{ width: 180 }}>
                  <GradientButton
                    title="Promeni lozinku"
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
