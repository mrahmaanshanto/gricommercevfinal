'use client';
// Reviews — Online Store › Reviews (/product-reviews): what buyers wrote about the products, checked and answered here.
//   Header   Review settings (auto-publish, when to ask for a review)
//   Figures  average rating of the published reviews, new reviews in 30 days, share from verified buyers
//   The list views with counts (All · Pending · Published · Hidden · Spam), a star filter, search (product, customer,
//            words); tick reviews for Publish, Hide (asks why) or Mark as spam. Each review shows the product, stars,
//            text, photos, the customer and "Verified buyer" with the order when the same phone had a delivered order
//            with that product. Actions: Publish, Hide with a reason, Mark as spam, Reply (shown under the review on the
//            website), Delete (asks first).
// ?tab=pending|published|hidden|spam opens that view; ?sku= shows one product's reviews (from the product page).
// Front end only: data from src/lib/productReviews.js (this browser).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, StatusBadge, Dialog, Sheet } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, Menu, Pager } from '@/components/ui/IndexKit';
import { formatDate, formatTime } from '@/lib/format';
import { orderHref } from '@/lib/orders';
import { demoNow } from '@/lib/demoClock';
import {
  getReviews, STATUS, HIDE_REASONS, REVIEWS_EVENT, RULES_EVENT, publish, hide, markSpam, reply, removeReply, deleteReviews,
  restore, editsOf, getSettings, saveSettings, askRule, setAsk,
} from '@/lib/productReviews';
import { StoreFrame, queryParam } from './storeShared';

const TABS = [['all', 'All'], ['pending', 'Pending'], ['published', 'Published'], ['hidden', 'Hidden'], ['spam', 'Spam']];
const PER = 20;
const DAY = 864e5;

const CSS = `
.rv-list{list-style:none;margin:0;padding:0}
.rv-item{display:flex;gap:var(--space-3);padding:var(--space-4);border-top:1px solid var(--border-subtle)}
.rv-item:first-child{border-top:0}
.rv-item.is-sel{background:var(--fill-primary-soft)}
.rv-item>input{flex:none;width:16px;height:16px;margin-top:3px;accent-color:var(--primary)}
.rv-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--space-2)}
.rv-top{display:flex;flex-wrap:wrap;align-items:center;gap:6px var(--space-3)}
.rv-prod{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none}
.rv-prod:hover{color:var(--primary);text-decoration:underline}
.rv-when{font-size:var(--text-xs);color:var(--text-muted)}
.rv-stars{display:inline-flex;gap:1px;color:var(--warning, #b45309)}
.rv-stars .is-off{color:var(--border-strong)}
.rv-text{margin:0;font-size:var(--text-sm);line-height:20px;color:var(--text-body);overflow-wrap:anywhere}
.rv-photos{display:flex;gap:var(--space-2)}
.rv-photo{display:grid;place-items:center;width:56px;height:56px;border-radius:var(--radius-lg);color:var(--text-muted);border:1px solid var(--border-subtle)}
.rv-who{display:flex;flex-wrap:wrap;align-items:center;gap:6px var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.rv-who b{font-weight:var(--weight-medium);color:var(--text-body)}
.rv-who a{color:var(--primary)}
.rv-note{font-size:var(--text-xs);color:var(--text-muted)}
.rv-reply{margin-top:2px;padding:var(--space-2) var(--space-3);border-left:2px solid var(--primary);border-radius:0 var(--radius-lg) var(--radius-lg) 0;background:var(--surface-subtle)}
.rv-reply b{display:block;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading)}
.rv-reply p{margin:2px 0 0;font-size:var(--text-sm);line-height:20px;color:var(--text-body)}
.rv-reply small{display:flex;gap:var(--space-2);margin-top:4px;font-size:var(--text-xs);color:var(--text-muted)}
.rv-reply button{border:0;background:none;padding:0;font:inherit;color:var(--primary);cursor:pointer}
.rv-acts{flex:none;display:flex;align-items:flex-start;gap:var(--space-2)}
.rv-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 6px 0 10px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.rv-chip button{display:grid;place-items:center;width:20px;height:20px;border:0;border-radius:var(--radius-full);background:none;color:inherit;cursor:pointer}
.rv-filters{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle)}
.rv-set{display:flex;flex-direction:column;gap:var(--space-4)}
.rv-set h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rv-set section{display:flex;flex-direction:column;gap:var(--space-3);padding-bottom:var(--space-4);border-bottom:1px solid var(--border-subtle)}
.rv-set section:last-child{border-bottom:0}
.rv-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm);color:var(--text-body)}
.rv-row small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.rv-msg{padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body)}
.rv-reasons{display:flex;flex-direction:column;gap:var(--space-2)}
.rv-reasons label{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
@media (max-width:640px){
  .rv-item{flex-wrap:wrap}
  .rv-acts{flex:1 1 100%;padding-left:28px}
}
`;

