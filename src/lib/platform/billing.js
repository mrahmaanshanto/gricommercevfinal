// platform/billing — GridCommerce billing its stores (the console's Billing area).
//
// Rules (CorePackaging board, brief #19):
//   · One bill a month on the store's billing day; it is issued 7 days before it falls due.
//   · Collected by hand by default: the owner pays from the merchant panel, or staff call and record the payment with
//     its transaction ID (each ID is used once). A store can be set to charge automatically (saved bKash or card):
//     the charge runs on the due day and retries after 1 and 3 days.
//   · Unpaid: grace for 7 days (full access, banner), then past due (admin read-only, storefront keeps selling) until
//     day 14, then suspended (admin and storefront off). Paying restores access at once. Nothing is ever deleted.
//   · A trial lasts 15 days; on day 16 the first bill falls due.
//   · Bills are never edited: corrections are credit notes. Every adjustment has a reason code; above the threshold
//     (৳500) a second person approves, never the one who asked.
//
//   tick(db, now)            bring the data up to `now` (registered with store.js; runs on load, on commit, every 20 s)
//   invoice math:            paidOn · creditOn · balance · invoiceState · openInvoices
//   store state:             subState · isPaying · mrrOf · planOf · priceOf · billItems
//   actions (commit inside): recordPayment · logCall · sendPayLinks · requestAdjustment · decideAdjustment · askAboutAdjustment
//                            addItem · editItem · endItem · changePlan · startModuleTrial · setAutoCharge · extendTrial
//                            pauseStore · resumeStore · cancelStore · archiveStore · restoreStore · setControl · runBilling

import { commit, setTicker, staff } from './store';
import { invoice as newInvoice } from './seed';
import { DAY, addMonths, at, daysBetween, periodOf, yearOf, dayOfMonth, pad4, hash, dm, taka, startOfDay, weekday } from './util';
import { PLAN_NAME, ladderLabel, addonBy, GRACE_DAYS, READONLY_DAYS, TRIAL_DAYS, STAGES, can, REASON_LABEL } from './catalogue';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
const txOf = (h) => Array.from({ length: 9 }, (_, i) => '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'[(h >>> (i * 3)) % 34]).join('');

// ---- lookups -----------------------------------------------------------------------------------------------
export const shopOf = (db, id) => db.shops.find((s) => s.id === id) || null;
export const subOf = (db, id) => db.subs[id] || null;
export const invoiceById = (db, id) => db.invoices.find((i) => i.id === id) || null;
export const shopInvoices = (db, id) => db.invoices.filter((i) => i.shopId === id).sort((a, b) => b.issuedAt - a.issuedAt);

/** The plan version a store is on. */
export function planOf(db, sub) {
  const ladder = db.plans[sub.ladder];
  const ver = ladder.versions.find((v) => v.v === sub.version) || ladder.versions[ladder.versions.length - 1];
  return { ...ver.plans[sub.plan], id: sub.plan, version: ver.v, ladder: sub.ladder };
}
/** Price of a billed item this month. */
export function priceOf(db, sub, it) {
  if (it.kind !== 'plan') return it.price;
  const ladder = db.plans[sub.ladder];
  const ver = ladder.versions.find((v) => v.v === sub.version) || ladder.versions[ladder.versions.length - 1];
  const p = ver.plans[it.code] || ver.plans[sub.plan];
  return sub.cycle === 'yearly' ? Math.round(p.yearly / 12) : p.price;
}
export const itemName = (sub, it) => (it.kind === 'plan' ? `${ladderLabel(sub.ladder)} · ${PLAN_NAME[it.code]} plan` : it.name);
/** Items billed now (not ended). */
export const billItems = (sub, t) => sub.items.filter((it) => (!it.until || it.until > t) && !(it.period === 'Once' && it.billedIn));
/** What the store pays each month for plan, modules and credits (yearly counted per month). */
export function mrrOf(db, sub, t) {
  return billItems(sub, t).filter((it) => it.period !== 'Once' && it.since <= t + 31 * DAY).reduce((s, it) => s + (it.period === 'Yearly' ? Math.round(it.price / 12) : priceOf(db, sub, it)), 0);
}

