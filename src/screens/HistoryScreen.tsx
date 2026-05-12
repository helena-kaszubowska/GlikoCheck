import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductById } from '../data/products';
import type { ProductFlowParamList } from '../types/navigation';
import type { Product } from '../types/product';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { clearHistory, getHistoryIds } from '../storage/appStorage';
import { colors } from '../theme/colors';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

type Nav = NativeStackNavigationProp<ProductFlowParamList, 'ProductList'>;

/** Lista ostatnio oglądanych produktów zapisana na urządzeniu. */
export function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { isSmallDevice, isLandscape, inset, headerPad, contentMaxWidth } = useResponsiveLayout();
  const [items, setItems] = useState<Product[]>([]);

  const load = useCallback(async () => {
    const ids = await getHistoryIds();
    const list = ids.map((id) => getProductById(id)).filter((p): p is Product => Boolean(p));
    setItems(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onClear = async () => {
    await clearHistory();
    await load();
  };

  const listContentStyle = [
    styles.list,
    {
      paddingHorizontal: inset,
      ...(isLandscape
        ? { alignSelf: 'center' as const, width: '100%' as const, maxWidth: contentMaxWidth }
        : {}),
    },
  ];

  return (
    <SafeAreaView
      style={styles.safe}
      edges={isLandscape ? ['top', 'left', 'right'] : ['top']}
    >
      <View style={[styles.header, { paddingHorizontal: headerPad, paddingTop: isLandscape ? 4 : 8 }]}>
        <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>Historia</Text>
        <Text style={[styles.subtitle, isSmallDevice && styles.subtitleSmall]}>
          Ostatnio przeglądane produkty
        </Text>
        {items.length > 0 ? (
          <TouchableOpacity onPress={() => void onClear()} style={styles.clearWrap}>
            <Text style={styles.clearText}>Wyczyść historię</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {items.length === 0 ? (
        <EmptyState message="Brak historii wyszukiwania" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={listContentStyle}
          initialNumToRender={isLandscape ? 6 : 10}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              compact={isSmallDevice}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  titleSmall: {
    fontSize: 21,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  subtitleSmall: {
    fontSize: 13,
  },
  clearWrap: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  clearText: {
    color: colors.giHigh,
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    paddingBottom: 24,
  },
});
