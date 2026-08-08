// =============================================================================
// Ders Defteri — Profile Screen
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { useAuth } from '../../../src/hooks/useAuth';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { AppButton } from '../../../src/components/ui/AppButton';

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
      <ScreenWrapper>
        <View style={styles.emptyContainer}>
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
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text variant="headlineSmall" style={styles.fullName}>
            {teacher.full_name}
          </Text>
          {teacher.email ? (
            <Text variant="bodyMedium" style={styles.email}>
              {teacher.email}
            </Text>
          ) : null}
        </View>

        <Surface style={styles.infoCard} elevation={1}>
          {teacher.phone ? (
            <View style={styles.infoRow}>
              <Text variant="labelMedium" style={styles.infoLabel}>
                Telefon
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {teacher.phone}
              </Text>
            </View>
          ) : null}

          {teacher.phone && formattedDate ? (
            <Divider style={styles.divider} />
          ) : null}

          {formattedDate ? (
            <View style={styles.infoRow}>
              <Text variant="labelMedium" style={styles.infoLabel}>
                Üyelik tarihi:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {formattedDate}
              </Text>
            </View>
          ) : null}
        </Surface>

        <View style={styles.actions}>
          <AppButton
            label="Profili Düzenle"
            onPress={() => {}}
            mode="outlined"
            disabled
            style={styles.editButton}
          />
          <Text variant="bodySmall" style={styles.comingSoon}>
            Faz 2'de eklenecek
          </Text>

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
  container: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#6750A4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fullName: {
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  email: {
    color: '#616161',
    textAlign: 'center',
  },
  infoCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 16,
  },
  infoLabel: {
    color: '#9E9E9E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
  divider: {
    marginVertical: 8,
  },
  actions: {
    marginTop: 32,
    paddingHorizontal: 16,
    gap: 4,
    alignItems: 'stretch',
  },
  editButton: {
    borderColor: '#BDBDBD',
  },
  comingSoon: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginBottom: 16,
  },
  signOutButton: {
    backgroundColor: '#B00020',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9E9E9E',
  },
});
