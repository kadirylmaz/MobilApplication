// =============================================================================
// Ders Defteri — "Daha Fazla" Dummy Route
// =============================================================================
// Bu ekrana normal şartlarda HİÇ gidilmez: (tabs)/_layout.tsx içindeki
// "Daha Fazla" sekmesi tabPress olayını preventDefault() ile keser ve
// bunun yerine MoreMenuSheet panelini açar. Bu dosya yalnızca Expo Router'ın
// route ağacında bir Tabs.Screen için karşılık gelen dosya bulabilmesi için var.
// =============================================================================

import { Redirect } from 'expo-router';

export default function MorePlaceholderScreen() {
  return <Redirect href="/(tabs)/home" />;
}
