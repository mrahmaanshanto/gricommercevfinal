'use client';
// Grid Partners › Profile (/gp-profile; Batch E): the partner edits everything on the profile — photo and cover, name, type,
// city, niches, languages, about, availability, platforms and followers, samples (photo upload or video link), rate card,
// budget range, mobile (a new number is checked with a code, demo 1234) and email. Saving changes the public profile at
// once (no new review, kept simple). At the side: Share my profile and a link to preview the public page.
// Data: lib/platform/partners.js.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { TYPES, LANGS, AVAIL, settings, savePartner, publicPath, toHandle, handleProblem } from '@/lib/platform/partners';
import { ShareCard } from '../partnerShared';
import { GpFrame } from './gpShared';
import { Toggles, PlatformRows, SampleRows, PackageRows, PhoneCheck, PicField, FORM_CSS, pkgRows, platRows } from './profileForm';

function Editor({ p }) {
  const st = settings();
  const [f, setF] = useState(() => ({
    name: p.name, handle: p.handle, type: p.type, city: p.city, niches: p.niches || [], languages: p.languages || [], bio: p.bio || '', photo: p.photo || '', cover: p.cover || '',
    availability: p.availability || 'open', platforms: platRows(p.platforms), samples: (p.samples || []).map((s) => ({ ...s })), packages: pkgRows(p.packages),
    budgetFrom: String(p.budgetFrom || ''), budgetTo: String(p.budgetTo || ''), phone: p.phone || '', phoneVerified: true, email: p.email || '',
  }));
  const [err, setErr] = useState({});
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const hp = f.handle !== p.handle ? handleProblem(f.handle, p.id) : '';
  const save = () => {
    const r = savePartner(p.id, { ...f, packages: f.packages.map((k) => ({ ...k, includes: String(k.includes || '').split('\n') })) }, p.name);
    if (r.ok === false) { setErr({ [r.field || 'form']: r.error }); toast(r.error, { tone: 'error' }); const el = r.field && document.getElementById('gpp-' + r.field); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    setErr({});
    toast(p.status === 'approved' ? 'Saved: your public page shows it now' : 'Saved');
  };
  const E = (k) => (err[k] ? <p className="gc-help gc-help--error" role="alert">{err[k]}</p> : null);
  return (<>
    <ShopHeader icon="user-round-pen" title="Your profile"
      about="Everything stores and visitors to your public page see. Changes show on your public page as soon as you save. Your phone and email are never on the public page: stores see them only after you accept their request."
      secondary={[{ label: 'Preview public page', href: publicPath(p.handle) }]}
      primary={{ label: 'Save', icon: 'check', onClick: save }} />
    <div className="ix-record">
      <form className="ix-main" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
        <section className="ix-card pt-pad pt-sec" aria-labelledby="gpp-s1">
          <h2 id="gpp-s1">Photo and cover</h2>
          <div className="pt-grid2">
            <PicField label="Profile photo" src={f.photo} onChange={(src) => set({ photo: src })} round />
            <PicField label="Cover picture" src={f.cover} onChange={(src) => set({ cover: src })} max={1400} />
          </div>
        </section>
        <section className="ix-card pt-pad pt-sec" aria-labelledby="gpp-s2">
          <h2 id="gpp-s2">About you</h2>
          <div className="pt-grid2">
            <div id="gpp-name"><label className="gc-label" htmlFor="gpp-n">Name</label><input id="gpp-n" className="gc-input" value={f.name} onChange={(e) => set({ name: e.target.value })} />{E('name')}</div>
            <div id="gpp-handle"><label className="gc-label" htmlFor="gpp-h">Public link</label><div className="pt-handle"><span>/p?h=</span><input id="gpp-h" className="gc-input" value={f.handle} onChange={(e) => set({ handle: toHandle(e.target.value) })} /></div>{hp ? <p className="gc-help gc-help--error" role="alert">{hp}</p> : null}{E('handle')}</div>
            <div><label className="gc-label" htmlFor="gpp-t">I am a</label><select id="gpp-t" className="gc-input gc-select" value={f.type} onChange={(e) => set({ type: e.target.value })}>{Object.entries(TYPES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}</select></div>
            <div id="gpp-city"><label className="gc-label" htmlFor="gpp-c">City</label><select id="gpp-c" className="gc-input gc-select" value={f.city} onChange={(e) => set({ city: e.target.value })}>{[...new Set([...st.cities, f.city].filter(Boolean))].map((c) => <option key={c} value={c}>{c}</option>)}</select>{E('city')}</div>
            <div><label className="gc-label" htmlFor="gpp-a">Availability</label><select id="gpp-a" className="gc-input gc-select" value={f.availability} onChange={(e) => set({ availability: e.target.value })}>{Object.entries(AVAIL).map(([k, a]) => <option key={k} value={k}>{a.label}</option>)}</select></div>
          </div>
          <div id="gpp-niches"><span className="gc-label">Niches (up to 6)</span><Toggles options={[...new Set([...st.niches, ...f.niches])]} value={f.niches} onChange={(v) => set({ niches: v })} label="Niches" max={6} />{E('niches')}</div>
          <div><span className="gc-label">Languages</span><Toggles options={[...new Set([...LANGS, ...f.languages])]} value={f.languages} onChange={(v) => set({ languages: v })} label="Languages" /></div>
          <div><label className="gc-label" htmlFor="gpp-bio">About</label><textarea id="gpp-bio" className="gc-input" rows={4} value={f.bio} onChange={(e) => set({ bio: e.target.value })} /></div>
        </section>
        <section className="ix-card pt-pad pt-sec" aria-labelledby="gpp-s3" id="gpp-platforms">
          <h2 id="gpp-s3">Platforms and followers</h2>
          <PlatformRows rows={f.platforms} onChange={(v) => set({ platforms: v })} />
          {E('platforms')}
        </section>
        <section className="ix-card pt-pad pt-sec" aria-labelledby="gpp-s4">
          <h2 id="gpp-s4">Sample work</h2>
          <SampleRows rows={f.samples} onChange={(v) => set({ samples: v })} />
        </section>
        <section className="ix-card pt-pad pt-sec" aria-labelledby="gpp-s5" id="gpp-packages">
          <h2 id="gpp-s5">Rate card</h2>
          <PackageRows rows={f.packages} onChange={(v) => set({ packages: v })} />
          {E('packages')}
          <div className="pt-grid2" id="gpp-budget">
            <div><label className="gc-label" htmlFor="gpp-bf">Usual budget from (৳)</label><input id="gpp-bf" className="gc-input" inputMode="numeric" value={f.budgetFrom} onChange={(e) => set({ budgetFrom: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="gpp-bt">Up to (৳)</label><input id="gpp-bt" className="gc-input" inputMode="numeric" value={f.budgetTo} onChange={(e) => set({ budgetTo: e.target.value })} /></div>
          </div>
          {E('budget')}
        </section>
        <section className="ix-card pt-pad pt-sec" aria-labelledby="gpp-s6">
          <h2 id="gpp-s6">Contact</h2>
          <p className="pt-muted">Shown to a store only after you accept its request.</p>
          <div className="pt-grid2">
            <div id="gpp-phone"><PhoneCheck phone={f.phone} verified={f.phoneVerified} onPhone={(v) => set({ phone: v })} onVerified={(v) => set({ phoneVerified: v })} err={err.phone} /></div>
            <div id="gpp-email"><label className="gc-label" htmlFor="gpp-e">Email</label><input id="gpp-e" type="email" className="gc-input" value={f.email} onChange={(e) => set({ email: e.target.value })} />{E('email')}</div>
          </div>
        </section>
        <div className="pt-row"><button type="submit" className="ix-btn ix-btn--primary"><Icon name="check" width="16" height="16" aria-hidden="true" />Save profile</button></div>
      </form>
      <aside className="ix-side" aria-label="Share">
        <ShareCard p={p} />
      </aside>
    </div>
  </>);
}

export default function GpProfile() {
  return <GpFrame active="profile" screen="GpProfile" css={FORM_CSS}>{(p) => <Editor key={p.id} p={p} />}</GpFrame>;
}
