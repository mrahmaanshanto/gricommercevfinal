'use client';
// Add merchant (/admin/merchants/new) — create a store, laid out like the merchant panel's form pages: RecordHeader
// with the back arrow, the form cards on the left (Business, Owner, Store address, Package, Sales, sign-in link) and
// a short summary on the right (package, plan price, add-ons, what is billed first). Create runs
// lib/platform/shops.js › provisionStore: the store, its owner, a trial (or paid) subscription and a setup run; its
// error is shown next to the field it names. On success the new store's record opens.
// The store address is checked as you type (subdomainFree) once the saved data has loaded (usePlatform().live).

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { PhoneActionBar } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { formatBDT } from '@/lib/format';
import { dmy, DAY } from '@/lib/platform/util';
import { CATEGORIES, DISTRICTS, SOURCES, ONBOARDERS, ADDONS, PLAN_IDS, PLAN_NAME, LADDERS, TRIAL_DAYS, ladderLabel } from '@/lib/platform/catalogue';
import { provisionStore, subdomainFree } from '@/lib/platform/shops';
import { AdminShell, usePlatform } from '../AdminShell';

const SEGS = LADDERS.map((l) => l.label);   // Online · Retail · Wholesale
const LANGS = ['বাংলা', 'English'];
const BASE = '.gridcommerce.com.bd';

const CSS = `
.nm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3) var(--space-4)}
.nm-grid .nm-wide{grid-column:1/-1}
.nm-err{margin:var(--space-2) 0 0;font-size:var(--text-xs);color:var(--text-danger)}
.nm-opt{font-weight:var(--weight-regular);color:var(--text-muted)}
.nm-pre{display:flex;align-items:stretch}
.nm-pre>span{display:inline-flex;flex:none;align-items:center;padding:0 10px;border:1px solid var(--border-field);border-right:0;border-radius:var(--radius-lg) 0 0 var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-body)}
.nm-pre>.gc-input{border-radius:0 var(--radius-lg) var(--radius-lg) 0}
.nm-post>span{order:2;border-right:1px solid var(--border-field);border-left:0;border-radius:0 var(--radius-lg) var(--radius-lg) 0}
.nm-post>.gc-input{order:1;border-radius:var(--radius-lg) 0 0 var(--radius-lg)}
.nm-avail{display:flex;align-items:center;gap:6px;margin:var(--space-2) 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.nm-avail b{font-family:var(--font-data);font-weight:var(--weight-medium)}
.nm-avail.is-ok{color:var(--text-success)}
.nm-avail.is-bad{color:var(--text-danger)}
.nm-checks{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.nm-choice{display:flex;align-items:flex-start;gap:var(--space-2);min-height:32px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.nm-choice:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft);color:var(--text-heading)}
.nm-choice input{flex:none;margin-top:1px;accent-color:var(--primary)}
.nm-choice__txt{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
.nm-choice__txt small{font-size:var(--text-xs);color:var(--text-muted)}
.nm-choice__price{flex:none;font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading)}
.nm-plans{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.nm-list{display:flex;flex-direction:column;gap:var(--space-2)}
.nm-send{display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.nm-send input{flex:none;margin-top:1px;accent-color:var(--primary)}
.nm-fieldset{margin:0;padding:0;border:0;min-width:0}
.nm-fieldset legend{padding:0}
.nm-sum{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.nm-sum dt{color:var(--text-body)}
.nm-sum dd{margin:0;text-align:right;font-family:var(--font-data);color:var(--text-heading)}
.nm-sum .is-total{padding-top:6px;border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold)}
.nm-note{margin:var(--space-3) 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.nm-side{position:sticky;top:var(--space-4)}
.nm-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:var(--space-2);padding-top:var(--space-1)}
.nm-alert{margin:0}
@media (max-width:1023px){.nm-side{position:static}}
@media (max-width:640px){
  .nm-grid,.nm-plans{grid-template-columns:minmax(0,1fr)}
  .nm-bar{display:none}
  .nm-page{padding-bottom:var(--space-16)}
}
`;

