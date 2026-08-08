// =============================================================================
// Ders Defteri — Register Screen
// =============================================================================

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '../../src/validation/authSchemas';
import { useAuth } from '../../src/hooks/useAuth';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../src/components/ui/AppTextInput';
import { AppButton } from '../../src/components/ui/AppButton';
import { ErrorMessage } from '../../src/components/ui/ErrorMessage';

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
      <ScreenWrapper scrollable>
        <View style={styles.container}>
          <View style={styles.successBox}>
            <Text variant="headlineSmall" style={styles.successTitle}>
              Kayıt Başarılı!
            </Text>
            <Text variant="bodyLarge" style={styles.successText}>
              E-postanızı kontrol edin
            </Text>
            <Text variant="bodyMedium" style={styles.successSubtext}>
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
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Hesap Oluştur
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Ders Defteri'ne kayıt olun
          </Text>
        </View>

        <View style={styles.form}>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#6750A4',
    marginBottom: 8,
  },
  subtitle: {
    color: '#616161',
  },
  form: {
    gap: 4,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  footerText: {
    color: '#616161',
  },
  link: {
    color: '#6750A4',
    fontWeight: '600',
  },
  successBox: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
    marginBottom: 32,
  },
  successTitle: {
    fontWeight: '700',
    color: '#2E7D32',
  },
  successText: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  successSubtext: {
    textAlign: 'center',
    color: '#616161',
  },
});
