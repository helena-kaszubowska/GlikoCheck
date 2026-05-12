/**
 * Parametry dla ekranu listy
 * i ekranu szczegółów produktu.
 */
export type ProductFlowParamList = {
  ProductList: undefined;
  /** Opcjonalna porcja do wstępnego uzupełnienia kalkulatora. */
  ProductDetail: { productId: string; initialPortionGrams?: number };
};

/** Zakładki widoczne na dole aplikacji. */
export type MainTabParamList = {
  ProductsTab: undefined;
  FavoritesTab: undefined;
  HistoryTab: undefined;
  AboutTab: undefined;
};
