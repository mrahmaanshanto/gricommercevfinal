'use client';
// Services › Catalogue (/admin/services/catalogue) — the services stores can buy: category, one-time or monthly, the
// packages' price range, who sees it (editions and plans), orders and rating, On sale / Paused. A row opens the editor
// (/admin/service-edit?id=; New service starts one). Settings: the VAT on service invoices, whether a lead checks work
// before delivery by default, and after how many quiet days an order waiting for the merchant closes itself.
// Batch D: Share offers a service to stores (email, SMS, WhatsApp, social) with a summary written for it, which can be
// edited and kept (ShareSheet); custom offers are not listed here (they are orders: Service orders › Offers).

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/runtime/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { StatusBadge } from '@/components/ui';
import { getServices, getOrders, ratingOf, catName, setServiceStatus, settings, saveSettings, autoShareText, saveShareText } from '@/lib/platform/services';
import { canUse } from '@/lib/platform/marketAccess';
import { ShareSheet } from './ShareSheet';
import { AdminShell } from '../AdminShell';
import { Pic } from '@/components/ui/Pic';
import { useSvc, tk, SVA_CSS } from './svcAdmin';

const EDITION_WORD = { online: 'Online', 'retail-online': 'Retail + Online', 'retail-wholesale': 'Retail', comms: 'Connect', full: 'All modules' };

