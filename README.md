# GlikoCheck

Aplikacja mobilna stworzona w **React Native** z użyciem **Expo** i **TypeScript** do **przeglądania indeksu glikemicznego (IG)** produktów spożywczych oraz **obliczania ładunku glikemicznego (ŁG)** dla podanej porcji. Dane produktów są **wbudowane lokalnie**; **ulubione** i **historia ostatnio przeglądanych** produktów zapisywane są na urządzeniu przez **AsyncStorage**.

## Cel projektu

- Ułatwić zapoznanie się z pojęciami IG i ŁG.
- Umożliwić filtrowanie i wyszukiwanie lokalnej bazy produktów.
- Zapewnić prosty kalkulator ŁG zgodny ze wzorami podanymi w specyfikacji projektu.

## Funkcjonalności 

1. **Ekran główny (Produkty):** pole wyszukiwania, lista produktów, filtry poziomu IG i kategorii.
2. **Baza lokalna:** produkty z polami: id, nazwa, kategoria, IG, węglowodany/100 g, opis, poziom IG.
3. **Szczegóły produktu:** pełne informacje, pole masy porcji (walidacja &gt; 0), obliczenie ŁG, interpretacja (0–10 / 11–19 / ≥ 20), ulubione.
4. **Ulubione:** lista z usuwaniem, komunikat przy pustej liście.
5. **Historia:** ostatnio przeglądane (max 10), czyszczenie, komunikat przy pustej liście.
6. **O aplikacji:** opis IG, ŁG, interpretacja.
7. **Nawigacja:** React Navigation, dolne zakładki: Produkty, Ulubione, Historia, O aplikacji.

## Uruchomienie

```bash
npm install
npx expo start
```

## Struktura katalogów

- `src/screens` — ekrany aplikacji
- `src/components` — komponenty UI (karty, filtry, poziom IG)
- `src/data` — lokalna baza produktów i kategorie filtrów
- `src/types` — typy TypeScript i typy nawigacji
- `src/utils` — obliczenia IG/ŁG i etykiety
- `src/storage` — AsyncStorage (ulubione, historia)
- `src/navigation` — konfiguracja React Navigation
- `src/theme` — kolory motywu

## Kalkulator (wzory w kodzie)

- Węglowodany w porcji (g) = `carbsPer100g × masa_g / 100`
- ŁG = `IG × węglowodany_w_porcji / 100`

## Zastrzeżenie

Aplikacja ma charakter edukacyjny; wartości IG są przykładowe i nie zastępują porady lekarza ani dietetyka.