// ---- invoice math ------------------------------------------------------------------------------------------
export const paidOn = (db, invId) => db.payments.filter((p) => p.invoiceId === invId && p.status === 'ok').reduce((s, p) => s + p.amount, 0);
export const creditOn = (db, invId) => db.credits.filter((c) => c.invoiceId === invId).reduce((s, c) => s + c.amount, 0);
export function balance(db, inv) {
  if (!inv || inv.noCharge || inv.voided) return 0;
  return Math.max(0, inv.total - paidOn(db, inv.id) - creditOn(db, inv.id));
}
/** { key: 'nocharge' | 'void' | 'paid' | 'due' | 'overdue', days, paidAt } */
export function invoiceState(db, inv, t) {
  if (inv.noCharge) return { key: 'nocharge', days: 0 };
  if (inv.voided) return { key: 'void', days: 0 };
  if (balance(db, inv) <= 0) {
    const ps = db.payments.filter((p) => p.invoiceId === inv.id && p.status === 'ok');
    const cs = db.credits.filter((c) => c.invoiceId === inv.id);
    const last = Math.max(0, ...ps.map((p) => p.at), ...cs.map((c) => c.at));
    return { key: ps.length ? 'paid' : 'credited', days: 0, paidAt: last };
  }
  const d = daysBetween(inv.dueAt, t);
  return d > 0 ? { key: 'overdue', days: d } : { key: 'due', days: -d };
}
/** Money the store has with us: payments and credit notes beyond what its bills asked, less what was carried over. */
export function storeCredit(db, shopId) {
  let extra = 0, used = 0;
  for (const inv of db.invoices) {
    if (inv.shopId !== shopId) continue;
    if (!inv.noCharge && !inv.voided) extra += Math.max(0, paidOn(db, inv.id) + creditOn(db, inv.id) - inv.total);
    for (const l of inv.lines) if (l.kind === 'carry') used += -l.amount;
  }
  return Math.max(0, extra - used);
}
/** Unpaid bills of a store, oldest first. */
export const openInvoices = (db, shopId) => db.invoices.filter((i) => i.shopId === shopId && balance(db, i) > 0).sort((a, b) => a.dueAt - b.dueAt);

// ---- store state -------------------------------------------------------------------------------------------
// key: setup · failed · trial · active · grace · pastdue · suspended · paused · cancelled · archived
const PILL = { ok: 'pill p-ok', warn: 'pill p-warn', err: 'pill p-err', none: 'pill p-grey', info: 'pill p-sky' };
export function subState(db, shopId, t) {
  const shop = shopOf(db, shopId);
  const sub = subOf(db, shopId);
  if (!shop || !sub) return mk('setup', 'Setting up', 'info');
  if (shop.status === 'setup') {
    const run = db.runs.find((r) => r.shopId === shopId);
    return run && run.failedAt ? mk('failed', 'Setup stopped at ' + stageLabel(run.failedAt), 'err') : mk('setup', 'Setting up', 'info');
  }
  if (sub.status === 'archived') return mk('archived', 'Archived', 'none');
  if (sub.status === 'cancelled') return mk('cancelled', 'Cancelled', 'none');
  if (sub.status === 'paused') return mk('paused', 'Paused', 'none');
  if (shop.control === 'suspended') return mk('suspended', 'Suspended', 'err', 0, true);
  if (sub.status === 'trial') {
    const day = Math.max(1, daysBetween(sub.trialStart, t) + 1);
    const left = sub.trialDays - day + 1;
    return { ...mk('trial', `Trial · day ${Math.min(day, sub.trialDays)}`, 'none', day), left };
  }
  const open = openInvoices(db, shopId);
  const overdue = open.length ? daysBetween(open[0].dueAt, t) : 0;
  if (overdue > READONLY_DAYS) return mk('suspended', 'Suspended', 'err', overdue);
  if (overdue > GRACE_DAYS) return mk('pastdue', 'Past due · read-only', 'err', overdue);
  if (shop.control === 'readonly') return mk('pastdue', 'Read-only', 'err', 0, true);
  if (overdue > 0) return mk('grace', `Grace · day ${overdue}`, 'warn', overdue);
  return mk('active', 'Active', 'ok');
}
function mk(key, label, tone, days = 0, manual = false) {
  return { key, label, tone, days, manual, pill: PILL[tone], shp: 'shp shp-' + (tone === 'info' ? 'none' : tone) };
}
export const isPaying = (st) => st.key === 'active' || st.key === 'grace' || st.key === 'pastdue';
export const isLiveStore = (st) => !['setup', 'failed', 'cancelled', 'archived'].includes(st.key);
export const stageLabel = (key) => (STAGES.find((s) => s[0] === key) || [key, key])[1];

