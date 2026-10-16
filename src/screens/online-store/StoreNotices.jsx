'use client';
// Store notices — Online Store › Store notices (/store-notices, Batch A step 2): the short messages customers see above,
// under or inside the header, or floating on phones. Each row: the notice (with its code), where it shows, who sees it,
// when, and whether it is showing now; "…": Edit, Turn off / on, Move up / down, Delete. Add notice and Edit open a side
// panel: text in English and Bangla (or today's offer line from Marketing), fill from an offer, button and link, coupon
// code, countdown, colours, place, pages / categories / products / devices, start and end (Bangladesh time) and "can be
// closed". The preview at the bottom shows the store with the notices as they are being edited. ?offer=<id> opens a new
// notice filled from that offer. Data: lib/storefront/notices.js (in the storefront store, so it travels in a store kit).

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, StatusBadge, Sheet } from '@/components/ui';
import { ShopHeader, Menu } from '@/components/ui/IndexKit';
import { clockNow } from '@/lib/settlements';
import { websiteOffers } from '@/lib/storeOffers';
import { toDhakaInput, fromDhakaInput, dhakaText } from '@/lib/seo';
import { NOTICE_PLACES, NOTICE_TONES, NOTICE_SOURCES, PAGE_KINDS, DEVICES } from '@/lib/storefront/schema';
import { getNotices, saveNotice, deleteNotice, moveNotice, newNotice, noticeProblem, noticeState, noticeFromOffer, STATE } from '@/lib/storefront/notices';
import { showText } from '@/lib/storefront/show';
import { lockOf } from '@/lib/storefront/access';
import { StoreFrame, queryParam } from './storeShared';
import { useSf, PreviewFrame, DeviceSwitch, CatPick, ProductPick, LockNote, SFB_CSS } from './sfShared';

const CSS = SFB_CSS + `
.sn-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.sn-text b{font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:420px}
.sn-text small{color:var(--text-muted);font-size:var(--text-xs)}
.sn-code{display:inline-block;margin-left:6px;padding:0 6px;border:1px dashed var(--border-strong);border-radius:var(--radius-md);font-family:var(--font-data);font-size:var(--text-xs)}
.sn-sw{display:inline-block;width:14px;height:14px;border-radius:var(--radius-full);vertical-align:-2px;margin-right:6px;border:1px solid var(--border-subtle)}
.sn-chips{display:flex;flex-wrap:wrap;gap:6px}
.sn-chips button{display:inline-flex;align-items:center;gap:4px;min-height:28px;padding:0 8px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-subtle);font:inherit;font-size:var(--text-xs);color:var(--text-heading);cursor:pointer}
.sn-kinds{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 12px}
.sn-kinds label{display:flex;align-items:center;gap:8px;font-size:var(--text-sm)}
.sn-count{font-size:var(--text-xs);color:var(--text-muted);text-align:right}
.sn-pv-bar{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-4)}
@media (max-width:640px){.sn-kinds{grid-template-columns:minmax(0,1fr)}.sn-text b{max-width:220px}}
`;

const TONE_SW = { accent: 'var(--viz-2)', primary: 'var(--primary)', dark: '#0f172a', light: '#ffffff', sale: '#dc2626' };
const label = (list, v) => ((list.find((x) => x[0] === v) || [v, v])[1]);
const whenText = (n) => (n.start || n.end ? [n.start ? 'From ' + dhakaText(n.start) : '', n.end ? 'until ' + dhakaText(n.end) : ''].filter(Boolean).join(' ') : 'Always');

function Field({ id, label: l, children, hint }) {
  return <div className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label>{children}{hint ? <p className="sfb-muted">{hint}</p> : null}</div>;
}

