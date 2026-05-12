import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductById } from '../data/products';
import type { ProductFlowParamList } from '../types/navigation';
import type { FavoriteEntry } from '../types/favorite';
import { EmptyState } from '../components/EmptyState';
import { getFavoriteEntries, removeFavoriteById } from '../storage/appStorage';
import { colors } from '../theme/colors';
import { LOAD_LABELS_PL } from '../utils/glycemic';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

type Nav = NativeStackNavigationProp<ProductFlowParamList, 'ProductList'>;

function loadColor(key: FavoriteEntry['loadInterpretation']) {
  if (key === 'low') return colors.loadLow;
  if (key === 'medium') return colors.loadMedium;
  return colors.loadHigh;
}

export function FavoritesScreen() {
  const navigation = useNavigation<Nav>();
  const { isSmallDevice, isLandscape, inset, headerPad, contentMaxWidth } = useResponsiveLayout();
  const [entries, setEntries] = useState<FavoriteEntry[]>([]);

  const load = useCallback(async () => {
    setEntries(await getFavoriteEntries());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

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
        <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>Ulubione</Text>
        <Text
          style={[styles.subtitle, isSmallDevice && styles.subtitleSmall]}
          numberOfLines={isSmallDevice ? 2 : 3}
        >
          Zapisane porcje z obliczonym ŁG (lokalnie na urządzeniu)
        </Text>
      </View>

      {entries.length === 0 ? (
        <EmptyState message="Brak ulubionych produktów" />
      ) : (
        <FlatList
          style={styles.listFlex}
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={listContentStyle}
          initialNumToRender={isLandscape ? 5 : 8}
          renderItem={({ item }) => {
            const product = getProductById(item.productId);
            const name = product?.name ?? 'Nieznany produkt';
            const border = loadColor(item.loadInterpretation);
            return (
              <View style={styles.cardWrap}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('ProductDetail', {
                      productId: item.productId,
                      initialPortionGrams: item.portionGrams,
                    })
                  }
                  style={({ pressed }) => [
                    styles.card,
                    isSmallDevice && styles.cardCompact,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <Text
                    style={[styles.cardTitle, isSmallDevice && styles.cardTitleSmall]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {name}
                  </Text>
                  <Text style={[styles.cardLine, isSmallDevice && styles.cardLineSmall]}>
                    Porcja: {item.portionGrams} g
                  </Text>
                  <Text style={[styles.cardLine, isSmallDevice && styles.cardLineSmall]}>
                    Węglowodany w porcji: {item.carbsInPortion.toFixed(1)} g
                  </Text>
                  <Text style={[styles.cardLine, isSmallDevice && styles.cardLineSmall]}>
                    ŁG: <Text style={styles.lgEm}>{item.glycemicLoad.toFixed(1)}</Text>
                  </Text>
                  <Text style={[styles.cardInterp, isSmallDevice && styles.cardInterpSmall, { color: border }]}>
                    {LOAD_LABELS_PL[item.loadInterpretation]}
                  </Text>
                </Pressable>
                <TouchableOpacity
                  style={[styles.removeBtn, isSmallDevice && styles.removeBtnSmall]}
                  onPress={async () => {
                    await removeFavoriteById(item.id);
                    await load();
                  }}
                >
                  <Text style={styles.removeText} numberOfLines={1}>
                    Usuń z ulubionych
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  listFlex: {
    flex: 1,
    minHeight: 0,
    width: '100%',
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
    lineHeight: 20,
  },
  subtitleSmall: {
    fontSize: 13,
    lineHeight: 18,
  },
  list: {
    paddingBottom: 24,
  },
  cardWrap: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#1B2E1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardCompact: {
    padding: 12,
    borderRadius: 12,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    flexShrink: 1,
    width: '100%',
  },
  cardTitleSmall: {
    fontSize: 16,
    marginBottom: 8,
  },
  cardLine: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  cardLineSmall: {
    fontSize: 14,
  },
  lgEm: {
    fontWeight: '800',
    color: colors.text,
  },
  cardInterp: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
  },
  cardInterpSmall: {
    fontSize: 14,
    marginTop: 6,
  },
  removeBtn: {
    alignSelf: 'stretch',
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.giHigh,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnSmall: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  removeText: {
    color: colors.giHigh,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
    paddingHorizontal: 4,
  },
});
