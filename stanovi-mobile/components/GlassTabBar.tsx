import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth/AuthContext';

type IoniconName = keyof typeof Ionicons.glyphMap;

const TABS: Record<string, { label: string; icon: IoniconName }> = {
  oglasi: { label: 'Oglasi', icon: 'home-outline' },
  projekti: { label: 'Projekti', icon: 'business-outline' },
  profil: { label: 'Profil', icon: 'person-outline' },
};

const ACTIVE_COLOR = '#ffffff';
const INACTIVE_COLOR = 'rgba(255,255,255,0.7)';

export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isInvestor } = useAuth();

  // Only render routes we have a config for, and hide the investor-only tab.
  const routes = state.routes.filter(
    (route) => TABS[route.name] && (route.name !== 'projekti' || isInvestor),
  );

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: insets.bottom + 12 }]}>
      <BlurView intensity={40} tint="light" experimentalBlurMethod="dimezisBlurView" style={styles.bar}>
        {/* Lavender glass tint layered over the blur */}
        <View style={styles.tint} pointerEvents="none" />

        {routes.map((route) => {
          const config = TABS[route.name];
          const isFocused = state.routes[state.index].key === route.key;
          const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

          const onPress = () => {
            if (process.env.EXPO_OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.item, isFocused && styles.itemActive]}>
              <Ionicons name={config.icon} size={22} color={color} />
              <Text style={[styles.label, { color }]}>{config.label}</Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(79,70,229,0.42)',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
  },
  itemActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
  },
});