const money = (n) => formatBDT(Math.round(Number(n) || 0));
const slug = (s) => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '').slice(0, 30);
/** "01711-223344", "+8801711223344" or "1711 223344" → "1711-223344" (provisionStore adds "+880 "). */
const localPhone = (s) => {
  let d = String(s || '').replace(/\D/g, '');
  if (d.startsWith('880')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return d.length > 4 ? d.slice(0, 4) + '-' + d.slice(4) : d;
};
const ladderOf = (segs) => (segs.includes('Online') ? 'online' : segs.includes('Retail') ? 'retail' : segs.includes('Wholesale') ? 'wholesale' : null);
/** The live price list of a ladder. */
function livePlans(db, ladder) {
  const l = db.plans && db.plans[ladder];
  if (!l) return null;
  const v = l.versions.find((x) => x.v === l.live) || l.versions[l.versions.length - 1];
  return v ? v.plans : null;
}

const EMPTY = {
  name: '', legal: '', cat: CATEGORIES[0], dist: DISTRICTS[0], address: '', licence: '', tin: '',
  owner: '', phone: '', email: '', lang: LANGS[0],
  sub: '', domain: '',
  segs: ['Online'], plan: 'growth', trial: true, modules: [],
  src: SOURCES[0], by: ONBOARDERS[0], helper: 'Unassigned', campaign: '', refCode: '',
  sendLogin: true,
};

function Field({ id, label, optional, error, children, wide }) {
  return (
    <div className={wide ? 'nm-wide' : undefined}>
      <label className="gc-label" htmlFor={id}>{label}{optional ? <span className="nm-opt"> (optional)</span> : null}</label>
      {children}
      {error ? <p className="nm-err" id={id + '-err'} role="alert">{error}</p> : null}
    </div>
  );
}

export default function NewMerchant() {
  const router = useRouter();
  const { db, t, live } = usePlatform();
  const [f, setF] = useState(EMPTY);
  const [subTouched, setSubTouched] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => {
    const v = e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setF((old) => {
      const next = { ...old, [k]: v };
      if (k === 'name' && !subTouched) next.sub = slug(v);
      return next;
    });
    if (errors[k] || (k === 'name' && errors.sub && !subTouched)) setErrors((old) => ({ ...old, [k]: undefined, ...(k === 'name' ? { sub: undefined } : {}) }));
  };
  const toggleIn = (k, v) => {
    setF((old) => ({ ...old, [k]: old[k].includes(v) ? old[k].filter((x) => x !== v) : [...old[k], v] }));
    if (errors[k]) setErrors((old) => ({ ...old, [k]: undefined }));
  };
  const inputCls = (k) => 'gc-input' + (errors[k] ? ' gc-input--error' : '');
  const aria = (k) => (errors[k] ? { 'aria-invalid': 'true', 'aria-describedby': 'nm-' + k + '-err' } : {});

  // the store address, checked as it is typed
  const sub = f.sub.trim().toLowerCase();
  const avail = live && sub ? subdomainFree(db, sub) : null;

  // the summary
  const ladder = ladderOf(f.segs);
  const prices = ladder ? livePlans(db, ladder) : null;
  const planPrice = prices && prices[f.plan] ? prices[f.plan].price : 0;
  const picked = ADDONS.filter((a) => f.modules.includes(a.code));
  const monthlyAddons = picked.filter((a) => a.period !== 'Once').reduce((s, a) => s + a.price, 0);
  const onceAddons = picked.filter((a) => a.period === 'Once').reduce((s, a) => s + a.price, 0);
  const trialDays = (prices && prices[f.plan] && prices[f.plan].trialDays) || TRIAL_DAYS;

  const focus = (field) => setTimeout(() => {
    const el = document.getElementById('nm-' + (field === 'segs' ? 'seg-0' : field));
    if (el) { el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }, 0);

  const submit = (e) => {
    if (e) e.preventDefault();
    if (busy) return;
    // checks provisionStore does not make
    const email = f.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrors({ email: 'Enter a valid email address, or leave it empty.' }); focus('email'); return; }
    const dom = f.domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (dom && !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(dom)) { setErrors({ domain: 'Enter a domain like shopname.com, or leave it empty.' }); focus('domain'); return; }
    setBusy(true);
    const res = provisionStore({
      ...f, name: f.name.trim(), legal: f.legal.trim(), owner: f.owner.trim(), phone: localPhone(f.phone), email,
      sub, domain: dom, address: f.address.trim(), campaign: f.campaign.trim(), refCode: f.refCode.trim(),
      licence: f.licence.trim(), tin: f.tin.trim(), migrate: 'empty',
    });
    setBusy(false);
    if (!res || !res.ok) {
      const field = (res && res.field) || 'form';
      setErrors({ [field]: (res && res.error) || 'The store could not be created.' });
      if (field !== 'form') focus(field);
      return;
    }
    toast('Store created');
    router.push('/admin/merchant?id=' + res.id);
  };

  const createBtn = <button type="submit" form="nm-form" className="gc-btn gc-btn--solid" disabled={busy || !live}>Create store</button>;

  return (
    <AdminShell active="merchant-new" title="Add merchant">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-page ix-page--narrow nm-page">
        <RecordHeader back="/admin/merchants" backLabel="Back to all merchants" title="Add merchant"
          about="Create a GridCommerce store: the business, its owner, the store address, the package and who sold it. The store is set up in about a minute and starts on a 15-day trial or paid from today." />

        <form id="nm-form" className="ix-record" onSubmit={submit} noValidate>
          <div className="ix-main">
            {errors.form ? (
              <div className="gc-alert gc-alert--soft gc-alert--error nm-alert" role="alert">
                <Icon name="triangle-alert" width="18" height="18" aria-hidden="true" /><span>{errors.form}</span>
              </div>
            ) : null}

            <section className="ix-card" aria-labelledby="nm-h-business">
              <header className="ix-card__head"><h2 id="nm-h-business">Business</h2></header>
              <div className="ix-card__body nm-grid">
                <Field id="nm-name" label="Store name" error={errors.name}>
                  <input id="nm-name" className={inputCls('name')} value={f.name} onChange={set('name')} autoComplete="organization" aria-required="true" {...aria('name')} />
                </Field>
                <Field id="nm-legal" label="Legal name" optional>
                  <input id="nm-legal" className="gc-input" value={f.legal} onChange={set('legal')} placeholder={f.name || 'As on the trade licence'} />
                </Field>
                <Field id="nm-cat" label="Category">
                  <select id="nm-cat" className="gc-input gc-select" value={f.cat} onChange={set('cat')}>{CATEGORIES.map((x) => <option key={x}>{x}</option>)}</select>
                </Field>
                <Field id="nm-dist" label="District">
                  <select id="nm-dist" className="gc-input gc-select" value={f.dist} onChange={set('dist')}>{DISTRICTS.map((x) => <option key={x}>{x}</option>)}</select>
                </Field>
                <Field id="nm-address" label="Address" optional wide>
                  <input id="nm-address" className="gc-input" value={f.address} onChange={set('address')} autoComplete="street-address" />
                </Field>
                <Field id="nm-licence" label="Trade licence number" optional>
                  <input id="nm-licence" className="gc-input" value={f.licence} onChange={set('licence')} style={{ fontFamily: 'var(--font-data)' }} />
                </Field>
                <Field id="nm-tin" label="TIN" optional>
                  <input id="nm-tin" className="gc-input" value={f.tin} onChange={set('tin')} inputMode="numeric" style={{ fontFamily: 'var(--font-data)' }} />
                </Field>
              </div>
            </section>

            <section className="ix-card" aria-labelledby="nm-h-owner">
              <header className="ix-card__head"><h2 id="nm-h-owner">Owner</h2></header>
              <div className="ix-card__body nm-grid">
                <Field id="nm-owner" label="Owner’s name" error={errors.owner}>
                  <input id="nm-owner" className={inputCls('owner')} value={f.owner} onChange={set('owner')} autoComplete="name" aria-required="true" {...aria('owner')} />
                </Field>
                <Field id="nm-phone" label="Mobile number" error={errors.phone}>
                  <div className="nm-pre">
                    <span aria-hidden="true">+880</span>
                    <input id="nm-phone" className={inputCls('phone')} value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel-national" placeholder="1711-223344" aria-required="true" style={{ fontFamily: 'var(--font-data)' }} {...aria('phone')} />
                  </div>
                </Field>
                <Field id="nm-email" label="Email" optional error={errors.email}>
                  <input id="nm-email" type="email" className={inputCls('email')} value={f.email} onChange={set('email')} autoComplete="email" {...aria('email')} />
                </Field>
                <Field id="nm-lang" label="Language">
                  <select id="nm-lang" className="gc-input gc-select" value={f.lang} onChange={set('lang')}>{LANGS.map((x) => <option key={x}>{x}</option>)}</select>
                </Field>
              </div>
            </section>

            <section className="ix-card" aria-labelledby="nm-h-address">
              <header className="ix-card__head"><h2 id="nm-h-address">Store address</h2></header>
              <div className="ix-card__body nm-grid">
                <Field id="nm-sub" label="Free address" error={errors.sub} wide>
                  <div className="nm-pre nm-post">
                    <span aria-hidden="true">{BASE}</span>
                    <input id="nm-sub" className={inputCls('sub')} value={f.sub} aria-required="true" autoCapitalize="none" spellCheck={false} style={{ fontFamily: 'var(--font-data)' }}
                      onChange={(e) => { setSubTouched(true); set('sub')(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }} {...aria('sub')} />
                  </div>
                  {avail && !errors.sub ? (
                    <p className={'nm-avail ' + (avail.ok ? 'is-ok' : 'is-bad')} aria-live="polite">
                      <Icon name={avail.ok ? 'circle-check' : 'circle-x'} width="14" height="14" aria-hidden="true" />
                      <span><b>{sub}{BASE}</b> {avail.ok ? 'is free' : '· ' + avail.why}</span>
                    </p>
                  ) : null}
                </Field>
                <Field id="nm-domain" label="Own domain" optional error={errors.domain} wide>
                  <input id="nm-domain" className={inputCls('domain')} value={f.domain} onChange={set('domain')} placeholder="shopname.com" autoCapitalize="none" spellCheck={false} style={{ fontFamily: 'var(--font-data)' }} {...aria('domain')} />
                </Field>
              </div>
            </section>

            <section className="ix-card" aria-labelledby="nm-h-package">
              <header className="ix-card__head"><h2 id="nm-h-package">Package</h2></header>
              <div className="ix-card__body nm-list">
                <fieldset className="nm-fieldset" aria-describedby={errors.segs ? 'nm-segs-err' : undefined}>
                  <legend className="gc-label">Sells</legend>
                  <div className="nm-checks">
                    {SEGS.map((x, i) => (
                      <label key={x} className="nm-choice">
                        <input id={'nm-seg-' + i} type="checkbox" className="gc-check" checked={f.segs.includes(x)} onChange={() => toggleIn('segs', x)} />
                        <span className="nm-choice__txt">{x}</span>
                      </label>
                    ))}
                  </div>
                  {errors.segs ? <p className="nm-err" id="nm-segs-err" role="alert">{errors.segs}</p> : null}
                </fieldset>
                <fieldset className="nm-fieldset">
                  <legend className="gc-label">Plan</legend>
                  <div className="nm-plans">
                    {PLAN_IDS.map((p) => (
                      <label key={p} className="nm-choice">
                        <input type="radio" name="nm-plan" className="gc-check gc-check--radio" checked={f.plan === p} onChange={() => set('plan')(p)} />
                        <span className="nm-choice__txt">{PLAN_NAME[p]}<small>{prices && prices[p] ? money(prices[p].price) + ' a month' : '—'}</small></span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="nm-fieldset">
                  <legend className="gc-label">Start</legend>
                  <div className="nm-plans">
                    <label className="nm-choice">
                      <input type="radio" name="nm-trial" className="gc-check gc-check--radio" checked={f.trial} onChange={() => set('trial')(true)} />
                      <span className="nm-choice__txt">{trialDays}-day free trial<small>First bill when the trial ends</small></span>
                    </label>
                    <label className="nm-choice">
                      <input type="radio" name="nm-trial" className="gc-check gc-check--radio" checked={!f.trial} onChange={() => set('trial')(false)} />
                      <span className="nm-choice__txt">Paid from today<small>First bill is due today</small></span>
                    </label>
                  </div>
                </fieldset>
                <fieldset className="nm-fieldset">
                  <legend className="gc-label">Add-ons <span className="nm-opt">(optional)</span></legend>
                  <div className="nm-list">
                    {ADDONS.map((a) => (
                      <label key={a.code} className="nm-choice">
                        <input type="checkbox" className="gc-check" checked={f.modules.includes(a.code)} onChange={() => toggleIn('modules', a.code)} />
                        <span className="nm-choice__txt">{a.label}</span>
                        <span className="nm-choice__price">{money(a.price)}<span className="nm-opt">{a.period === 'Once' ? ' once' : ' /mo'}</span></span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </section>

            <section className="ix-card" aria-labelledby="nm-h-sales">
              <header className="ix-card__head"><h2 id="nm-h-sales">Sales</h2></header>
              <div className="ix-card__body nm-grid">
                <Field id="nm-src" label="Came from">
                  <select id="nm-src" className="gc-input gc-select" value={f.src} onChange={set('src')}>{SOURCES.map((x) => <option key={x}>{x}</option>)}</select>
                </Field>
                <Field id="nm-by" label="Sold by">
                  <select id="nm-by" className="gc-input gc-select" value={f.by} onChange={set('by')}>{ONBOARDERS.map((x) => <option key={x}>{x}</option>)}</select>
                </Field>
                <Field id="nm-helper" label="Helped by" optional>
                  <select id="nm-helper" className="gc-input gc-select" value={f.helper} onChange={set('helper')}>
                    <option value="Unassigned">Nobody</option>
                    {ONBOARDERS.filter((x) => x !== f.by).map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
                <Field id="nm-campaign" label="Campaign" optional>
                  <input id="nm-campaign" className="gc-input" value={f.campaign} onChange={set('campaign')} placeholder="e.g. Eid offer 2026" />
                </Field>
                <Field id="nm-ref" label="Referral code" optional wide>
                  <input id="nm-ref" className="gc-input" value={f.refCode} onChange={set('refCode')} placeholder="e.g. DHAKAG-ARIF" autoCapitalize="characters" style={{ fontFamily: 'var(--font-data)' }} />
                </Field>
              </div>
            </section>

            <section className="ix-card ix-card--pad">
              <label className="nm-send">
                <input type="checkbox" className="gc-check" checked={f.sendLogin} onChange={set('sendLogin')} />
                <span className="nm-choice__txt">Send the owner a sign-in link<small>By SMS{f.email.trim() ? ' and email' : ''}, once the store is ready</small></span>
              </label>
            </section>

            <div className="nm-bar">
              <Link href="/admin/merchants" className="gc-btn gc-btn--neutral">Cancel</Link>
              {createBtn}
            </div>
          </div>

          <aside className="ix-side">
            <section className="ix-card nm-side" aria-labelledby="nm-h-sum">
              <header className="ix-card__head"><h2 id="nm-h-sum">Summary</h2></header>
              <div className="ix-card__body">
                <dl className="nm-sum">
                  <dt>Package</dt><dd style={{ fontFamily: 'var(--font-sans)' }}>{ladder ? `${ladderLabel(ladder)} · ${PLAN_NAME[f.plan]}` : '—'}</dd>
                  <dt>Plan</dt><dd>{planPrice ? money(planPrice) : '—'}</dd>
                  {monthlyAddons ? <><dt>Add-ons</dt><dd>{money(monthlyAddons)}</dd></> : null}
                  <dt className="is-total">Monthly</dt><dd className="is-total">{money(planPrice + monthlyAddons)}</dd>
                  {onceAddons ? <><dt>One-off</dt><dd>{money(onceAddons)}</dd></> : null}
                </dl>
                <p className="nm-note">
                  {f.trial
                    ? (live ? `Free until ${dmy(t + trialDays * DAY)}; the first bill follows.` : `Free for ${trialDays} days; the first bill follows.`)
                    : 'The first bill is due today.'}
                  {f.segs.length > 1 ? ` Sells ${f.segs.join(' + ')}; billed on the ${ladder ? ladderLabel(ladder) : ''} package.` : ''}
                </p>
              </div>
            </section>
          </aside>
        </form>
      </div>

      <PhoneActionBar note={ladder ? money(planPrice + monthlyAddons) + ' a month' : null} label="Create store">
        <button type="button" className="gc-btn gc-btn--solid" onClick={submit} disabled={busy || !live}>Create store</button>
      </PhoneActionBar>
    </AdminShell>
  );
}
