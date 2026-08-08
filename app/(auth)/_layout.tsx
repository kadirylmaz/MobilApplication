// =============================================================================
// Ders Defteri — Auth Layout
// =============================================================================

import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

export default function AuthLayout() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/students');
    }
  }, [user, router]);

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: 'Giriş Yap',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Kayıt Ol',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
