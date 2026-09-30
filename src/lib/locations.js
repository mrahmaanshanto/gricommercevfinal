// locations — the one list of places that hold stock. Every dropdown that asks "which warehouse
// or branch" reads it, so the names are the same everywhere.
export const LOCATIONS = [
  { id: 'cw', name: 'Central Warehouse', type: 'Warehouse', address: 'Plot 12, Tejgaon I/A, Dhaka' },
  { id: 'ctg', name: 'Chattogram hub', type: 'Warehouse', address: 'Agrabad C/A, Chattogram' },
  { id: 'rd', name: 'Returns & damaged', type: 'Warehouse', address: 'Central Warehouse, bay 7', noSale: true },
  { id: 'dh', name: 'Dhanmondi branch', type: 'Branch', address: 'House 42, Road 27, Dhanmondi, Dhaka' },
  { id: 'mp', name: 'Mirpur branch', type: 'Branch', address: 'Plot 8, Section 10, Mirpur, Dhaka' },
  { id: 'gl', name: 'Gulshan-1 branch', type: 'Branch', address: 'Road 11, Gulshan-1, Dhaka' },
  { id: 'ut', name: 'Uttara branch', type: 'Branch', address: 'Sector 7, Uttara, Dhaka', opening: '1 Nov 2026' },
];
export const PLACE_NAMES = LOCATIONS.map((l) => l.name);
/** Places whose stock can be sold or held for an order (not the damaged bay, not a branch still opening). */
export const STOCK_PLACES = LOCATIONS.filter((l) => !l.noSale && !l.opening).map((l) => l.name);
export const WAREHOUSE_NAMES = LOCATIONS.filter((l) => l.type === 'Warehouse').map((l) => l.name);
export const BRANCH_NAMES = LOCATIONS.filter((l) => l.type === 'Branch').map((l) => l.name);
export const DAMAGED_PLACE = 'Returns & damaged';
const OLD = { 'Dhanmondi branch': 'Dhanmondi branch', 'Mirpur branch': 'Mirpur branch', 'Gulshan-1 branch': 'Gulshan-1 branch' };
/** Older saved rows may still carry an old name. */
export const placeName = (name) => OLD[name] || name;