function NoticeSheet({ open, draft, setDraft, onSave, onClose, isNew }) {
  const offers = useMemo(() => { try { return websiteOffers(clockNow()).filter((o) => o.state !== 'ended'); } catch { return []; } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open || !draft) return null;
  const n = draft;
  const set = (patch) => setDraft({ ...n, ...patch });
  const show = n.show || { pages: 'all', devices: 'all' };
  const setShow = (patch) => set({ show: { ...show, ...patch } });
  const allPages = show.pages === 'all';
  const kinds = allPages ? [] : show.pages || [];
  const problem = noticeProblem(n);
  return (
    <Sheet open title={isNew ? 'New notice' : 'Edit notice'} onClose={onClose}
      footer={<>
        {problem ? <p className="sfb-warn" style={{ flex: 1 }}><Icon name="triangle-alert" width="14" height="14" aria-hidden="true" /><span>{problem}</span></p> : <span style={{ flex: 1 }} />}
        <button type="button" className="gc-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="gc-btn gc-btn--solid" disabled={!!problem} onClick={onSave}>Save notice</button>
      </>}>
      <div className="sfb-fields">
        {offers.length ? (
          <Field id="sn-offer" label="Fill from an offer" hint="Takes the offer’s name, code, end time and page.">
            <select id="sn-offer" className="gc-input gc-select" value="" onChange={(e) => { const o = offers.find((x) => x.id === e.target.value); if (o) { set(noticeFromOffer(o)); toast('Filled from ' + o.title); } }}>
              <option value="">Choose an offer…</option>
              {offers.map((o) => <option key={o.id} value={o.id}>{o.title}{o.state === 'soon' ? ' (starts later)' : ''}</option>)}
            </select>
          </Field>
        ) : null}
        <Field id="sn-from" label="Text">
          <select id="sn-from" className="gc-input gc-select" value={n.from || ''} onChange={(e) => set({ from: e.target.value })}>{NOTICE_SOURCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </Field>
        {n.from === 'offers' ? <p className="sfb-muted">The live flash sale and code from Marketing show here by themselves.</p> : (<>
          <div className="sfb-field">
            <label className="gc-label" htmlFor="sn-text">In English</label>
            <input id="sn-text" className="gc-input" maxLength={140} value={n.text || ''} placeholder="Free delivery inside Dhaka on orders over ৳2,000" onChange={(e) => set({ text: e.target.value })} autoFocus />
            <span className="sn-count">{(n.text || '').length}/140</span>
          </div>
          <div className="sfb-field">
            <label className="gc-label" htmlFor="sn-bn">In Bangla</label>
            <input id="sn-bn" className="gc-input" lang="bn" maxLength={140} value={n.textBn || ''} placeholder="Optional · shown when a customer reads in Bangla" onChange={(e) => set({ textBn: e.target.value })} />
          </div>
        </>)}
        <div className="sfb-two">
          <Field id="sn-btn" label="Button"><input id="sn-btn" className="gc-input" maxLength={30} value={n.button || ''} placeholder="Shop now" onChange={(e) => set({ button: e.target.value })} /></Field>
          <Field id="sn-link" label="Link"><input id="sn-link" className="gc-input" value={n.link || ''} placeholder="/offers" onChange={(e) => set({ link: e.target.value.trim() })} /></Field>
        </div>
        <Field id="sn-code" label="Coupon code" hint="Customers can copy it with one tap."><input id="sn-code" className="gc-input" maxLength={30} value={n.code || ''} placeholder="EID300" onChange={(e) => set({ code: e.target.value.toUpperCase().replace(/\s/g, '') })} /></Field>
        <div className="sfb-two">
          <Field id="sn-start" label="Starts"><input id="sn-start" type="datetime-local" className="gc-input" value={toDhakaInput(n.start)} onChange={(e) => set({ start: fromDhakaInput(e.target.value) })} /></Field>
          <Field id="sn-end" label="Ends"><input id="sn-end" type="datetime-local" className="gc-input" value={toDhakaInput(n.end)} onChange={(e) => set({ end: fromDhakaInput(e.target.value) })} /></Field>
        </div>
        <div className="sfb-row"><span id="sn-cd">Countdown to the end</span><button type="button" role="switch" className="gc-switch" aria-checked={!!n.countdown} aria-labelledby="sn-cd" onClick={() => set({ countdown: !n.countdown })}><span className="gc-switch__knob" /></button></div>
        <div className="sfb-two">
          <Field id="sn-place" label="Where"><select id="sn-place" className="gc-input gc-select" value={n.place} onChange={(e) => set({ place: e.target.value })}>{NOTICE_PLACES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <Field id="sn-tone" label="Colours"><select id="sn-tone" className="gc-input gc-select" value={n.tone} onChange={(e) => set({ tone: e.target.value })}>{NOTICE_TONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        </div>
        {n.place === 'header' ? <p className="sfb-muted">Add the Store notice element to a header row in the <a href="/header-builder">Header builder</a>.</p> : null}
        <div className="sfb-field">
          <span className="gc-label">Pages</span>
          <div className="sfb-row"><span id="sn-all">Every page</span><button type="button" role="switch" className="gc-switch" aria-checked={allPages} aria-labelledby="sn-all" onClick={() => setShow({ pages: allPages ? ['home'] : 'all' })}><span className="gc-switch__knob" /></button></div>
          {!allPages ? (
            <div className="sn-kinds" role="group" aria-label="Kinds of page">
              {PAGE_KINDS.map(([k, l]) => <label key={k}><input type="checkbox" className="gc-check" checked={kinds.includes(k)} onChange={() => setShow({ pages: kinds.includes(k) ? kinds.filter((x) => x !== k) : [...kinds, k] })} />{l}</label>)}
            </div>
          ) : null}
        </div>
        <Field id="sn-cat" label="Only for these categories" hint="Leave empty for every category. Works on category and product pages.">
          <CatPick id="sn-cat" value="" onChange={(c) => { if (c && !(show.categories || []).includes(c)) setShow({ categories: [...(show.categories || []), c] }); }} />
          {(show.categories || []).length ? <div className="sn-chips">{show.categories.map((c) => <button key={c} type="button" aria-label={'Remove ' + c} onClick={() => setShow({ categories: show.categories.filter((x) => x !== c) })}>{c}<Icon name="x" width="12" height="12" aria-hidden="true" /></button>)}</div> : null}
        </Field>
        <Field id="sn-prod" label="Or these products">
          <ProductPick id="sn-prod" value="" onChange={(p) => { if (p && !(show.products || []).includes(p)) setShow({ products: [...(show.products || []), p] }); }} />
          {(show.products || []).length ? <div className="sn-chips">{show.products.map((p) => <button key={p} type="button" aria-label={'Remove ' + p} onClick={() => setShow({ products: show.products.filter((x) => x !== p) })}>{p}<Icon name="x" width="12" height="12" aria-hidden="true" /></button>)}</div> : null}
        </Field>
        <Field id="sn-dev" label="Devices"><select id="sn-dev" className="gc-input gc-select" value={show.devices || 'all'} onChange={(e) => setShow({ devices: e.target.value })}>{DEVICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        <div className="sfb-row"><span id="sn-x">Customers can close it</span><button type="button" role="switch" className="gc-switch" aria-checked={!!n.dismiss} aria-labelledby="sn-x" onClick={() => set({ dismiss: !n.dismiss })}><span className="gc-switch__knob" /></button></div>
      </div>
    </Sheet>
  );
}

export default function StoreNotices() {
  const { ready, d } = useSf();
  const [now, setNow] = useState(0);
  const [draft, setDraft] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [device, setDevice] = useState('desktop');
  const locked = ready ? lockOf('header') : '';
  useEffect(() => { setNow(clockNow()); const t = setInterval(() => setNow(clockNow()), 30000); return () => clearInterval(t); }, []);
  const list = useMemo(() => (ready ? getNotices() : []), [ready, d]);
  // ?offer=<id>: a new notice filled from that offer (Marketing › Offers)
  useEffect(() => {
    if (!ready) return;
    const id = queryParam('offer');
    if (!id) return;
    let o = null;
    try { o = websiteOffers(clockNow()).find((x) => x.id === id) || null; } catch { o = null; }
    if (o) { setIsNew(true); setDraft(newNotice(noticeFromOffer(o))); }
  }, [ready]);

  const add = () => { setIsNew(true); setDraft(newNotice()); };
  const edit = (n) => { setIsNew(false); setDraft(JSON.parse(JSON.stringify(n))); };
  const save = () => { saveNotice(draft); toast(isNew ? 'Notice added' : 'Notice saved'); setDraft(null); };
  const toggle = (n) => { saveNotice({ ...n, on: !n.on }); toast(n.on ? 'Notice turned off' : 'Notice turned on'); };
  const remove = async (n) => {
    if (!(await confirmDialog({ title: 'Delete this notice?', body: `“${n.text || 'Today’s offer'}” is removed for good.`, confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteNotice(n.id);
    toast('Notice deleted');
  };
  // the preview shows the list with the notice being edited
  const previewList = draft ? (list.some((x) => x.id === draft.id) ? list.map((x) => (x.id === draft.id ? draft : x)) : [...list, draft]) : list;
  const rowMenu = (n, i) => [
    { label: 'Edit', onClick: () => edit(n) },
    { label: n.on ? 'Turn off' : 'Turn on', onClick: () => toggle(n) },
    i > 0 ? { label: 'Move up', onClick: () => moveNotice(n.id, -1) } : null,
    i < list.length - 1 ? { label: 'Move down', onClick: () => moveNotice(n.id, 1) } : null,
    { label: 'Delete', onClick: () => remove(n), tone: 'danger' },
  ].filter(Boolean);
  const textOf = (n) => (n.from === 'offers' ? 'Today’s offer, from Marketing' : n.text || '—');

  return (
    <StoreFrame screen="StoreNotices" active="store-notices" page="Store notices" css={CSS}
      after={<NoticeSheet open={!!draft} draft={draft} setDraft={setDraft} onSave={save} onClose={() => setDraft(null)} isNew={isNew} />}>
      <ShopHeader icon="megaphone" title="Store notices"
        about="Short messages above, under or inside your store's header, or floating on phones: a sale with a countdown, a coupon code, a delivery cut-off, a holiday closing. Each can run on its own dates and show only on some pages. Two notices in one place take turns."
        more={[{ label: 'Header builder', href: '/header-builder' }, { label: 'View store', onClick: () => window.open('/store', '_blank', 'noopener') }]}
        primary={{ label: 'Add notice', onClick: add, disabled: !!locked }} />
      <LockNote text={locked} />
      <section className="ix-card" aria-label="Notices">
        {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : !list.length ? (
          <div className="ix-empty"><EmptyState icon="megaphone" title="No notices yet" body="Tell customers about a sale, a code or a delivery cut-off." actionLabel="Add notice" onAction={add} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Notices">
            {list.map((n, i) => { const s = STATE[noticeState(n, now || Date.now())]; return <li key={n.id}><button type="button" className="ix-pitem" onClick={() => edit(n)}><span className="ix-pitem__top"><b>{textOf(n)}</b><StatusBadge tone={s.tone}>{s.label}</StatusBadge></span><span className="ix-pitem__mid">{label(NOTICE_PLACES, n.place).split(',')[0]} · {whenText(n)}</span></button></li>; })}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">{`Store notices, ${list.length}`}</caption>
              <thead><tr><th scope="col">Notice</th><th scope="col">Where</th><th scope="col">Who sees it</th><th scope="col">When</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {list.map((n, i) => {
                  const s = STATE[noticeState(n, now || Date.now())];
                  return (
                    <tr key={n.id} onClick={(e) => { if (!e.target.closest('a,button')) edit(n); }}>
                      <td><span className="sn-text"><b><span className="sn-sw" style={{ background: TONE_SW[n.tone] || TONE_SW.accent }} aria-hidden="true" />{textOf(n)}{n.code ? <span className="sn-code">{n.code}</span> : null}</b>{n.countdown ? <small>With a countdown</small> : n.textBn ? <small lang="bn">{n.textBn}</small> : null}</span></td>
                      <td>{label(NOTICE_PLACES, n.place).split(',')[0].replace(/ \(.*$/, '')}</td>
                      <td className="ix-muted">{showText(n.show)}</td>
                      <td className="ix-muted">{whenText(n)}</td>
                      <td><StatusBadge tone={s.tone}>{s.label}</StatusBadge></td>
                      <td style={{ textAlign: 'right' }}><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={rowMenu(n, i)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{list.length === 1 ? '1 notice' : list.length + ' notices'}{list.length > 1 ? ' · notices in the same place take turns, in this order' : ''}</span></div>
      </section>
      <section className="ix-card" aria-labelledby="sn-pv">
        <div className="sn-pv-bar"><h2 id="sn-pv" style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{draft ? 'Preview · with your changes' : 'Preview'}</h2><DeviceSwitch device={device} onChange={setDevice} /></div>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>{ready ? <PreviewFrame src="/store?preview=1" device={device} parts={[['notices', previewList]]} height={device === 'phone' ? 520 : 320} title="Store with notices" /> : null}</div>
      </section>
    </StoreFrame>
  );
}
