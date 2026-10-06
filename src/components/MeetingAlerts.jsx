'use client';
// MeetingAlerts — keeps staff and customers on time for meetings (lib/meetings.js), mounted once in the root layout.
// Every half minute: sends the customer's reminder for meetings starting within the hour, puts meetings starting within
// 15 minutes and meetings waiting for a note in the top bar's bell (window.__gcMeet + 'gc:meet'), and shows a toast
// once per meeting when one is about to start. It only runs on pages with the merchant top bar.

import { useEffect } from 'react';
import { toast } from '@/runtime/ui';
import { staffAlerts, sendDueReminders, MEETINGS_EVENT } from '@/lib/meetings';
import { hasModule } from '@/lib/edition';

const SEEN = 'gc.meetings.toasted';
const fmtTime = (t) => new Date(t).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });

export function MeetingAlerts() {
  useEffect(() => {
    const tick = () => {
      // only on the merchant pages (they have the top bar); sign-in, storefront and console pages are left alone
      // and only in editions with meetings (Communication & CRM: Online, Retail + Online, Connect; not Retail)
      if (!document.querySelector('gc-topbar') || !hasModule('comms')) { if (window.__gcMeet && window.__gcMeet.items.length) { window.__gcMeet = { items: [] }; window.dispatchEvent(new CustomEvent('gc:meet')); } return; }
      try {
        sendDueReminders();
        const { soon, note } = staffAlerts();
        const items = [
          ...soon.map((m) => ({ id: m.id, t: `Meeting at ${fmtTime(m.at)}: ${m.with.name}`, d: m.title, w: 'Soon' })),
          ...note.slice(0, 3).map((m) => ({ id: m.id, t: `Add a note: ${m.with.name}`, d: m.title, w: new Date(m.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) })),
        ];
        window.__gcMeet = { items };
        window.dispatchEvent(new CustomEvent('gc:meet'));
        let seen = [];
        try { seen = JSON.parse(window.sessionStorage.getItem(SEEN)) || []; } catch { /* ignore */ }
        soon.filter((m) => !seen.includes(m.id)).forEach((m) => {
          toast(`${m.title} with ${m.with.name} starts at ${fmtTime(m.at)}`, { tone: 'info' });
          seen.push(m.id);
        });
        try { window.sessionStorage.setItem(SEEN, JSON.stringify(seen)); } catch { /* ignore */ }
      } catch { /* the meetings list could not be read */ }
    };
    tick();
    const id = window.setInterval(tick, 30000);
    window.addEventListener(MEETINGS_EVENT, tick);
    return () => { window.clearInterval(id); window.removeEventListener(MEETINGS_EVENT, tick); };
  }, []);
  return null;
}
