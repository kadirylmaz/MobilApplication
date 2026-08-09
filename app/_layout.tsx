// =============================================================================
// Ders Defteri — Root Layout
// =============================================================================

import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { LoadingOverlay } from '../src/components/ui/LoadingOverlay';
import { paperTheme } from '../src/theme';

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const status = useAuthStore((s) => s.status);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initialize();
    }
  }, [initialize]);

  // Show loading overlay only during the very first initialization
  const showLoading = status === 'loading';

  return (
    <GestureHandlerRootView style={styles.root}>
      <PaperProvider theme={paperTheme}>
        <Stack screenOptions={{ headerShown: false }} />
        <LoadingOverlay visible={showLoading} />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
