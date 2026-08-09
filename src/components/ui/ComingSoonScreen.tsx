// =============================================================================
// Ders Defteri — ComingSoonScreen UI Bileşeni
// =============================================================================

import React from 'react';
import { ScreenWrapper } from './ScreenWrapper';
import { EmptyState } from './EmptyState';

interface ComingSoonScreenProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export function ComingSoonScreen({
  icon,
  title,
  subtitle = 'Bu özellik üzerinde çalışıyoruz. Çok yakında burada olacak.',
}: ComingSoonScreenProps) {
  return (
    <ScreenWrapper>
      <EmptyState icon={icon} title={`${title} yakında burada`} subtitle={subtitle} />
    </ScreenWrapper>
  );
}