function Stars({ n, size = 14 }) {
  return (
    <span className="rv-stars" role="img" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" width={size} height={size} className={i <= n ? '' : 'is-off'} fill={i <= n ? 'currentColor' : 'none'} aria-hidden="true" />)}
    </span>
  );
}
const ReviewStatus = ({ status }) => { const s = STATUS[status] || STATUS.pending; return <StatusBadge tone={s.tone} icon={s.icon}>{s.label}</StatusBadge>; };

function useReviews() {
  const [state, setState] = useState({ list: [], ready: false, now: 0 });
  useEffect(() => {
    const load = () => { const now = demoNow(); setState({ list: getReviews(now), ready: true, now }); };
    load();
    const ev = [REVIEWS_EVENT, RULES_EVENT, 'storage'];
    ev.forEach((e) => window.addEventListener(e, load));
    return () => ev.forEach((e) => window.removeEventListener(e, load));
  }, []);
  return state;
}

/** Hide one or more reviews: asks why (the reason stays with the review). */
function HideDialog({ open, count, onClose, onDone }) {
  const [why, setWhy] = useState(HIDE_REASONS[0]);
  const [other, setOther] = useState('');
  useEffect(() => { if (open) { setWhy(HIDE_REASONS[0]); setOther(''); } }, [open]);
  const reason = why === 'Other' ? other.trim() || 'Other' : why;
  return (
    <Dialog open={open} title={count > 1 ? `Hide ${count} reviews` : 'Hide this review'} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => onDone(reason)}>Hide</button></>}>
      <p className="gc-help" style={{ marginTop: 0 }}>Hidden reviews stay here but are not shown on the website. Why?</p>
      <div className="rv-reasons" role="radiogroup" aria-label="Reason">
        {HIDE_REASONS.map((r) => (
          <label key={r}><input type="radio" name="rv-why" className="gc-check gc-check--radio" checked={why === r} onChange={() => setWhy(r)} />{r}</label>
        ))}
      </div>
      {why === 'Other' ? <input className="gc-input" style={{ marginTop: 'var(--space-3)' }} aria-label="Other reason" placeholder="Write the reason" value={other} onChange={(e) => setOther(e.target.value)} data-autofocus /> : null}
    </Dialog>
  );
}

/** Write or change the shop's public reply. */
function ReplyDialog({ review, onClose }) {
  const [text, setText] = useState('');
  useEffect(() => { setText(review && review.reply ? review.reply.text : ''); }, [review]);
  if (!review) return <Dialog open={false} title="" onClose={onClose} />;
  const save = () => {
    if (!text.trim()) { toast('Write a reply first.', { tone: 'error' }); return; }
    reply(review.id, text);
    toast(review.status === 'published' ? 'Reply posted under the review' : 'Reply saved. It shows once the review is published.');
    onClose();
  };
  return (
    <Dialog open title={review.reply ? 'Edit reply' : 'Reply to ' + review.name} onClose={onClose} width={520}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={save}>{review.reply ? 'Save reply' : 'Post reply'}</button></>}>
      <div className="rv-msg" style={{ marginBottom: 'var(--space-3)' }}><Stars n={review.stars} size={12} /> {review.text}</div>
      <label className="gc-label" htmlFor="rv-reply">Your reply</label>
      <textarea id="rv-reply" className="gc-input" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Thank the customer, or say how you fixed the problem" data-autofocus style={{ height: 'auto', paddingTop: 8 }} />
      <p className="gc-help">Shown under the review on the website as “Reply from Dazzle Shop”.</p>
    </Dialog>
  );
}

