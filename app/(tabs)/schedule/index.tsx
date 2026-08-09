// =============================================================================
// Ders Defteri — Schedule Screen (Placeholder)
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';

export default function ScheduleScreen() {
  return (
    <ScreenWrapper style={styles.screenBg}>
      <View style={styles.container}>
        <View style={styles.illustrationCard}>
          <View style={styles.iconBg}>
            <MaterialCommunityIcons name="calendar-clock" size={56} color={PRIMARY} />
          </View>
          <Text style={styles.title}>Program</Text>
          <Text style={styles.subtitle}>
            Haftalık ders programınızı buradan takip edebileceksiniz.
          </Text>
          <View style={styles.comingBadge}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={PRIMARY} />
            <Text style={styles.comingText}>Faz 2'de eklenecek</Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screenBg: {
    backgroundColor: '#F8F7FF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  illustrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    gap: 12,
    width: '100%',
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  comingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  comingText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
});
