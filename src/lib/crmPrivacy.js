// crmPrivacy — how long derived customer data is kept, and forgetting it (brief #13 › Privacy and retention).
// Derived data = signal snapshots (customerSignals.js), closed recovery records (recovery.js) and ad-audience
// membership (audiences.js). Orders, payments and the customer record are not touched here.
// Set in Customer settings › Data kept. applyRetention() runs when the Customers pages open (as a nightly job would).
// Front end only: kept in this browser (gc.crm.retention).

import { purgeSnapshots, forgetSignals } from './customerSignals';
import { purgeOld, forgetCustomer } from './recovery';
import { removeCustomerFromAudiences } from './audiences';
import { setAdsOptOut } from './consent';

export const RETENTION_KEY = 'gc.crm.retention';
export const DEFAULT_RETENTION = { signalsDays: 90, recoveryDays: 180, lastRun: 0 };
export const RETENTION_CHOICES = [30, 90, 180, 365];

export function getRetention() {
  if (typeof window === 'undefined') return DEFAULT_RETENTION;
  try { return { ...DEFAULT_RETENTION, ...(JSON.parse(window.localStorage.getItem(RETENTION_KEY)) || {}) }; } catch { return DEFAULT_RETENTION; }
}
export function saveRetention(patch) {
  try { window.localStorage.setItem(RETENTION_KEY, JSON.stringify({ ...getRetention(), ...patch })); } catch { /* storage blocked */ }
}
/** Delete derived data older than the settings say. → { signals, recovery } removed. */
export function applyRetention(force = false, now = Date.now()) {
  const r = getRetention();
  if (!force && now - (r.lastRun || 0) < 12 * 3600 * 1000) return { signals: 0, recovery: 0, skipped: true };
  const out = { signals: purgeSnapshots(r.signalsDays, now), recovery: purgeOld(r.recoveryDays, now) };
  saveRetention({ lastRun: now });
  return out;
}
/** A customer asked us to stop using their data for insights and ads: clear signals, recovery records, audiences. */
export function forgetDerived(customerId, by = 'Staff') {
  const signals = forgetSignals(customerId);
  const recovery = forgetCustomer(customerId);
  const audiences = removeCustomerFromAudiences(customerId);
  setAdsOptOut(customerId, true, by);
  return { signals, recovery, audiences };
}