/** Review settings: auto-publish and the review request (the automation "Ask for a review after delivery"). */
function SettingsSheet({ open, onClose }) {
  const [f, setF] = useState(null);
  useEffect(() => {
    if (!open) return;
    const s = getSettings(); const a = askRule() || { on: false, days: 2 };
    setF({ autoPublish: s.autoPublish, minStars: s.minStars, verifiedOnly: s.verifiedOnly, askOn: a.on, days: a.days, rule: a });
  }, [open]);
  if (!open || !f) return <Sheet open={false} title="" onClose={onClose} />;
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const save = () => {
    const s = getSettings();
    if (s.autoPublish !== f.autoPublish || s.minStars !== f.minStars || s.verifiedOnly !== f.verifiedOnly) saveSettings({ autoPublish: f.autoPublish, minStars: f.minStars, verifiedOnly: f.verifiedOnly });
    setAsk({ on: f.askOn, days: f.days });
    toast('Review settings saved');
    onClose();
  };
  const sw = (on, label, onClick) => <button type="button" className="gc-switch" role="switch" aria-checked={!!on} aria-label={label} onClick={onClick}><span className="gc-switch__knob" /></button>;
  return (
    <Sheet open title="Review settings" onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={save}>Save</button></>}>
      <div className="rv-set">
        <section aria-label="Publishing">
          <h3>Publishing</h3>
          <div className="rv-row"><span>Publish good reviews automatically<small>The rest wait in Pending for you.</small></span>{sw(f.autoPublish, 'Publish good reviews automatically', () => set({ autoPublish: !f.autoPublish }))}</div>
          {f.autoPublish ? (<>
            <div>
              <label className="gc-label" htmlFor="rv-min">Which reviews</label>
              <select id="rv-min" className="gc-input gc-select" value={f.minStars} onChange={(e) => set({ minStars: Number(e.target.value) })}>
                <option value={4}>4 and 5 stars</option>
                <option value={5}>5 stars only</option>
              </select>
            </div>
            <label className="rv-row" style={{ justifyContent: 'flex-start' }}><input type="checkbox" className="gc-check" checked={f.verifiedOnly} onChange={() => set({ verifiedOnly: !f.verifiedOnly })} />Only from verified buyers</label>
          </>) : null}
          <p className="gc-help" style={{ margin: 0 }}>Reviews with links or ads always go to Spam. New reviews follow these settings.</p>
        </section>
        <section aria-label="Ask for a review">
          <h3>Ask for a review</h3>
          <div className="rv-row"><span>Ask buyers after delivery</span>{sw(f.askOn, 'Ask buyers after delivery', () => set({ askOn: !f.askOn }))}</div>
          {f.askOn ? (
            <div>
              <label className="gc-label" htmlFor="rv-days">When</label>
              <select id="rv-days" className="gc-input gc-select" value={f.days} onChange={(e) => set({ days: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5, 7, 10, 14].map((d) => <option key={d} value={d}>{d === 1 ? '1 day after delivery' : `${d} days after delivery`}</option>)}
              </select>
            </div>
          ) : null}
          <div className="rv-msg">
            Sent as an SMS by the automation <b>“{f.rule.name || 'Ask for a review after delivery'}”</b>.
            {f.rule.text ? <div style={{ marginTop: 4, color: 'var(--text-muted)' }}>{f.rule.text}</div> : null}
          </div>
          <Link href="/automations" className="gc-help" style={{ color: 'var(--primary)' }}>Open in Automations</Link>
        </section>
      </div>
    </Sheet>
  );
}

