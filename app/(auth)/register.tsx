// =============================================================================
// Ders Defteri — Register Screen
// =============================================================================

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { registerSchema, type RegisterFormValues } from '../../src/validation/authSchemas';
import { useAuth } from '../../src/hooks/useAuth';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../src/components/ui/AppTextInput';
import { AppButton } from '../../src/components/ui/AppButton';
import { ErrorMessage } from '../../src/components/ui/ErrorMessage';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function RegisterScreen() {
  const { signUp, error, isLoading, clearError } = useAuth();
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    clearError();
    try {
      await signUp(values.email, values.password, values.full_name);
      setSuccess(true);
    } catch {
      // error is set in the store
    }
  }

  if (success) {
    return (
      <ScreenWrapper scrollable style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.successCard}>
            <View style={styles.successTabStrip} />
            <View style={styles.successBody}>
              <View style={styles.successIconCircle}>
                <MaterialCommunityIcons name="email-check" size={44} color={colors.moss} />
              </View>
              <Text style={styles.successTitle}>Kayıt Başarılı!</Text>
              <Text style={styles.successText}>E-postanızı kontrol edin</Text>
              <Text style={styles.successSubtext}>
                Hesabınızı etkinleştirmek için e-postanıza gönderilen bağlantıya tıklayın.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              Hesabınızı onayladıktan sonra{' '}
            </Text>
            <Link href="/(auth)/login">
              <Text variant="bodyMedium" style={styles.link}>
                giriş yapın
              </Text>
            </Link>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable style={styles.safeArea}>
      <View style={styles.container}>
        {/* Hero header area */}
        <View style={styles.heroArea}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="notebook-plus" size={48} color={colors.seal} />
          </View>
          <Text style={styles.appTitle}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Ders Defteri'ne kayıt olun</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <View style={styles.cardTabStrip} />
          <View style={styles.cardBody}>
            <Controller
              control={control}
              name="full_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppTextInput
                  label="Ad Soyad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.full_name?.message}
                  autoComplete="name"
                />
              )}
            />

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
                  autoComplete="new-password"
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppTextInput
                  label="Şifre Tekrar"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  secureTextEntry
                  autoComplete="new-password"
                />
              )}
            />

            <ErrorMessage message={error} />

            <AppButton
              label="Kayıt Ol"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.button}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={styles.footerText}>
            Zaten hesabınız var mı?{' '}
          </Text>
          <Link href="/(auth)/login">
            <Text variant="bodyMedium" style={styles.link}>
              Giriş yapın
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
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.ink,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 0,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingBottom: spacing.xxxl,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: radius.lg,
    backgroundColor: colors.paper,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.6,
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
  successCard: {
    backgroundColor: colors.paperRaised,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  successTabStrip: {
    height: 5,
    backgroundColor: colors.moss,
  },
  successBody: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.mossSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.moss,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  successSubtext: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