// ---- the engine --------------------------------------------------------------------------------------------
/** Issue an invoice for a store's bill falling due at `due`, from what it is billed for. */
function issueBill(db, sub, due, t) {
  if (sub.moveTo) { sub.version = sub.moveTo; delete sub.moveTo; }
  const lines = [];
  for (const it of sub.items) {
    if (it.until && it.until <= due) continue;
    if (it.period === 'Once') {
      if (!it.billedIn && it.since <= due + 7 * DAY) { lines.push({ label: it.name, amount: it.price, kind: it.kind }); it.billedIn = 'pending'; }
      continue;
    }
    if (it.since > due + DAY) continue;
    lines.push({ label: itemName(sub, it), amount: priceOf(db, sub, it), kind: it.kind });
  }
  // discounts approved for the next bill
  for (const a of db.adjustments) {
    if (a.shopId !== sub.shopId || a.invoiceId !== 'next' || a.status !== 'approved' || a.appliedTo) continue;
    if (a.type === 'discount') lines.push({ label: `Discount · ${REASON_LABEL[a.reason] || a.reason} (${a.id})`, amount: -Math.abs(a.amount), kind: 'discount' });
    a.appliedTo = 'pending';
  }
  if (!lines.length) return null;
  // credit the store has with us (an overpayment or a credit note on a bill that was already paid) comes off this bill
  const carry = Math.min(storeCredit(db, sub.shopId), lines.reduce((s, l) => s + l.amount, 0));
  if (carry > 0) lines.push({ label: 'Credit carried over', amount: -carry, kind: 'carry' });
  const issuedAt = Math.min(t, due - 7 * DAY);
  const y = yearOf(issuedAt);
  db.seq.inv[y] = (db.seq.inv[y] || 0) + 1;
  const id = `INV-${y}-${pad4(db.seq.inv[y])}`;
  const total = Math.max(0, lines.reduce((s, l) => s + l.amount, 0));
  const inv = { id, y, shopId: sub.shopId, issuedAt, dueAt: due, period: periodOf(due), lines, total, noCharge: total === 0, voided: false, charges: [], reminders: [] };
  db.invoices.push(inv);
  for (const it of sub.items) if (it.billedIn === 'pending') it.billedIn = id;
  for (const a of db.adjustments) if (a.appliedTo === 'pending') a.appliedTo = id;
  return inv;
}

