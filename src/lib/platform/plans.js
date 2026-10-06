// platform/plans — changing what a plan costs and includes. A change is a draft of the next version of one plan on
// one ladder; a second person (Finance or an Admin, never the one who drafted it) approves it, and it goes live on
// its date as a new version. Stores keep the version they bought unless the draft says to move them (at their next
// bill, or now — only for price cuts).
//   draftFor(db, ladder, plan) · saveDraft(fields) · submitDraft(id) · decideDraft(id, 'approve' | 'reject', note) · diff(a, b)

import { commit, staff } from './store';
import { PLAN_NAME, SETS, LIMIT_KEYS, UNLIMITED, can, APPROVERS } from './catalogue';
import { taka, num } from './util';

const who = () => staff().name;

/** A new draft (not saved) from the live version of a plan. */
export function draftFor(db, ladderId, planId) {
  const ladder = db.plans[ladderId];
  const live = ladder.versions.find((v) => v.v === ladder.live);
  const next = Math.max(...ladder.versions.map((v) => v.v), ...db.planDrafts.filter((d) => d.ladder === ladderId).map((d) => d.v)) + 1;
  const p = live.plans[planId];
  return {
    id: null, ladder: ladderId, plan: planId, baseV: live.v, v: next, status: 'new',
    name: p.name, tagline: p.tagline, visibility: p.visibility || 'Public',
    price: p.price, yearly: p.yearly, setup: p.setup, trialDays: p.trialDays,
    sets: { ...p.sets }, limits: { ...p.limits }, warnAt: p.warnAt, topup: p.topup, atLimit: p.atLimit,
    existing: 'keep', liveFrom: null, approver: APPROVERS[0], why: '',
  };
}

/** Problems that stop a draft being sent for approval. */
export function draftErrors(d) {
  const e = {};
  if (!String(d.name || '').trim()) e.name = 'Name the plan.';
  if (!(d.price > 0)) e.price = 'Enter the monthly price.';
  if (d.yearly && d.yearly >= d.price * 12) e.yearly = `Yearly must be lower than 12 × monthly (${taka(d.price * 12)}). Try ${taka(Math.round((d.price * 10) / 1000) * 1000)}.`;
  if (!String(d.why || '').trim()) e.why = 'Say why this change is made.';
  if (d.existing === 'now' && d.basePrice != null && d.price > d.basePrice) e.existing = 'Moving stores now is only for price cuts.';
  return e;
}

/** What changed between two plan definitions, as the design writes it: + added, ~ changed, − removed. */
export function diff(a, b) {
  const out = [];
  const setLabel = (id) => (SETS.find((s) => s.id === id) || {}).label || id;
  for (const id of Object.keys({ ...a.sets, ...b.sets })) {
    if (a.sets[id] === b.sets[id]) continue;
    if (b.sets[id] === 'Included' && a.sets[id] !== 'Included') out.push(['+', `${setLabel(id)} included`]);
    else if (a.sets[id] === 'Included' && b.sets[id] !== 'Included') out.push(['−', `${setLabel(id)}: ${b.sets[id].toLowerCase()}`]);
    else out.push(['~', `${setLabel(id)}: ${a.sets[id]} → ${b.sets[id]}`]);
  }
  for (const [k, label] of LIMIT_KEYS) {
    if (a.limits[k] === b.limits[k]) continue;
    const f = (x) => (x >= UNLIMITED ? 'unlimited' : k === 'storage' ? x + ' GB' : num(x));
    out.push(['~', `${label} ${f(a.limits[k])} → ${f(b.limits[k])}`]);
  }
  if (a.price !== b.price) out.push(['~', `Monthly ${taka(a.price)} → ${taka(b.price)}`]);
  if (a.yearly !== b.yearly) out.push(['~', `Yearly ${taka(a.yearly)} → ${taka(b.yearly)}`]);
  if (a.setup !== b.setup) out.push(['~', `Setup fee ${taka(a.setup)} → ${taka(b.setup)}`]);
  if (a.trialDays !== b.trialDays) out.push(['~', `Trial ${a.trialDays} → ${b.trialDays} days`]);
  if (a.name !== b.name) out.push(['~', `Name ${a.name} → ${b.name}`]);
  if (a.atLimit !== b.atLimit) out.push(['~', b.atLimit === 'block' ? 'At the limit: block and offer a top-up' : 'At the limit: allow and bill the overage']);
  return out;
}

