import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Product } from '../types/product';
import { colors } from '../theme/colors';
import { GlycemicIndexLabel } from './GlycemicIndexLabel';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  /** Węższy układ na małych ekranach. */
  compact?: boolean;
}

/** Karta produktu na listach (główna, ulubione, historia). */
export function ProductCard({ product, onPress, compact }: ProductCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.cardCompact, pressed && styles.cardPressed]}
    >
      <View style={styles.row}>
        <View style={styles.main}>
          <Text style={[styles.name, compact && styles.nameCompact]}>{product.name}</Text>
          <Text style={[styles.category, compact && styles.categoryCompact]}>{product.category}</Text>
          <Text style={[styles.gi, compact && styles.giCompact]}>IG: {product.glycemicIndex}</Text>
        </View>
        <GlycemicIndexLabel level={product.giLevel} compact />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 10,
    borderRadius: 12,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  main: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  nameCompact: {
    fontSize: 16,
  },
  category: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  categoryCompact: {
    fontSize: 13,
  },
  gi: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  giCompact: {
    fontSize: 14,
  },
});