/** Bring everything up to time t. Safe to run any number of times. */
export function tick(db, t) {
  for (const shop of db.shops) {
    const sub = db.subs[shop.id];
    if (!sub) continue;
    // a store being set up goes live when its run finishes; its trial starts then
    if (shop.status === 'setup') {
      const run = db.runs.filter((r) => r.shopId === shop.id).sort((a, b) => b.startedAt - a.startedAt)[0];
      if (run && !run.failedAt) {
        const end = run.startedAt + run.stages.reduce((s, x) => s + x.ms, 0);
        if (end <= t) {
          shop.status = 'live';
          sub.status = 'trial';
          sub.trialStart = end;
          if (sub.trialDays > 0 && !db.invoices.some((i) => i.shopId === shop.id)) {
            const inv = newInvoice(db, { shopId: shop.id, issuedAt: end, dueAt: end, period: periodOf(end), lines: [{ label: `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]} plan, ${sub.trialDays}-day trial`, amount: 0 }], noCharge: true });
            inv.id = `INV-${inv.y}-${pad4(db.seq.inv[inv.y])}`;
          }
          db.events.push({ id: 'E' + db.seq.ev++, shopId: shop.id, at: end, kind: 'system', text: `Store live after ${Math.round((end - run.startedAt) / 1000)} s · ${sub.trialDays ? sub.trialDays + '-day trial started' : 'paid from today'}` });
        }
      }
      continue;
    }
    // trial ends: the first bill falls due on day 16
    if (sub.status === 'trial') {
      const end = startOfDay(sub.trialStart) + sub.trialDays * DAY;
      if (end <= t) {
        sub.status = 'active';
        sub.billDay = Math.min(dayOfMonth(end), 28);
        sub.nextDue = end;
        if (!sub.items.some((it) => it.kind === 'plan' && !it.until)) sub.items.push({ id: 'IT' + db.seq.item++, kind: 'plan', code: sub.plan, name: null, price: null, period: 'Monthly', since: end, until: null });
        db.events.push({ id: 'E' + db.seq.ev++, shopId: shop.id, at: end, kind: 'system', text: 'Trial ended · first bill falls due today' });
      }
    }
    // module trials that ended
    for (const mt of sub.moduleTrials) {
      if (mt.result) continue;
      const end = mt.start + mt.days * DAY;
      if (end > t) continue;
      if (mt.autoAdd) {
        sub.items.push({ id: 'IT' + db.seq.item++, kind: 'module', code: mt.code, name: mt.name.replace(' · extend', ''), price: mt.price, period: 'Monthly', since: end, until: null, fromTrial: mt.id });
        mt.result = 'Became add-on';
        db.events.push({ id: 'E' + db.seq.ev++, shopId: shop.id, at: end, kind: 'billing', text: `${mt.name} trial ended · added to the bill at ${taka(mt.price)} a month` });
      } else {
        mt.result = 'Ended';
        db.events.push({ id: 'E' + db.seq.ev++, shopId: shop.id, at: end, kind: 'system', text: `${mt.name} trial ended · data kept` });
      }
    }
    // monthly bills, issued 7 days ahead; none while paused, cancelled or suspended
    if (sub.status === 'active' && sub.nextDue) {
      let guard = 0;
      while (sub.nextDue - 7 * DAY <= t && guard++ < 24) {
        const st = subState(db, shop.id, t);
        if (st.key === 'suspended') break;
        issueBill(db, sub, sub.nextDue, t);
        sub.nextDue = at(addMonths(sub.nextDue, sub.cycle === 'yearly' ? 12 : 1, sub.billDay), 0, 0);
      }
    }
    // demo: owners paying from their own panel. Most bills are paid around the due day; about one in six is
    // left for the collections team (it then follows grace → read-only → suspended until someone collects).
    if (!sub.autoCharge && sub.status === 'active') {
      for (const inv of openInvoices(db, shop.id)) {
        if (inv.hold || inv.issuedAt > t) continue;
        const h = hash('pay:' + inv.id);
        if (h % 100 >= 84) { inv.hold = true; continue; }
        const when = inv.dueAt + (((h >>> 8) % 6) - 2) * DAY + 10 * 3600e3 + ((h >>> 4) % 600) * 6e4;
        if (when > t) continue;
        const method = (h >>> 12) % 5 === 0 ? 'Nagad' : 'bKash';
        db.payments.push({ id: 'PAY-' + pad4(db.seq.pay++), invoiceId: inv.id, shopId: shop.id, amount: balance(db, inv), method, via: 'panel', at: Math.max(when, inv.issuedAt + 3600e3), by: 'Owner', txId: txOf(h), status: 'ok' });
      }
    }
    // automatic charges: on the due day, then after 1 and 3 days
    if (sub.autoCharge && sub.status === 'active') {
      for (const inv of openInvoices(db, shop.id)) {
        if (inv.dueAt > t) continue;
        const tries = inv.charges.length;
        const next = inv.dueAt + [0, 1, 3][tries] * DAY;
        if (tries >= 3 || next > t) continue;
        const ok = hash(inv.id + ':' + tries) % 10 !== 0;
        const when = Math.max(next, inv.dueAt) + 9 * 3600e3;
        inv.charges.push({ at: when, ok, method: sub.payMethod, reason: ok ? null : 'Not enough balance' });
        if (ok) {
          db.payments.push({ id: 'PAY-' + pad4(db.seq.pay++), invoiceId: inv.id, shopId: shop.id, amount: balance(db, inv), method: sub.payMethod, via: 'auto', at: when, by: 'Auto-charge', txId: 'AC' + (hash(inv.id) % 1e8), status: 'ok' });
        }
      }
    }
  }
  // plan versions whose go-live date has come
  for (const [id, ladder] of Object.entries(db.plans)) {
    const due = ladder.versions.filter((v) => v.liveFrom <= t).map((v) => v.v);
    const live = Math.max(...due);
    if (live > ladder.live) ladder.live = live;
    for (const d of db.planDrafts) {
      if (d.ladder !== id || d.status !== 'approved' || d.moved || d.liveFrom > t) continue;
      d.moved = true;
      for (const sub of Object.values(db.subs)) {
        if (sub.ladder !== id || sub.plan !== d.plan || sub.version >= d.v) continue;
        if (d.existing === 'now') sub.version = d.v;
        else if (d.existing === 'next') sub.moveTo = d.v; // from the next bill (issueBill)
      }
    }
  }
  return db;
}
setTicker(tick);

