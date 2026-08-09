// =============================================================================
// Ders Defteri — Metro Bundler Yapılandırması
// =============================================================================
// @supabase/realtime-js, Node.js-only 'ws' paketini import ediyor. Metro bunu
// React Native ortamında çözmeye çalışınca 'stream' gibi Node core modüllerini
// bulamayıp patlıyor. Supabase'in resmi RN kurulum notu bu modülü devre dışı
// bırakmayı öneriyor: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
// =============================================================================

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_conditionNames = ['browser'];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ws: require.resolve('./src/lib/empty-module.js'),
};

module.exports = config;
