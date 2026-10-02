'use client';
// Channels › Connect a channel (/connect-channel?channel=) — six short steps, no technical words:
//   1 Choose channel · 2 Connect account (sign in with Meta / Google: Connecting…) · 3 Choose business, catalog,
//   Merchant Center account or locations · 4 Choose what to sync · 5 Review · 6 Connected (the first sync runs, with
//   progress). ?channel= starts at step 2. Data: src/lib/channels.js › connect.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { PageHeader, PhoneActionBar } from '@/components/ui';
import { CHANNELS, channelBy, connect, gbpLocations, channelUniverse } from '@/lib/channels';
import { currentUser } from '@/lib/team';
import { ChannelFrame, ChannelLogo, ConnBadge, SyncState, useChannels } from './chShared';

const STEPS = ['Channel', 'Account', 'Business', 'What to sync', 'Review', 'Done'];
const BUSINESSES = {
  meta: { label: 'Business account', items: [['GridShop BD', 'Business account · 3 pages'], ['GridShop Wholesale', 'Business account · 1 page']] },
  gmc: { label: 'Merchant Center account', items: [['GridShop BD', 'ID 512 349 8722 · gridshop.com.bd'], ['new', 'Create a new account']] },
  gbp: { label: 'Business profile group', items: [['GridShop BD', 'Profiles you manage on Google']] },
};
const CATALOGS = [['GridShop · Main catalog', 'Used by your Facebook page and Instagram shop'], ['new', 'Create a new catalog']];
const WHAT = {
  meta: [['products', 'Products', 'Names, descriptions, categories'], ['inventory', 'Inventory', 'Stock, so you never oversell'], ['prices', 'Prices', 'Prices and sale prices'], ['images', 'Images', 'Product photos']],
  gmc: [['products', 'Products', 'Names, descriptions, categories'], ['inventory', 'Inventory', 'Stock, so you never oversell'], ['prices', 'Prices', 'Prices and sale prices'], ['images', 'Images', 'Product photos']],
  gbp: [['info', 'Business info', 'Name, phone, website, address'], ['hours', 'Opening hours', 'Regular and holiday hours'], ['reviews', 'Reviews', 'Read and reply here'], ['posts', 'Posts and photos', 'Offers and news on your profile']],
};

const CSS = `
.cc-steps{display:flex;align-items:flex-start;justify-content:center;margin:0;padding:var(--space-5) var(--space-4) var(--space-2)}
.cc-phone-step{display:none;flex-direction:column;gap:var(--space-2);padding:var(--space-4) var(--space-4) 0;font-size:var(--text-sm)}
.cc-phone-step b{font-weight:var(--weight-medium);color:var(--text-heading)}
.cc-body{display:flex;flex-direction:column;gap:var(--space-5);width:100%;max-width:720px;margin:0 auto;padding:var(--space-5)}
.cc-body h2{margin:0;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cc-body>p,.cc-lead{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
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
.cc-account .gb-avatar{display:grid;place-items:center;width:36px;height:36px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-semibold)}
.cc-sign{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-3);align-self:flex-start;min-width:260px}
.cc-sign img{width:20px;height:20px}
.cc-safe{display:flex;gap:var(--space-2);align-items:flex-start;font-size:var(--text-xs);color:var(--text-muted)}
.cc-review{display:grid;grid-template-columns:auto 1fr;gap:var(--space-3) var(--space-5);margin:0;font-size:var(--text-sm)}
.cc-review dt{color:var(--text-muted)}
.cc-review dd{margin:0;color:var(--text-heading)}
.cc-foot{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-4) var(--space-5);border-top:1px solid var(--border-subtle)}
.cc-done{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);text-align:center}
.cc-done__icon{display:grid;place-items:center;width:56px;height:56px;border-radius:var(--radius-full);background:var(--fill-success-soft);color:var(--text-success)}
.cc-done .ch-sync,.cc-done .gc-alert{width:100%;text-align:left}
@media (max-width:767px){.cc-steps{display:none}.cc-phone-step{display:flex}}
@media (max-width:640px){.cc-body{padding:var(--space-4)}.cc-foot{display:none}.cc-sign{min-width:0;width:100%}}
`;

