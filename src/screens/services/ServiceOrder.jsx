'use client';
// Order a service (/service-order?id=&pkg=): 1 · the package and add-ons, 2 · the brief (the questions this service
// asks, set in super admin's brief form builder; files are named here, uploaded on the live system), 3 · how to pay
// (bKash, Nagad, card or GridCommerce credits; a demo payment), with the fee, VAT and total. Ad spend for ads services is
// asked in the brief and kept apart: it is never in our charge. Paying makes the order (lib/platform/services.js ›
// placeOrder), books the cost in the shop's own books (Income & expenses) and shows the invoice; the order then lives in
// My services. Front end only: the payment gateway and file storage are the server's.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { postEntry } from '@/lib/ledger';
import { serviceById, pkgOf, priceOf, placeOrder, checkBrief, PAY_METHODS, payLabel, settings, SELF_SHOP, SELF_NAME } from '@/lib/platform/services';
import { SvcFrame, useServices, tk, query, daysWord, dateText } from './svcShared';

const PAY_ACCOUNT = { bkash: 'bkash', nagad: 'nagad', card: 'brac', credits: 'gc-credits' };
const kb = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');

function BriefField({ f, value, error, onChange }) {
  const id = 'so-b-' + f.id;
  const common = { id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': error ? id + '-err' : f.help ? id + '-help' : undefined };
  let input;
  if (f.type === 'textarea') input = <textarea className={'gc-input' + (error ? ' gc-input--error' : '')} rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} {...common} />;
  else if (f.type === 'select') input = <select className={'gc-input gc-select' + (error ? ' gc-input--error' : '')} value={value || ''} onChange={(e) => onChange(e.target.value)} {...common}><option value="">Choose…</option>{(f.options || []).map((o) => <option key={o}>{o}</option>)}</select>;
  else if (f.type === 'files') {
    const list = Array.isArray(value) ? value : [];
    input = (
      <div className="svc-field">
        <input type="file" multiple className="gc-input" onChange={(e) => { const add = Array.from(e.target.files || []).map((x) => ({ name: x.name, size: kb(x.size) })); e.target.value = ''; onChange([...list, ...add]); }} {...common} />
        {list.length ? <ul className="svc-files">{list.map((x, i) => <li key={i}><Icon name="file" width="16" height="16" aria-hidden="true" /><b>{x.name}</b><small>{x.size}</small><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + x.name} onClick={() => onChange(list.filter((_, j) => j !== i))}><Icon name="x" width="14" height="14" /></button></li>)}</ul> : null}
      </div>
    );
  } else input = <input className={'gc-input' + (error ? ' gc-input--error' : '')} inputMode={f.type === 'money' || f.type === 'number' ? 'numeric' : f.type === 'url' ? 'url' : undefined} placeholder={f.placeholder || (f.type === 'url' ? 'https://' : f.type === 'money' ? '৳' : '')} value={value || ''} onChange={(e) => onChange(e.target.value)} {...common} />;
  return (
    <div className="svc-field">
      <label className="gc-label" htmlFor={id}>{f.label}{f.req ? <span aria-hidden="true" style={{ color: 'var(--text-danger)' }}> *</span> : null}</label>
      {input}
      {error ? <p id={id + '-err'} className="gc-help gc-help--error" style={{ margin: 0 }}>{error}</p> : f.help ? <p id={id + '-help'} className="gc-help" style={{ margin: 0 }}>{f.help}</p> : null}
    </div>
  );
}

