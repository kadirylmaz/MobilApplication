// =============================================================================
// Ders Defteri — LoadingOverlay UI Bileşeni
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { colors, radius } from '../../theme';

interface LoadingOverlayProps {
  visible?: boolean;
}

export function LoadingOverlay({ visible = true }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.spinnerCard}>
        <ActivityIndicator size="large" animating color={colors.seal} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 251, 246, 0.9)',
    zIndex: 999,
  },
  spinnerCard: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.paperRaised,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
});
