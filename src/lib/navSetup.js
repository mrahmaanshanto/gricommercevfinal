// navSetup — areas the shop chose but has not set up yet (brief #21 "Set up" state). An area in this state keeps its
// menu row, with a "Set up" badge, and its pages show a short setup prompt under the top bar (shell/gc-topbar.js).
// Only people who can open the page that fixes it see either (lib/team.js › navFor).
//   SETUP_CHECKS   { id, module, area (menu area id), fix (menu id of the page that fixes it), label, note, href, done() }
//   pendingSetup(ed) → the checks still to do for the edition's modules (each done() read from the lib that owns it)
//   SETUP_EVENTS   events after which the state may have changed (the shell listens to them)
// Reads lib/settlements.js (couriers and gateways) and lib/posStore.js (counters); browser only.

import { getAllPartners } from './settlements';
import { getCounters } from './posStore';
import { hasModule, currentEditionId } from './edition';

const partners = (kind) => { try { return getAllPartners().filter((p) => p.kind === kind); } catch { return []; } };

export const SETUP_CHECKS = [
  { id: 'courier', module: 'online', area: 'area-orders', fix: 'connections', label: 'Connect a courier', note: 'Online orders need a courier to deliver them.', href: '/connections?group=delivery', done: () => partners('Courier').length > 0 },
  { id: 'counter', module: 'pos', area: 'area-pos', fix: 'pos-counters', label: 'Set up a counter', note: 'Add a counter before you sell in the shop.', href: '/pos-manage', done: () => { try { return getCounters().some((c) => c.active !== false); } catch { return true; } } },
  { id: 'payment', module: 'commerce', area: 'area-payments', fix: 'pay-setup', label: 'Connect a payment', note: 'Connect bKash, Nagad or a card gateway to take payments.', href: '/set-payments', done: () => partners('Gateway').length > 0 },
];

export const SETUP_EVENTS = ['gc:connections', 'gc:ledger', 'gc:pos', 'storage'];

/** The setup checks still to do for the edition (a check that cannot be read counts as done: no false alarms). */
export function pendingSetup(ed = currentEditionId()) {
  if (typeof window === 'undefined') return [];
  return SETUP_CHECKS.filter((s) => hasModule(s.module, ed)).filter((s) => { try { return !s.done(); } catch { return false; } });
}
