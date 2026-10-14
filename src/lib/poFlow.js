// poFlow — what happens to a purchase order after it is made, for the demo orders and the ones made in this browser
// alike (PR-F4, PR-F5):
//   draft → approval (waiting) → approved → ordered (sent to the supplier) → partial → received
//   any time before goods arrive: cancelled (with a reason); after part of it arrived: closed (the rest is not coming)
//   a rejected order goes back to draft with the reason, so the person who made it can change it and send it again.
//
//   Status keys are the list's tabs (PurchaseOrders.jsx): draft · approval · approved · ordered · partial · received ·
//   closed · cancelled. An order made here keeps its words in `status` too (Draft, Approved, Sent, Partly received,
//   Received, Closed, Cancelled), which Receive goods and older screens read.
//
//   approvalLimit()                 Settings › Stock setup: staff orders above this need approval (0 = never)
//   canApprove(user)                CEO and warehouse manager may approve
//   needsApproval(total, user)      a person who can't approve placing an order over the limit
//   poOf(no)                        one order in one shape: { no, demo, s, label, tone, supplier, place, at, lines, total,
//                                   by, byId, approvedBy, rejected, cancelled, closed, sentAt, sentVia, costs, log, … }
//   allPOs()                        every order (made here first, then the demo ones), newest first
//   approvePO / rejectPO / cancelPO / closeRemaining / markSent / editPO / addCost / recordDelivery
//                                   each returns { ok, error?, po }
// Demo orders can't be rewritten, so their changes are kept beside them (gc.purchase.demoChanges) and laid over them.
// Front end only: a real backend would check who may approve on the server and keep the history there.

import { getPOs, updatePO, poTotal, DEMO_POS } from './purchaseOrders';
import { getStockSetup } from './stockSetup';
import { rolesOf } from './team';

const DEMO_KEY = 'gc.purchase.demoChanges';
export const PO_EVENT = 'gc:purchase-orders';
export const DEFAULT_LIMIT = 50000;
const APPROVERS = ['ceo', 'wh-manager'];

export const PO_LABEL = { draft: 'Draft', approval: 'Waiting approval', approved: 'Approved', ordered: 'Sent', partial: 'Partly received', received: 'Received', closed: 'Closed', cancelled: 'Cancelled' };
export const PO_TONE = { draft: 'slate', approval: 'warning', approved: 'info', ordered: 'primary', partial: 'warning', received: 'success', closed: 'slate', cancelled: 'error' };
const WORD = { draft: 'Draft', approval: 'Draft', approved: 'Approved', ordered: 'Sent', partial: 'Partly received', received: 'Received', closed: 'Closed', cancelled: 'Cancelled' };
const KEY_OF_WORD = { Draft: 'draft', Approved: 'approved', Sent: 'ordered', 'Partly received': 'partial', Received: 'received', Closed: 'closed', Cancelled: 'cancelled' };
// who made the demo orders (the two waiting for approval were made by staff who can't approve)
const DEMO_BY = { 'PO-2609-0024': ['Sabbir Hossain', 'sabbir'], 'PO-2609-0021': ['Rakib Hasan', 'rakib'] };

// ---- settings ---------------------------------------------------------------------------------------
/** Staff orders above this total need approval; 0 = no approval needed. */
export function approvalLimit() {
  const v = getStockSetup().poLimit;
  return v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? DEFAULT_LIMIT : Math.max(0, Number(v));
}
export const canApprove = (u) => rolesOf(u).some((r) => APPROVERS.includes(r));
export const needsApproval = (total, u) => { const lim = approvalLimit(); return lim > 0 && total > lim && !canApprove(u); };

// ---- reading ----------------------------------------------------------------------------------------
const readDemo = () => { if (typeof window === 'undefined') return {}; try { const v = JSON.parse(window.localStorage.getItem(DEMO_KEY)); return v && typeof v === 'object' ? v : {}; } catch { return {}; } };
const writeDemo = (map) => { try { window.localStorage.setItem(DEMO_KEY, JSON.stringify(map)); } catch { /* ignore */ } };
const ping = () => { try { window.dispatchEvent(new CustomEvent(PO_EVENT)); } catch { /* ignore */ } };
const pieces = (lines) => lines.reduce((a, l) => a + (Number(l.qty) || 0), 0);
const got = (lines) => lines.reduce((a, l) => a + (Number(l.received) || 0), 0);

/** A stored order's status key. */
export function keyOfStored(p) {
  // the key written by this file, unless another screen changed the words since (e.g. an older receive)
  if (p.s && PO_LABEL[p.s] && WORD[p.s] === p.status) return p.s;
  if (p.approval === 'waiting' && p.status === 'Draft') return 'approval';
  return KEY_OF_WORD[p.status] || 'draft';
}

