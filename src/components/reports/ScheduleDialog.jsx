'use client';
// ScheduleDialog — send a report every day, week or month at a set time, by email or WhatsApp.
// Front end only: the schedule is saved here and shown on Scheduled reports; sending needs the server later.

import React, { useState } from 'react';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { saveSchedule, nextRun } from '@/lib/reports/prefs';
import { fmt } from '@/lib/reports/period';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ScheduleDialog({ report, query = '', existing, onClose }) {
  const [s, setS] = useState(existing || { reportId: report.id, title: report.title, query, every: 'day', time: '20:00', weekday: 6, monthDay: 1, to: 'whatsapp', address: '01700-000000', format: 'pdf' });
  const [err, setErr] = useState('');
  const set = (patch) => { setS({ ...s, ...patch }); setErr(''); };
  const save = () => {
    const addr = String(s.address || '').trim();
    if (s.to === 'email' ? !/^\S+@\S+\.\S+$/.test(addr) : !/^01[3-9]\d{2}-?\d{6}$/.test(addr.replace(/\s/g, ''))) { setErr(s.to === 'email' ? 'Enter an email address.' : 'Enter a Bangladeshi mobile number, e.g. 01711-234567.'); return; }
    const row = saveSchedule({ ...s, address: addr });
    toast(`Scheduled · next ${fmt(nextRun(row), 'datetime')}`);
    onClose(true);
  };
  const when = s.every === 'day' ? `every day at ${s.time}` : s.every === 'week' ? `every ${DAYS[s.weekday]} at ${s.time}` : `on day ${s.monthDay} of each month at ${s.time}`;
  return (
    <Dialog open title={existing ? 'Edit schedule' : 'Schedule this report'} onClose={() => onClose(false)} width={520}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={save}>{existing ? 'Save' : 'Schedule'}</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-heading)', fontWeight: 'var(--weight-medium)' }}>{s.title}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
          <div><label className="gc-label" htmlFor="sd-every">How often</label><select id="sd-every" className="gc-input gc-select" value={s.every} onChange={(e) => set({ every: e.target.value })}><option value="day">Every day</option><option value="week">Every week</option><option value="month">Every month</option></select></div>
          {s.every === 'week' ? <div><label className="gc-label" htmlFor="sd-wd">On</label><select id="sd-wd" className="gc-input gc-select" value={s.weekday} onChange={(e) => set({ weekday: Number(e.target.value) })}>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></div> : null}
          {s.every === 'month' ? <div><label className="gc-label" htmlFor="sd-md">Day of the month</label><select id="sd-md" className="gc-input gc-select" value={s.monthDay} onChange={(e) => set({ monthDay: Number(e.target.value) })}>{Array.from({ length: 28 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select></div> : null}
          <div><label className="gc-label" htmlFor="sd-time">Time</label><input id="sd-time" type="time" className="gc-input" value={s.time} onChange={(e) => set({ time: e.target.value })} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
          <div><label className="gc-label" htmlFor="sd-to">Send to</label><select id="sd-to" className="gc-input gc-select" value={s.to} onChange={(e) => set({ to: e.target.value, address: e.target.value === 'email' ? 'owner@gridshop.com.bd' : '01700-000000' })}><option value="whatsapp">WhatsApp</option><option value="email">Email</option></select></div>
          <div><label className="gc-label" htmlFor="sd-addr">{s.to === 'email' ? 'Email' : 'Mobile number'}</label><input id="sd-addr" className={'gc-input' + (err ? ' gc-input--error' : '')} value={s.address} onChange={(e) => set({ address: e.target.value })} aria-invalid={!!err} aria-describedby={err ? 'sd-err' : undefined} /></div>
          <div><label className="gc-label" htmlFor="sd-fmt">As</label><select id="sd-fmt" className="gc-input gc-select" value={s.format} onChange={(e) => set({ format: e.target.value })}><option value="pdf">PDF</option><option value="csv">CSV (spreadsheet)</option><option value="text">Short message</option></select></div>
        </div>
        {err ? <p id="sd-err" className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--fill-info-soft)', color: 'var(--text-info)', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>
          <b style={{ fontWeight: 'var(--weight-semibold)' }}>{s.title}</b> will be sent {when} to {s.address || '…'} as {s.format === 'pdf' ? 'a PDF' : s.format === 'csv' ? 'a spreadsheet' : 'a short message'}. Sending starts once the shop’s server is connected; the schedule is kept until then.
        </div>
      </div>
    </Dialog>
  );
}
