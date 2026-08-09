// =============================================================================
// Ders Defteri — Profile Screen
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../src/hooks/useAuth';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { AppButton } from '../../../src/components/ui/AppButton';

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';
const ERROR = '#EF4444';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function ProfileScreen() {
  const router = useRouter();
  const { teacher, signOut, isLoading } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch {
      // error handled in store
    }
  }

  if (!teacher) {
    return (
      <ScreenWrapper style={styles.screenBg}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="account-alert" size={40} color={TEXT_SECONDARY} />
          </View>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Profil bilgisi yüklenemedi.
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const initials = getInitials(teacher.full_name);
  const formattedDate = teacher.created_at
    ? format(parseISO(teacher.created_at), 'dd MMMM yyyy', { locale: tr })
    : '';

  return (
    <ScreenWrapper scrollable style={styles.screenBg}>
      <View style={styles.container}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.fullName}>{teacher.full_name}</Text>
          {teacher.email ? (
            <View style={styles.emailRow}>
              <MaterialCommunityIcons name="email-outline" size={14} color={TEXT_SECONDARY} />
              <Text style={styles.email}>{teacher.email}</Text>
            </View>
          ) : null}
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          {teacher.phone ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <MaterialCommunityIcons name="phone" size={16} color={PRIMARY} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Telefon</Text>
                <Text style={styles.infoValue}>{teacher.phone}</Text>
              </View>
            </View>
          ) : null}

          {teacher.phone && formattedDate ? (
            <Divider style={styles.divider} />
          ) : null}

          {formattedDate ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <MaterialCommunityIcons name="calendar" size={16} color={PRIMARY} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Üyelik tarihi</Text>
                <Text style={styles.infoValue}>{formattedDate}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <AppButton
            label="Profili Düzenle"
            onPress={() => {}}
            mode="outlined"
            disabled
            style={styles.editButton}
          />
          <Text style={styles.comingSoon}>Faz 2'de eklenecek</Text>

          <AppButton
            label="Çıkış Yap"
            onPress={handleSignOut}
            loading={isLoading}
            mode="contained"
            style={styles.signOutButton}
          />
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
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    backgroundColor: PRIMARY_LIGHT,
    marginHorizontal: -16,
    marginTop: -16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: 8,
    marginBottom: 24,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 48,
    backgroundColor: 'rgba(91,79,207,0.15)',
    marginBottom: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fullName: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  email: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    fontWeight: '500',
  },
  infoCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: '600',
    marginTop: 1,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#E5E7EB',
  },
  actions: {
    marginTop: 28,
    paddingHorizontal: 16,
    gap: 4,
    alignItems: 'stretch',
  },
  editButton: {
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  comingSoon: {
    textAlign: 'center',
    color: TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 16,
  },
  signOutButton: {
    backgroundColor: ERROR,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: TEXT_SECONDARY,
  },
});
