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

const PRIMARY = '#5B4FCF';
const PRIMARY_LIGHT = '#EDE9FE';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';

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
      router.replace('/(tabs)/students');
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
            <MaterialCommunityIcons name="notebook" size={64} color={PRIMARY} />
          </View>
          <Text style={styles.appTitle}>Ders Defteri</Text>
          <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
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
    backgroundColor: '#F8F7FF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  heroArea: {
    alignItems: 'center',
    paddingVertical: 40,
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
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#5B4FCF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: PRIMARY,
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
    color: PRIMARY,
    fontWeight: '700',
  },
});
