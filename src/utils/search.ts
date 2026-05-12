import type { Product } from '../types/product';

export function searchTokens(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function splitWords(text: string): string[] {
  return text.split(/[\s\-/(),.]+/).filter(Boolean);
}

function allProductWords(p: Product): string[] {
  return [
    ...splitWords(p.name.toLowerCase()),
    ...splitWords(p.description.toLowerCase()),
    ...splitWords(p.category.toLowerCase()),
  ];
}

function wordMatchesToken(word: string, token: string): boolean {
  return (
    !!word &&
    !!token &&
    (word.startsWith(token) || word.endsWith(token) || (token.length >= 4 && word.includes(token)))
  );
}

export function productMatchesTokens(p: Product, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const name = p.name.toLowerCase();
  const words = allProductWords(p);

  return tokens.every((token) =>
    token.length <= 2 && tokens.length === 1
      ? name.startsWith(token)
      : words.some((word) => wordMatchesToken(word, token)),
  );
}