// ---- payments and calls ------------------------------------------------------------------------------------
const who = () => staff().name;

/** Record a payment against a bill. Returns { ok, error, payment }. */
export function recordPayment({ invoiceId, amount, method, txId, via = 'call', by }) {
  return commit((db, t) => {
    const inv = invoiceById(db, invoiceId);
    if (!inv) return { ok: false, error: 'Pick the bill this payment is for.' };
    const due = balance(db, inv);
    const amt = Math.round(Number(amount));
    if (!amt || amt <= 0) return { ok: false, error: 'Enter the amount received.' };
    if (amt > due) return { ok: false, error: `That is more than the ${taka(due)} still owed on ${inv.id}.` };
    const tx = String(txId || '').trim().toUpperCase();
    if (method !== 'Cash at office' && !tx) return { ok: false, error: 'Enter the transaction ID from the ' + method + ' message.' };
    if (tx && db.payments.some((p) => (p.txId || '').toUpperCase() === tx)) return { ok: false, error: `Transaction ID ${tx} is already used on another payment.` };
    const before = subState(db, inv.shopId, t);
    const p = { id: 'PAY-' + pad4(db.seq.pay++), invoiceId: inv.id, shopId: inv.shopId, amount: amt, method, via, at: t, by: by || who(), txId: tx || null, status: 'ok' };
    db.payments.push(p);
    const after = subState(db, inv.shopId, t);
    const restored = ['grace', 'pastdue', 'suspended'].includes(before.key) && after.key === 'active';
    return { ok: true, payment: p, restored, left: balance(db, inv) };
  });
}

const OUTCOME = {
  paid: 'Paid on the call', promised: 'Promised to pay', panel: 'Will pay from the panel', noanswer: 'No answer', later: 'Call later', dispute: 'Disputes the bill', reminder: 'Reminder sent',
};
/** Log a collection call. */
export function logCall({ shopId, invoiceId, outcome, note, promiseAt, nextAt, method, by }) {
  return commit((db, t) => {
    const c = { id: 'CALL-' + pad4(db.seq.call++), shopId, invoiceId, at: t, by: by || who(), outcome, note: note || OUTCOME[outcome] || outcome, promiseAt: promiseAt || null, nextAt: nextAt || null, method: method || null };
    db.calls.push(c);
    return { ok: true, call: c };
  });
}
export const outcomeLabel = (k) => OUTCOME[k] || k;

/** Send pay links for unpaid bills (one store, or every store with a bill due or overdue). */
export function sendPayLinks(shopId = null) {
  return commit((db, t) => {
    let n = 0;
    for (const inv of db.invoices) {
      if (shopId && inv.shopId !== shopId) continue;
      if (balance(db, inv) <= 0 || inv.dueAt - 7 * DAY > t) continue;
      inv.reminders.push({ at: t, by: who(), via: 'SMS and panel' });
      db.calls.push({ id: 'CALL-' + pad4(db.seq.call++), shopId: inv.shopId, invoiceId: inv.id, at: t, by: who(), outcome: 'reminder', note: 'Pay link sent by SMS', promiseAt: null, nextAt: null });
      n++;
    }
    return { ok: true, count: n };
  });
}

