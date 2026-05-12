import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface EmptyStateProps {
  message: string;
}

/** Prosty komunikat, gdy lista jest pusta. */
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
