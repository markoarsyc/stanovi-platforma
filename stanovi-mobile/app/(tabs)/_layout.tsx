import { Tabs } from 'expo-router';

import { GlassTabBar } from '@/components/GlassTabBar';
import { useAuth } from '@/lib/auth/AuthContext';

export default function TabLayout() {
  const { isInvestor } = useAuth();

  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="oglasi" options={{ title: 'Oglasi' }} />
      <Tabs.Screen
        name="projekti"
        options={{
          title: 'Projekti',
          // Investor-only: keep it non-navigable for everyone else.
          // GlassTabBar also hides the button for non-investors.
          href: isInvestor ? undefined : null,
        }}
      />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
