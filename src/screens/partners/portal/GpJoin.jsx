'use client';
// Join Grid Partners (/grid-partners/join; Batch E): the creator's application — type (model, influencer, video creator),
// name and public link (/p?h=<handle>), city, niches, languages, about, photo, platforms with followers, 3+ samples (photo
// upload or a video link), rate card (packages with the partner's own prices), budget range, mobile number checked with a
// code (demo 1234), email and the ID declaration. At the side the minimum standards tick as the form fills in. Sending it
// makes the profile "Waiting for review", signs the creator in and opens /gp. Data: lib/platform/partners.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { TYPES, LANGS, settings, applyAsPartner, partnerSignIn, toHandle, handleProblem, checkStandards } from '@/lib/platform/partners';
import { usePartners } from '../partnerShared';
import { PublicFrame } from './gpShared';
import { Toggles, PlatformRows, SampleRows, PackageRows, PhoneCheck, PicField, FORM_CSS, blankPlatform, blankPackage } from './profileForm';

const CSS = FORM_CSS + `
.gj-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:var(--space-4);align-items:start}
.gj-side{position:sticky;top:76px;display:flex;flex-direction:column;gap:var(--space-3)}
.gj-head h1{margin:0;font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gj-head p{margin:4px 0 0;font-size:var(--text-sm);color:var(--text-muted)}
.gj-id{display:flex;gap:10px;align-items:flex-start;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.gj-id input{margin-top:2px}
@media (max-width:960px){.gj-grid{grid-template-columns:1fr}.gj-side{position:static}}
`;

const TYPE_HELP = { model: 'Photo and video shoots', influencer: 'Posts to your followers', creator: 'Videos stores post and run as ads' };

