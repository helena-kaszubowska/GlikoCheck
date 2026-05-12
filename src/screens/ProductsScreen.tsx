import { useState } from 'react';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORY_FILTERS } from '../data/categories';
import { products } from '../data/products';
import type { ProductFlowParamList } from '../types/navigation';
import type { GiLevel } from '../types/product';
import { ProductCard } from '../components/ProductCard';
import { FilterSelector } from '../components/FilterSelector';
import { colors } from '../theme/colors';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { productMatchesTokens, searchTokens } from '../utils/search';

type Nav = NativeStackNavigationProp<ProductFlowParamList, 'ProductList'>;

const GI_FILTER_LABELS = ['Wszystkie', 'Niski', 'Średni', 'Wysoki'] as const;
type GiFilterLabel = (typeof GI_FILTER_LABELS)[number];

function giLabelToLevel(label: GiFilterLabel): GiLevel | null {
  switch (label) {
    case 'Niski':
      return 'low';
    case 'Średni':
      return 'medium';
    case 'Wysoki':
      return 'high';
    default:
      return null;
  }
}

type ProductsListHeaderProps = {
  query: string;
  onQueryChange: (q: string) => void;
  giFilter: GiFilterLabel;
  onGiFilterChange: (v: GiFilterLabel) => void;
  category: (typeof CATEGORY_FILTERS)[number];
  onCategoryChange: (v: (typeof CATEGORY_FILTERS)[number]) => void;
  isSmallDevice: boolean;
  isLandscape: boolean;
  inset: number;
  headerPad: number;
};

function ProductsListHeader({
  query,
  onQueryChange,
  giFilter,
  onGiFilterChange,
  category,
  onCategoryChange,
  isSmallDevice,
  isLandscape,
  inset,
  headerPad,
}: ProductsListHeaderProps) {
  const chipCompact = isSmallDevice || isLandscape;
  const giSectionHorizontalInset = Math.max(4, inset - 8);
  return (
    <>
      <View
        style={[styles.header, { paddingHorizontal: headerPad }, isLandscape && styles.headerLandscape]}
      >
        <Text
          style={[styles.title, isSmallDevice && styles.titleSmall, isLandscape && styles.titleLandscape]}
        >
          GlikoCheck
        </Text>
        <Text
          style={[styles.subtitle, isSmallDevice && styles.subtitleSmall]}
          numberOfLines={isLandscape ? 1 : 4}
        >
          Sprawdź indeks i ładunek glikemiczny produktów
        </Text>
      </View>

      <View style={[styles.searchWrap, { paddingHorizontal: inset }, isLandscape && styles.searchWrapLandscape]}>
        <View style={[styles.searchBox, isSmallDevice && styles.searchBoxSmall]}>
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder="Szukaj produktu…"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.searchInput,
              isSmallDevice && styles.searchInputSmall,
              isLandscape && styles.searchInputLandscape,
              query.length > 0 && styles.searchInputWithClear,
            ]}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            submitBehavior="submit"
            onSubmitEditing={() => Keyboard.dismiss()}
            disableFullscreenUI
          />
          {query.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                onQueryChange('');
                Keyboard.dismiss();
              }}
              style={styles.searchClearInside}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Wyczyść wyszukiwanie"
            >
              <Text style={styles.searchClearText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FilterSelector
        label="Poziom IG"
        options={GI_FILTER_LABELS}
        value={giFilter}
        onChange={onGiFilterChange}
        compact={chipCompact}
        dense={isLandscape}
        contentHorizontalInset={giSectionHorizontalInset}
        layout="fitEqual"
      />
      <FilterSelector
        label="Kategoria"
        options={CATEGORY_FILTERS}
        value={category}
        onChange={onCategoryChange}
        compact={chipCompact}
        dense={isLandscape}
        contentHorizontalInset={inset}
        layout="scroll"
      />
    </>
  );
}

/** Główny ekran z wyszukiwaniem, filtrami i listą produktów. */
export function ProductsScreen() {
  const navigation = useNavigation<Nav>();
  const { isSmallDevice, isLandscape, inset, headerPad, contentMaxWidth } = useResponsiveLayout();
  const [query, setQuery] = useState('');
  const [giFilter, setGiFilter] = useState<GiFilterLabel>('Wszystkie');
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]>('Wszystkie');

  const level = giLabelToLevel(giFilter);
  const tokens = searchTokens(query);
  const filtered = products
    .filter((p) => {
      if (level && p.giLevel !== level) return false;
      if (category !== 'Wszystkie' && p.category !== category) return false;
      return productMatchesTokens(p, tokens);
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'pl', { sensitivity: 'base' }));

  const listContentStyle = [
    styles.list,
    {
      paddingHorizontal: inset,
      ...(isLandscape
        ? { alignSelf: 'center' as const, width: '100%' as const, maxWidth: contentMaxWidth }
        : {}),
      flexGrow: filtered.length === 0 ? 1 : undefined,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={isLandscape ? ['top', 'left', 'right'] : ['top']}>
      <FlatList
        style={styles.flex1}
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <ProductsListHeader
            query={query}
            onQueryChange={setQuery}
            giFilter={giFilter}
            onGiFilterChange={setGiFilter}
            category={category}
            onCategoryChange={setCategory}
            isSmallDevice={isSmallDevice}
            isLandscape={isLandscape}
            inset={inset}
            headerPad={headerPad}
          />
        }
        contentContainerStyle={listContentStyle}
        initialNumToRender={isLandscape ? 6 : 14}
        maxToRenderPerBatch={12}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            compact={isSmallDevice}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Brak produktów spełniających kryteria.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLandscape: {
    paddingTop: 4,
    paddingBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  titleSmall: {
    fontSize: 24,
  },
  titleLandscape: {
    fontSize: 26,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  subtitleSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  searchWrap: {
    marginBottom: 12,
  },
  searchWrapLandscape: {
    marginBottom: 8,
  },
  searchBox: {
    position: 'relative',
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchBoxSmall: {
    borderRadius: 11,
  },
  searchInput: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 0,
    color: colors.text,
    backgroundColor: 'transparent',
  },
  searchInputWithClear: {
    paddingRight: 44,
  },
  searchInputSmall: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  searchInputLandscape: {
    paddingVertical: 8,
    fontSize: 15,
  },
  searchClearInside: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchClearText: {
    fontSize: 17,
    lineHeight: 20,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  list: {
    paddingBottom: 24,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 15,
    color: colors.textSecondary,
  },
});
