'use client';
// Connect an app (/connect?app=<id>, old /connect-channel?channel= too) — the one connect flow, opened from Connections
// and from every "Connect" button in the app. Short steps, no technical words:
//   sign-in apps (Meta, Google, TikTok, LinkedIn, X, Pinterest, Threads, Merchant Center, Business Profile)
//       Account (Continue with …) · Choose (page, catalog, account, locations) · What to use · Review · Done
//   stores   WooCommerce: store address and keys, Test connection · Shopify: store address, Install the app
//       Store · What to sync · Review · Done (first sync with progress)
//   keys     SMS gateway, email sending, Telegram bot: provider and keys, Test · Review · Done
// Payment gateways and couriers open their own setup (GatewaySetup) on the Connections page; devices and tools go to
// their page. No app given: choose one from a group (?group=). Data: src/lib/connections.js (+ channels.js).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { PageHeader, PhoneActionBar } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { gbpLocations, channelUniverse, channelBy } from '@/lib/channels';
import { appBy, groupBy, editionApps, statusOf, connectApp } from '@/lib/connections';
import { currentUser } from '@/lib/team';
import { ChannelFrame, SyncState, ConnBadge, useChannels } from '@/screens/channels/chShared';

const CHANNEL_APP = { meta: 'meta-catalog', gmc: 'gmc', gbp: 'gbp', woo: 'woocommerce', shopify: 'shopify' };
const CATALOGS = [['GridShop · Main catalog', 'Used by your Facebook page and Instagram shop'], ['new', 'Create a new catalog']];
const BUSINESS = {
  'meta-catalog': { label: 'Business account', items: [['GridShop BD', 'Business account · 3 pages'], ['GridShop Wholesale', 'Business account · 1 page']] },
  gmc: { label: 'Merchant Center account', items: [['GridShop BD', 'ID 512 349 8722 · gridshop.com.bd'], ['new', 'Create a new account']] },
};
const PRODUCT_WHAT = [['products', 'Products', 'Names, descriptions, categories'], ['inventory', 'Stock', 'So you never sell what you don’t have'], ['prices', 'Prices', 'Prices and sale prices'], ['images', 'Images', 'Product photos']];
const WHAT = {
  'meta-catalog': PRODUCT_WHAT, gmc: PRODUCT_WHAT,
  woocommerce: [...PRODUCT_WHAT, ['orders', 'Orders', 'Their orders come into Orders']],
  shopify: [...PRODUCT_WHAT, ['orders', 'Orders', 'Their orders come into Orders']],
  gbp: [['info', 'Business info', 'Name, phone, website, address'], ['hours', 'Opening hours', 'Regular and holiday hours'], ['reviews', 'Reviews', 'Read and reply in the Inbox'], ['posts', 'Posts and photos', 'Offers and news on your profile']],
};
const USE_TEXT = {
  Messages: 'Chats come into the Inbox', Comments: 'Comments on your posts come into the Inbox', Posts: 'Post from Social posts', Broadcasts: 'Send offers to people who opted in',
  Reviews: 'Reviews come into the Inbox', 'Ad spend': 'Spend shows in reports and profit', 'Sales from ads': 'Send sales back so ads find more buyers', Visitors: 'Visitors show in reports',
  Tags: 'Manage tags from here', Search: 'Search words show in reports', Recordings: 'See how people use your site',
};

