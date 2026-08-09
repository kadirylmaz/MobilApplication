// =============================================================================
// Ders Defteri — New Group Screen
// =============================================================================

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { groupSchema, type GroupSchemaValues } from '../../../src/validation/groupSchemas';
import { useGroups } from '../../../src/hooks/useGroups';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../../src/components/ui/AppTextInput';
import { AppButton } from '../../../src/components/ui/AppButton';
import { ErrorMessage } from '../../../src/components/ui/ErrorMessage';
import { HeaderBackButton } from '../../../src/components/ui/HeaderBackButton';
import { colors } from '../../../src/theme';

export default function NewGroupScreen() {
  const router = useRouter();
  const { createGroup, isLoading, error } = useGroups();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupSchemaValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  async function onSubmit(values: GroupSchemaValues) {
    try {
      await createGroup({
        name: values.name,
        description: values.description ?? '',
      });
      router.back();
    } catch {
      // error is set in the store
    }
  }

  return (
    <>
      <Stack.Screen
        options={{ title: 'Yeni Grup', headerLeft: () => <HeaderBackButton /> }}
      />
      <ScreenWrapper scrollable style={styles.screenBg}>
        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Grup Adı *"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                placeholder="Örn: 10-A"
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Açıklama"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={3}
              />
            )}
          />

          <ErrorMessage message={error} />

          <AppButton
            label="Grup Oluştur"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  screenBg: {
    backgroundColor: colors.paper,
  },
  form: {
    gap: 4,
  },
  submitButton: {
    marginTop: 12,
  },
});