// ---- adjustments (credits, discounts, waivers, charges) -----------------------------------------------------
/** Ask for an adjustment. At or under the threshold it is approved at once; above it waits for a second person. */
export function requestAdjustment({ shopId, invoiceId, type, amount, pct, reason, linked, note, approver }) {
  return commit((db, t) => {
    const me = staff();
    const inv = invoiceId && invoiceId !== 'next' ? invoiceById(db, invoiceId) : null;
    let amt = Math.round(Number(amount) || 0);
    if (!amt && pct && inv) amt = Math.round((inv.total * Number(pct)) / 100);
    if (!amt && pct && invoiceId === 'next') { const sub = subOf(db, shopId); amt = Math.round((mrrOf(db, sub, t) * Number(pct)) / 100); }
    if (type === 'waive' && inv) amt = balance(db, inv);
    if (!reason) return { ok: false, error: 'Pick a reason code.' };
    if (!amt || amt <= 0) return { ok: false, error: 'Enter an amount or a percent.' };
    if ((type === 'credit' || type === 'waive') && !inv) return { ok: false, error: 'A credit note needs an issued bill.' };
    if (type === 'credit' && inv && amt > balance(db, inv) + paidOn(db, inv.id)) return { ok: false, error: `The credit is more than the bill (${taka(inv.total)}).` };
    if (!String(note || '').trim()) return { ok: false, error: 'Write the note the owner will see.' };
    if (type === 'waive' && me.role !== 'admin') return { ok: false, error: 'Waiving a bill needs an Admin.' };
    const id = 'ADJ-' + pad4(db.seq.adj++);
    const a = { id, shopId, invoiceId: invoiceId || 'next', type, amount: amt, pct: pct ? Number(pct) : null, reason, linked: linked || null, note, by: me.name, at: t, status: 'pending', approver: approver || null, decidedBy: null, decidedAt: null, decisionNote: null, cnId: null, questions: [] };
    db.adjustments.push(a);
    if (amt <= db.settings.adjThreshold) applyAdjustment(db, a, 'auto', t);
    return { ok: true, adjustment: a };
  });
}
function applyAdjustment(db, a, by, t) {
  a.status = 'approved';
  a.decidedBy = by;
  a.decidedAt = t;
  if (a.type === 'credit' || a.type === 'waive') {
    const y = yearOf(t);
    db.seq.cn[y] = (db.seq.cn[y] || 0) + 1;
    const id = `CN-${y}-${pad4(db.seq.cn[y])}`;
    db.credits.push({ id, invoiceId: a.invoiceId, shopId: a.shopId, amount: a.amount, reason: a.reason, adjId: a.id, at: t, by: a.by });
    a.cnId = id;
  }
  if (a.type === 'charge') {
    const sub = subOf(db, a.shopId);
    sub.items.push({ id: 'IT' + db.seq.item++, kind: 'oneoff', code: 'CHARGE', name: a.note.slice(0, 60), price: a.amount, period: 'Once', since: t, until: null });
  }
}
/** Approve or reject. The person who asked can never decide. */
export function decideAdjustment(id, decision, note = '') {
  return commit((db, t) => {
    const me = staff();
    const a = db.adjustments.find((x) => x.id === id);
    if (!a || a.status !== 'pending') return { ok: false, error: 'This request is already decided.' };
    if (a.by === me.name) return { ok: false, error: 'You asked for this, so you cannot approve it.' };
    if (!can(me, 'billing', 'approve')) return { ok: false, error: 'Only Finance or an Admin can approve money changes.' };
    if (decision === 'reject') {
      if (!String(note).trim()) return { ok: false, error: 'Say why it is rejected.' };
      a.status = 'rejected'; a.decidedBy = me.name; a.decidedAt = t; a.decisionNote = note;
    } else {
      applyAdjustment(db, a, me.name, t);
    }
    return { ok: true, adjustment: a };
  });
}
export function askAboutAdjustment(id, text) {
  return commit((db, t) => {
    const a = db.adjustments.find((x) => x.id === id);
    if (!a) return { ok: false };
    a.questions.push({ at: t, by: who(), text });
    return { ok: true };
  });
}

