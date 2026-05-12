/** Liczy, ile węglowodanów jest w podanej porcji. */
export function carbsInPortion(carbsPer100g: number, portionGrams: number): number {
  return (carbsPer100g * portionGrams) / 100;
}

/** Liczy ładunek glikemiczny na podstawie IG i ilości węglowodanów w porcji. */
export function glycemicLoad(glycemicIndex: number, carbsInPortionGrams: number): number {
  return (glycemicIndex * carbsInPortionGrams) / 100;
}

/** Ocena wyniku ŁG do pokazania w interfejsie. */
export type LoadInterpretation = 'low' | 'medium' | 'high';

export function interpretGlycemicLoad(load: number): LoadInterpretation {
  if (load < 11) return 'low';
  if (load < 20) return 'medium';
  return 'high';
}

/** Etykiety dla obliczonego wyniku ŁG. */
export const LOAD_LABELS_PL: Record<LoadInterpretation, string> = {
  low: 'niski ładunek glikemiczny',
  medium: 'średni ładunek glikemiczny',
  high: 'wysoki ładunek glikemiczny',
};

/** Etykiety poziomu IG z bazy produktów. */
export const GI_LEVEL_LABELS_PL = {
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
} as const;
