import { useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductById } from '../data/products';
import type { ProductFlowParamList } from '../types/navigation';
import { GlycemicIndexLabel } from '../components/GlycemicIndexLabel';
import { colors } from '../theme/colors';
import {
  GI_LEVEL_LABELS_PL,
  LOAD_LABELS_PL,
  carbsInPortion,
  glycemicLoad,
  interpretGlycemicLoad,
} from '../utils/glycemic';
import {
  addFavoriteEntry,
  addProductToHistory,
  findFavoriteIdForPortion,
  removeFavoriteById,
} from '../storage/appStorage';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

type Props = NativeStackScreenProps<ProductFlowParamList, 'ProductDetail'>;
type ProductDetailData = NonNullable<ReturnType<typeof getProductById>>;
type CalcResult = { carbs: number; load: number };

function parsePortionGrams(text: string): number | null {
  const normalized = text.replace(',', '.').trim();
  if (!normalized) return null;
  const n = Number(normalized);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

function calculateResult(product: ProductDetailData, grams: number): CalcResult {
  const carbs = carbsInPortion(product.carbsPer100g, grams);
  return { carbs, load: glycemicLoad(product.glycemicIndex, carbs) };
}

/** Sprawdza, czy pokazany wynik nadal pasuje do aktualnie wpisanej porcji. */
function isResultFresh(
  product: ProductDetailData,
  portionText: string,
  result: CalcResult,
): boolean {
  const grams = parsePortionGrams(portionText);
  if (grams === null) return false;
  const next = calculateResult(product, grams);
  return Math.abs(next.carbs - result.carbs) < 0.06 && Math.abs(next.load - result.load) < 0.06;
}

export function ProductDetailScreen({ route, navigation }: Props) {
  const { productId, initialPortionGrams } = route.params;
  const { isSmallDevice, isLandscape, inset, contentMaxWidth } = useResponsiveLayout();
  /** Na małych ekranach i w poziomie pokazany jest węższy układ. */
  const compactAfterCalc = isSmallDevice || isLandscape;
  const product = getProductById(productId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: product?.name ?? 'Szczegóły produktu' });
  }, [navigation, product]);

  const [portionText, setPortionText] = useState('');
  const [portionError, setPortionError] = useState<string | null>(null);
  const [result, setResult] = useState<CalcResult | null>(null);
  /** Id wpisu w ulubionych dla tej dokładnej porcji, jeśli już istnieje. */
  const [favoriteRowId, setFavoriteRowId] = useState<string | null>(null);

  useEffect(() => {
    setPortionError(null);
    setFavoriteRowId(null);
    if (!product || initialPortionGrams == null || initialPortionGrams <= 0) {
      setPortionText('');
      setResult(null);
      return;
    }
    setPortionText(String(initialPortionGrams));
    setResult(calculateResult(product, initialPortionGrams));
  }, [productId, product, initialPortionGrams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const grams = parsePortionGrams(portionText);
      await addProductToHistory(productId);
      if (!product || !result || grams === null) {
        if (!cancelled) setFavoriteRowId(null);
        return;
      }
      if (!isResultFresh(product, portionText, result)) {
        if (!cancelled) setFavoriteRowId(null);
        return;
      }
      const fid = await findFavoriteIdForPortion(productId, grams);
      if (!cancelled) setFavoriteRowId(fid);
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, product, portionText, result]);

  async function refreshFavoriteMeta() {
    const grams = parsePortionGrams(portionText);
    if (product && result && grams !== null && isResultFresh(product, portionText, result)) {
      setFavoriteRowId(await findFavoriteIdForPortion(productId, grams));
    } else {
      setFavoriteRowId(null);
    }
  }

  async function onAddFavorite() {
    if (!product || !result) return;
    const grams = parsePortionGrams(portionText);
    if (grams === null || !isResultFresh(product, portionText, result)) return;
    const existing = await findFavoriteIdForPortion(productId, grams);
    if (existing) return;

    const interp = interpretGlycemicLoad(result.load);
    await addFavoriteEntry({
      productId,
      portionGrams: grams,
      carbsInPortion: result.carbs,
      glycemicLoad: result.load,
      loadInterpretation: interp,
    });
    await refreshFavoriteMeta();
  }

  async function onRemoveFavorite() {
    if (!favoriteRowId) return;
    await removeFavoriteById(favoriteRowId);
    setFavoriteRowId(null);
    await refreshFavoriteMeta();
  }

  function onCalculate() {
    if (!product) return;
    const grams = parsePortionGrams(portionText);
    if (grams === null) {
      setPortionError('Podaj liczbę większą od 0 (masa porcji w gramach).');
      setResult(null);
      return;
    }
    setPortionError(null);
    setResult(calculateResult(product, grams));
  }

  function submitCalculation() {
    onCalculate();
    Keyboard.dismiss();
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safe} edges={isLandscape ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom']}>
        <Text style={[styles.missing, { paddingHorizontal: inset }]}>Nie znaleziono produktu.</Text>
      </SafeAreaView>
    );
  }

  const interp = result ? interpretGlycemicLoad(result.load) : null;
  const interpColor =
    interp === 'low'
      ? colors.loadLow
      : interp === 'medium'
        ? colors.loadMedium
        : interp === 'high'
          ? colors.loadHigh
          : colors.textSecondary;

  const canSaveFavorite = !!result && isResultFresh(product, portionText, result);

  const alreadySavedThisPortion = Boolean(favoriteRowId);
  const hasCalcResult = !!result && interp !== null;

  const scrollPad = isSmallDevice ? 14 : 20;
  const scrollBottomPad = hasCalcResult ? 0 : isLandscape ? 24 : 40;
  const scrollContentStyle = {
    width: '100%' as const,
    paddingTop: scrollPad,
    paddingHorizontal: scrollPad,
    paddingBottom: scrollBottomPad,
    ...(isLandscape ? { alignSelf: 'center' as const, maxWidth: contentMaxWidth } : {}),
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={isLandscape ? ['bottom', 'left', 'right', 'top'] : ['bottom', 'left', 'right']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={scrollContentStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        <Text style={[styles.name, isSmallDevice && styles.nameSmall, isLandscape && styles.nameLandscape]}>
          {product.name}
        </Text>
        <Text style={[styles.meta, isSmallDevice && styles.metaSmall]}>Kategoria: {product.category}</Text>
        <View style={styles.rowBadges}>
          <Text style={[styles.meta, isSmallDevice && styles.metaSmall]}>
            Indeks glikemiczny: {product.glycemicIndex}
          </Text>
          <GlycemicIndexLabel level={product.giLevel} />
        </View>
        <Text style={[styles.meta, isSmallDevice && styles.metaSmall]}>
          Poziom IG: {GI_LEVEL_LABELS_PL[product.giLevel]}
        </Text>
        <Text style={[styles.meta, isSmallDevice && styles.metaSmall]}>
          Węglowodany na 100 g: {product.carbsPer100g} g
        </Text>

        <Text style={[styles.description, isSmallDevice && styles.descriptionSmall]}>{product.description}</Text>

        <Text
          style={[
            styles.sectionTitle,
            isSmallDevice && styles.sectionTitleSmall,
            compactAfterCalc && styles.sectionTitleCompact,
          ]}
        >
          Kalkulator ładunku glikemicznego
        </Text>
        <Text
          style={[styles.hint, isSmallDevice && styles.hintSmall, compactAfterCalc && styles.hintCompact]}
        >
          Wpisz masę porcji w gramach.
        </Text>
        <TextInput
          value={portionText}
          onChangeText={(t) => {
            setPortionText(t);
            setPortionError(null);
          }}
          placeholder="np. 120"
          keyboardType="decimal-pad"
          style={[styles.input, isSmallDevice && styles.inputSmall]}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="done"
          submitBehavior="submit"
          onSubmitEditing={submitCalculation}
        />
        {portionError ? <Text style={styles.error}>{portionError}</Text> : null}

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={submitCalculation}
          activeOpacity={0.9}
        >
          <Text style={styles.btnPrimaryText} numberOfLines={2}>
            Oblicz ładunek glikemiczny
          </Text>
        </TouchableOpacity>

        {result && interp ? (
          <View
            style={[
              styles.afterCalcCard,
              isSmallDevice && styles.afterCalcCardSmall,
              compactAfterCalc && styles.afterCalcCardDense,
            ]}
          >
            <View
              style={[
                styles.resultBlock,
                compactAfterCalc && styles.resultBlockDense,
                { borderLeftColor: interpColor },
              ]}
            >
              <Text
                style={[
                  styles.resultLine,
                  isSmallDevice && styles.resultLineSmall,
                  compactAfterCalc && styles.resultLineCompact,
                ]}
              >
                Węglowodany w porcji:{' '}
                <Text style={styles.resultEm}>{result.carbs.toFixed(1)} g</Text>
              </Text>
              <Text
                style={[
                  styles.resultLine,
                  isSmallDevice && styles.resultLineSmall,
                  compactAfterCalc && styles.resultLineCompact,
                ]}
              >
                Ładunek glikemiczny (ŁG):{' '}
                <Text style={styles.resultEm}>{result.load.toFixed(1)}</Text>
              </Text>
              <Text
                style={[
                  styles.interpretation,
                  isSmallDevice && styles.interpretationSmall,
                  compactAfterCalc && styles.interpretationCompact,
                  { color: interpColor },
                ]}
              >
                Ocena: {LOAD_LABELS_PL[interp]}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.btnSecondary,
                styles.btnInAfterCalc,
                compactAfterCalc && styles.btnSecondaryInCardCompact,
                alreadySavedThisPortion && styles.btnSecondaryDisabled,
                !canSaveFavorite && styles.btnSecondaryDisabled,
              ]}
              onPress={() => {
                void onAddFavorite();
              }}
              disabled={!canSaveFavorite || alreadySavedThisPortion}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.btnSecondaryText,
                  styles.btnSecondaryTextInCard,
                  (!canSaveFavorite || alreadySavedThisPortion) && styles.btnSecondaryTextDisabled,
                ]}
                numberOfLines={2}
              >
                Dodaj do ulubionych
              </Text>
            </TouchableOpacity>

            {alreadySavedThisPortion ? (
              <TouchableOpacity
                style={[
                  styles.btnRemoveFavorite,
                  styles.btnInAfterCalc,
                  styles.btnStackGap,
                  compactAfterCalc && styles.btnRemoveFavoriteTight,
                ]}
                onPress={() => {
                  void onRemoveFavorite();
                }}
                activeOpacity={0.9}
              >
                <Text style={styles.btnRemoveFavoriteText} numberOfLines={2}>
                  Usuń z ulubionych
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.linkBtn, styles.linkBtnInCard]}
              onPress={() =>
                Alert.alert(
                  'Skala ŁG',
                  'ŁG 0–10: niski\nŁG 11–19: średni\nŁG 20 i więcej: wysoki\n\n',
                )
              }
            >
              <Text style={[styles.linkText, isSmallDevice && styles.linkTextSmall]}>Jak czytać wynik ŁG?</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  missing: {
    paddingVertical: 24,
    fontSize: 16,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  nameSmall: {
    fontSize: 22,
  },
  nameLandscape: {
    fontSize: 24,
  },
  meta: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  metaSmall: {
    fontSize: 14,
  },
  rowBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  descriptionSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionTitleSmall: {
    fontSize: 17,
    marginTop: 18,
  },
  sectionTitleCompact: {
    marginTop: 16,
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  hintSmall: {
    fontSize: 13,
  },
  hintCompact: {
    marginTop: 6,
  },
  input: {
    marginTop: 10,
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  inputSmall: {
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  error: {
    marginTop: 8,
    color: colors.giHigh,
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimary: {
    marginTop: 16,
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
    width: '100%',
    textAlign: 'center',
  },
  afterCalcCard: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  afterCalcCardSmall: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  afterCalcCardDense: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  resultBlock: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderLeftWidth: 4,
    paddingLeft: 10,
  },
  resultBlockDense: {
    marginBottom: 6,
    paddingBottom: 6,
    paddingLeft: 8,
    borderLeftWidth: 3,
  },
  resultLine: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 6,
  },
  resultLineSmall: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultLineCompact: {
    fontSize: 14,
    marginBottom: 3,
  },
  resultEm: {
    fontWeight: '800',
  },
  interpretation: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  interpretationSmall: {
    fontSize: 14,
    marginTop: 2,
  },
  interpretationCompact: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 0,
  },
  btnInAfterCalc: {
    marginTop: 0,
    alignSelf: 'stretch',
  },
  btnStackGap: {
    marginTop: 8,
  },
  btnRemoveFavoriteTight: {
    paddingVertical: 7,
  },
  btnRemoveFavorite: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.giHigh,
    backgroundColor: colors.background,
    alignSelf: 'stretch',
  },
  btnRemoveFavoriteText: {
    color: colors.giHigh,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
    width: '100%',
    textAlign: 'center',
  },
  btnSecondary: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    alignSelf: 'stretch',
  },
  btnSecondaryDisabled: {
    borderColor: colors.border,
    backgroundColor: '#F0F0F0',
  },
  btnSecondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
    width: '100%',
    textAlign: 'center',
  },
  btnSecondaryTextInCard: {
    fontSize: 15,
    paddingHorizontal: 4,
  },
  btnSecondaryInCardCompact: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  btnSecondaryTextDisabled: {
    color: colors.textSecondary,
  },
  linkBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkBtnInCard: {
    marginTop: 8,
    marginBottom: 0,
    paddingVertical: 0,
    paddingBottom: 0,
    alignSelf: 'stretch',
  },
  linkText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  linkTextSmall: {
    fontSize: 13,
  },
});
