// =============================================================================
// Ders Defteri — Tabs Layout
// =============================================================================

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  return (
    <View style={[tabIconStyles.wrapper, focused && tabIconStyles.activeWrapper]}>
      <MaterialCommunityIcons name={name} size={24} color={color} />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrapper: {
    width: 44,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeWrapper: {
    backgroundColor: '#EDE9FE',
  },
});

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user, router]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#5B4FCF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="students/index"
        options={{
          title: 'Öğrenciler',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="school-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule/index"
        options={{
          title: 'Program',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="calendar-month-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments/index"
        options={{
          title: 'Ödemeler',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="wallet-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="account-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="students/[id]" options={{ href: null }} />
      <Tabs.Screen name="students/new" options={{ href: null }} />
      <Tabs.Screen name="students/[id]/edit" options={{ href: null }} />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
    height: 68,
    paddingBottom: 10,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
