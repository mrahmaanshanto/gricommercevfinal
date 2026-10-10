// Grid AI quality — how the shop team teaches the AI.
//   Feedback     staff mark an AI answer: correct · incorrect · incomplete · irrelevant · unsafe · needs improvement
//   Corrections  "Correct answer / Add to knowledge": a person writes the right answer; it waits for review (someone
//                with "Upload AI knowledge") before it becomes knowledge. A correction is never used straight away and
//                is never shared with other shops.
//   rate(run, verdict, note, by) · getFeedback() · propose({ question, wrong, right, category, conv }, by)
//   getCorrections() · approveCorrection(id, by) → adds a knowledge entry · rejectCorrection(id, reason, by)
// Front end only: kept in this browser (gc.gridai.feedback, gc.gridai.corrections).

import { addEntry } from './knowledge';
import { logAi } from './activity';

export const QUALITY_EVENT = 'gc:gridai-quality';
const FK = 'gc.gridai.feedback', CK = 'gc.gridai.corrections';
export const VERDICTS = [
  ['correct', 'Correct', 'success', 'thumbs-up'], ['incorrect', 'Incorrect', 'error', 'thumbs-down'], ['incomplete', 'Incomplete', 'warning', 'circle-dashed'],
  ['irrelevant', 'Irrelevant', 'warning', 'circle-off'], ['unsafe', 'Unsafe', 'error', 'shield-alert'], ['improve', 'Needs improvement', 'info', 'wand-sparkles'],
];
export const VERDICT = Object.fromEntries(VERDICTS.map(([k, l, tone, icon]) => [k, { label: l, tone, icon }]));

const H = 3600e3, D = 24 * H;
const isBrowser = typeof window !== 'undefined';
function seedCorrections() {
  const now = Date.now();
  return [
    { id: 'CR-3', at: now - 2 * H, by: 'Lamia Sultana', conv: '', question: 'Galaxy A15 er sathe charger ache?', wrong: 'Yes, the Galaxy A15 comes with a 25W charger in the box.', right: 'Galaxy A15 comes with a cable only, no charger in the box. The Anker 20W charger fits it (৳1,890).', category: 'products', status: 'waiting' },
    { id: 'CR-2', at: now - 9 * H, by: 'Farhana Yasmin', conv: '', question: 'Mirpur branch theke pickup kora jabe?', wrong: 'Sorry, we only deliver by courier.', right: 'Yes. Order online and pick it up from the Mirpur branch the next day after 2 PM; no delivery charge.', category: 'delivery', status: 'waiting' },
    { id: 'CR-1', at: now - 3 * D, by: 'Lamia Sultana', conv: '', question: 'Do you take EMI?', wrong: 'We don’t offer EMI.', right: 'EMI on cards from 12 banks for orders over ৳10,000, 3 to 12 months, at the counter or with SSLCOMMERZ online.', category: 'payments', status: 'approved', decidedBy: 'Mehedi Rahman', decidedAt: now - 3 * D + 2 * H },
  ];
}
function seedFeedback() {
  const now = Date.now();
  return [
    { id: 'FB-4', at: now - 40 * 60e3, run: '', verdict: 'correct', note: '', by: 'Lamia Sultana', text: 'Inside Dhaka ৳70 (1–2 days)…' },
    { id: 'FB-3', at: now - 2 * H, run: '', verdict: 'incorrect', note: 'Said the A15 comes with a charger', by: 'Lamia Sultana', text: 'Yes, the Galaxy A15 comes with a 25W charger…' },
    { id: 'FB-2', at: now - 5 * H, run: '', verdict: 'incomplete', note: 'Didn’t give the outside Dhaka time', by: 'Farhana Yasmin', text: 'We deliver all over Bangladesh…' },
    { id: 'FB-1', at: now - D, run: '', verdict: 'correct', note: '', by: 'Rina Ahmed', text: 'Realme Note 50 is ৳14,990 and in stock.' },
  ];
}
const load = (k, seed) => {
  if (!isBrowser) return [];
  try { const v = JSON.parse(window.localStorage.getItem(k)); if (Array.isArray(v)) return v; } catch { /* ignore */ }
  const s = seed(); try { window.localStorage.setItem(k, JSON.stringify(s)); } catch { /* ignore */ } return s;
};
const save = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v.slice(0, 300))); window.dispatchEvent(new CustomEvent(QUALITY_EVENT)); } catch { /* ignore */ } };
const nextId = (list, p) => p + '-' + (list.reduce((m, x) => Math.max(m, parseInt(String(x.id).split('-')[1], 10) || 0), 0) + 1);

export const getFeedback = () => load(FK, seedFeedback).slice().sort((a, b) => b.at - a.at);
export function rate(run, verdict, note = '', by = 'You', text = '') {
  const list = load(FK, seedFeedback);
  const row = { id: nextId(list, 'FB'), at: Date.now(), run: (run && run.id) || run || '', verdict, note, by, text: text || (run && run.reply) || '' };
  save(FK, [row, ...list]);
  if (verdict !== 'correct') logAi({ kind: 'override', title: 'Answer marked ' + VERDICT[verdict].label.toLowerCase(), detail: note || text.slice(0, 80), by });
  return row;
}

export const getCorrections = () => load(CK, seedCorrections).slice().sort((a, b) => b.at - a.at);
export function propose({ question = '', wrong = '', right = '', category = 'faq', conv = '' }, by = 'You') {
  if (!right.trim()) return { error: 'Write the right answer.' };
  const list = load(CK, seedCorrections);
  const row = { id: nextId(list, 'CR'), at: Date.now(), by, conv, question, wrong, right: right.trim(), category, status: 'waiting' };
  save(CK, [row, ...list]);
  logAi({ kind: 'knowledge', title: 'Correction sent for review', detail: question || right.slice(0, 80), by });
  return row;
}
export function approveCorrection(id, by = 'You', edited) {
  const list = load(CK, seedCorrections);
  const i = list.findIndex((c) => c.id === id);
  if (i < 0 || list[i].status !== 'waiting') return { error: 'Already decided' };
  const c = { ...list[i], right: edited != null ? edited : list[i].right, status: 'approved', decidedBy: by, decidedAt: Date.now() };
  list[i] = c;
  save(CK, list);
  addEntry({ category: c.category, title: c.question || 'Correction', text: c.right }, by);
  logAi({ kind: 'approved', title: 'Correction added to knowledge', detail: c.question, by });
  return c;
}
export function rejectCorrection(id, reason = '', by = 'You') {
  const list = load(CK, seedCorrections);
  const i = list.findIndex((c) => c.id === id);
  if (i < 0) return;
  list[i] = { ...list[i], status: 'rejected', reason, decidedBy: by, decidedAt: Date.now() };
  save(CK, list);
  logAi({ kind: 'rejected', title: 'Correction not used', detail: reason || list[i].question, by });
}
