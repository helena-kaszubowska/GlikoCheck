import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FavoriteEntry } from '../types/favorite';

const FAVORITES_KEY = '@glikocheck/favorites';
const HISTORY_KEY = '@glikocheck/history';
const MAX_HISTORY = 10;

function isFavoriteEntry(x: unknown): x is FavoriteEntry {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.productId === 'string' &&
    typeof o.portionGrams === 'number' &&
    typeof o.carbsInPortion === 'number' &&
    typeof o.glycemicLoad === 'number' &&
    (o.loadInterpretation === 'low' || o.loadInterpretation === 'medium' || o.loadInterpretation === 'high')
  );
}

async function readJsonArray(key: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

async function writeJsonArray(key: string, value: string[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/** Odczytuje ulubione z pamięci telefonu. */
export async function getFavoriteEntries(): Promise<FavoriteEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isFavoriteEntry) : [];
  } catch {
    return [];
  }
}

async function setFavoriteEntries(entries: FavoriteEntry[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(entries));
}

function newFavoriteId(): string {
  return `fav_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Dodaje nowy wpis do ulubionych. */
export async function addFavoriteEntry(
  partial: Omit<FavoriteEntry, 'id'> & { id?: string },
): Promise<FavoriteEntry> {
  const entries = await getFavoriteEntries();
  const entry: FavoriteEntry = {
    ...partial,
    id: partial.id ?? newFavoriteId(),
  };
  await setFavoriteEntries([entry, ...entries]);
  return entry;
}

export async function removeFavoriteById(favoriteId: string): Promise<void> {
  const entries = await getFavoriteEntries();
  await setFavoriteEntries(entries.filter((e) => e.id !== favoriteId));
}

/** Sprawdza, czy ten produkt z tą samą porcją jest już w ulubionych. */
export async function findFavoriteIdForPortion(
  productId: string,
  portionGrams: number,
): Promise<string | null> {
  const entries = await getFavoriteEntries();
  const match = entries.find(
    (e) => e.productId === productId && Math.abs(e.portionGrams - portionGrams) < 0.0001,
  );
  return match?.id ?? null;
}

/** Zwraca historię ostatnio oglądanych produktów. */
export async function getHistoryIds(): Promise<string[]> {
  return readJsonArray(HISTORY_KEY);
}

export async function addProductToHistory(productId: string): Promise<void> {
  const current = await getHistoryIds();
  const without = current.filter((id) => id !== productId);
  const next = [productId, ...without].slice(0, MAX_HISTORY);
  await writeJsonArray(HISTORY_KEY, next);
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