function shape(base, extra) {
  const lines = (extra.lines || base.lines || []).map((l) => ({ ...l, received: Number(l.received) || 0 }));
  const s = extra.s || base.s;
  return {
    ...base, ...extra, lines, s, label: PO_LABEL[s], tone: PO_TONE[s], total: poTotal(lines), pieces: pieces(lines), got: got(lines),
    log: extra.log || base.log || [], costs: extra.costs || base.costsList || [], deliveries: extra.deliveries || base.deliveries || [],
  };
}
function demoOf(r, changes = readDemo()) {
  const x = changes[r.no] || {};
  const by = DEMO_BY[r.no];
  return shape({ ...r, demo: true, by: by ? by[0] : 'Mehedi Rahman', byId: by ? by[1] : 'ceo' }, x);
}
function storedOf(p) { return shape({ ...p, demo: false, s: keyOfStored(p) }, {}); }

/** One order (made here or demo), or null. */
export function poOf(no) {
  const p = getPOs().find((x) => x.no === no);
  if (p) return storedOf(p);
  const r = DEMO_POS.find((x) => x.no === no);
  return r ? demoOf(r) : null;
}
/** Every order: made here first (newest first), then the demo ones. */
export function allPOs() {
  const ch = readDemo();
  return [...getPOs().map(storedOf), ...DEMO_POS.map((r) => demoOf(r, ch))];
}

// ---- changing ---------------------------------------------------------------------------------------
const stamp = (u) => ({ by: (u && u.name) || 'Staff', byId: (u && u.id) || '', at: Date.now() });
/** Apply a change to an order of either kind. `fn(po)` returns the fields to change (s, lines, log …). */
function change(no, fn) {
  const cur = poOf(no);
  if (!cur) return null;
  const patch = fn(cur);
  if (!patch) return cur;
  if (cur.demo) {
    const all = readDemo();
    all[no] = { ...(all[no] || {}), ...patch };
    writeDemo(all);
  } else {
    updatePO(no, (p) => {
      const out = { ...patch };
      if (patch.s) { out.status = WORD[patch.s]; out.approval = patch.s === 'approval' ? 'waiting' : patch.s === 'draft' ? undefined : 'done'; }
      if (patch.costs) { out.costsList = patch.costs; delete out.costs; }
      return out;
    });
  }
  ping();
  return poOf(no);
}
const withLog = (po, text, u, extra = {}) => [{ text, ...stamp(u), ...extra }, ...(po.log || [])];

export function approvePO(no, u) {
  const po = poOf(no);
  if (!po || po.s !== 'approval') return { ok: false, error: 'This order is not waiting for approval.' };
  if (!canApprove(u)) return { ok: false, error: 'Only the owner or the warehouse manager can approve.' };
  if (po.byId && u && po.byId === u.id) return { ok: false, error: 'Someone else must approve an order you made.' };
  return { ok: true, po: change(no, (p) => ({ s: 'approved', approvedBy: stamp(u), rejected: null, log: withLog(p, 'Approved by ' + u.name, u, { ok: true }) })) };
}
export function rejectPO(no, u, reason) {
  const why = String(reason || '').trim();
  const po = poOf(no);
  if (!po || po.s !== 'approval') return { ok: false, error: 'This order is not waiting for approval.' };
  if (!canApprove(u)) return { ok: false, error: 'Only the owner or the warehouse manager can reject.' };
  if (po.byId && u && po.byId === u.id) return { ok: false, error: 'Someone else must decide on an order you made.' };
  if (!why) return { ok: false, error: 'Write why it is rejected.' };
  return { ok: true, po: change(no, (p) => ({ s: 'draft', rejected: { ...stamp(u), reason: why }, log: withLog(p, `Rejected by ${u.name}: ${why}`, u) })) };
}
/** Send a draft for approval again (after a rejection), or place it when no approval is needed. */
export function submitPO(no, u) {
  const po = poOf(no);
  if (!po || po.s !== 'draft') return { ok: false, error: 'Only a draft can be sent.' };
  if (!po.lines.length) return { ok: false, error: 'Add at least one product first.' };
  const wait = needsApproval(po.total, u);
  return { ok: true, waiting: wait, po: change(no, (p) => ({ s: wait ? 'approval' : 'approved', rejected: null, ...(wait ? {} : { approvedBy: stamp(u) }), log: withLog(p, wait ? 'Sent for approval' : 'Placed (no approval needed)', u) })) };
}
export function markSent(no, u, via = '') {
  const po = poOf(no);
  if (!po || !['approved', 'draft'].includes(po.s)) return { ok: false, error: 'This order can’t be sent now.' };
  if (po.s === 'draft' && needsApproval(po.total, u)) return { ok: false, error: 'This order needs approval before it goes to the supplier.' };
  return { ok: true, po: change(no, (p) => ({ s: 'ordered', sentAt: Date.now(), sentVia: via, log: withLog(p, 'Sent to ' + p.supplier + (via ? ' on ' + via : ''), u) })) };
}
export const canCancel = (po) => !!po && ['draft', 'approval', 'approved', 'ordered'].includes(po.s) && po.got === 0;
export function cancelPO(no, u, reason) {
  const why = String(reason || '').trim();
  const po = poOf(no);
  if (!canCancel(po)) return { ok: false, error: 'An order with goods received can’t be cancelled. Close the rest instead.' };
  if (!why) return { ok: false, error: 'Write why it is cancelled.' };
  return { ok: true, po: change(no, (p) => ({ s: 'cancelled', cancelled: { ...stamp(u), reason: why }, log: withLog(p, `Cancelled by ${u.name}: ${why}`, u) })) };
}
export const canClose = (po) => !!po && ['partial', 'ordered'].includes(po.s) && po.got > 0 && po.got < po.pieces;
export function closeRemaining(no, u, reason) {
  const po = poOf(no);
  if (!canClose(po)) return { ok: false, error: 'Nothing is left to close on this order.' };
  const left = po.pieces - po.got;
  const why = String(reason || '').trim();
  return { ok: true, po: change(no, (p) => ({ s: 'closed', closed: { ...stamp(u), qty: left, reason: why }, log: withLog(p, `Closed by ${u.name}: ${left} pieces not coming${why ? ' · ' + why : ''}`, u) })) };
}
export const canEdit = (po) => !!po && ['draft', 'approval', 'approved', 'ordered', 'partial'].includes(po.s);
/** Change quantities and prices (never below what has arrived), drop lines nothing arrived on, change the note or
 *  expected date. A staff edit that takes an approved order over the limit sends it back for approval. */
