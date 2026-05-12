/** Poziom IG przypisany do produktu. */
export type GiLevel = 'low' | 'medium' | 'high';

/** Jeden produkt z lokalnej bazy. */
export interface Product {
  id: string;
  name: string;
  /** Kategoria używana też w filtrach. */
  category: string;
  glycemicIndex: number;
  carbsPer100g: number;
  description: string;
  giLevel: GiLevel;
}