// ---- what a store is billed for --------------------------------------------------------------------------
/** Add a module or item to a store's bill. Custom prices more than 20% under list need an adjustment instead. */
export function addItem(shopId, { code, name, price, period, startsAt, prorate }) {
  return commit((db, t) => {
    const sub = subOf(db, shopId);
    const a = addonBy(code);
    const p = Math.round(Number(price));
    if (!p || p <= 0) return { ok: false, error: 'Enter a price.' };
    if (a && p < a.price * 0.8) return { ok: false, error: `${taka(p)} is more than 20% under the list price (${taka(a.price)}): send it as a discount for a second approval.` };
    if (a && a.kind === 'module' && billItems(sub, t).some((it) => it.code === code)) return { ok: false, error: `${a.name} is already on the bill.` };
    const since = startsAt || t;
    const per = period === 'One-off' ? 'Once' : period;
    const it = { id: 'IT' + db.seq.item++, kind: a ? a.kind : per === 'Once' ? 'oneoff' : 'module', code: code || 'CUSTOM', name: a ? a.name : name || 'Custom item', price: p, period: per, since, until: null };
    sub.items.push(it);
    if (prorate && per === 'Monthly' && sub.nextDue) {
      const days = Math.max(0, daysBetween(since, sub.nextDue));
      const amt = Math.round((p * days) / 30);
      if (amt > 0) sub.items.push({ id: 'IT' + db.seq.item++, kind: 'proration', code: 'PRORATE', name: `${it.name}, ${days} days before the next bill`, price: amt, period: 'Once', since, until: null });
    }
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'billing', text: `${it.name} added to the bill at ${taka(p)} ${per === 'Once' ? 'once' : per.toLowerCase()}, by ${who()}` });
    return { ok: true, item: it };
  });
}
export function editItem(shopId, itemId, price) {
  return commit((db, t) => {
    const sub = subOf(db, shopId);
    const it = sub.items.find((x) => x.id === itemId);
    if (!it) return { ok: false, error: 'Item not found.' };
    const p = Math.round(Number(price));
    if (!p || p <= 0) return { ok: false, error: 'Enter a price.' };
    if (it.kind === 'plan') return { ok: false, error: 'Change the plan instead.' };
    const a = addonBy(it.code);
    if (a && p < a.price * 0.8) return { ok: false, error: 'More than 20% under list: send it as a discount for a second approval.' };
    const old = it.price;
    it.price = p;
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'billing', text: `${it.name}: ${taka(old)} → ${taka(p)}, from the next bill, by ${who()}` });
    return { ok: true };
  });
}
export function endItem(shopId, itemId) {
  return commit((db, t) => {
    const sub = subOf(db, shopId);
    const it = sub.items.find((x) => x.id === itemId);
    if (!it) return { ok: false, error: 'Item not found.' };
    if (it.kind === 'plan') return { ok: false, error: 'A store always has a plan: change it or cancel the store.' };
    it.until = t;
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'billing', text: `${it.name} ended, by ${who()} · not billed from the next bill` });
    return { ok: true };
  });
}
/** Move a store to another plan; the difference for the days left in this cycle goes on the next bill. */
export function changePlan(shopId, plan, cycle) {
  return commit((db, t) => {
    const sub = subOf(db, shopId);
    if (!sub || !PLAN_NAME[plan]) return { ok: false, error: 'Pick a plan.' };
    if (plan === sub.plan && (!cycle || cycle === sub.cycle)) return { ok: false, error: 'The store is already on this plan.' };
    const ladder = db.plans[sub.ladder];
    const liveVer = ladder.versions.find((v) => v.v === ladder.live);
    const oldPrice = planOf(db, sub).price;
    const newPrice = liveVer.plans[plan].price;
    const oldName = PLAN_NAME[sub.plan];
    for (const it of sub.items) if (it.kind === 'plan' && !it.until) it.until = t;
    sub.items.push({ id: 'IT' + db.seq.item++, kind: 'plan', code: plan, name: null, price: null, period: 'Monthly', since: t, until: null });
    sub.plan = plan;
    sub.version = ladder.live;
    if (cycle) sub.cycle = cycle;
    let pr = 0;
    if (sub.status === 'active' && sub.nextDue) {
      const days = Math.max(0, daysBetween(t, sub.nextDue));
      pr = Math.round(((newPrice - oldPrice) * days) / 30);
      if (pr) sub.items.push({ id: 'IT' + db.seq.item++, kind: 'proration', code: 'PRORATE', name: `Plan changed ${oldName} → ${PLAN_NAME[plan]}, prorated`, price: pr, period: 'Once', since: t, until: null });
    }
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'staff', text: `Plan changed ${oldName} → ${PLAN_NAME[plan]}${pr ? ', prorated ' + taka(pr) : ''}, by ${who()}` });
    return { ok: true, prorated: pr };
  });
}
/** Give a module trial. One trial per module per store. */
export function startModuleTrial(shopId, { code, label, days, startsAt, reason, autoAdd, price }) {
  return commit((db, t) => {
    const sub = subOf(db, shopId);
    const extend = /extend/.test(label || '');
    const running = sub.moduleTrials.find((m) => m.code === code && !m.result);
    if (running && extend) {
      running.days += days;
      db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'staff', text: `${running.name} trial extended by ${days} days, by ${who()}` });
      return { ok: true, trial: running, extended: true };
    }
    if (running) return { ok: false, error: `${running.name} is already in trial.` };
    if (sub.moduleTrials.some((m) => m.code === code)) return { ok: false, error: 'This store already had a trial of this module (one per module).' };
    if (billItems(sub, t).some((it) => it.code === code)) return { ok: false, error: 'The store already pays for this module.' };
    const mt = { id: 'MT' + db.seq.trial++, code, name: String(label || code).replace(' · extend', ''), start: startsAt || t, days, by: who(), reason, autoAdd: !!autoAdd, price: price || 0, use: '', result: null };
    sub.moduleTrials.push(mt);
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'staff', text: `${mt.name} trial started for ${days} days, by ${who()}` });
    return { ok: true, trial: mt };
  });
}
export function setAutoCharge(shopId, on, method) {
  return commit((db, t) => {
    const sub = subOf(db, shopId);
    sub.autoCharge = !!on;
    if (method) sub.payMethod = method;
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'billing', text: on ? `Automatic charge turned on · ${sub.payMethod}, by ${who()}` : `Automatic charge turned off · collected by hand, by ${who()}` });
    return { ok: true };
  });
}
export function extendTrial(shopId, days) {
  return commit((db, t) => {
    const sub = subOf(db, shopId);
    if (sub.status !== 'trial') return { ok: false, error: 'The store is not in trial.' };
    sub.trialDays += days;
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'staff', text: `Trial extended by ${days} days, by ${who()}` });
    return { ok: true };
  });
}

