import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

interface FilterSelectorProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  /** Używa mniejszych przycisków i mniejszej etykiety. */
  compact?: boolean;
  /** Zmniejsza odstęp pod sekcją. */
  dense?: boolean;
  /** Pozwala dopasować sekcję do marginesów reszty ekranu. */
  contentHorizontalInset?: number;
  /** `fitEqual` daje jeden równy rząd, a `scroll` przewijanie w bok. */
  layout?: 'scroll' | 'fitEqual';
}

/** Uniwersalny komponent do wybierania filtrów. */
export function FilterSelector<T extends string>({
  options,
  value,
  onChange,
  label,
  compact,
  dense,
  contentHorizontalInset = 4,
  layout = 'scroll',
}: FilterSelectorProps<T>) {
  const chips = options.map((opt) => {
    const active = opt === value;
    const chipStyle =
      layout === 'fitEqual'
        ? [styles.chipFit, compact && styles.chipFitCompact, active && styles.chipActive]
        : [styles.chip, active && styles.chipActive];
    const textStyle =
      layout === 'fitEqual'
        ? [styles.chipTextFit, compact && styles.chipTextFitCompact, active && styles.chipTextActive]
        : [styles.chipText, compact && styles.chipTextCompact, active && styles.chipTextActive];

    return (
      <TouchableOpacity key={opt} onPress={() => onChange(opt)} style={chipStyle} activeOpacity={0.85}>
        <Text
          style={textStyle}
          numberOfLines={1}
          adjustsFontSizeToFit={layout === 'fitEqual'}
          {...(layout === 'fitEqual' ? { minimumFontScale: 0.78 } : {})}
        >
          {opt}
        </Text>
      </TouchableOpacity>
    );
  });

  const body =
    layout === 'fitEqual' ? (
      <View style={styles.fitRowPanel}>
        <View style={[styles.rowFit, compact && styles.rowFitCompact]}>{chips}</View>
      </View>
    ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {chips}
      </ScrollView>
    );

  return (
    <View
      style={[
        styles.section,
        dense && styles.sectionDense,
        { paddingHorizontal: contentHorizontalInset },
      ]}
    >
      <Text style={[styles.sectionLabel, compact && styles.sectionLabelCompact]}>{label}</Text>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  sectionDense: {
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionLabelCompact: {
    fontSize: 12,
    marginLeft: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  fitRowPanel: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: '#1B2E1F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  rowFit: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'stretch',
    gap: 6,
  },
  rowFitCompact: {
    gap: 5,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipFit: {
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipFitCompact: {
    minHeight: 38,
    paddingVertical: 8,
    paddingHorizontal: 3,
    borderRadius: 10,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  chipTextCompact: {
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  chipTextFit: {
    width: '100%',
    textAlign: 'center',
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  chipTextFitCompact: {
    fontSize: 12,
  },
});
