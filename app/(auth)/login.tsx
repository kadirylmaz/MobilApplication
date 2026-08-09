// =============================================================================
// Ders Defteri — Login Screen
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loginSchema, type LoginFormValues } from '../../src/validation/authSchemas';
import { useAuth } from '../../src/hooks/useAuth';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../src/components/ui/AppTextInput';
import { AppButton } from '../../src/components/ui/AppButton';
import { ErrorMessage } from '../../src/components/ui/ErrorMessage';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, error, isLoading, clearError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    clearError();
    try {
      await signIn(values.email, values.password);
      router.replace('/(tabs)/home');
    } catch {
      // error is set in the store
    }
  }

  return (
    <ScreenWrapper scrollable style={styles.safeArea}>
      <View style={styles.container}>
        {/* Hero header area */}
        <View style={styles.heroArea}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="notebook" size={52} color={colors.seal} />
          </View>
          <Text style={styles.eyebrow}>ÖĞRETMEN PANELİ</Text>
          <Text style={styles.appTitle}>Ders Defteri</Text>
          <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <View style={styles.cardTabStrip} />
          <View style={styles.cardBody}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppTextInput
                  label="E-posta"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppTextInput
                  label="Şifre"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                  autoComplete="password"
                />
              )}
            />

            <ErrorMessage message={error} />

            <AppButton
              label="Giriş Yap"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={styles.footerText}>
            Hesabınız yok mu?{' '}
          </Text>
          <Link href="/(auth)/register">
            <Text variant="bodyMedium" style={styles.link}>
              Kayıt olun
            </Text>
          </Link>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.paper,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  heroArea: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.ink,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 0,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingBottom: spacing.xxxl + 8,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    backgroundColor: colors.paper,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.sealSoft,
    marginBottom: spacing.sm,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.paperRaised,
    borderRadius: radius.xl,
    marginHorizontal: 0,
    marginTop: -28,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTabStrip: {
    height: 5,
    backgroundColor: colors.seal,
  },
  cardBody: {
    padding: spacing.xl,
  },
  button: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
    flexWrap: 'wrap',
  },
  footerText: {
    color: colors.textSecondary,
  },
  link: {
    color: colors.seal,
    fontWeight: '700',
  },
});
