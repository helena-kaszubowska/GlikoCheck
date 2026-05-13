# GlikoCheck

Aplikacja mobilna stworzona w **React Native** z użyciem **Expo** i **TypeScript** do **przeglądania indeksu glikemicznego (IG)** produktów spożywczych oraz **obliczania ładunku glikemicznego (ŁG)** dla podanej porcji. Dane produktów są **wbudowane lokalnie**; **ulubione** i **historia ostatnio przeglądanych** produktów zapisywane są na urządzeniu przez **AsyncStorage**.

## Cel projektu

- Ułatwić zapoznanie się z pojęciami IG i ŁG.
- Umożliwić filtrowanie i wyszukiwanie lokalnej bazy produktów.
- Zapewnić prosty kalkulator ŁG zgodny ze wzorami podanymi w specyfikacji projektu.

## Funkcjonalności aplikacji

### Ekran produktów
- wyszukiwanie produktów po nazwie,
- lista produktów spożywczych,
- filtrowanie według poziomu indeksu glikemicznego,
- filtrowanie według kategorii produktu.

### Lokalna baza produktów
- baza 126 produktów spożywczych,
- dane produktu: ID, nazwa, kategoria, indeks glikemiczny, węglowodany na 100 g, opis oraz poziom IG.

### Szczegóły produktu
- pełne informacje o wybranym produkcie,
- możliwość wpisania masy porcji,
- walidacja wartości porcji większej niż 0,
- obliczanie ładunku glikemicznego,
- interpretacja wyniku: niski, średni lub wysoki ŁG,
- dodawanie i usuwanie produktu z ulubionych.

### Ulubione
- lista zapisanych ulubionych produktów,
- możliwość usuwania produktów z ulubionych,
- komunikat w przypadku pustej listy.

### Historia
- lista ostatnio przeglądanych produktów,
- ograniczenie historii do 10 ostatnich produktów,
- możliwość wyczyszczenia historii,
- komunikat w przypadku pustej historii.

### O aplikacji
- krótki opis indeksu glikemicznego,
- wyjaśnienie ładunku glikemicznego,
- interpretacja poziomów ŁG.

### Nawigacja
- nawigacja z wykorzystaniem React Navigation,
- dolne zakładki: Produkty, Ulubione, Historia, O aplikacji.
  
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
