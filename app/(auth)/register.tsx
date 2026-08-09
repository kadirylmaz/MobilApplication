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

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const SUCCESS = '#10B981';
const TEXT_SECONDARY = '#6B7280';

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
            <View style={styles.successIconCircle}>
              <MaterialCommunityIcons name="email-check" size={48} color={SUCCESS} />
            </View>
            <Text style={styles.successTitle}>Kayıt Başarılı!</Text>
            <Text style={styles.successText}>E-postanızı kontrol edin</Text>
            <Text style={styles.successSubtext}>
              Hesabınızı etkinleştirmek için e-postanıza gönderilen bağlantıya tıklayın.
            </Text>
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
            <MaterialCommunityIcons name="notebook" size={56} color={PRIMARY} />
          </View>
          <Text style={styles.appTitle}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Ders Defteri'ne kayıt olun</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
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
    backgroundColor: '#F8F7FF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  heroArea: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#EDE9FE',
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 48,
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5B4FCF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 0,
    marginTop: -24,
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    flexWrap: 'wrap',
  },
  footerText: {
    color: TEXT_SECONDARY,
  },
  link: {
    color: '#5B4FCF',
    fontWeight: '700',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: SUCCESS,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  successSubtext: {
    textAlign: 'center',
    color: TEXT_SECONDARY,
    lineHeight: 22,
  },
});
