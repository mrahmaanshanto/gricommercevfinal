// storefront/saved — a shopper's wishlist and compare list on the website (this browser; the live store keeps them on
// the customer's account once they sign in). Product ids only; pages read the products from catalog.js.
//   getWish() · isWished(id) · toggleWish(id) → true when added · getCompare() · toggleCompare(id) → { added, full }
//   clearCompare() · useSaved() → { wish, compare } (re-reads on SAVED_EVENT)

import { useEffect, useState } from 'react';

export const SAVED_EVENT = 'gc:store-saved';
const WISH = 'gc.store.wishlist';
const COMPARE = 'gc.store.compare';
export const COMPARE_MAX = 4;

const readList = (key) => {
  if (typeof window === 'undefined') return [];
  try { const l = JSON.parse(window.localStorage.getItem(key) || '[]'); return Array.isArray(l) ? l.filter((x) => typeof x === 'string') : []; } catch { return []; }
};
const writeList = (key, list) => {
  try { window.localStorage.setItem(key, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(SAVED_EVENT)); } catch { /* ignore */ }
  return list;
};

export const getWish = () => readList(WISH);
export const isWished = (id) => getWish().includes(id);
export function toggleWish(id) {
  const l = getWish();
  const on = !l.includes(id);
  writeList(WISH, on ? [id, ...l].slice(0, 100) : l.filter((x) => x !== id));
  return on;
}

export const getCompare = () => readList(COMPARE);
export function toggleCompare(id) {
  const l = getCompare();
  if (l.includes(id)) { writeList(COMPARE, l.filter((x) => x !== id)); return { added: false, full: false }; }
  if (l.length >= COMPARE_MAX) return { added: false, full: true };
  writeList(COMPARE, [...l, id]);
  return { added: true, full: false };
}
export const clearCompare = () => writeList(COMPARE, []);

export function useSaved() {
  const [st, setSt] = useState({ wish: [], compare: [] });
  useEffect(() => {
    const read = () => setSt({ wish: getWish(), compare: getCompare() });
    read();
    window.addEventListener(SAVED_EVENT, read);
    window.addEventListener('storage', read);
    return () => { window.removeEventListener(SAVED_EVENT, read); window.removeEventListener('storage', read); };
  }, []);
  return st;
}
