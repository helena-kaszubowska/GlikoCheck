import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

/** Ekran z krótkim wyjaśnieniem IG, ŁG i działania aplikacji. */
export function AboutScreen() {
  const { isSmallDevice, isLandscape, contentMaxWidth } = useResponsiveLayout();
  const pad = isSmallDevice ? 14 : 20;
  const scrollContent = {
    padding: pad,
    paddingBottom: isLandscape ? 24 : 40,
    ...(isLandscape ? { alignSelf: 'center' as const, width: '100%' as const, maxWidth: contentMaxWidth } : {}),
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={isLandscape ? ['top', 'left', 'right'] : ['top']}
    >
      <ScrollView contentContainerStyle={scrollContent} showsVerticalScrollIndicator>
        <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>O aplikacji</Text>
        <Text style={[styles.lead, isSmallDevice && styles.leadSmall]}>
          GlikoCheck pomaga w przystępny sposób zapoznać się z indeksem glikemicznym wybranych produktów
          oraz oszacować ładunek glikemiczny dla podanej porcji.
        </Text>

        <Text style={[styles.section, isSmallDevice && styles.sectionSmall]}>
          Czym jest indeks glikemiczny (IG)?
        </Text>
        <Text style={[styles.body, isSmallDevice && styles.bodySmall]}>
          Indeks glikemiczny opisuje, jak szybko dany produkt spożywany samodzielnie może podnieść stężenie
          glukozy we krwi w porównaniu do czystej glukozy (skala praktyczna: ok. 0–100). Nie uwzględnia
          jednak wielkości porcji — dlatego ważny jest także ładunek glikemiczny.
        </Text>

        <Text style={[styles.section, isSmallDevice && styles.sectionSmall]}>
          Czym jest ładunek glikemiczny (ŁG)?
        </Text>
        <Text style={[styles.body, isSmallDevice && styles.bodySmall]}>
          Ładunek glikemiczny uwzględnia zarówno IG, jak i ilość węglowodanów w zjedzonej porcji. W tej
          aplikacji stosujemy wzór: ŁG = IG × (węglowodany w porcji w gramach) / 100, gdzie węglowodany w
          porcji = węglowodany na 100 g × masa porcji / 100.
        </Text>

        <Text style={[styles.section, isSmallDevice && styles.sectionSmall]}>
          Jak interpretować wynik ŁG?
        </Text>
        <Text style={[styles.body, isSmallDevice && styles.bodySmall]}>
          Uproszczony podział:{'\n\n'}
          • ŁG 0–10 — niski ładunek glikemiczny{'\n'}
          • ŁG 11–19 — średni ładunek glikemiczny{'\n'}
          • ŁG 20 i więcej — wysoki ładunek glikemiczny{'\n\n'}
          W praktyce na odpowiedź organizmu wpływają też inne składniki posiłku (białko, tłuszcz, błonnik),
          aktywność fizyczna i indywidualna tolerancja węglowodanów.
        </Text>

        <View style={[styles.disclaimer, { padding: isSmallDevice ? 12 : 16 }]}>
          <Text style={[styles.disclaimerTitle, isSmallDevice && styles.disclaimerTitleSmall]}>
            Ważne
          </Text>
          <Text style={[styles.disclaimerBody, isSmallDevice && styles.disclaimerBodySmall]}>
            Aplikacja ma charakter wyłącznie edukacyjny. Zawarte dane są przykładowe i mogą różnić się od
            wartości dla konkretnych marek czy metod przygotowania potraw. Nie zastępuje porady lekarza,
            dietetyka ani indywidualnego planu żywieniowego — w sprawach zdrowia skonsultuj się ze
            specjalistą.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
  },
  titleSmall: {
    fontSize: 22,
    marginBottom: 10,
  },
  lead: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 20,
  },
  leadSmall: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionSmall: {
    fontSize: 17,
    marginTop: 6,
    marginBottom: 6,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  disclaimer: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  disclaimerTitleSmall: {
    fontSize: 15,
  },
  disclaimerBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  disclaimerBodySmall: {
    fontSize: 13,
    lineHeight: 20,
  },
});