const CSS = `
.cc-steps{display:flex;align-items:flex-start;justify-content:center;margin:0;padding:var(--space-5) var(--space-4) var(--space-2)}
.cc-phone-step{display:none;flex-direction:column;gap:var(--space-2);padding:var(--space-4) var(--space-4) 0;font-size:var(--text-sm)}
.cc-phone-step b{font-weight:var(--weight-medium);color:var(--text-heading)}
.cc-body{display:flex;flex-direction:column;gap:var(--space-5);width:100%;max-width:720px;margin:0 auto;padding:var(--space-5)}
.cc-body h2{margin:0;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cc-body>p,.cc-lead{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.cc-app{display:flex;align-items:center;gap:var(--space-3)}
.cc-app b{display:block;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cc-app small{font-size:var(--text-xs);color:var(--text-muted)}
.cc-pick{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:var(--space-3)}
.cc-opt{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-3);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);font:inherit;text-align:left;color:inherit;cursor:pointer;transition:border-color 150ms ease}
.cc-opt[aria-pressed="true"],.cc-opt[aria-checked="true"]{border-color:var(--primary);background:var(--fill-primary-soft);box-shadow:inset 0 0 0 1px var(--primary)}
.cc-opt:disabled{cursor:default;opacity:.7}
.cc-opt b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cc-opt small{font-size:var(--text-xs);color:var(--text-muted)}
.cc-opt .gc-badge{position:absolute;top:var(--space-3);right:var(--space-3)}
.cc-list{display:flex;flex-direction:column;gap:var(--space-2)}
.cc-row{display:flex;align-items:center;gap:var(--space-3);min-height:56px;padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font-size:var(--text-sm);cursor:pointer}
.cc-row:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft)}
.cc-row span{display:flex;flex-direction:column;min-width:0;flex:1}
.cc-row b{font-weight:var(--weight-medium);color:var(--text-heading)}
.cc-row small{font-size:var(--text-xs);color:var(--text-muted)}
.cc-account{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm)}
.cc-avatar{display:grid;place-items:center;flex:none;width:36px;height:36px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-semibold)}
.cc-sign{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-3);align-self:flex-start;min-width:260px}
.cc-safe{display:flex;gap:var(--space-2);align-items:flex-start;font-size:var(--text-xs);color:var(--text-muted)}
.cc-fields{display:flex;flex-direction:column;gap:var(--space-4)}
.cc-review{display:grid;grid-template-columns:auto 1fr;gap:var(--space-3) var(--space-5);margin:0;font-size:var(--text-sm)}
.cc-review dt{color:var(--text-muted)}
.cc-review dd{margin:0;color:var(--text-heading);min-width:0;overflow-wrap:anywhere}
.cc-foot{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-4) var(--space-5);border-top:1px solid var(--border-subtle)}
.cc-done{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);text-align:center}
.cc-done__icon{display:grid;place-items:center;width:56px;height:56px;border-radius:var(--radius-full);background:var(--fill-success-soft);color:var(--text-success)}
.cc-done .ch-sync,.cc-done .gc-alert{width:100%;text-align:left}
.cc-ok{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-success)}
/* room under the card so the GridAI button never covers Continue */
.gc-shell__content:has(.cc-foot){padding-bottom:96px!important}
@media (max-width:767px){.cc-steps{display:none}.cc-phone-step{display:flex}}
@media (max-width:640px){.cc-body{padding:var(--space-4)}.cc-foot{display:none}.cc-sign{min-width:0;width:100%}}
`;

/** "your Facebook Page", "your ad account": brand names keep their capitals. */
const lc = (t) => (/^(Ad|Business|Container|Website)\b/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);

/** The steps for an app. */
function stepsOf(a, chose) {
  const first = chose ? ['App'] : [];
  if (!a) return ['App'];
  if (a.id === 'woocommerce' || a.id === 'shopify') return [...first, 'Store', 'What to sync', 'Review', 'Done'];
  if (a.kind === 'keys') return [...first, a.providers ? 'Provider' : 'Keys', 'Review', 'Done'];
  return [...first, 'Account', 'Choose', a.group === 'sell' ? 'What to sync' : 'What to use', 'Review', 'Done'];
}

