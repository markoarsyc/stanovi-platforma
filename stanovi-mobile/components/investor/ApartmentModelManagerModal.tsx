import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Model3DViewer } from '@/components/Model3DViewer';
import type { Apartment } from '@/lib/api/types';
import { useApartmentModel, useApartmentModelMutations } from '@/lib/api/useInvestorPanel';
import { pickGlbModel } from '@/lib/investor/modelPicker';

interface ApartmentModelManagerModalProps {
  apartment: Apartment | null;
  onClose: () => void;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ApartmentModelManagerModal({
  apartment,
  onClose,
}: ApartmentModelManagerModalProps) {
  const apartmentId = apartment?.id ?? '';
  const { data: model, isLoading } = useApartmentModel(apartment?.id ?? null);
  const { upload, remove } = useApartmentModelMutations(apartmentId);

  const handlePick = async () => {
    const picked = await pickGlbModel();
    if (!picked) return;
    // The backend replaces an existing model in place, so no delete step first.
    try {
      await upload.mutateAsync({ uri: picked.uri, name: picked.name });
    } catch {
      Alert.alert('Greška', 'Model nije uspeo da se otpremi. Pokušajte ponovo.');
    }
  };

  const handleRemove = () => {
    Alert.alert('Obriši 3D model', 'Da li ste sigurni?', [
      { text: 'Otkaži', style: 'cancel' },
      {
        text: 'Obriši',
        style: 'destructive',
        onPress: () => {
          remove.mutate(undefined, {
            onError: () => Alert.alert('Greška', 'Model nije uspeo da se obriše.'),
          });
        },
      },
    ]);
  };

  return (
    <Modal
      visible={!!apartment}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
          <Text className="font-display text-h3 text-foreground">
            3D model — Stan {apartment?.aptNo}
          </Text>
          <Pressable onPress={onClose} hitSlop={12} className="h-10 w-10 items-center justify-center">
            <Ionicons name="close" size={28} color="hsl(230, 25%, 92%)" />
          </Pressable>
        </View>

        <ScrollView contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={handlePick}
            disabled={upload.isPending}
            className="mb-5 items-center border border-dashed bg-surface py-6"
            style={{ borderRadius: 24, borderColor: '#3A3A63' }}>
            {upload.isPending ? (
              <ActivityIndicator color="hsl(239, 84%, 67%)" />
            ) : (
              <>
                <Ionicons name="cube-outline" size={28} color="hsl(239, 84%, 67%)" />
                <Text className="mt-2 font-body text-body-base text-muted">
                  {model ? 'Zameni model' : 'Dodaj .glb model'}
                </Text>
                <Text className="mt-1 font-body text-body-sm text-muted">
                  .glb fajl, do 10 MB
                </Text>
              </>
            )}
          </Pressable>

          {isLoading ? (
            <ActivityIndicator color="hsl(239, 84%, 67%)" />
          ) : !model ? (
            <Text className="text-center font-body text-body-sm text-muted">
              Nema postavljenog 3D modela
            </Text>
          ) : (
            <View className="overflow-hidden rounded-3xl bg-surface">
              <View className="flex-row items-center gap-3 px-4 py-3">
                <Ionicons name="cube" size={20} color="hsl(239, 84%, 67%)" />
                <Text className="flex-1 font-body text-body-sm text-muted" numberOfLines={1}>
                  {formatSize(model.fileSize)}
                </Text>
                <Pressable
                  onPress={handleRemove}
                  disabled={remove.isPending}
                  hitSlop={8}
                  className="h-9 w-9 items-center justify-center">
                  {remove.isPending ? (
                    <ActivityIndicator color="#9A9AB0" size="small" />
                  ) : (
                    <Ionicons name="trash-outline" size={18} color="#9A9AB0" />
                  )}
                </Pressable>
              </View>
              <View style={{ height: 280 }}>
                <Model3DViewer src={model.modelUrl} />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