export default function GpJoin() {
  const { ready } = usePartners();
  const st = ready ? settings() : { niches: [], cities: [] };
  const [f, setF] = useState({ type: 'influencer', name: '', handle: '', city: '', niches: [], languages: ['Bangla'], bio: '', photo: '', platforms: [blankPlatform()], samples: [], packages: [blankPackage()], budgetFrom: '', budgetTo: '', phone: '', phoneVerified: false, email: '', idChecked: false });
  const [own, setOwn] = useState(false);       // the creator typed their own link
  const [err, setErr] = useState({});
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const handle = own ? f.handle : toHandle(f.name);
  const hp = handle ? (ready ? handleProblem(handle) : '') : '';
  const draft = useMemo(() => ({ ...f, handle, platforms: f.platforms.map((x) => ({ ...x, followers: Number(String(x.followers).replace(/\D/g, '')) || 0 })), packages: f.packages.map((k) => ({ ...k, price: Number(String(k.price).replace(/\D/g, '')) || 0 })) }), [f, handle]);
  const checks = ready ? checkStandards(draft) : [];
  const send = () => {
    const r = applyAsPartner({ ...f, handle, packages: f.packages.map((k) => ({ ...k, includes: String(k.includes || '').split('\n') })) });
    if (r.ok === false) {
      setErr({ [r.field || 'form']: r.error });
      toast(r.error, { tone: 'error' });
      const el = r.field && document.getElementById('gj-' + r.field);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    partnerSignIn(r.partner.id);
    toast('Application sent: waiting for review');
    navigate('/gp');
  };
  const E = (k) => (err[k] ? <p className="gc-help gc-help--error" role="alert">{err[k]}</p> : null);
  return (
    <PublicFrame screen="GpJoin" css={CSS} hideJoin>
      <header className="gj-head">
        <h1>Join Grid Partners</h1>
        <p>Takes about 10 minutes. Already applied? <Link href="/gp-sign-in" className="bl-link">Sign in</Link></p>
      </header>
      <div className="gj-grid">
        <form className="pt-form" onSubmit={(e) => { e.preventDefault(); send(); }} noValidate>
          <section className="ix-card pt-pad pt-sec" aria-labelledby="gj-s1">
            <h2 id="gj-s1">You</h2>
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="gc-label">I am a</legend>
              <div className="pt-types">
                {Object.entries(TYPES).map(([k, t]) => (
                  <label key={k} className="pt-type"><input type="radio" name="gj-type" checked={f.type === k} onChange={() => set({ type: k })} /><Icon name={t.icon} width="18" height="18" aria-hidden="true" /><b>{t.label}</b><small>{TYPE_HELP[k]}</small></label>
                ))}
              </div>
            </fieldset>
            <div className="pt-grid2">
              <div id="gj-name"><label className="gc-label" htmlFor="gj-n">Name stores will see</label><input id="gj-n" className="gc-input" value={f.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" />{E('name')}</div>
              <div id="gj-city"><label className="gc-label" htmlFor="gj-c">City</label><select id="gj-c" className="gc-input gc-select" value={f.city} onChange={(e) => set({ city: e.target.value })}><option value="">Choose…</option>{st.cities.map((c) => <option key={c} value={c}>{c}</option>)}</select>{E('city')}</div>
            </div>
            <div id="gj-handle">
              <label className="gc-label" htmlFor="gj-h">Your public link</label>
              <div className="pt-handle"><span>gridcommerce.net/p?h=</span><input id="gj-h" className="gc-input" value={handle} onChange={(e) => { setOwn(true); set({ handle: toHandle(e.target.value) }); }} placeholder="your-name" /></div>
              {hp ? <p className="gc-help gc-help--error" role="alert">{hp}</p> : <p className="gc-help" style={{ margin: '4px 0 0' }}>You can post this link on your social media.</p>}
              {E('handle')}
            </div>
            <PicField label="Profile photo" src={f.photo} onChange={(src) => set({ photo: src })} round />
            <div id="gj-niches"><span className="gc-label">Niches (up to 6)</span><Toggles options={st.niches} value={f.niches} onChange={(v) => set({ niches: v })} label="Niches" max={6} />{E('niches')}</div>
            <div><span className="gc-label">Languages</span><Toggles options={LANGS} value={f.languages} onChange={(v) => set({ languages: v })} label="Languages" /></div>
            <div><label className="gc-label" htmlFor="gj-bio">About you</label><textarea id="gj-bio" className="gc-input" rows={4} value={f.bio} onChange={(e) => set({ bio: e.target.value })} placeholder="What you make, who follows you, what brands you have worked with" /></div>
          </section>

          <section className="ix-card pt-pad pt-sec" aria-labelledby="gj-s2" id="gj-platforms">
            <h2 id="gj-s2">Platforms and followers</h2>
            <PlatformRows rows={f.platforms} onChange={(v) => set({ platforms: v })} />
            {E('platforms')}
          </section>

          <section className="ix-card pt-pad pt-sec" aria-labelledby="gj-s3">
            <h2 id="gj-s3">Samples of your work <small>at least {ready ? settings().standards.minSamples : 3}</small></h2>
            <SampleRows rows={f.samples} onChange={(v) => set({ samples: v })} />
          </section>

          <section className="ix-card pt-pad pt-sec" aria-labelledby="gj-s4" id="gj-packages">
            <h2 id="gj-s4">Rate card</h2>
            <PackageRows rows={f.packages} onChange={(v) => set({ packages: v })} />
            {E('packages')}
            <div className="pt-grid2" id="gj-budget">
              <div><label className="gc-label" htmlFor="gj-bf">Usual budget from (৳)</label><input id="gj-bf" className="gc-input" inputMode="numeric" value={f.budgetFrom} onChange={(e) => set({ budgetFrom: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="gj-bt">Up to (৳)</label><input id="gj-bt" className="gc-input" inputMode="numeric" value={f.budgetTo} onChange={(e) => set({ budgetTo: e.target.value })} /></div>
            </div>
            {E('budget')}
          </section>

          <section className="ix-card pt-pad pt-sec" aria-labelledby="gj-s5">
            <h2 id="gj-s5">Contact and ID</h2>
            <p className="pt-muted">Stores see these only after you accept their request.</p>
            <div className="pt-grid2">
              <div id="gj-phone"><PhoneCheck phone={f.phone} verified={f.phoneVerified} onPhone={(v) => set({ phone: v })} onVerified={(v) => set({ phoneVerified: v })} err={err.phone} /></div>
              <div id="gj-email"><label className="gc-label" htmlFor="gj-e">Email</label><input id="gj-e" type="email" className="gc-input" value={f.email} onChange={(e) => set({ email: e.target.value })} autoComplete="email" />{E('email')}</div>
            </div>
            <label className="gj-id" id="gj-id"><input type="checkbox" className="gc-check" checked={f.idChecked} onChange={(e) => set({ idChecked: e.target.checked })} /><span>I will show my national ID or passport to GridCommerce when asked. The name on it matches this profile.</span></label>
            {E('id')}
          </section>

          <div className="pt-row"><button type="submit" className="ix-btn ix-btn--primary"><Icon name="send" width="16" height="16" aria-hidden="true" />Send application</button><span className="pt-muted">GridCommerce reviews it within 2 working days.</span></div>
        </form>

        <aside className="gj-side" aria-label="Minimum standards">
          <section className="ix-card pt-pad">
            <h2>Minimum standards</h2>
            <ul className="pt-check">
              {checks.map((c) => <li key={c.key} className={c.ok ? 'is-ok' : 'is-bad'}><Icon name={c.ok ? 'circle-check' : 'circle'} width="16" height="16" aria-hidden="true" /><span><b>{c.label}</b><small>{c.detail}</small></span></li>)}
            </ul>
            <p className="pt-muted" style={{ margin: 0 }}>You can send it before every line is ticked; GridCommerce approves profiles that meet them all.</p>
          </section>
        </aside>
      </div>
    </PublicFrame>
  );
}
