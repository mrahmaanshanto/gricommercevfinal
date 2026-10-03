// orderJobs — bulk work on many orders that runs in the background (Nayeem's Sales & Orders brief #4: "bulk invoice /
// label print and courier booking are asynchronous; failures are visible per order and don't block the batch").
//   startJob('courier' | 'print', orders)  saved at once (gc.orders.jobs); orders that can't take part fail straight
//                                          away with the reason (no retry), the rest are queued
//   tickJobs()      works every queued order whose turn has come, one by one, a moment apart. Any page showing the
//                   jobs strip (screens/merchant-orders/OrderJobs.jsx) calls it on a timer: leaving the page pauses
//                   the job and coming back picks it up where it was.
//   retryItem(jobId, orderId) · retryFailed(jobId) · dismissJob(jobId) · jobSummary(job) · getJobs()
// Courier: orderFlow.sendToCourier (booking twice returns the parcel already booked, so a retry never books two).
// Print: the label is made ready; the strip prints every ready label at once (labelsPrinted marks the slips).
// Results stay until dismissed. Front end only: a server would run these as queued jobs; the courier sometimes
// not answering on the first try is simulated so Retry can be seen.

import { findOrder } from './orders';
import { sendToCourier, prepOf, updatePrep } from './orderFlow';

const KEY = 'gc.orders.jobs';
export const JOB_EVENT = 'gc:order-jobs';
const STEP_MS = 700;
const hash = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 1000003; return h; };

const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch { return []; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20))); window.dispatchEvent(new CustomEvent(JOB_EVENT)); } catch { /* ignore */ } };
export const getJobs = () => (typeof window === 'undefined' ? [] : read().filter((j) => !j.dismissed));
export const JOB_LABEL = { courier: 'Courier booking', print: 'Label printing' };

/** Why an order can't take part in this job ('' when it can). */
function ineligible(kind, o) {
  if (!o) return 'Order not found';
  if (kind === 'courier') {
    if (o.sentAt && o.consignment && o.consignment !== '—') return '';
    return o.statusKey === 'ready' ? '' : `${o.status}: only Ready for courier orders can be booked`;
  }
  if (/^(POS|Wholesale)/.test(o.channel) || o.isInvoice) return 'Counter sale: no label';
  if (['cancelled', 'returned', 'delivered'].includes(o.statusKey)) return `${o.status}: no label needed`;
  return '';
}

/** Start a job for these orders. Returns the job. */
export function startJob(kind, orders) {
  const now = Date.now();
  let n = 0;
  const items = orders.map((o) => {
    const why = ineligible(kind, o);
    if (why) return { id: o.id, state: 'failed', error: why, retry: false, tries: 0 };
    n += 1;
    return { id: o.id, state: 'queued', due: now + n * STEP_MS, tries: 0 };
  });
  const job = { id: 'JOB-' + now.toString(36), kind, at: now, items, by: 'Staff' };
  write([job, ...read()]);
  return job;
}

function runItem(kind, it) {
  const o = findOrder(it.id);
  if (!o) return { state: 'failed', error: 'Order not found', retry: false };
  if (kind === 'courier') {
    // the courier's API sometimes doesn't answer the first time (demo): the order stays as it was, Retry books it
    if (it.tries === 0 && !o.sentAt && hash(o.id) % 5 === 0) return { state: 'failed', error: 'Courier did not answer. Try again.', retry: true };
    const r = sendToCourier(o);
    return r.ok ? { state: 'done', result: `${r.courier} · ${r.id}${r.duplicate ? ' (already booked)' : ''}` } : { state: 'failed', error: r.error, retry: true };
  }
  const prep = prepOf(o);
  if (!prep.courier) return { state: 'failed', error: 'Choose a courier on the order first', retry: true };
  if (!String(o.address || '').trim()) return { state: 'failed', error: 'No address on the order', retry: true };
  return { state: 'done', result: `${prep.courier} label` };
}

/** Work every queued order whose turn has come. Returns true when something changed. */
export function tickJobs(now = Date.now()) {
  if (typeof window === 'undefined') return false;
  const list = read();
  let changed = false;
  list.forEach((job) => {
    if (job.dismissed) return;
    job.items.forEach((it) => {
      if (it.state !== 'queued' || now < it.due) return;
      Object.assign(it, { error: '', ...runItem(job.kind, it), tries: (it.tries || 0) + 1, doneAt: now });
      changed = true;
    });
  });
  if (changed) write(list);
  return changed;
}

const update = (jobId, f) => { const list = read(); const job = list.find((j) => j.id === jobId); if (job) { f(job); write(list); } return job; };
/** Try one failed order again (it goes to the back of the queue). */
export function retryItem(jobId, orderId) {
  return update(jobId, (job) => {
    const last = Math.max(Date.now(), ...job.items.filter((x) => x.state === 'queued').map((x) => x.due));
    job.items.forEach((it) => { if (it.id === orderId && it.state === 'failed' && it.retry !== false) Object.assign(it, { state: 'queued', due: last + STEP_MS, error: '' }); });
  });
}
export function retryFailed(jobId) {
  return update(jobId, (job) => {
    let t = Math.max(Date.now(), ...job.items.filter((x) => x.state === 'queued').map((x) => x.due));
    job.items.forEach((it) => { if (it.state === 'failed' && it.retry !== false) { t += STEP_MS; Object.assign(it, { state: 'queued', due: t, error: '' }); } });
  });
}
export const dismissJob = (jobId) => update(jobId, (job) => { job.dismissed = true; });
/** The labels of a print job were printed: their slips count as printed on the orders. */
export function labelsPrinted(jobId) {
  return update(jobId, (job) => {
    job.items.filter((it) => it.state === 'done').forEach((it) => { const o = findOrder(it.id); if (o && !prepOf(o).slipPrinted) updatePrep(o, { slipPrinted: true }); });
    job.printedAt = Date.now();
  });
}

/** { total, done, failed, queued, running, retryable } */
export function jobSummary(job) {
  const c = (s) => job.items.filter((it) => it.state === s).length;
  return { total: job.items.length, done: c('done'), failed: c('failed'), queued: c('queued'), running: c('queued') > 0, retryable: job.items.filter((it) => it.state === 'failed' && it.retry !== false).length };
}
