'use client';
// Grid Partners for creators (/grid-partners; Batch E): a short landing page — what it is, who it is for (models,
// influencers, video creators), how it works in 3 steps, the minimum standards (from the super admin's settings) and Join
// (/grid-partners/join). A featured partner's public page is the example. Data: lib/platform/partners.js.

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { TYPES, settings, livePartners, followersText } from '@/lib/platform/partners';
import { usePartners, Avatar, Tick, TopReach } from '../partnerShared';
import { PublicFrame } from './gpShared';

const CSS = `
.gl-hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:var(--space-6);align-items:center;padding:var(--space-6);border-radius:var(--radius-xl);background:linear-gradient(135deg,var(--fill-primary-soft),var(--surface-card));border:1px solid var(--border-subtle)}
.gl-hero h1{margin:0;font-size:var(--text-3xl);font-weight:var(--weight-semibold);line-height:1.2;color:var(--text-heading)}
.gl-hero p{margin:0;font-size:var(--text-base);line-height:1.6;color:var(--text-body)}
.gl-hero__text{display:flex;flex-direction:column;gap:var(--space-4)}
.gl-faces{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.gl-face{display:flex;flex-direction:column;border-radius:var(--radius-lg);overflow:hidden;background:var(--surface-card);border:1px solid var(--border-subtle);color:inherit;text-decoration:none}
.gl-face img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;object-position:top center}
.gl-face span{display:flex;flex-direction:column;gap:2px;padding:8px}
.gl-face b{display:flex;align-items:center;gap:4px;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gl-types{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.gl-type{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4)}
.gl-type h3,.gl-step h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gl-type p,.gl-step p{margin:0;font-size:var(--text-sm);color:var(--text-body);line-height:1.5}
.gl-ico{display:grid;place-items:center;width:40px;height:40px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.gl-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3);margin:0;padding:0;list-style:none;counter-reset:s}
.gl-step{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4)}
.gl-num{display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--primary);color:var(--text-on-dark);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.gl-h2{margin:var(--space-2) 0 0;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gl-std{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--space-2);margin:0;padding:0;list-style:none}
.gl-std li{display:flex;gap:8px;align-items:flex-start;font-size:var(--text-sm);color:var(--text-body)}
.gl-std svg{flex:none;margin-top:2px;color:var(--text-success)}
.gl-cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-5)}
.gl-cta b{font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:860px){.gl-hero{grid-template-columns:1fr;padding:var(--space-5)}.gl-types,.gl-steps{grid-template-columns:1fr}}
@media (max-width:640px){.gl-hero{padding:var(--space-4)}.gl-hero h1{font-size:var(--text-2xl)}}
`;

const ABOUT = {
  model: 'Catalogue, lookbook and product shoots for clothing, jewellery, beauty and more.',
  influencer: 'Posts, stories and campaigns to your followers on Facebook, Instagram and TikTok.',
  creator: 'Reels, reviews, unboxings and short videos stores can post and run as ads.',
};

export default function GpLanding() {
  const { ready } = usePartners();
  const st = ready ? settings().standards : null;
  const faces = ready ? livePartners().filter((p) => p.photo && p.featured).slice(0, 3) : [];
  const example = faces[0];
  return (
    <PublicFrame screen="GpLanding" css={CSS}>
      <section className="gl-hero">
        <div className="gl-hero__text">
          <h1>Get hired by online shops across Bangladesh</h1>
          <p>Grid Partners puts models, influencers and video creators in front of the stores that run on GridCommerce. Show your work and your rates; stores send you requests.</p>
          <div className="pt-row">
            <Link href="/grid-partners/join" className="ix-btn ix-btn--primary"><Icon name="user-plus" width="16" height="16" aria-hidden="true" />Join Grid Partners</Link>
            {example ? <Link href={'/p?h=' + example.handle} className="ix-btn">See a profile</Link> : null}
          </div>
        </div>
        <div className="gl-faces" aria-label="Some of our partners">
          {faces.map((p) => (
            <Link key={p.id} href={'/p?h=' + p.handle} className="gl-face">
              {p.photo ? <img src={p.photo} alt="" /> : <Avatar p={p} size={120} />}
              <span><b>{p.name.split(' ')[0]}{p.verified ? <Tick size={12} /> : null}</b><TopReach p={p} /></span>
            </Link>
          ))}
        </div>
      </section>

      <h2 className="gl-h2">Who it is for</h2>
      <div className="gl-types">
        {Object.entries(TYPES).map(([k, t]) => (
          <section key={k} className="ix-card gl-type">
            <span className="gl-ico" aria-hidden="true"><Icon name={t.icon} width="20" height="20" /></span>
            <h3>{t.plural}</h3>
            <p>{ABOUT[k]}</p>
          </section>
        ))}
      </div>

      <h2 className="gl-h2">How it works</h2>
      <ol className="gl-steps">
        {[['Apply', 'Add your platforms, at least 3 samples of your work and your rate card. Check your phone with a code.'],
          ['Get approved', 'GridCommerce checks your profile against the minimum standards, usually within 2 working days.'],
          ['Get requests', 'Stores find you and send a brief. Accept it and you both see each other’s phone and email.']].map(([h, p], i) => (
          <li key={h} className="ix-card gl-step"><span className="gl-num" aria-hidden="true">{i + 1}</span><h3>{h}</h3><p>{p}</p></li>
        ))}
      </ol>

      {st ? (
        <section className="ix-card pt-pad" aria-labelledby="gl-std">
          <h2 id="gl-std">Minimum standards</h2>
          <ul className="gl-std">
            <li><Icon name="check" width="14" height="14" aria-hidden="true" />{followersText(st.minFollowers.model)}+ followers for models, {followersText(st.minFollowers.influencer)}+ for influencers, {followersText(st.minFollowers.creator)}+ for video creators</li>
            <li><Icon name="check" width="14" height="14" aria-hidden="true" />At least {st.minSamples} samples of your work</li>
            {st.phoneVerified ? <li><Icon name="check" width="14" height="14" aria-hidden="true" />A mobile number checked with a code</li> : null}
            {st.idChecked ? <li><Icon name="check" width="14" height="14" aria-hidden="true" />Your national ID or passport</li> : null}
            {st.rateCard ? <li><Icon name="check" width="14" height="14" aria-hidden="true" />A rate card with your own prices</li> : null}
          </ul>
        </section>
      ) : null}

      <section className="ix-card gl-cta">
        <span><b>Free to join.</b> <span className="pt-muted">No fees and no cut from your work.</span></span>
        <Link href="/grid-partners/join" className="ix-btn ix-btn--primary">Join Grid Partners</Link>
      </section>
    </PublicFrame>
  );
}
