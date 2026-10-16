// storefront/saved — the wishlist and compare list as the store's cards, quick view and product page use them. Since the
// merge with Nayeem's customer accounts (Batch B) they are lib/storefront/account.js's lists: the wishlist belongs to the
// signed-in shopper (or the guest, joined at sign-in) and compare holds up to COMPARE_MAX. This file keeps the older calls.
//   getWish() · isWished(id) · toggleWish(id) → true when added · getCompare() · toggleCompare(id) → { added, full }
//   clearCompare() · useSaved() → { wish, compare } (re-reads on ACCOUNT_EVENT)

import { useEffect, useState } from 'react';
import { wishlist, toggleWishlist, compareList, toggleCompare as accToggleCompare, clearCompare as accClear, ACCOUNT_EVENT, COMPARE_MAX } from './account';

export const SAVED_EVENT = ACCOUNT_EVENT;
export { COMPARE_MAX };

export const getWish = () => wishlist();
export const isWished = (id) => getWish().includes(id);
export const toggleWish = (id) => toggleWishlist(id);

export const getCompare = () => compareList();
export function toggleCompare(id) {
  const r = accToggleCompare(id);
  return { added: !!(r && r.ok && r.on), full: !!(r && !r.ok) };
}
export const clearCompare = () => { accClear(); try { window.dispatchEvent(new CustomEvent(ACCOUNT_EVENT)); } catch { /* ignore */ } };

export function useSaved() {
  const [st, setSt] = useState({ wish: [], compare: [] });
  useEffect(() => {
    const read = () => setSt({ wish: getWish(), compare: getCompare() });
    read();
    window.addEventListener(ACCOUNT_EVENT, read);
    window.addEventListener('storage', read);
    return () => { window.removeEventListener(ACCOUNT_EVENT, read); window.removeEventListener('storage', read); };
  }, []);
  return st;
}
