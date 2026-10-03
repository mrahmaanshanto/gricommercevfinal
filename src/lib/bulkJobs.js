// bulkJobs — background jobs on many customers at once (brief #7 › bulk actions): add a tag, add to a segment,
// change consent, export. A job runs in the background with progress, then shows what was done, what was
// skipped (already so) and what failed, per customer, with the reason. Message actions don't run here: the list
// shows how many can get the message (consentSummary) and hands the eligible ones to Communications.
// Front end only: a job's progress follows the clock (about 3 seconds); its effect is applied once when it ends,
// as the server would. Kept in this browser (gc.crm.jobs).

import { resolveCustomer, updateIdentity, getDirectory } from './customers';
import { setConsent, CONSENT_STATES, channelLabel, consentCounts, whyNotAllowed } from './consent';
import { addMembers, getSegment } from './segments';
import { getCrmRows } from './crm';
import { canExportFullPhones, maskPhone, maskEmail } from './crmAccess';
import { restrictionBadges } from './restrictions';

export const JOBS_KEY = 'gc.crm.jobs';
export const JOBS_EVENT = 'gc:crm-jobs';
export const JOB_KINDS = { tag: 'Add tag', untag: 'Remove tag', segment: 'Add to segment', consent: 'Change consent', export: 'Export' };
const RUN_MS = 3000;

const ssr = () => typeof window === 'undefined';
function read() { if (ssr()) return []; try { return JSON.parse(window.localStorage.getItem(JOBS_KEY)) || []; } catch { return []; } }
function write(list) { try { window.localStorage.setItem(JOBS_KEY, JSON.stringify(list.slice(0, 20))); window.dispatchEvent(new CustomEvent(JOBS_EVENT)); } catch { /* storage blocked */ } }

/** How many of these customers can get a marketing message on each channel: { sms, whatsapp, email, call, total }. */
export function consentSummary(ids) {
  const dir = getDirectory();
  const list = ids.map((id) => resolveCustomer(id, dir)).filter(Boolean);
  return { ...consentCounts(list, 'marketing'), total: list.length };
}

/**
 * Start a job. kind: 'tag' | 'untag' | 'segment' | 'consent' | 'export'; ids: customer IDs;
 * params: { tag } | { segmentId } | { channel, state, source } | { label }.
 */
export function startJob(kind, ids, params = {}, by = 'Staff') {
  const now = Date.now();
  const label = kind === 'tag' ? 'Add tag “' + params.tag + '”' : kind === 'untag' ? 'Remove tag “' + params.tag + '”' : kind === 'segment' ? 'Add to “' + ((getSegment(params.segmentId) || {}).name || 'segment') + '”'
    : kind === 'consent' ? channelLabel(params.channel) + ': ' + CONSENT_STATES[params.state] : 'Export ' + ids.length + ' customers';
  const job = { id: 'JOB-' + (now % 100000), kind, label, ids: [...new Set(ids)], params, by, startedAt: now, done: false };
  write([job, ...read()]);
  return job;
}

function applyJob(job) {
  const dir = getDirectory();
  const res = { done: 0, skipped: [], failed: [] };
  const name = (c, id) => (c ? c.name : id);
  if (job.kind === 'segment') {
    const seg = getSegment(job.params.segmentId);
    if (!seg || seg.owner) { job.ids.forEach((id) => res.failed.push({ id, name: name(resolveCustomer(id, dir), id), why: 'Segment not found' })); return res; }
    const before = new Set(seg.members || []);
    addMembers(seg.id, job.ids);
    job.ids.forEach((id) => { if (before.has(id)) res.skipped.push({ id, name: name(resolveCustomer(id, dir), id), why: 'Already in it' }); else res.done += 1; });
    return res;
  }
  if (job.kind === 'export') {
    const rows = getCrmRows();
    const full = canExportFullPhones();
    const pick = rows.filter((r) => job.ids.includes(r.id));
    const esc = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const head = ['Customer ID', 'Name', 'Type', 'Phone', 'Email', 'Area', 'Orders', 'Spent', 'Due', 'Last order', 'Status', 'Restrictions', 'Tags'];
    const lines = [head.map(esc).join(',')].concat(pick.map((r) => [r.id, r.name, r.kind === 'company' ? 'Company' : 'Person', full ? r.phone : maskPhone(r.phone), full ? r.email : maskEmail(r.email), r.city, r.orders, r.spent, r.due, r.last, r.status, restrictionBadges(r).join('; '), (r.tags || []).join('; ')].map(esc).join(',')));
    job.file = { name: 'customers-' + new Date().toISOString().slice(0, 10) + '.csv', text: lines.join('\n'), masked: !full };
    res.done = pick.length;
    job.ids.filter((id) => !pick.some((r) => r.id === id)).forEach((id) => res.failed.push({ id, name: id, why: 'Not found' }));
    return res;
  }
  job.ids.forEach((id) => {
    const c = resolveCustomer(id, dir);
    if (!c) { res.failed.push({ id, name: id, why: 'Not found' }); return; }
    if (job.kind === 'tag' || job.kind === 'untag') {
      const has = (c.tags || []).includes(job.params.tag);
      if (job.kind === 'tag' && has) { res.skipped.push({ id, name: c.name, why: 'Already tagged' }); return; }
      if (job.kind === 'untag' && !has) { res.skipped.push({ id, name: c.name, why: 'Didn’t have the tag' }); return; }
      updateIdentity(c.id, { tags: job.kind === 'tag' ? [...(c.tags || []), job.params.tag] : c.tags.filter((t) => t !== job.params.tag) });
      res.done += 1;
    } else if (job.kind === 'consent') {
      // a "yes" needs a usable phone / email on that channel
      if (job.params.state === 'in') { const why = whyNotAllowed(c, job.params.channel, 'transactional'); if (why) { res.failed.push({ id, name: c.name, why }); return; } }
      const changed = setConsent(c.id, job.params.channel, job.params.state, { source: job.params.source || 'Bulk change', by: job.by, note: job.label });
      if (changed) res.done += 1; else res.skipped.push({ id, name: c.name, why: 'Already ' + CONSENT_STATES[job.params.state].toLowerCase() });
    }
  });
  return res;
}

/** Every job with its progress; jobs that have run their time are applied (once) and marked done. */
export function getJobs(now = Date.now()) {
  const list = read();
  let changed = false;
  const out = list.map((j) => {
    if (j.done) return { ...j, progress: 100 };
    const ms = Math.max(1200, Math.min(RUN_MS, j.ids.length * 150));
    const p = Math.min(100, Math.round(((now - j.startedAt) / ms) * 100));
    if (p < 100) return { ...j, progress: p, processed: Math.floor((j.ids.length * p) / 100) };
    const job = { ...j };
    job.results = applyJob(job);
    job.done = true; job.endedAt = now;
    changed = true;
    return { ...job, progress: 100 };
  });
  if (changed) write(out.map(({ progress, processed, ...j }) => j));
  return out;
}
export const runningJobs = () => getJobs().filter((j) => !j.done);
export function dismissJob(id) { write(read().filter((j) => j.id !== id)); }
/** Save an export job's file to the computer. */
export function downloadJob(job) {
  if (!job || !job.file || typeof document === 'undefined') return;
  const blob = new Blob([job.file.text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = job.file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