export default function ServiceOrder() {
  const { ready } = useServices();
  const [pkgId, setPkgId] = useState('');
  const [addons, setAddons] = useState([]);
  const [brief, setBrief] = useState({});
  const [errors, setErrors] = useState({});
  const [method, setMethod] = useState('bkash');
  const [done, setDone] = useState(null);
  const s = ready ? serviceById(query('id')) : null;
  useEffect(() => { if (s && !pkgId) setPkgId(pkgOf(s, query('pkg')) ? query('pkg') : s.packages[Math.min(1, s.packages.length - 1)].id); }, [s, pkgId]);
  const m = useMemo(() => (s && pkgId ? priceOf(s, pkgId, addons) : null), [s, pkgId, addons]);

  if (!ready) return <SvcFrame screen="ServiceOrder" active="svc-shop" page="Order"><div style={{ minHeight: 400 }} aria-busy="true" /></SvcFrame>;
  if (!s || s.status !== 'live') return <SvcFrame screen="ServiceOrder" active="svc-shop" page="Order" narrow><RecordHeader back="/services" backLabel="Services" title="Service not found" /><section className="ix-card ix-empty"><EmptyState icon="briefcase" title="This service is not on sale" actionLabel="See all services" onAction={() => { window.location.href = '/services'; }} /></section></SvcFrame>;

  const pkg = pkgOf(s, pkgId);
  const monthly = s.cycle === 'monthly';
  const setField = (id, v) => { setBrief((b) => ({ ...b, [id]: v })); setErrors((e) => { const n = { ...e }; delete n[id]; return n; }); };
  const pay = () => {
    const chk = checkBrief(s, brief);
    if (!chk.ok) {
      setErrors(chk.errors);
      const first = Object.keys(chk.errors)[0];
      toast('Fill in the brief first.', { tone: 'error' });
      window.setTimeout(() => { const el = document.getElementById('so-b-' + first); if (el) { el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }, 30);
      return;
    }
    const res = placeOrder({ shopId: SELF_SHOP, shopName: SELF_NAME, serviceId: s.id, pkgId, addons, brief, method });
    if (!res.ok) { if (res.errors) setErrors(res.errors); toast(res.error, { tone: 'error' }); return; }
    // the shop's own books: the fee is an expense paid from the account the shop paid with
    try { postEntry({ account: PAY_ACCOUNT[method], amount: -res.order.total, kind: 'expense', cat: s.cat === 'grow' ? 'Marketing' : 'Software & subscriptions', party: 'GridCommerce Services', note: `${s.name} · ${pkg.name} · ${res.order.invNo}`, ref: res.order.paid.txId, by: 'Staff' }); } catch { /* the books are optional here */ }
    setDone(res.order);
    window.scrollTo({ top: 0 });
    toast('Paid. Your order ' + res.order.id + ' is in.');
  };

  if (done) {
    return (
      <SvcFrame screen="ServiceOrder" active="svc-shop" page="Order placed" narrow>
        <RecordHeader back="/services" backLabel="Services" title="Thank you, your order is in" badges={<span className="gc-badge gc-badge--success">Paid</span>} meta={`${done.id} · ${s.name} · ${pkg.name}`}
          primary={{ label: 'Open the order', href: '/my-service?id=' + done.id }} />
        <section className="ix-card svc-pad" aria-label="Invoice">
          <h2>Invoice {done.invNo}</h2>
          <KV rows={[['Billed to', SELF_NAME], ['From', 'GridCommerce Services · BIN 004512387-0101'], ['Date', dateText(done.paid.at)], ['Paid by', payLabel(done.paid.method) + ' · ' + done.paid.txId]]} />
          <div className="svc-sum">
            <div><span>{s.name} · {pkg.name}{monthly ? ' (month 1)' : ''}</span><span>{tk(pkg.price)}</span></div>
            {addons.map((id) => { const a = s.addons.find((x) => x.id === id); return a ? <div key={id}><span>{a.name}</span><span>{tk(a.price)}</span></div> : null; })}
            <div><span>VAT {done.vatPct}%</span><span>{tk(done.vat)}</span></div>
            <div className="is-total"><span>Total paid</span><span>{tk(done.total)}</span></div>
          </div>
          <p className="gc-help">An expert is assigned within one working day. You’ll see them, the due date and their messages in My services.</p>
        </section>
      </SvcFrame>
    );
  }

  const summary = (
    <section className="ix-card svc-pad" aria-label="Summary">
      <h2>Summary</h2>
      <div className="svc-sum">
        <div><span>{pkg ? pkg.name : ''}{monthly ? ' · first month' : ''}</span><span>{tk(pkg ? pkg.price : 0)}</span></div>
        {addons.map((id) => { const a = s.addons.find((x) => x.id === id); return a ? <div key={id}><span>{a.name}</span><span>{tk(a.price)}</span></div> : null; })}
        <div><span>VAT {settings().vatPct}%</span><span>{tk(m ? m.vat : 0)}</span></div>
        <div className="is-total"><span>Total</span><span>{tk(m ? m.total : 0)}</span></div>
      </div>
      {monthly ? <p className="gc-help">Next months: {tk(m ? m.total : 0)} a month with your subscription. Stop any time.</p> : pkg ? <p className="gc-help">Delivered in {daysWord(pkg.days)} from when the expert starts · {pkg.revisions} change{pkg.revisions === 1 ? '' : 's'} included.</p> : null}
      <button type="button" className="gc-btn gc-btn--solid" onClick={pay}><Icon name="lock" width="16" height="16" aria-hidden="true" />Pay {tk(m ? m.total : 0)}</button>
    </section>
  );

  return (
    <SvcFrame screen="ServiceOrder" active="svc-shop" page={'Order ' + s.name}>
      <RecordHeader back={'/service-detail?id=' + s.id} backLabel={s.name} title={'Order ' + s.name} meta={monthly ? 'Monthly · stop any time' : 'One-time'} />
      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card svc-pad" aria-labelledby="so-1">
            <h2 id="so-1">1 · Package</h2>
            <div className="svc-pkgs" role="radiogroup" aria-label="Package">
              {s.packages.map((p) => (
                <label key={p.id} className={'svc-pkg' + (p.id === pkgId ? ' is-on' : '')} style={{ cursor: 'pointer' }}>
                  <span className="svc-row"><input type="radio" name="so-pkg" className="gc-check gc-check--radio" checked={p.id === pkgId} onChange={() => setPkgId(p.id)} /><h3>{p.name}</h3></span>
                  <span className="svc-pkg__price">{tk(p.price)} <small>{monthly ? 'a month' : ''}</small></span>
                  <ul>{p.includes.map((x) => <li key={x}><Icon name="check" width="14" height="14" aria-hidden="true" />{x}</li>)}</ul>
                </label>
              ))}
            </div>
            {s.addons.length ? (
              <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <legend className="gc-label">Add-ons</legend>
                {s.addons.map((a) => <label key={a.id} className="svc-row" style={{ fontSize: 'var(--text-sm)' }}><input type="checkbox" className="gc-check" checked={addons.includes(a.id)} onChange={() => setAddons((x) => (x.includes(a.id) ? x.filter((y) => y !== a.id) : [...x, a.id]))} />{a.name} · {tk(a.price)}</label>)}
              </fieldset>
            ) : null}
          </section>
          <section className="ix-card svc-pad" aria-labelledby="so-2">
            <h2 id="so-2">2 · Brief</h2>
            <p className="gc-help">The expert starts from this. You can add more in the order’s messages later.</p>
            {s.brief.map((f) => <BriefField key={f.id} f={f} value={brief[f.id]} error={errors[f.id]} onChange={(v) => setField(f.id, v)} />)}
            {s.brief.some((f) => f.id === 'spend') ? <p className="svc-note"><Icon name="info" width="16" height="16" aria-hidden="true" />The ad spend you enter is paid by you to Meta or Google. It is not part of this charge.</p> : null}
          </section>
          <section className="ix-card svc-pad" aria-labelledby="so-3">
            <h2 id="so-3">3 · Pay</h2>
            <div className="svc-pay" role="radiogroup" aria-label="How you pay">
              {PAY_METHODS.map(([k, l]) => <label key={k} className={method === k ? 'is-on' : ''}><input type="radio" name="so-pay" className="gc-check gc-check--radio" checked={method === k} onChange={() => setMethod(k)} />{l}</label>)}
            </div>
            <p className="gc-help">Demo: the payment goes through at once. On the live system it opens {method === 'card' ? 'the card page' : method === 'credits' ? 'nothing: it comes off your GridCommerce credits' : payLabel(method) + ' to confirm'}.</p>
          </section>
        </div>
        <aside className="ix-side" aria-label="Order summary">{summary}<p className="gc-help" style={{ margin: 0 }}>Questions first? <Link href={'/service-detail?id=' + s.id} className="bl-link">See the service</Link></p></aside>
      </div>
    </SvcFrame>
  );
}
