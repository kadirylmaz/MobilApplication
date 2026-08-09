// =============================================================================
// Ders Defteri — Tasarım Sistemi
// =============================================================================
// Kimlik: sıcak kağıt zemin + koyu mürekkep tipografi + turuncu mühür vurgusu.
// Tüm ekranlar bu dosyadan renk/tipografi/boşluk token'larını kullanır —
// ekran içinde yerel PRIMARY/TEXT_PRIMARY sabitleri tanımlamayın.
// =============================================================================

import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';

export { colors } from './colors';
export { typography } from './typography';
export { spacing, radius, tabStripHeight } from './spacing';

export const paperTheme = {
  ...MD3LightTheme,
  roundness: 14,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.seal,
    onPrimary: '#FFFFFF',
    primaryContainer: colors.sealSoft,
    onPrimaryContainer: colors.sealDeep,
    secondary: colors.slate,
    onSecondary: '#FFFFFF',
    secondaryContainer: colors.slateSoft,
    onSecondaryContainer: colors.slate,
    background: colors.paper,
    surface: colors.paperRaised,
    surfaceVariant: colors.paperShade,
    onSurface: colors.ink,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    error: colors.rust,
    errorContainer: colors.rustSoft,
  },
};