export default function ProductReviews() {
  const { list, ready, now } = useReviews();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [stars, setStars] = useState(0);
  const [sku, setSku] = useState('');
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState([]);
  const [hiding, setHiding] = useState(null);     // ids to hide
  const [replying, setReplying] = useState(null); // review
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    const t = queryParam('tab'); if (TABS.some((x) => x[0] === t)) setTab(t);
    setSku(queryParam('sku'));
  }, []);
  useEffect(() => { setPage(0); }, [tab, q, stars, sku]);

  const base = useMemo(() => {
    const s = q.trim().toLowerCase();
    return list.filter((r) => (!sku || r.sku === sku || r.sku.startsWith(sku + '-'))
      && (!stars || r.stars === stars)
      && (!s || [r.product, r.name, r.text, r.order, r.phone].some((x) => String(x || '').toLowerCase().includes(s))));
  }, [list, q, stars, sku]);
  const counts = useMemo(() => {
    const c = { all: base.length };
    Object.keys(STATUS).forEach((k) => { c[k] = base.filter((r) => r.status === k).length; });
    return c;
  }, [base]);
  const shown = base.filter((r) => tab === 'all' || r.status === tab);
  const pageRows = shown.slice(page * PER, page * PER + PER);
  const skuName = sku ? (list.find((r) => r.sku === sku || r.sku.startsWith(sku + '-')) || {}).product || sku : '';

  // figures (published reviews of the products in view)
  const facts = useMemo(() => {
    const scope = list.filter((r) => !sku || r.sku === sku || r.sku.startsWith(sku + '-'));
    const pub = scope.filter((r) => r.status === 'published');
    const avg = pub.length ? pub.reduce((a, r) => a + r.stars, 0) / pub.length : 0;
    const recent = scope.filter((r) => r.status !== 'spam' && now - r.at <= 30 * DAY).length;
    const real = scope.filter((r) => r.status !== 'spam');
    const ver = real.length ? Math.round((real.filter((r) => r.verified).length / real.length) * 100) : 0;
    return { avg, pub: pub.length, recent, ver };
  }, [list, sku, now]);

  const picked = sel.filter((id) => list.some((r) => r.id === id));
  const ids = pageRows.map((r) => r.id);
  const allOn = ids.length > 0 && ids.every((id) => picked.includes(id));
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => setSel(allOn ? picked.filter((id) => !ids.includes(id)) : [...new Set([...picked, ...ids])]);
  const plural = (n) => `${n} review${n === 1 ? '' : 's'}`;

  const withUndo = (ids2, act, msg) => {
    const prev = editsOf(ids2);
    act();
    toast(msg, { undo: () => { restore(prev); toast('Undone'); } });
    setSel([]);
  };
  const doPublish = (ids2) => withUndo(ids2, () => publish(ids2), ids2.length === 1 ? 'Review published' : `${plural(ids2.length)} published`);
  const doSpam = (ids2) => withUndo(ids2, () => markSpam(ids2), ids2.length === 1 ? 'Marked as spam' : `${plural(ids2.length)} marked as spam`);
  const doHide = (reason) => { const ids2 = hiding || []; setHiding(null); withUndo(ids2, () => hide(ids2, reason), ids2.length === 1 ? 'Review hidden' : `${plural(ids2.length)} hidden`); };
  const doDelete = async (ids2) => {
    const ok = await confirmDialog({ title: ids2.length === 1 ? 'Delete this review?' : `Delete ${plural(ids2.length)}?`, body: 'It is removed for good, with its reply. Hide it instead to keep it.', confirmLabel: 'Delete', tone: 'danger' });
    if (!ok) return;
    deleteReviews(ids2);
    setSel([]);
    toast(`${plural(ids2.length)} deleted`);
  };
  const dropReply = async (r) => {
    const ok = await confirmDialog({ title: 'Remove your reply?', body: 'It is taken off the website.', confirmLabel: 'Remove', tone: 'danger' });
    if (!ok) return;
    removeReply(r.id);
    toast('Reply removed');
  };

  const menuOf = (r) => [
    r.status !== 'published' ? { label: 'Publish', onClick: () => doPublish([r.id]) } : null,
    r.status !== 'hidden' ? { label: 'Hide…', onClick: () => setHiding([r.id]) } : null,
    r.status !== 'spam' ? { label: 'Mark as spam', onClick: () => doSpam([r.id]) } : null,
    { label: r.reply ? 'Edit reply' : 'Reply', onClick: () => setReplying(r) },
    { label: 'Delete', onClick: () => doDelete([r.id]), tone: 'danger' },
  ].filter(Boolean);
  const mainAct = (r) => (r.status === 'published'
    ? { label: 'Hide', icon: 'eye-off', onClick: () => setHiding([r.id]) }
    : { label: r.status === 'spam' ? 'Not spam' : 'Publish', icon: 'check', onClick: () => doPublish([r.id]) });

  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'rv-tab-' + id, label, count: ready ? counts[id] : null, on: tab === id, onClick: () => setTab(id) }));
  const closeFind = () => { setFind(false); setQ(''); };
  const starItems = [{ label: 'All stars', onClick: () => setStars(0) }, ...[5, 4, 3, 2, 1].map((n) => ({ label: `${n} star${n === 1 ? '' : 's'} (${list.filter((r) => r.stars === n && (!sku || r.sku === sku)).length})`, onClick: () => setStars(n) }))];
  const clearSku = () => { setSku(''); try { window.history.replaceState(null, '', '/product-reviews'); } catch { /* ignore */ } };

  return (
    <StoreFrame screen="ProductReviews" active="store-reviews" page="Reviews" css={CSS}
      after={<>
        <HideDialog open={!!hiding} count={(hiding || []).length} onClose={() => setHiding(null)} onDone={doHide} />
        <ReplyDialog review={replying} onClose={() => setReplying(null)} />
        <SettingsSheet open={settings} onClose={() => setSettings(false)} />
      </>}>
      <ShopHeader icon="star" title="Reviews"
        about="What buyers wrote about your products. Publish the good ones, hide or mark as spam the rest, and reply in public. Verified buyer means the same phone number had a delivered order with that product."
        secondary={[{ label: 'Review settings', icon: 'settings-2', onClick: () => setSettings(true) }]} />

      <MetricStrip items={[
        { label: 'Average rating', value: ready && facts.pub ? facts.avg.toFixed(1) + ' ★' : '—', sub: ready ? `${facts.pub} published` : '', icon: 'star' },
        { label: 'New in 30 days', value: ready ? String(facts.recent) : '—', icon: 'message-square' },
        { label: 'Verified buyers', value: ready ? facts.ver + '%' : '—', icon: 'badge-check' },
      ]} />

      <section className="ix-card" aria-label="Reviews">
        {picked.length ? (
          <div className="ix-bulk" role="toolbar" aria-label="Selected reviews">
            <input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="Select all shown reviews" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
            <span className="ix-bulk__n">{picked.length} selected</span>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => doPublish(picked)}><Icon name="check" width="16" height="16" aria-hidden="true" />Publish</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setHiding(picked)}><Icon name="eye-off" width="16" height="16" aria-hidden="true" />Hide</button>
            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Mark as spam', onClick: () => doSpam(picked) }, { label: 'Delete', onClick: () => doDelete(picked), tone: 'danger' }, { label: 'Clear selection', onClick: () => setSel([]) }]} />
          </div>
        ) : (
          <div className="ix-bar">
            {find ? (<>
              <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product, customer or words" onDone={closeFind} autoFocus />
              <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
            </>) : (<>
              <IndexTabs tabs={tabs} label="Review status" />
              <span className="ix-tools">
                <Menu label={stars ? `${stars} star${stars === 1 ? '' : 's'}` : 'All stars'} icon="star" cls="ix-btn ix-btn--sm" items={starItems} />
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search reviews" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
              </span>
            </>)}
          </div>
        )}
        {sku ? <div className="rv-filters"><span className="rv-chip">Product: {skuName}<button type="button" aria-label="Show all products" onClick={clearSku}><Icon name="x" width="14" height="14" aria-hidden="true" /></button></span></div> : null}

        {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : shown.length === 0 ? (
          <div className="ix-empty"><EmptyState icon="star" title={list.length ? 'No reviews match' : 'No reviews yet'} body={list.length ? 'Try another view, star or search.' : 'Reviews come in after delivery, when buyers answer the review request.'} actionLabel={list.length ? 'Show all reviews' : 'Review settings'} onAction={() => { if (list.length) { setQ(''); setFind(false); setTab('all'); setStars(0); clearSku(); } else setSettings(true); }} /></div>
        ) : (
          <ul className="rv-list" aria-label="Reviews">
            {pageRows.map((r) => {
              const act = mainAct(r);
              return (
                <li key={r.id} className={'rv-item' + (picked.includes(r.id) ? ' is-sel' : '')}>
                  <input type="checkbox" aria-label={`Select the review by ${r.name}`} checked={picked.includes(r.id)} onChange={() => toggle(r.id)} />
                  <div className="rv-main">
                    <div className="rv-top">
                      <Stars n={r.stars} />
                      <Link href={'/add-product?sku=' + encodeURIComponent(r.sku)} className="rv-prod">{r.product}</Link>
                      <span className="rv-when">{formatDate(r.at)}, {formatTime(r.at)}</span>
                      <ReviewStatus status={r.status} />
                    </div>
                    <p className="rv-text">{r.text}</p>
                    {r.photos.length ? <div className="rv-photos" aria-label={`${r.photos.length} photo${r.photos.length === 1 ? '' : 's'} from the customer`}>{r.photos.map((p) => <span key={p.id} className="rv-photo" style={{ background: p.tone }} title="Customer photo"><Icon name="image" width="18" height="18" aria-hidden="true" /></span>)}</div> : null}
                    <div className="rv-who">
                      <b>{r.name}</b>
                      {r.verified
                        ? <><StatusBadge tone="success" icon="badge-check">Verified buyer</StatusBadge><Link href={orderHref(r.order)}>Order {r.order}</Link></>
                        : <span>Not verified: no delivered order with this product</span>}
                    </div>
                    {r.status === 'hidden' && r.hideReason ? <span className="rv-note">Hidden: {r.hideReason}</span> : null}
                    {r.auto ? <span className="rv-note">{r.auto}</span> : null}
                    {r.reply ? (
                      <div className="rv-reply">
                        <b>Reply from Dazzle Shop</b>
                        <p>{r.reply.text}</p>
                        <small><span>{formatDate(r.reply.at)}</span><button type="button" onClick={() => setReplying(r)}>Edit</button><button type="button" onClick={() => dropReply(r)}>Remove</button></small>
                      </div>
                    ) : null}
                  </div>
                  <div className="rv-acts">
                    <button type="button" className="ix-btn ix-btn--sm" onClick={act.onClick}><Icon name={act.icon} width="16" height="16" aria-hidden="true" />{act.label}</button>
                    {!r.reply ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setReplying(r)}><Icon name="reply" width="16" height="16" aria-hidden="true" />Reply</button> : null}
                    <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={menuOf(r)} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {ready && shown.length > PER ? (
          <Pager label={`${page * PER + 1}–${Math.min(shown.length, page * PER + PER)} of ${shown.length}`} atStart={page === 0} atEnd={(page + 1) * PER >= shown.length} prev={() => setPage((p) => Math.max(0, p - 1))} next={() => setPage((p) => p + 1)} />
        ) : <div className="ix-foot"><span>{ready ? plural(shown.length) : ''}</span></div>}
      </section>
    </StoreFrame>
  );
}
