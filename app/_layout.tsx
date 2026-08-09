// =============================================================================
// Ders Defteri — Root Layout
// =============================================================================

import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { LoadingOverlay } from '../src/components/ui/LoadingOverlay';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#5B4FCF',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EDE9FE',
    onPrimaryContainer: '#1E1B4B',
    secondary: '#7C6FE0',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#EDE9FE',
    onSecondaryContainer: '#1E1B4B',
  },
};

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
      <PaperProvider theme={theme}>
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
