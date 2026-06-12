import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProjektiScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 items-center justify-center px-8">
        <Ionicons name="business-outline" size={48} color="#9A9AB0" />
        <Text className="mt-4 text-center font-display text-h3 text-foreground">
          Upravljanje projektima
        </Text>
        <Text className="mt-2 text-center font-body text-body-base text-muted">
          Još nije implementirano.
        </Text>
      </View>
    </SafeAreaView>
  );
}
