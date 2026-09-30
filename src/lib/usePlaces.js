'use client';
// usePlaceList — the live list of place names for a screen's dropdowns (src/lib/locations.js).
// The first render uses the built-in list (the same on the server, so hydration matches); after
// mount the list the merchant keeps in Warehouses / Branches takes over: added places appear,
// deactivated ones disappear. It follows changes made in another tab too.
//   'stock'      places that can sell or hold stock (new sales, holds, transfers, counts, adjustments)
//   'receiving'  places that can receive purchase deliveries (purchase orders, receive goods)
//   'filter'     stock places, then deactivated places, for filters of past records
import { useEffect, useState } from 'react';
import { STOCK_PLACES, getStockPlaces, getReceivingPlaces, getFilterPlaces } from './locations';

const PICK = { stock: getStockPlaces, receiving: getReceivingPlaces, filter: getFilterPlaces };

export function usePlaceList(kind = 'stock') {
  const [list, setList] = useState(STOCK_PLACES);
  useEffect(() => {
    const pick = PICK[kind] || getStockPlaces;
    const sync = () => setList((was) => { const next = pick(); return next.join('|') === was.join('|') ? was : next; });
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [kind]);
  return list;
}
