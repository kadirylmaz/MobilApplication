// =============================================================================
// Ders Defteri — LoadingOverlay UI Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

const PRIMARY = '#5B4FCF';

interface LoadingOverlayProps {
  visible?: boolean;
}

export function LoadingOverlay({ visible = true }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.spinnerCard}>
        <ActivityIndicator size="large" animating color={PRIMARY} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 247, 255, 0.88)',
    zIndex: 999,
  },
  spinnerCard: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
});
