/** Ocena zapisanego wyniku ŁG. */
export type SavedLoadLevel = 'low' | 'medium' | 'high';

/** Jeden zapis w ulubionych z porcją i policzonym ŁG. */
export interface FavoriteEntry {
  id: string;
  productId: string;
  portionGrams: number;
  carbsInPortion: number;
  glycemicLoad: number;
  loadInterpretation: SavedLoadLevel;
}
