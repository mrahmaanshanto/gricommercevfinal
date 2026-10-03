'use client';
// AdAudiences — Marketing › Ad audiences (/ad-audiences), a list page (docs/shopify-style.md). Brief #13: a customer
// segment (lib/segments.js) is sent to Meta or TikTok as a custom audience (lib/audiences.js). Each sync works out who
// may be sent (a phone or email, an active account, not left out of ads, a marketing yes) and reads back the
// platform's match range. Removing an audience, or a customer asking to be left out, queues a removal there.
// Ad spend and results stay in Analytics; this page only shows which segment goes where and how the sync went.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { ShopHeader, LearnMore, Menu } from '@/components/ui/IndexKit';
import { toast, confirmDialog } from '@/runtime/ui';
import { getAudiences, createAudience, syncAudience, removeAudience, forgetRemoved, audienceCheck, PROVIDERS, USE_CASES, AUD_STATUS, AUDIENCES_EVENT } from '@/lib/audiences';
import { getSegments, SEGMENT_TEMPLATES, getSegment } from '@/lib/segments';
import { getCrmRows } from '@/lib/crm';
import { currentUser } from '@/lib/team';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const when = (t) => { if (!t) return '—'; const d = new Date(t), h = d.getHours(); return d.getDate() + ' ' + MON[d.getMonth()] + ', ' + (h % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM'); };
const CSS = `
.aa-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.aa-form{display:flex;flex-direction:column;gap:var(--space-3)}
.aa-check{display:flex;flex-direction:column;gap:4px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm)}
.aa-check b{font-weight:var(--weight-semibold);color:var(--text-heading)}
`;

export default function AdAudiencesScreen() {
  const [ready, setReady] = useState(false);
  const [ver, setVer] = useState(0);
  const bump = useCallback(() => setVer((v) => v + 1), []);
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');
  const me = (currentUser() || {}).name || 'Staff';
  useEffect(() => {
    setReady(true);
    try { const seg = new URLSearchParams(window.location.search).get('segment'); if (seg && getSegment(seg)) setForm({ name: '', segmentId: seg, provider: 'meta', useCase: 'retarget' }); } catch { /* no URL access */ }
    window.addEventListener(AUDIENCES_EVENT, bump);
    const t = setInterval(bump, 1000);
    return () => { window.removeEventListener(AUDIENCES_EVENT, bump); clearInterval(t); };
  }, [bump]);
  const list = useMemo(() => (ready ? getAudiences().filter((a) => a.status !== 'removed') : []), [ready, ver]);
  const rows = useMemo(() => (ready ? getCrmRows() : []), [ready]);
  const segs = ready ? [...getSegments(), ...SEGMENT_TEMPLATES] : [];
  const chk = useMemo(() => (form && form.segmentId ? audienceCheck(form.segmentId, rows) : null), [form, rows]);

  const openNew = () => { setForm({ name: '', segmentId: (segs[0] || {}).id || '', provider: 'meta', useCase: 'retarget' }); setErr(''); };
  const save = () => {
    const r = createAudience({ ...form, by: me });
    if (!r.ok) { setErr(r.error); return; }
    setForm(null); bump(); toast('Audience created. The first sync is running.');
  };
  const sync = (a) => { syncAudience(a.id); bump(); toast('Syncing ' + a.name + '.'); };
  const remove = async (a) => {
    if (!(await confirmDialog({ title: 'Remove this audience?', body: PROVIDERS[a.provider].label + ' is asked to delete it. Ads using it stop reaching these people.', confirmLabel: 'Remove', tone: 'danger' }))) return;
    removeAudience(a.id); bump(); toast('Removal sent to ' + PROVIDERS[a.provider].label + '.');
    setTimeout(() => { forgetRemoved(); bump(); }, 7000);
  };
  const menu = (a) => [
    a.status !== 'removing' ? { label: 'Sync now', onClick: () => sync(a) } : null,
    a.segment ? { label: 'Show customers', href: '/all-customers?segment=' + a.segmentId } : null,
    a.status !== 'removing' ? { label: 'Remove', tone: 'danger', onClick: () => remove(a) } : null,
  ].filter(Boolean);
  const excludedText = (a) => (a.last ? a.last.excluded + ' left out' : '—');

  return (
    <div className="dc-screen ds" data-screen="AdAudiences">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="rec-audiences" />
        <main className="gc-shell__main">
          <Topbar crumb="Marketing" page="Ad audiences" placeholder="Search customer by name or phone" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="target" title="Ad audiences"
                about="Send a customer segment to Meta or TikTok as a custom audience, to show ads to them, leave them out, or find people like them. Only customers who can be reached and agreed to marketing are sent. Phone numbers and emails are hashed before upload; hashing hides the raw values but does not make the data anonymous. Results of the ads are in Analytics."
                more={[{ label: 'Customer settings', href: '/customer-settings#segments' }, { label: 'Connections', href: '/connections' }, { label: 'Abandoned carts', href: '/abandoned-carts' }]}
                primary={{ label: 'New audience', onClick: openNew }} />
              <section className="ix-card" aria-label="Ad audiences">
                {!ready ? null : !list.length ? (
                  <div className="ix-empty"><EmptyState icon="target" title="No audiences yet." actionLabel="New audience" onAction={openNew} /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Ad audiences">
                    {list.map((a) => (
                      <li key={a.id} className="ix-pitem">
                        <span className="ix-pitem__top"><b>{a.name}</b><span>{a.last ? a.last.eligible + ' sent' : ''}</span></span>
                        <span className="ix-pitem__mid">{PROVIDERS[a.provider].label} · {USE_CASES[a.useCase]} · match {a.last ? a.last.match : '—'}</span>
                        <span className="ix-pitem__tags"><StatusBadge tone={AUD_STATUS[a.status].tone}>{a.status === 'syncing' ? 'Syncing ' + a.progress + '%' : AUD_STATUS[a.status].label}</StatusBadge><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={menu(a)} /></span>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table ix-table--static gc-table--keep">
                      <thead><tr><th scope="col">Audience</th><th scope="col">Status</th><th scope="col" className="ix-num">Sent</th><th scope="col">Match <InfoTip text="What the platform reports, as a range. It never tells you who exactly was matched." /></th><th scope="col">Last sync</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                      <tbody>
                        {list.map((a) => (
                          <tr key={a.id}>
                            <td><span className="ix-strong">{a.name}</span><span className="aa-sub">{a.segment ? <Link href={'/all-customers?segment=' + a.segmentId}>{a.segment.name}</Link> : 'Segment deleted'} · {PROVIDERS[a.provider].label} {a.account ? '(' + a.account + ')' : ''} · {USE_CASES[a.useCase]}</span></td>
                            <td><StatusBadge tone={AUD_STATUS[a.status].tone}>{a.status === 'syncing' ? 'Syncing ' + a.progress + '%' : AUD_STATUS[a.status].label}</StatusBadge>{a.status === 'partial' && a.connNote ? <span className="aa-sub">{a.connNote}</span> : null}</td>
                            <td className="ix-num">{a.last ? a.last.eligible : '—'}<span className="aa-sub">{excludedText(a)}</span></td>
                            <td className="ix-muted">{a.last ? a.last.match : '—'}</td>
                            <td className="ix-muted">{when(a.lastSyncAt)}<span className="aa-sub">{a.last ? '+' + a.last.added + ' · −' + a.last.removed : ''}</span></td>
                            <td className="ix-num"><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={menu(a)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{list.length === 1 ? '1 audience' : list.length + ' audiences'} · updates when you sync</span></div>
              </section>
              <LearnMore topic="ad audiences" />
            </div>
          </div>
          <Dialog open={!!form} title="New audience" onClose={() => setForm(null)} width={520} footer={<>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={save}>Create and sync</button>
          </>}>
            {form ? (
              <div className="aa-form">
                {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
                <div className="ly-field"><label className="gc-label" htmlFor="aa-seg">Segment</label><select id="aa-seg" className="gc-input gc-select" value={form.segmentId} onChange={(e) => setForm({ ...form, segmentId: e.target.value })}>{segs.map((s) => <option key={s.id} value={s.id}>{s.name}{s.owner ? ' · ready-made' : ''}</option>)}</select></div>
                <div className="ly-two">
                  <div className="ly-field"><label className="gc-label" htmlFor="aa-prov">Send to</label><select id="aa-prov" className="gc-input gc-select" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>{Object.keys(PROVIDERS).map((k) => <option key={k} value={k}>{PROVIDERS[k].label}</option>)}</select></div>
                  <div className="ly-field"><label className="gc-label" htmlFor="aa-use">Use</label><select id="aa-use" className="gc-input gc-select" value={form.useCase} onChange={(e) => setForm({ ...form, useCase: e.target.value })}>{Object.keys(USE_CASES).map((k) => <option key={k} value={k}>{USE_CASES[k]}</option>)}</select></div>
                </div>
                <div className="ly-field"><label className="gc-label" htmlFor="aa-name">Name (optional)</label><input id="aa-name" className="gc-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} /></div>
                {chk ? (
                  <div className="aa-check" role="status">
                    <span><b className="ly-fig">{chk.eligible.length}</b> of {chk.members.length} can be sent</span>
                    {Object.keys(chk.excluded).map((k) => <span key={k} className="aa-sub">{chk.excluded[k]} left out: {k.toLowerCase()}</span>)}
                  </div>
                ) : null}
                <p className="gc-help" style={{ margin: 0 }}><Icon name="lock" width="14" height="14" aria-hidden="true" style={{ verticalAlign: '-2px' }} /> Phone numbers and emails are hashed before upload. That hides the raw values; it does not make the data anonymous.</p>
              </div>
            ) : null}
          </Dialog>
        </main>
      </div>
    </div>
  );
}
