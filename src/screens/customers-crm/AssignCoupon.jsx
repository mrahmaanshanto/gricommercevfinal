'use client';
// AssignCouponDialog — make a one-time coupon code for each chosen customer (lib/personalCoupons.js): the discount,
// how many days it works and whether to tell them by SMS or WhatsApp. Used by Customers (bulk "Assign coupon") and the
// customer page. The codes are real offers: the POS, Create order and the checkout accept each only for its customer.

import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui';
import { toast } from '@/runtime/ui';
import { currentUser } from '@/lib/team';
import { COUPON_KINDS, COUPON_DAYS, TELL_BY, makePersonalCoupons } from '@/lib/personalCoupons';

const CSS = '.pc-form{display:flex;flex-direction:column;gap:var(--space-3)}.pc-form .gc-help{margin:0}.pc-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}@media (max-width:640px){.pc-two{grid-template-columns:minmax(0,1fr)}}';

export default function AssignCouponDialog({ open, customers = [], onClose, onDone }) {
  const [kind, setKind] = useState('pct10');
  const [days, setDays] = useState(7);
  const [tell, setTell] = useState('sms');
  useEffect(() => { if (open) { setKind('pct10'); setDays(7); setTell('sms'); } }, [open]);
  const n = customers.length;
  const one = n === 1 ? customers[0] : null;

  const run = () => {
    if (!n) { onClose(); return; }
    const r = makePersonalCoupons(customers, { kind, days: Number(days), tell, by: (currentUser() || {}).name || 'Staff' });
    const made = r.made.length;
    if (!made) { toast('No code was made. ' + ((r.failed[0] || {}).reason || ''), { tone: 'error' }); return; }
    const head = one ? 'Code ' + r.made[0].code + ' made for ' + one.name + '.' : made + ' codes made, one per customer.';
    const why = Object.keys(r.reasons).map((k) => (one ? k : k + ' (' + r.reasons[k] + ')')).join(', ');
    const word = (TELL_BY.find((t) => t[0] === tell) || [])[1];
    const told = tell === 'none' ? ' No message sent.' : one ? (r.told ? ' Sent by ' + word + '.' : ' Not sent by ' + word + ': ' + why + '.') : ' ' + word + ': ' + r.told + ' sent' + (r.notTold ? ', ' + r.notTold + ' not sent (' + why + ')' : '') + '.';
    const failed = r.failed.length ? ' ' + r.failed.length + ' failed.' : '';
    toast(head + told + failed, r.notTold || r.failed.length ? { tone: 'info' } : undefined);
    if (onDone) onDone(r);
  };

  return (
    <Dialog open={open} title={one ? 'Assign a coupon' : 'Assign a coupon to ' + n + ' customers'} onClose={onClose} width={480}
      footer={<>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onClose}>Cancel</button>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={run}>{one ? 'Make code' : 'Make ' + n + ' codes'}</button>
      </>}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pc-form">
        <p className="gc-help">{one ? 'A one-time code that only ' + one.name + ' can use.' : 'Each customer gets their own one-time code.'}</p>
        <div className="pc-two">
          <div><label className="gc-label" htmlFor="pc-kind">Discount</label>
            <select id="pc-kind" className="gc-input gc-select" value={kind} onChange={(e) => setKind(e.target.value)}>{COUPON_KINDS.map((k) => <option key={k.k} value={k.k}>{k.label}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="pc-days">Works for</label>
            <select id="pc-days" className="gc-input gc-select" value={days} onChange={(e) => setDays(e.target.value)}>{COUPON_DAYS.map((d) => <option key={d} value={d}>{d} days</option>)}</select></div>
        </div>
        <div><label className="gc-label" htmlFor="pc-tell">Tell them by</label>
          <select id="pc-tell" className="gc-input gc-select" value={tell} onChange={(e) => setTell(e.target.value)}>{TELL_BY.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <p className="gc-help">Only customers who said yes to offers on this channel get the message.</p></div>
      </div>
    </Dialog>
  );
}
