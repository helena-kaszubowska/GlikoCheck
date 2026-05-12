import { useWindowDimensions } from 'react-native';

/** Zwraca informacje i pomocnicze wartości do responsywnego układu. */
export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  const isSmallDevice = width < 380;
  const isLandscape = width > height;
  const inset = isSmallDevice ? 12 : 16;
  const headerPad = isSmallDevice ? 14 : 20;
  /** W poziomie treść jest zwężona, żeby łatwiej się ją czytało. */
  const contentMaxWidth = isLandscape ? Math.min(720, Math.max(width - inset * 2, 320)) : width;

  return {
    isSmallDevice,
    isLandscape,
    inset,
    headerPad,
    contentMaxWidth,
  };
}
