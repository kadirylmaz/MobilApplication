// =============================================================================
// Ders Defteri — Tabs Layout
// =============================================================================

import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { MoreMenuSheet } from '../../src/components/navigation/MoreMenuSheet';
import { colors } from '../../src/theme';

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
    backgroundColor: colors.sealSoft,
  },
});

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user, router]);

  function handleNavigate(path: string) {
    setMoreMenuVisible(false);
    router.push(path as never);
  }

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.seal,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home/index"
          options={{
            title: 'Ana Sayfa',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="home-outline" color={color} focused={focused} />
            ),
          }}
        />
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
          name="classroom/index"
          options={{
            title: 'Sınıfım',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="account-group-outline" color={color} focused={focused} />
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
          name="more/index"
          options={{
            title: 'Daha Fazla',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="dots-horizontal" color={color} focused={focused} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setMoreMenuVisible(true);
            },
          }}
        />

        <Tabs.Screen name="payments/index" options={{ href: null }} />
        <Tabs.Screen name="profile/index" options={{ href: null }} />
        <Tabs.Screen name="exams/index" options={{ href: null }} />
        <Tabs.Screen name="homework/index" options={{ href: null }} />
        <Tabs.Screen name="tutoring/index" options={{ href: null }} />
        <Tabs.Screen name="reports/index" options={{ href: null }} />

        <Tabs.Screen name="students/[id]" options={{ href: null }} />
        <Tabs.Screen name="students/new" options={{ href: null }} />
        <Tabs.Screen name="students/[id]/edit" options={{ href: null }} />
        <Tabs.Screen name="classroom/new" options={{ href: null }} />
        <Tabs.Screen name="classroom/[id]" options={{ href: null }} />
        <Tabs.Screen name="classroom/[id]/edit" options={{ href: null }} />
        <Tabs.Screen name="home/post-new" options={{ href: null }} />
        <Tabs.Screen name="profile/edit" options={{ href: null }} />
        <Tabs.Screen name="payments/[id]" options={{ href: null }} />
        <Tabs.Screen name="payments/new" options={{ href: null }} />
        <Tabs.Screen name="payments/[id]/edit" options={{ href: null }} />
      </Tabs>

      <MoreMenuSheet
        visible={moreMenuVisible}
        onDismiss={() => setMoreMenuVisible(false)}
        onNavigate={handleNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: colors.paperRaised,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.ink,
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