// ---- store lifecycle (Merchant page › Store controls, Subscriptions) -----------------------------------------
function needReason(reason) { return String(reason || '').trim() ? null : { ok: false, error: 'Pick a reason code.' }; }
export function pauseStore(shopId, reason) {
  return needReason(reason) || commit((db, t) => {
    const sub = subOf(db, shopId); sub.status = 'paused'; sub.pausedAt = t;
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'staff', text: `Storefront paused · ${reason}, by ${who()} · no bills while paused` });
    return { ok: true };
  });
}
export function resumeStore(shopId) {
  return commit((db, t) => {
    const sub = subOf(db, shopId); const shop = shopOf(db, shopId);
    sub.status = 'active'; sub.pausedAt = null; shop.control = null;
    if (!sub.nextDue || sub.nextDue < t) { sub.billDay = Math.min(dayOfMonth(t), 28); sub.nextDue = at(t, 0, 0); }
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'staff', text: `Store resumed, by ${who()}` });
    return { ok: true };
  });
}
export function setControl(shopId, control, reason) {
  return needReason(reason) || commit((db, t) => {
    const shop = shopOf(db, shopId);
    shop.control = control;
    const what = { readonly: 'Made read-only', suspended: 'Store suspended', null: 'Access restored' }[control] || control;
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'staff', text: `${what} · ${reason}, by ${who()}` });
    return { ok: true };
  });
}
export function cancelStore(shopId, reason) {
  return needReason(reason) || commit((db, t) => {
    const sub = subOf(db, shopId); sub.status = 'cancelled'; sub.cancelledAt = t; sub.cancelReason = reason;
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'staff', text: `Cancelled · ${reason}, by ${who()} · data kept, export offered` });
    return { ok: true };
  });
}
export function archiveStore(shopId, reason) {
  return needReason(reason) || commit((db, t) => {
    const sub = subOf(db, shopId); sub.status = 'archived'; sub.archivedAt = t; if (!sub.cancelledAt) { sub.cancelledAt = t; sub.cancelReason = reason; }
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'staff', text: `Archived · ${reason}, by ${who()} · restorable without a rebuild` });
    return { ok: true };
  });
}
export function restoreStore(shopId) {
  return commit((db, t) => {
    const sub = subOf(db, shopId); const shop = shopOf(db, shopId);
    sub.status = 'active'; sub.archivedAt = null; sub.cancelledAt = null; shop.control = null;
    sub.billDay = Math.min(dayOfMonth(t), 28); sub.nextDue = at(t, 0, 0);
    db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'staff', text: `Store restored, by ${who()} · billing starts today` });
    return { ok: true };
  });
}

/** Run billing now (issues any bills whose day has come; the engine also does this by itself). */
export function runBilling() { return commit(() => ({ ok: true })); }

// ---- small helpers the screens share -------------------------------------------------------------------------
/** How a payment came in, as the design writes it: "bKash · from panel" */
export function paidVia(p) {
  if (!p) return '—';
  const via = { panel: 'from panel', call: 'taken on call', bank: 'bank deposit', person: 'in person', auto: 'auto-charge' }[p.via] || p.via;
  return `${p.method === 'Bank transfer' ? 'Bank' : p.method} · ${via}`;
}
export function lastPayment(db, invId) {
  return db.payments.filter((p) => p.invoiceId === invId && p.status === 'ok').sort((a, b) => b.at - a.at)[0] || null;
}
/** "Sunday" for a promise */
export const dayName = (ms) => ({ Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' }[weekday(ms)]);
export { cap, TRIAL_DAYS };
