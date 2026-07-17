import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { BuildingImage } from '@/lib/api/types';

interface BuildingGalleryModalProps {
  images: BuildingImage[];
  visible: boolean;
  onClose: () => void;
}

export function BuildingGalleryModal({ images, visible, onClose }: BuildingGalleryModalProps) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (visible) setIndex(0);
  }, [visible]);

  const count = images.length;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <Modal
      visible={visible && count > 0}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
          <Text className="font-display text-h3 text-foreground">Slike projekta</Text>
          <Pressable onPress={onClose} hitSlop={12} className="h-10 w-10 items-center justify-center">
            <Ionicons name="close" size={28} color="hsl(230, 25%, 92%)" />
          </Pressable>
        </View>

        <View className="flex-1 justify-center" onLayout={onLayout}>
          {width > 0 ? (
            <FlatList
              data={images}
              keyExtractor={(img) => img.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={({ item }) => (
                <View style={{ width }} className="justify-center px-5">
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 16 }}
                    contentFit="cover"
                    transition={200}
                  />
                </View>
              )}
            />
          ) : null}
        </View>

        <Text className="pb-3 pt-2 text-center font-body text-body-sm text-muted">
          {index + 1} / {count}
        </Text>
      </SafeAreaView>
    </Modal>
  );
}