export default function ConnectApp() {
  const router = useRouter();
  const { ready, c } = useChannels();
  const [appId, setAppId] = useState('');
  const [chose, setChose] = useState(false);       // the app was picked here (step "App" is shown)
  const [group, setGroup] = useState('sell');
  const [step, setStep] = useState(0);
  const [acct, setAcct] = useState('idle');        // idle | busy | done  (sign-in, store test, app install)
  const [pick, setPick] = useState('');
  const [multi, setMulti] = useState({});
  const [cat, setCat] = useState(CATALOGS[0][0]);
  const [locs, setLocs] = useState({});
  const [what, setWhat] = useState({});
  const [scope, setScope] = useState('all');
  const [form, setForm] = useState({});
  const [err, setErr] = useState('');
  const timer = useRef(null);
  const head = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const id = u.get('app') || CHANNEL_APP[u.get('channel')] || '';
    if (u.get('group')) setGroup(u.get('group'));
    const a = appBy(id);
    if (!a) { setChose(true); return; }
    if (a.kind === 'gateway') { router.replace('/connections?connect=' + a.id); return; }
    if (a.kind === 'page') { router.replace(a.add || a.page); return; }
    begin(a.id, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (head.current && step > 0) head.current.focus({ preventScroll: false }); }, [step, appId]);

  function begin(id, picked) {
    const a = appBy(id);
    setAppId(id); setChose(!!picked); setAcct('idle'); setErr(''); setForm({}); setMulti({});
    setStep(picked ? 1 : 0);
    const b = BUSINESS[id] || a.pick;
    setPick(b && b.items ? b.items[0][0] : '');
    const w = WHAT[id] || (a.uses || []).map((u) => [u, u, USE_TEXT[u] || '']);
    setWhat(Object.fromEntries(w.map(([k]) => [k, true])));
    if (a.pick && a.pick.multi) setMulti(Object.fromEntries(a.pick.items.map(([k]) => [k, true])));
    setLocs(Object.fromEntries(gbpLocations().map((l) => [l.id, true])));
    if (a.providers) setForm({ provider: a.providers[0] });
  }
  const frame = (body) => <ChannelFrame screen="ConnectApp" active="connections" page="Connect" crumb="Connections" css={CSS}>{body}</ChannelFrame>;
  if (!ready) return frame(<PageHeader title="Connect" />);

  const a = appBy(appId);
  const steps = stepsOf(a, chose);
  const name = steps[step] || 'App';
  const user = currentUser();
  const count = channelUniverse().filter((p) => !p.draft).length;
  const allLocs = gbpLocations();
  const pickedLocs = allLocs.filter((l) => locs[l.id]);
  const whatList = a ? (WHAT[a.id] || (a.uses || []).map((u) => [u, u, USE_TEXT[u] || ''])) : [];
  const pickList = a ? (BUSINESS[a.id] || a.pick) : null;

  const signIn = () => { setAcct('busy'); timer.current = setTimeout(() => setAcct('done'), 1600); };
  const testStore = () => {
    const f = form;
    if (a.id === 'woocommerce') {
      if (!/^https?:\/\/\S+\.\S+/.test(f.url || '')) { setErr('Enter your store address, starting with https://'); return; }
      if (!f.ck || !f.cs) { setErr('Enter the consumer key and the consumer secret.'); return; }
    } else if (!/^[a-z0-9-]+\.myshopify\.com$/i.test((f.url || '').trim())) { setErr('Enter the store address, e.g. gridshop.myshopify.com'); return; }
    setErr(''); setAcct('busy');
    timer.current = setTimeout(() => setAcct('done'), 1500);
  };
  const testKeys = () => {
    const miss = (a.fields || []).find(([k]) => !String(form[k] || '').trim());
    if (miss) { setErr(`Enter the ${miss[1].toLowerCase()}.`); return; }
    setErr(''); setAcct('busy');
    timer.current = setTimeout(() => setAcct('done'), 1200);
  };
  const canNext = (() => {
    if (name === 'App') return !!a && statusOf(a.id).state === 'off';
    if (name === 'Account') return acct === 'done';
    if (name === 'Store' || name === 'Keys' || name === 'Provider') return acct === 'done';
    if (name === 'Choose') return a.id === 'gbp' ? pickedLocs.length > 0 : a.pick && a.pick.multi ? Object.values(multi).some(Boolean) : !!pick;
    if (name === 'What to sync' || name === 'What to use') return Object.values(what).some(Boolean);
    return true;
  })();
  const host = (u) => String(u || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const finish = () => {
    let info;
    if (a.id === 'meta-catalog') info = { business: pick === 'new' ? 'GridShop BD' : pick, catalog: cat === 'new' ? 'GridShop · New catalog' : cat, catalogId: '1048227199340', account: user.name, what };
    else if (a.id === 'gmc') info = { account: pick === 'new' ? 'GridShop BD' : pick, merchantId: '5123498722', website: 'gridshop.com.bd', what };
    else if (a.id === 'gbp') info = { account: 'GridShop BD', locations: pickedLocs.map((l) => l.id), what };
    else if (a.id === 'woocommerce') info = { store: host(form.url), account: host(form.url), version: 'WooCommerce 9.3', what };
    else if (a.id === 'shopify') info = { store: form.url.trim(), account: form.url.trim(), what };
    else if (a.kind === 'keys') info = { account: [form.provider, form.sender_id || form.from || ''].filter(Boolean).join(' · ') || (a.id === 'telegram' ? '@gridshop_bot' : a.name) };
    else info = { account: a.pick && a.pick.multi ? `${Object.values(multi).filter(Boolean).length} ${lc(a.pick.label)}s` : pick, what };
    connectApp(a.id, info);
    setStep(steps.indexOf('Done'));
    toast(`${a.name} connected`);
  };
  const next = () => { if (!canNext) return; if (name === 'Review') finish(); else { setErr(''); setStep(step + 1); } };
  const back = () => { setErr(''); setStep(Math.max(0, step - 1)); };
  const done = name === 'Done';
  const actions = !done ? (<>
    {step > 0 ? <button type="button" className="gc-btn gc-btn--neutral" onClick={back}>Back</button> : <Link href="/connections" className="gc-btn gc-btn--neutral">Cancel</Link>}
    <span style={{ flex: 1 }} />
    <button type="button" className="gc-btn gc-btn--solid" onClick={next} disabled={!canNext}>{name === 'Review' ? `Connect ${a ? a.name : ''}` : 'Continue'}</button>
  </>) : null;
  const appHead = a ? <div className="cc-app"><BrandLogo brand={a.brand} size={44} decorative /><span><b>{a.name}</b><small>{a.sub}</small></span></div> : null;

  return frame(<>
    <PageHeader title={a ? `Connect ${a.name}` : 'Connect an app'} description="A few short steps. You can change everything later." />
    <section className="gc-card" aria-label="Connect">
      <ol className="gc-steps cc-steps" aria-label="Steps">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            {i ? <li aria-hidden="true" className={'gc-steps__bar' + (i <= step ? ' gc-steps__bar--done' : '')} style={{ listStyle: 'none' }} /> : null}
            <li className="gc-steps__step" aria-current={i === step ? 'step' : undefined} style={{ listStyle: 'none' }}>
              <span className={'gc-steps__circle' + (i < step ? ' gc-steps__circle--done' : i === step ? ' gc-steps__circle--current' : '')}>{i < step ? <Icon name="check" width="16" height="16" aria-hidden="true" /> : i + 1}</span>
              <span className="gc-steps__label">{s}</span>
            </li>
          </React.Fragment>
        ))}
      </ol>
      <div className="cc-phone-step" aria-hidden="true">
        <span><b>Step {step + 1} of {steps.length}</b> · {name}</span>
        <div className="gc-progress"><div className="gc-progress__fill" style={{ width: ((step + 1) / steps.length) * 100 + '%' }} /></div>
      </div>

      <div className="cc-body">
        {a && !done && name !== 'App' && statusOf(a.id).state !== 'off' ? <div className="gc-alert gc-alert--soft gc-alert--info" role="status"><Icon name="info" width="18" height="18" aria-hidden="true" /><span>{a.name} is already connected. Going on replaces the account it uses.</span></div> : null}
        {name === 'App' ? (<>
          <h2 ref={head} tabIndex={-1}>{groupBy(group) ? groupBy(group).label : 'Choose an app'}</h2>
          <div className="cc-pick" role="radiogroup" aria-label="App">
            {editionApps().filter((x) => x.group === group && x.kind !== 'page' && x.kind !== 'gateway').map((x) => {
              const on = statusOf(x.id).state !== 'off';
              return (
                <button key={x.id} type="button" role="radio" aria-checked={appId === x.id} className="cc-opt" disabled={on} onClick={() => begin(x.id, true)}>
                  {on ? <ConnBadge on /> : null}
                  <BrandLogo brand={x.brand} size={44} decorative />
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><b>{x.name}</b><small>{x.sub}</small></span>
                </button>
              );
            })}
          </div>
          <p className="cc-lead"><Link href="/connections">See every app in Connections</Link></p>
        </>) : null}

        {name === 'Account' && a ? (<>
          {appHead}
          <h2 ref={head} tabIndex={-1}>Sign in with {a.signin || a.company || 'Google'}</h2>
          <p>Use the account that manages {a.pick ? `your ${lc(a.pick.label)}` : a.id === 'gbp' ? 'your Google Business Profile' : a.id === 'gmc' ? 'your Merchant Center' : 'your business'}. A {a.signin || a.company || 'Google'} window opens; allow GridCommerce, then come back here.</p>
          {acct === 'done' ? (
            <div className="cc-account" role="status">
              <span className="cc-avatar">{user.name.charAt(0)}</span>
              <span style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}><b style={{ fontWeight: 'var(--weight-medium)' }}>{user.name}</b><small className="ch-muted" style={{ fontSize: 'var(--text-xs)', overflowWrap: 'anywhere' }}>{user.email}</small></span>
              <span className="gc-badge gc-badge--success"><Icon name="check" width="12" height="12" aria-hidden="true" />Signed in</span>
            </div>
          ) : (
            <button type="button" className="gc-btn gc-btn--neutral cc-sign" onClick={signIn} disabled={acct === 'busy'}>
              {acct === 'busy' ? <><span className="ch-spin" aria-hidden="true" /> Connecting…</> : <><BrandLogo brand={a.signin === 'Facebook' ? 'facebook' : a.signin === 'Instagram' ? 'instagram' : a.brand} size={22} decorative /> Continue with {a.signin || a.company || 'Google'}</>}
            </button>
          )}
          {acct === 'busy' ? <p className="cc-lead" role="status">Waiting for {a.signin || a.company}. Finish signing in in the window that opened.</p> : null}
          <p className="cc-safe"><Icon name="shield-check" width="16" height="16" aria-hidden="true" /> GridCommerce never sees your password. You can disconnect at any time.</p>
        </>) : null}

        {name === 'Choose' && a ? (<>
          {appHead}
          <h2 ref={head} tabIndex={-1}>{a.id === 'gbp' ? 'Choose your locations' : `Choose your ${lc(pickList.label)}`}</h2>
          {a.id === 'gbp' ? (
            <div className="cc-list">
              {allLocs.map((l) => (
                <label key={l.id} className="cc-row">
                  <input type="checkbox" className="gc-check" checked={!!locs[l.id]} onChange={() => setLocs({ ...locs, [l.id]: !locs[l.id] })} />
                  <span><b>{l.name}</b><small>{l.serviceArea || l.address}</small></span>
                </label>
              ))}
            </div>
          ) : pickList.multi ? (
            <div className="cc-list">
              {pickList.items.map(([k, sub]) => (
                <label key={k} className="cc-row"><input type="checkbox" className="gc-check" checked={!!multi[k]} onChange={() => setMulti({ ...multi, [k]: !multi[k] })} /><span><b>{k}</b><small>{sub}</small></span></label>
              ))}
            </div>
          ) : (
            <div className="cc-list" role="radiogroup" aria-label={pickList.label}>
              {pickList.items.map(([k, sub]) => (
                <label key={k} className="cc-row"><input type="radio" className="gc-check gc-check--radio" name="cc-pick" checked={pick === k} onChange={() => setPick(k)} /><span><b>{k === 'new' ? 'New account' : k}</b><small>{sub}</small></span></label>
              ))}
            </div>
          )}
          {a.id === 'meta-catalog' ? (<>
            <h2 style={{ fontSize: 'var(--text-sm-plus)' }}>Catalog</h2>
            <p className="cc-lead">Where your products are kept on Meta.</p>
            <div className="cc-list" role="radiogroup" aria-label="Catalog">
              {CATALOGS.map(([k, sub]) => (
                <label key={k} className="cc-row"><input type="radio" className="gc-check gc-check--radio" name="cc-cat" checked={cat === k} onChange={() => setCat(k)} /><span><b>{k === 'new' ? 'New catalog' : k}</b><small>{sub}</small></span></label>
              ))}
            </div>
          </>) : null}
        </>) : null}

        {name === 'Store' && a ? (<>
          {appHead}
          <h2 ref={head} tabIndex={-1}>{a.id === 'woocommerce' ? 'Your WordPress store' : 'Your Shopify store'}</h2>
          {a.id === 'woocommerce' ? (<>
            <p>In WordPress, open WooCommerce › Settings › Advanced › REST API, add a key with Read/Write access, and paste it here.</p>
            <div className="cc-fields">
              <div><label className="gc-label" htmlFor="cc-url">Store address</label><input id="cc-url" className="gc-input" inputMode="url" placeholder="https://yourstore.com" value={form.url || ''} onChange={(e) => { setForm({ ...form, url: e.target.value }); setAcct('idle'); }} /></div>
              <div><label className="gc-label" htmlFor="cc-ck">Consumer key</label><input id="cc-ck" className="gc-input" placeholder="ck_…" value={form.ck || ''} onChange={(e) => { setForm({ ...form, ck: e.target.value }); setAcct('idle'); }} autoComplete="off" /></div>
              <div><label className="gc-label" htmlFor="cc-cs">Consumer secret</label><input id="cc-cs" className="gc-input" type="password" placeholder="cs_…" value={form.cs || ''} onChange={(e) => { setForm({ ...form, cs: e.target.value }); setAcct('idle'); }} autoComplete="off" /></div>
            </div>
          </>) : (<>
            <p>Enter your Shopify address. Shopify asks you to install the GridCommerce app; approve it and come back.</p>
            <div><label className="gc-label" htmlFor="cc-url">Store address</label><input id="cc-url" className="gc-input" placeholder="yourstore.myshopify.com" value={form.url || ''} onChange={(e) => { setForm({ ...form, url: e.target.value }); setAcct('idle'); }} /></div>
          </>)}
          {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
          {acct === 'done' ? <p className="cc-ok" role="status"><Icon name="circle-check" width="18" height="18" aria-hidden="true" /> {a.id === 'woocommerce' ? `Connected to ${host(form.url)} · WooCommerce 9.3` : `GridCommerce is installed on ${form.url.trim()}`}</p> : (
            <button type="button" className="gc-btn gc-btn--neutral cc-sign" onClick={testStore} disabled={acct === 'busy'}>
              {acct === 'busy' ? <><span className="ch-spin" aria-hidden="true" /> {a.id === 'woocommerce' ? 'Testing…' : 'Waiting for Shopify…'}</> : a.id === 'woocommerce' ? <><Icon name="plug-zap" width="18" height="18" aria-hidden="true" /> Test connection</> : <><BrandLogo brand="shopify" size={22} decorative /> Install on Shopify</>}
            </button>
          )}
        </>) : null}

        {(name === 'Keys' || name === 'Provider') && a ? (<>
          {appHead}
          <h2 ref={head} tabIndex={-1}>{a.providers ? 'Choose the provider' : 'Add the key'}</h2>
          <div className="cc-fields">
            {a.providers ? (
              <div><label className="gc-label" htmlFor="cc-prov">Provider</label>
                <select id="cc-prov" className="gc-input gc-select" value={form.provider || ''} onChange={(e) => { setForm({ ...form, provider: e.target.value }); setAcct('idle'); }}>{a.providers.map((p) => <option key={p}>{p}</option>)}</select>
              </div>
            ) : null}
            {(a.fields || []).map(([k, label, secret, help]) => (
              <div key={k}>
                <label className="gc-label" htmlFor={'cc-' + k}>{label}</label>
                <input id={'cc-' + k} className="gc-input" type={secret ? 'password' : 'text'} autoComplete="off" value={form[k] || ''} onChange={(e) => { setForm({ ...form, [k]: e.target.value }); setAcct('idle'); }} />
                {help ? <p className="gc-help">{help}</p> : null}
              </div>
            ))}
          </div>
          {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
          {acct === 'done' ? <p className="cc-ok" role="status"><Icon name="circle-check" width="18" height="18" aria-hidden="true" /> {a.id === 'sms' ? 'Test SMS sent to your phone.' : a.id === 'email' ? 'Test email sent to your inbox.' : 'The bot answered.'}</p> : (
            <button type="button" className="gc-btn gc-btn--neutral cc-sign" onClick={testKeys} disabled={acct === 'busy'}>{acct === 'busy' ? <><span className="ch-spin" aria-hidden="true" /> Testing…</> : <><Icon name="plug-zap" width="18" height="18" aria-hidden="true" /> {a.id === 'sms' ? 'Send a test SMS' : a.id === 'email' ? 'Send a test email' : 'Test connection'}</>}</button>
          )}
        </>) : null}

        {(name === 'What to sync' || name === 'What to use') && a ? (<>
          {appHead}
          <h2 ref={head} tabIndex={-1}>{name === 'What to sync' ? 'Choose what to sync' : 'Choose what to use it for'}</h2>
          <div className="cc-pick">
            {whatList.map(([k, label, sub]) => (
              <button key={k} type="button" className="cc-opt" aria-pressed={!!what[k]} onClick={() => setWhat({ ...what, [k]: !what[k] })}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><input type="checkbox" className="gc-check" checked={!!what[k]} readOnly tabIndex={-1} aria-hidden="true" /><b>{label}</b></span>
                {sub ? <small>{sub}</small> : null}
              </button>
            ))}
          </div>
          {a.group === 'sell' && a.id !== 'gbp' ? (<>
            <h2 style={{ fontSize: 'var(--text-sm-plus)' }}>Which products</h2>
            <div className="cc-list" role="radiogroup" aria-label="Which products">
              <label className="cc-row"><input type="radio" className="gc-check gc-check--radio" name="cc-scope" checked={scope === 'all'} onChange={() => setScope('all')} /><span><b>All active products</b><small>{count} products · new ones are added by themselves</small></span></label>
              <label className="cc-row"><input type="radio" className="gc-check gc-check--radio" name="cc-scope" checked={scope === 'pick'} onChange={() => setScope('pick')} /><span><b>Only some</b><small>Choose them later on the {a.name} page</small></span></label>
            </div>
          </>) : null}
        </>) : null}

        {name === 'Review' && a ? (<>
          {appHead}
          <h2 ref={head} tabIndex={-1}>Review</h2>
          <dl className="cc-review">
            {a.kind === 'oauth' || ['meta-catalog', 'gmc', 'gbp'].includes(a.id) ? <><dt>Signed in as</dt><dd>{user.name}<small className="ch-muted" style={{ display: 'block', fontSize: 'var(--text-xs)' }}>{user.email}</small></dd></> : null}
            {a.id === 'gbp' ? <><dt>Locations</dt><dd>{pickedLocs.map((l) => l.name).join(', ')}</dd></> : null}
            {pickList && a.id !== 'gbp' ? <><dt>{pickList.label}</dt><dd>{pickList.multi ? Object.keys(multi).filter((k) => multi[k]).join(', ') : pick === 'new' ? 'New account' : pick}</dd></> : null}
            {a.id === 'meta-catalog' ? <><dt>Catalog</dt><dd>{cat === 'new' ? 'New catalog' : cat}</dd></> : null}
            {a.id === 'woocommerce' || a.id === 'shopify' ? <><dt>Store</dt><dd>{host(form.url) || form.url}</dd></> : null}
            {a.providers ? <><dt>Provider</dt><dd>{form.provider}</dd></> : null}
            {whatList.length ? <><dt>{a.group === 'sell' ? 'Sync' : 'Use for'}</dt><dd>{whatList.filter(([k]) => what[k]).map(([, l]) => l).join(', ')}</dd></> : null}
            {a.group === 'sell' && a.id !== 'gbp' ? <><dt>Products</dt><dd>{scope === 'all' ? `All active products (${count})` : 'Chosen later'}</dd></> : null}
          </dl>
          <p className="cc-lead">{a.group === 'sell' ? 'The first sync starts as soon as you connect.' : a.group === 'social' ? 'New messages and comments start coming in a minute after you connect.' : a.group === 'ads' ? 'Data shows in reports within a few hours.' : ''}</p>
        </>) : null}

        {done && a ? (
          <div className="cc-done">
            <span className="cc-done__icon"><Icon name="circle-check" width="28" height="28" aria-hidden="true" /></span>
            <h2 ref={head} tabIndex={-1}>{a.name} is connected</h2>
            <p className="cc-lead">{a.group === 'sell' ? (a.id === 'gbp' ? 'Your profile details are being sent now.' : 'Your products are being sent now.') : a.group === 'social' ? `${a.uses.filter((u) => u !== 'Posts' && u !== 'Broadcasts').join(' and ')} from ${a.name} now come into the Inbox.` : a.group === 'ads' ? 'Its numbers show in reports within a few hours.' : `${a.name} is ready to use.`}</p>
            {a.kind === 'channel' ? <SyncState ch={a.ch} c={c} /> : null}
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center' }}>
              <Link href="/connections" className="gc-btn gc-btn--neutral">Back to Connections</Link>
              {a.group === 'social' && a.id !== 'gbp' ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => router.push('/merchant-inbox')}>Open the Inbox</button>
                : a.page ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => router.push(a.page.split('#')[0])}>Go to {a.kind === 'channel' ? (channelBy(a.ch) || {}).short || a.name : a.name}</button> : null}
            </span>
          </div>
        ) : null}
      </div>
      {actions ? <div className="cc-foot">{actions}</div> : null}
    </section>
    {actions ? <PhoneActionBar>{actions}</PhoneActionBar> : null}
  </>);
}

