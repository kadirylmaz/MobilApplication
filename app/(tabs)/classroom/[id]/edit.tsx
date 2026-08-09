// =============================================================================
// Ders Defteri — Edit Group Screen
// =============================================================================

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { groupSchema, type GroupSchemaValues } from '../../../../src/validation/groupSchemas';
import { useGroups } from '../../../../src/hooks/useGroups';
import { ScreenWrapper } from '../../../../src/components/ui/ScreenWrapper';
import { AppTextInput } from '../../../../src/components/ui/AppTextInput';
import { AppButton } from '../../../../src/components/ui/AppButton';
import { ErrorMessage } from '../../../../src/components/ui/ErrorMessage';
import { HeaderBackButton } from '../../../../src/components/ui/HeaderBackButton';
import { colors } from '../../../../src/theme';

export default function EditGroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { groups, updateGroup, isLoading, error } = useGroups();
  const group = groups.find((g) => g.id === id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GroupSchemaValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (group) {
      reset({
        name: group.name,
        description: group.description ?? '',
      });
    }
  }, [group, reset]);

  async function onSubmit(values: GroupSchemaValues) {
    try {
      await updateGroup(id, {
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
        options={{ title: 'Grubu Düzenle', headerLeft: () => <HeaderBackButton /> }}
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
            label="Değişiklikleri Kaydet"
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
