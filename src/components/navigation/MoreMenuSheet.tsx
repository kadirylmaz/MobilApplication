// =============================================================================
// Ders Defteri — MoreMenuSheet Bileşeni
// =============================================================================
// Alt tab bar'daki "Daha Fazla" sekmesine basılınca açılan, alttan yukarı
// beliren bir menü paneli. Yeni bağımlılık gerektirmez — react-native-paper'ın
// Portal/Modal bileşenleri kullanılır.
// =============================================================================

import React, { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, List, Modal, Portal, Text } from 'react-native-paper';
import { colors, radius } from '../../theme';

interface MenuItem {
  icon: string;
  label: string;
  path: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'wallet-outline', label: 'Ödemeler', path: '/(tabs)/payments' },
  { icon: 'file-document-edit-outline', label: 'Sınavlar', path: '/(tabs)/exams' },
  { icon: 'notebook-outline', label: 'Ödevlerim', path: '/(tabs)/homework' },
  { icon: 'account-group-outline', label: 'Etütlerim', path: '/(tabs)/tutoring' },
  { icon: 'chart-bar', label: 'Raporlar', path: '/(tabs)/reports' },
  { icon: 'account-outline', label: 'Profil', path: '/(tabs)/profile' },
];

interface MoreMenuSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onNavigate: (path: string) => void;
}

export function MoreMenuSheet({ visible, onDismiss, onNavigate }: MoreMenuSheetProps) {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        style={styles.modalWrapper}
        contentContainerStyle={styles.sheet}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>Daha Fazla</Text>
        {MENU_ITEMS.map((item, idx) => (
          <Fragment key={item.path}>
            <List.Item
              title={item.label}
              titleStyle={styles.itemLabel}
              left={(props) => <List.Icon {...props} icon={item.icon} color={colors.seal} />}
              onPress={() => onNavigate(item.path)}
            />
            {idx < MENU_ITEMS.length - 1 ? <Divider style={styles.divider} /> : null}
          </Fragment>
        ))}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  sheet: {
    backgroundColor: colors.paperRaised,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 8,
    paddingBottom: 28,
    paddingHorizontal: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 16,
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  divider: {
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
});