export default function ConnectChannel() {
  const router = useRouter();
  const { ready, c } = useChannels();
  const [step, setStep] = useState(0);
  const [ch, setCh] = useState('');
  const [acct, setAcct] = useState('idle');       // idle | busy | done
  const [biz, setBiz] = useState('');
  const [cat, setCat] = useState(CATALOGS[0][0]);
  const [locs, setLocs] = useState({});
  const [what, setWhat] = useState({});
  const [scope, setScope] = useState('all');
  const timer = useRef(null);
  const head = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('channel');
    if (q && channelBy(q)) { pickChannel(q); setStep(1); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (head.current && step > 0) head.current.focus({ preventScroll: false }); }, [step]);

  function pickChannel(k) {
    setCh(k); setAcct('idle'); setBiz(BUSINESSES[k].items[0][0]);
    setWhat(Object.fromEntries(WHAT[k].map(([w]) => [w, true])));
    setLocs(Object.fromEntries(gbpLocations().map((l) => [l.id, true])));
  }
  const frame = (body) => <ChannelFrame screen="ConnectChannel" active="ch-home" page="Connect a channel" css={CSS}>{body}</ChannelFrame>;
  if (!ready) return frame(<PageHeader title="Connect a channel" />);

  const meta = ch ? channelBy(ch) : null;
  const user = currentUser();
  const count = channelUniverse().filter((p) => !p.draft).length;
  const allLocs = gbpLocations();
  const pickedLocs = allLocs.filter((l) => locs[l.id]);
  const signIn = () => { setAcct('busy'); timer.current = setTimeout(() => setAcct('done'), 1600); };
  const canNext = [!!ch && !c.conn[ch], acct === 'done', ch === 'gbp' ? pickedLocs.length > 0 : !!biz, Object.values(what).some(Boolean), true][step];
  const finish = () => {
    const bizName = biz === 'new' ? 'GridShop BD' : biz;
    const info = ch === 'meta' ? { business: bizName, catalog: cat === 'new' ? 'GridShop · New catalog' : cat, catalogId: '1048227199340', account: user.name, what }
      : ch === 'gmc' ? { account: bizName, merchantId: '5123498722', website: 'gridshop.com.bd', what }
        : { account: bizName, locations: pickedLocs.map((l) => l.id), what };
    connect(ch, info);
    setStep(5);
    toast(`${meta.short} connected`);
  };
  const next = () => { if (!canNext) return; if (step === 4) finish(); else setStep(step + 1); };
  const back = () => setStep(Math.max(0, step - 1));
  const actions = step < 5 ? (<>
    {step > 0 ? <button type="button" className="gc-btn gc-btn--neutral" onClick={back}>Back</button> : <Link href="/channels" className="gc-btn gc-btn--neutral">Cancel</Link>}
    <span style={{ flex: 1 }} />
    <button type="button" className="gc-btn gc-btn--solid" onClick={next} disabled={!canNext}>{step === 4 ? `Connect ${meta ? meta.short : ''}` : 'Continue'}</button>
  </>) : null;

  return frame(<>
    <PageHeader title="Connect a channel" description="A few short steps. You can change everything later." />
    <section className="gc-card" aria-label="Connect a channel">
      <ol className="gc-steps cc-steps" aria-label="Steps">
        {STEPS.map((s, i) => (
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
        <span><b>Step {step + 1} of {STEPS.length}</b> · {STEPS[step]}</span>
        <div className="gc-progress"><div className="gc-progress__fill" style={{ width: ((step + 1) / STEPS.length) * 100 + '%' }} /></div>
      </div>

      <div className="cc-body">
        {step === 0 ? (<>
          <h2 ref={head} tabIndex={-1}>Choose a channel</h2>
          <div className="cc-pick" role="radiogroup" aria-label="Channel">
            {CHANNELS.map((x) => {
              const on = !!c.conn[x.key];
              return (
                <button key={x.key} type="button" role="radio" aria-checked={ch === x.key} className="cc-opt" disabled={on} onClick={() => pickChannel(x.key)}>
                  {on ? <ConnBadge on /> : null}
                  <ChannelLogo ch={x.key} size={44} />
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><b>{x.name}</b><small>{x.key === 'meta' ? 'Sell on Facebook and Instagram' : x.key === 'gmc' ? 'Show products on Google Search and Shopping' : 'Your shop on Google Search and Maps'}</small></span>
                </button>
              );
            })}
          </div>
          {CHANNELS.every((x) => c.conn[x.key]) ? <p className="cc-lead">Every channel is connected. <Link href="/channels">Back to channels</Link></p> : null}
        </>) : null}

        {step === 1 && meta ? (<>
          <h2 ref={head} tabIndex={-1}>Connect your {meta.company} account</h2>
          <p>Sign in with the {meta.company} account that manages {ch === 'meta' ? 'your Facebook page and shop' : ch === 'gmc' ? 'your Merchant Center' : 'your Google Business Profile'}. A {meta.company} window opens; allow GridCommerce, then come back here.</p>
          {acct === 'done' ? (
            <div className="cc-account" role="status">
              <span className="gb-avatar">{user.name.charAt(0)}</span>
              <span style={{ display: 'flex', flexDirection: 'column', flex: 1 }}><b style={{ fontWeight: 'var(--weight-medium)' }}>{user.name}</b><small className="ch-muted" style={{ fontSize: 'var(--text-xs)' }}>{user.email}</small></span>
              <span className="gc-badge gc-badge--success"><Icon name="check" width="12" height="12" aria-hidden="true" />Connected</span>
            </div>
          ) : (
            <button type="button" className="gc-btn gc-btn--neutral cc-sign" onClick={signIn} disabled={acct === 'busy'}>
              {acct === 'busy' ? <><span className="ch-spin" aria-hidden="true" /> Connecting…</> : <><img src={meta.logo} alt="" /> Continue with {ch === 'meta' ? 'Facebook' : 'Google'}</>}
            </button>
          )}
          {acct === 'busy' ? <p className="cc-lead" role="status">Waiting for {meta.company}. Finish signing in in the window that opened.</p> : null}
          <p className="cc-safe"><Icon name="shield-check" width="16" height="16" aria-hidden="true" /> GridCommerce never sees your password. You can disconnect at any time.</p>
        </>) : null}

        {step === 2 && meta ? (<>
          <h2 ref={head} tabIndex={-1}>{ch === 'gbp' ? 'Choose your locations' : `Choose your ${BUSINESSES[ch].label.toLowerCase()}`}</h2>
          {ch === 'gbp' ? (<>
            <p>Pick the places to manage here.</p>
            <div className="cc-list">
              {allLocs.map((l) => (
                <label key={l.id} className="cc-row">
                  <input type="checkbox" className="gc-check" checked={!!locs[l.id]} onChange={() => setLocs({ ...locs, [l.id]: !locs[l.id] })} />
                  <span><b>{l.name}</b><small>{l.serviceArea || l.address}</small></span>
                  <span className="gc-badge gc-badge--success" style={{ flex: 'none' }}><Icon name="badge-check" width="12" height="12" aria-hidden="true" />Verified</span>
                </label>
              ))}
            </div>
          </>) : (<>
            <div className="cc-list" role="radiogroup" aria-label={BUSINESSES[ch].label}>
              {BUSINESSES[ch].items.map(([k, sub]) => (
                <label key={k} className="cc-row">
                  <input type="radio" className="gc-check gc-check--radio" name="cc-biz" checked={biz === k} onChange={() => setBiz(k)} />
                  <span><b>{k === 'new' ? 'New account' : k}</b><small>{sub}</small></span>
                </label>
              ))}
            </div>
            {ch === 'meta' ? (<>
              <h2 style={{ fontSize: 'var(--text-sm-plus)' }}>Catalog</h2>
              <p className="cc-lead">Where your products are kept on Meta.</p>
              <div className="cc-list" role="radiogroup" aria-label="Catalog">
                {CATALOGS.map(([k, sub]) => (
                  <label key={k} className="cc-row">
                    <input type="radio" className="gc-check gc-check--radio" name="cc-cat" checked={cat === k} onChange={() => setCat(k)} />
                    <span><b>{k === 'new' ? 'New catalog' : k}</b><small>{sub}</small></span>
                  </label>
                ))}
              </div>
            </>) : null}
          </>)}
        </>) : null}

        {step === 3 && meta ? (<>
          <h2 ref={head} tabIndex={-1}>Choose what to sync</h2>
          <p>GridCommerce keeps these up to date on {meta.short} by itself.</p>
          <div className="cc-pick">
            {WHAT[ch].map(([k, label, sub]) => (
              <button key={k} type="button" className="cc-opt" aria-pressed={!!what[k]} onClick={() => setWhat({ ...what, [k]: !what[k] })}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><input type="checkbox" className="gc-check" checked={!!what[k]} readOnly tabIndex={-1} aria-hidden="true" /><b>{label}</b></span>
                <small>{sub}</small>
              </button>
            ))}
          </div>
          {ch !== 'gbp' ? (<>
            <h2 style={{ fontSize: 'var(--text-sm-plus)' }}>Which products</h2>
            <div className="cc-list" role="radiogroup" aria-label="Which products">
              <label className="cc-row"><input type="radio" className="gc-check gc-check--radio" name="cc-scope" checked={scope === 'all'} onChange={() => setScope('all')} /><span><b>All active products</b><small>{count} products · new ones are added by themselves</small></span></label>
              <label className="cc-row"><input type="radio" className="gc-check gc-check--radio" name="cc-scope" checked={scope === 'pick'} onChange={() => setScope('pick')} /><span><b>Only some</b><small>Choose them later on the {meta.short} page</small></span></label>
            </div>
          </>) : null}
        </>) : null}

        {step === 4 && meta ? (<>
          <h2 ref={head} tabIndex={-1}>Review</h2>
          <dl className="cc-review">
            <dt>Channel</dt><dd style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><ChannelLogo ch={ch} size={24} />{meta.name}</dd>
            <dt>Account</dt><dd>{user.name}<small className="ch-muted" style={{ display: 'block', fontSize: 'var(--text-xs)', overflowWrap: 'anywhere' }}>{user.email}</small></dd>
            {ch === 'gbp' ? <><dt>Locations</dt><dd>{pickedLocs.map((l) => l.name).join(', ')}</dd></> : <><dt>{BUSINESSES[ch].label}</dt><dd>{biz === 'new' ? 'New account' : biz}</dd></>}
            {ch === 'meta' ? <><dt>Catalog</dt><dd>{cat === 'new' ? 'New catalog' : cat}</dd></> : null}
            <dt>Sync</dt><dd>{WHAT[ch].filter(([k]) => what[k]).map(([, l]) => l).join(', ')}</dd>
            {ch !== 'gbp' ? <><dt>Products</dt><dd>{scope === 'all' ? `All active products (${count})` : 'Chosen later'}</dd></> : null}
          </dl>
          <p className="cc-lead">The first sync starts as soon as you connect. {ch === 'gmc' ? 'Google then checks your products, which can take up to 3 days.' : ''}</p>
        </>) : null}

        {step === 5 && meta ? (
          <div className="cc-done">
            <span className="cc-done__icon"><Icon name="circle-check" width="28" height="28" aria-hidden="true" /></span>
            <h2 ref={head} tabIndex={-1}>{meta.name} is connected</h2>
            <p className="cc-lead">{ch === 'gbp' ? 'Your profile details are being sent now.' : 'Your products are being sent now.'}</p>
            <SyncState ch={ch} c={c} />
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center' }}>
              <Link href="/channels" className="gc-btn gc-btn--neutral">Back to channels</Link>
              <button type="button" className="gc-btn gc-btn--solid" onClick={() => router.push(meta.page)}>Go to {meta.short}</button>
            </span>
          </div>
        ) : null}
      </div>
      {actions ? <div className="cc-foot">{actions}</div> : null}
    </section>
    {actions ? <PhoneActionBar>{actions}</PhoneActionBar> : null}
  </>);
}