export default function SvcCatalogue() {
  const { ready, tick } = useSvc();
  const router = useRouter();
  const [tab, setTab] = useState('all');
  const [set, setSet] = useState(null);
  const [share, setShare] = useState(null);   // the service being shared
  const rows = useMemo(() => (ready ? getServices().filter((s) => !s.custom).map((s) => ({ s, orders: getOrders().filter((o) => o.serviceId === s.id).length, r: ratingOf(s.id) })) : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = rows.filter((x) => tab === 'all' || (tab === 'live' ? x.s.status === 'live' : x.s.status !== 'live'));
  const tabs = [['all', 'All'], ['live', 'On sale'], ['paused', 'Paused']].map(([k, l]) => ({ key: k, id: 'sc-tab-' + k, label: l, count: ready ? rows.filter((x) => k === 'all' || (k === 'live' ? x.s.status === 'live' : x.s.status !== 'live')).length : null, on: tab === k, onClick: () => setTab(k) }));
  const cur = ready ? settings() : null;
  const st = set || cur;

  return (
    <AdminShell active="svc-catalogue" title="Service catalogue">
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="list" title="Service catalogue"
          about="The services stores can buy, with packages, add-ons, the brief each one asks and who may buy it (editions and plans). Paused services are hidden from stores; orders already placed carry on."
          secondary={[{ label: 'Orders', href: '/admin/services' }]} primary={{ label: 'New service', href: '/admin/service-edit' }} />
        <section className="ix-card" aria-label="Services">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Services by status" /></div>
          {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : (<>
            <ul className="ix-plist" aria-label="Services">{shown.map((x) => <li key={x.s.id}><Link href={'/admin/service-edit?id=' + x.s.id} className="ix-pitem ix-pitem--thumb" style={{ gridTemplateColumns: '43px minmax(0,1fr)' }}><span style={{ gridRow: 'span 2' }}><Pic src={x.s.cover} name={x.s.name} kind="cover" icon={x.s.icon || 'briefcase'} /></span><span className="ix-pitem__top"><b>{x.s.name}</b><StatusBadge tone={x.s.status === 'live' ? 'success' : 'neutral'}>{x.s.status === 'live' ? 'On sale' : 'Paused'}</StatusBadge></span><span className="ix-pitem__mid">{catName(x.s.cat)} · from {tk(Math.min(...x.s.packages.map((p) => p.price)))} · {x.orders} orders</span></Link></li>)}</ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Services</caption>
                <thead><tr><th scope="col">Service</th><th scope="col">Packages</th><th scope="col">Who sees it</th><th scope="col" className="ix-num">Orders</th><th scope="col">Rating</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{shown.map((x) => (
                  <tr key={x.s.id} onClick={(e) => { if (!e.target.closest('a,button')) router.push('/admin/service-edit?id=' + x.s.id); }}>
                    <td><span className="gc-picrow"><Pic src={x.s.cover} name={x.s.name} kind="cover" icon={x.s.icon || 'briefcase'} /><span><Link href={'/admin/service-edit?id=' + x.s.id} className="ix-strong">{x.s.name}</Link><span className="sva-sub">{catName(x.s.cat)} · {x.s.cycle === 'monthly' ? 'monthly' : 'one-time'}</span></span></span></td>
                    <td>{tk(Math.min(...x.s.packages.map((p) => p.price)))}–{tk(Math.max(...x.s.packages.map((p) => p.price)))}<span className="sva-sub">{x.s.packages.length} packages · {x.s.brief.length} brief questions</span></td>
                    <td className="ix-muted" style={{ maxWidth: 260, whiteSpace: 'normal' }}>{x.s.editions.length ? x.s.editions.map((e) => EDITION_WORD[e] || e).join(', ') : 'Every edition'}<span className="sva-sub">{x.s.plans.length ? x.s.plans.map((p) => p[0].toUpperCase() + p.slice(1)).join(', ') : 'Every plan'}</span></td>
                    <td className="ix-num">{x.orders}</td>
                    <td>{x.r.count ? `${x.r.avg.toFixed(1)}★ (${x.r.count})` : <span className="ix-muted">—</span>}</td>
                    <td><StatusBadge tone={x.s.status === 'live' ? 'success' : 'neutral'}>{x.s.status === 'live' ? 'On sale' : 'Paused'}</StatusBadge></td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><button type="button" className="ix-btn ix-btn--sm" disabled={x.s.status !== 'live'} title={x.s.status !== 'live' ? 'Put it on sale to share it' : undefined} onClick={() => setShare(x.s)}>Share</button> <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setServiceStatus(x.s.id, x.s.status === 'live' ? 'paused' : 'live'); toast(x.s.status === 'live' ? x.s.name + ' paused: stores no longer see it' : x.s.name + ' is on sale'); }}>{x.s.status === 'live' ? 'Pause' : 'Put on sale'}</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>)}
          <div className="ix-foot"><span>{shown.length} services</span></div>
        </section>
        {ready ? (
          <section className="ix-card sva-pad" aria-labelledby="sc-set">
            <h2 id="sc-set">Settings</h2>
            <div className="sva-grid2">
              <div><label className="gc-label" htmlFor="sc-vat">VAT on service invoices (%)</label><input id="sc-vat" className="gc-input" inputMode="decimal" value={st.vatPct} onChange={(e) => setSet({ ...st, vatPct: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="sc-quiet">Close quiet orders after (days)</label><input id="sc-quiet" className="gc-input" inputMode="numeric" value={st.quietDays} onChange={(e) => setSet({ ...st, quietDays: e.target.value })} /></div>
            </div>
            <label className="sva-chk"><input type="checkbox" className="gc-check" checked={st.qaDefault !== false} onChange={(e) => setSet({ ...st, qaDefault: e.target.checked })} />A lead checks the work before it is delivered (new orders)</label>
            <div className="sva-row"><button type="button" className="ix-btn ix-btn--primary" disabled={!set} onClick={() => { const r = saveSettings({ vatPct: st.vatPct, quietDays: Math.max(3, Number(st.quietDays) || 14), qaDefault: st.qaDefault !== false }); if (!r.ok) { toast(r.error, { tone: 'error' }); return; } setSet(null); toast('Settings saved'); }}>Save settings</button></div>
          </section>
        ) : null}
      </div>
      {share ? (() => {
        const link = window.location.origin + '/service-detail?id=' + share.id;
        const cur = getServices().find((x) => x.id === share.id) || share;
        return <ShareSheet open onClose={() => setShare(null)} title={share.name} subject={`${share.name} from GridCommerce experts`} link={link} autoText={autoShareText(cur, link)} savedText={cur.share && cur.share.text ? cur.share.text : ''}
          eligible={(id) => canUse('services', id).ok} onSaveText={(t) => saveShareText(share.id, t)} />;
      })() : null}
    </AdminShell>
  );
}
