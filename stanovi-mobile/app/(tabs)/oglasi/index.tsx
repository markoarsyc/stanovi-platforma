import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BuildingCard } from '@/components/BuildingCard';
import { GradientText } from '@/components/ui/GradientText';
import { useBuildings } from '@/lib/api/useBuildings';

export default function ListingsScreen() {
  const { data: buildings, isLoading, isError } = useBuildings();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 pb-2 pt-2">
        <Text className="font-display text-h1 text-white">Projekti</Text>
        <GradientText className="font-display text-h1">u ponudi</GradientText>
        <Text className="mt-2 font-body text-body-base text-muted">
          Pregledajte ekskluzivne stanove u izgradnji.
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="hsl(239, 84%, 67%)" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={48} color="#9A9AB0" />
          <Text className="mt-3 text-center font-body text-body-base text-muted">
            Došlo je do greške pri učitavanju projekata.
          </Text>
        </View>
      ) : (
        <FlatList
          data={buildings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BuildingCard building={item} />}
          contentContainerClassName="px-6 pb-32 pt-3 gap-4"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="mt-24 items-center px-8">
              <Ionicons name="home-outline" size={48} color="#9A9AB0" />
              <Text className="mt-3 text-center font-body text-body-base text-muted">
                Trenutno nema dostupnih projekata.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