export function saveDraft(fields) {
  return commit((db, t) => {
    let d = fields.id ? db.planDrafts.find((x) => x.id === fields.id) : null;
    if (d && d.status !== 'draft' && d.status !== 'rejected') return { ok: false, error: 'This draft is already sent for approval.' };
    if (!d) {
      d = { ...fields, id: 'PV-' + String(db.planDrafts.length + 1).padStart(3, '0'), by: who(), at: t, status: 'draft' };
      db.planDrafts.push(d);
    } else Object.assign(d, fields, { status: 'draft' });
    return { ok: true, draft: d };
  });
}
export function submitDraft(fields) {
  const r = saveDraft(fields);
  if (!r.ok) return r;
  return commit((db, t) => {
    const d = db.planDrafts.find((x) => x.id === r.draft.id);
    const base = db.plans[d.ladder].versions.find((v) => v.v === d.baseV).plans[d.plan];
    const errs = draftErrors({ ...d, basePrice: base.price });
    if (Object.keys(errs).length) return { ok: false, error: Object.values(errs)[0], errors: errs, draft: d };
    if (d.approver === d.by) return { ok: false, error: 'Pick someone else as the second approver.' };
    d.status = 'pending';
    d.sentAt = t;
    return { ok: true, draft: d };
  });
}
/** Approve (publish as a new version) or reject a draft. Never by the person who drafted it. */
export function decideDraft(id, decision, note = '') {
  return commit((db, t) => {
    const me = staff();
    const d = db.planDrafts.find((x) => x.id === id);
    if (!d || d.status !== 'pending') return { ok: false, error: 'This draft is not waiting for approval.' };
    if (d.by === me.name) return { ok: false, error: 'You drafted this, so you cannot approve it.' };
    if (!can(me, 'billing', 'approve') && me.role !== 'admin') return { ok: false, error: 'Only Finance or an Admin can approve a plan version.' };
    if (decision === 'reject') {
      if (!String(note).trim()) return { ok: false, error: 'Say why it is rejected.' };
      Object.assign(d, { status: 'rejected', decidedBy: me.name, decidedAt: t, decisionNote: note });
      return { ok: true, draft: d };
    }
    const ladder = db.plans[d.ladder];
    const base = ladder.versions.find((v) => v.v === ladder.live);
    const plans = JSON.parse(JSON.stringify(base.plans));
    plans[d.plan] = { ...plans[d.plan], name: d.name, tagline: d.tagline, visibility: d.visibility, price: d.price, yearly: d.yearly, setup: d.setup, trialDays: d.trialDays, sets: { ...d.sets }, limits: { ...d.limits }, warnAt: d.warnAt, topup: d.topup, atLimit: d.atLimit };
    const v = Math.max(...ladder.versions.map((x) => x.v)) + 1;
    const liveFrom = d.liveFrom && d.liveFrom > t ? d.liveFrom : t;
    ladder.versions.push({ v, liveFrom, plans, by: d.by, approvedBy: me.name, note: d.why });
    if (liveFrom <= t) ladder.live = v;
    Object.assign(d, { status: 'approved', decidedBy: me.name, decidedAt: t, v, liveFrom, moved: false });
    if (d.existing === 'now' && liveFrom <= t) {
      for (const sub of Object.values(db.subs)) if (sub.ladder === d.ladder && sub.plan === d.plan) sub.version = v;
      d.moved = true;
    }
    db.events.push({ id: 'E' + db.seq.ev++, shopId: null, at: t, kind: 'system', text: `${PLAN_NAME[d.plan]} version ${v} on the ${d.ladder} ladder approved by ${me.name}` });
    return { ok: true, draft: d, version: v };
  });
}
