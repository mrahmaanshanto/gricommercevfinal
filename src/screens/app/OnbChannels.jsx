'use client';
// Merchant app · Sign-up step 4 (/onb-channels): how the shop sells. The answer picks the system (lib/edition.js):
// Online only → Online · In a shop only → Retail · Both → Retail + Online (lib/shopOnboarding.js › SELL); with a shop,
// how stock is bought (Settings › Stock setup: direct purchase / purchase orders / both). Where customers find the shop
// and how they pay shape Done's next steps. On an edition's own site the system is fixed and only shown.
// Continue → /onb-link.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Note, Segmented } from './kit/AppKit';
import { OnbScreen, OnbTitle, ChoiceCard, TickChips, useDraft } from './onb/OnbKit';
import { SELL, FIND, PAY, lockedSell } from '@/lib/shopOnboarding';
import { BUYING } from '@/lib/stockSetup';

export default function OnbChannelsScreen() {
  const router = useRouter();
  const [d, set] = useDraft();
  const [sell, setSell] = useState('');
  const [find, setFind] = useState([]);
  const [pay, setPay] = useState([]);
  const [buying, setBuying] = useState('direct');
  const [fixed, setFixed] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!d) return;
    const lock = lockedSell();
    setFixed(lock);
    setSell((s) => s || (lock ? lock.key : d.sell || ''));
    setFind((f) => (f.length ? f : d.find || []));
    setPay((p) => (p.length ? p : d.pay || ['Cash on delivery']));
    setBuying((b) => d.buying || b);
  }, [d]);
  const online = sell === 'online' || sell === 'both' || (fixed && /online/.test(fixed.edition));
  const shop = sell === 'shop' || sell === 'both' || (fixed && /retail/.test(fixed.edition));

  const go = () => {
    if (!sell) { setErr('Choose how you sell.'); return; }
    set({ sell, find: online ? find : [], pay, buying: shop ? buying : 'direct' });
    router.push('/onb-link');
  };

  return (
    <OnbScreen name="OnbChannels" title="How you sell" step={4} label="How you sell" back="/onb-store"
      actions={<Button style={{ flex: 2 }} onClick={go}>Continue</Button>}>
      <OnbTitle title="How do you sell today?" sub="We’ll set up the right system for you." />
      {fixed ? (
        <Note tone="info" icon="store" style={{ marginTop: '20px' }}>{`This site is ${fixed.label}.`}</Note>
      ) : (
        <div role="radiogroup" aria-label="How you sell" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          {SELL.map((s) => <ChoiceCard key={s.key} row on={sell === s.key} icon={s.icon} label={s.label} sub={s.sub} onClick={() => { setSell(s.key); setErr(''); }} />)}
        </div>
      )}
      {err ? <p role="alert" style={{ margin: '10px 0 0', fontSize: 'var(--text-xs-plus)', color: 'var(--err)' }}>{err}</p> : null}
      {online ? (
        <div className="field" style={{ marginTop: '22px' }}>
          <span className="lab">Where do customers find you?</span>
          <TickChips items={FIND} value={find} onChange={setFind} label="Where do customers find you?" />
        </div>
      ) : null}
      {shop ? (
        <div className="field" style={{ marginTop: '22px' }}>
          <span className="lab">How do you buy stock?</span>
          <Segmented items={BUYING.map(([key, label]) => ({ key, label }))} value={buying} onChange={setBuying} style={{ margin: 0 }} />
          <span className="help">{(BUYING.find((b) => b[0] === buying) || [])[2]}</span>
        </div>
      ) : null}
      <div className="field" style={{ marginTop: '22px' }}>
        <span className="lab">How do customers pay?</span>
        <TickChips items={PAY} value={pay} onChange={setPay} label="How do customers pay?" />
      </div>
    </OnbScreen>
  );
}
