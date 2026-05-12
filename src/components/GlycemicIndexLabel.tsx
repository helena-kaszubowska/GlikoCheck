import { StyleSheet, Text, View } from 'react-native';
import type { GiLevel } from '../types/product';
import { colors } from '../theme/colors';
import { GI_LEVEL_LABELS_PL } from '../utils/glycemic';

const LEVEL_COLORS: Record<GiLevel, string> = {
  low: colors.giLow,
  medium: colors.giMedium,
  high: colors.giHigh,
};

interface GlycemicIndexLabelProps {
  level: GiLevel;
  compact?: boolean;
}

/** Mała etykieta pokazująca poziom IG. */
export function GlycemicIndexLabel({ level, compact }: GlycemicIndexLabelProps) {
  const bg = LEVEL_COLORS[level];
  const label = GI_LEVEL_LABELS_PL[level];
  return (
    <View style={[styles.wrap, { backgroundColor: bg }, compact && styles.wrapCompact]}>
      <Text style={[styles.text, compact && styles.textCompact]}>{compact ? label : `IG: ${label}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  wrapCompact: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  textCompact: {
    fontSize: 12,
  },
});
