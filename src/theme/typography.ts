// =============================================================================
// Ders Defteri — Tasarım Sistemi: Tipografi
// =============================================================================
// Özel font paketi eklemeden, sistem fontuyla belirgin bir hiyerarşi:
// başlıklarda geniş negatif letter-spacing + ağır kalınlık ("rozet" hissi),
// gövde metninde nötr, okunabilir ayar.
// =============================================================================

import { colors } from './colors';

export const typography = {
  display: {
    fontSize: 34,
    fontWeight: '800' as const,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  h1: {
    fontSize: 26,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  h3: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.textSecondary,
  },
  body: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.ink,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
} as const;