export function editPO(no, u, { lines, note, expected } = {}) {
  const po = poOf(no);
  if (!canEdit(po)) return { ok: false, error: 'This order can’t be changed any more.' };
  const next = (lines || po.lines).map((l) => ({ ...l, qty: Math.max(Number(l.received) || 0, Math.round(Number(l.qty) || 0)), cost: Math.max(0, Number(l.cost) || 0) })).filter((l) => l.qty > 0);
  if (!next.length) return { ok: false, error: 'Keep at least one product. To stop the order, cancel it.' };
  const total = poTotal(next);
  const back = ['approved', 'ordered'].includes(po.s) && total > po.total && needsApproval(total, u);
  const what = [];
  po.lines.forEach((l) => {
    const n = next.find((x) => x.name === l.name);
    if (!n) what.push(`${l.name} removed`);
    else { if (n.qty !== l.qty) what.push(`${l.name} ${l.qty} → ${n.qty}`); if (n.cost !== l.cost) what.push(`${l.name} price ${l.cost} → ${n.cost}`); }
  });
  if (note !== undefined && note !== (po.note || '')) what.push('note changed');
  if (expected !== undefined && expected !== (po.expected || '')) what.push('expected delivery ' + (expected || 'cleared'));
  if (!what.length) return { ok: true, po, same: true };
  return {
    ok: true, back,
    po: change(no, (p) => ({
      lines: next, ...(note !== undefined ? { note } : {}), ...(expected !== undefined ? { expected } : {}), ...(back ? { s: 'approval', approvedBy: null } : {}),
      log: withLog(p, 'Changed: ' + what.join(', ') + (back ? ' · needs approval again' : ''), u),
    })),
  };
}
/** An extra cost (transport, labour …) added after the order was made. */
export function addCost(no, u, { label, amt }) {
  const a = Math.round(Number(amt) || 0);
  if (!String(label || '').trim()) return { ok: false, error: 'Write what the cost was for.' };
  if (!(a > 0)) return { ok: false, error: 'Enter an amount above 0.' };
  return { ok: true, po: change(no, (p) => ({ costs: [...(p.costs || []), { label: String(label).trim(), amt: a, at: Date.now(), by: u.name }], log: withLog(p, `Extra cost ${String(label).trim()} ৳${a.toLocaleString('en-IN')}`, u) })) };
}
/** Goods arrived (Receive goods): add to each line's received count, keep the delivery and move the status on. */
export function recordDelivery(no, { add = [], extraLines = [], delivery } = {}) {
  return change(no, (p) => {
    const lines = p.lines.map((l, i) => ({ ...l, received: (Number(l.received) || 0) + (Number(add[i]) || 0) }));
    extraLines.forEach((x) => lines.push({ ...x }));
    const done = lines.every((l) => l.received >= l.qty);
    return { lines, s: done ? 'received' : 'partial', deliveries: [delivery, ...(p.deliveries || [])].filter(Boolean), log: withLog(p, `${delivery ? delivery.qty : ''} pieces received${delivery && delivery.grn ? ' · ' + delivery.grn : ''}`, { name: delivery ? delivery.by : 'Staff' }, { ok: true }) };
  });
}

// ---- sending to the supplier ------------------------------------------------------------------------
/** The WhatsApp link with the order written out (the PDF is attached by hand: WhatsApp links can't carry files). */
export function whatsappLink(po, phone, shop) {
  const d = String(phone || '').replace(/\D/g, '');
  const to = d.startsWith('880') ? d : d.startsWith('0') ? '88' + d : d;
  const lines = po.lines.map((l) => `• ${l.name} × ${l.qty}`).join('\n');
  const text = `Assalamu alaikum. Purchase order ${po.no} from ${shop}:\n${lines}\nTotal ৳${po.total.toLocaleString('en-IN')}. Deliver to ${po.place}${po.expected ? ' by ' + po.expected : ''}. Please confirm. Thank you.`;
  return { href: `https://wa.me/${to}?text=${encodeURIComponent(text)}`, text, ok: to.length >= 12 };
}
