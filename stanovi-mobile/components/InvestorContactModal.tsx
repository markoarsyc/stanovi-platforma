import { Ionicons } from '@expo/vector-icons';
import { Linking, Modal, Pressable, Text, View } from 'react-native';

import type { Investor } from '@/lib/api/types';

interface InvestorContactModalProps {
  investor: Investor | null;
  visible: boolean;
  onClose: () => void;
}

export function InvestorContactModal({ investor, visible, onClose }: InvestorContactModalProps) {
  const email = investor?.contactEmail;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        {/* Stop propagation so taps inside the card don't close the modal. */}
        <Pressable
          onPress={() => {}}
          className="w-full rounded-3xl border border-border bg-surface p-6">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-h3 text-foreground">Kontakt investitora</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color="hsl(230, 25%, 92%)" />
            </Pressable>
          </View>

          <View className="mt-4 flex-row items-center gap-2">
            <Ionicons name="business-outline" size={18} color="hsl(260, 80%, 75%)" />
            <Text className="font-body-medium text-body-base text-foreground">
              {investor?.companyName ?? 'Nepoznat investitor'}
            </Text>
          </View>

          {email ? (
            <Pressable
              onPress={() => Linking.openURL(`mailto:${email}`)}
              className="mt-3 flex-row items-center gap-2">
              <Ionicons name="mail-outline" size={18} color="hsl(239, 84%, 67%)" />
              <Text className="font-body-medium text-body-base text-primary">{email}</Text>
            </Pressable>
          ) : (
            <Text className="mt-3 font-body text-body-sm text-muted">
              Kontakt email nije dostupan.
            </Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
