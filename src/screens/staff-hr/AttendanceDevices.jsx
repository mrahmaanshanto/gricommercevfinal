'use client';
// Attendance devices (/attendance-devices) — the fingerprint / face machines at each place (src/lib/hr.js › devices):
// connection, last sync, punches today; who is enrolled on which machine (fingerprints, face, card); today's punch
// log; and adding a machine. Front end only: syncing pretends the machine answered.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { formatDate, formatTime } from '@/lib/format';
import {
  DEVICE_KINDS, HR_PLACES, saveDevice, removeDevice, syncDevice, saveEnrolment, enrolmentOf, punchesOn, todayKey, t12, devicesAt,
} from '@/lib/hr';
import { HrPage, useHr, Person } from './hrShared';
import { FORM_CSS, Seg } from '@/screens/staff-profile/staffForm';

const CSS = `
.ad-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr));gap:var(--space-3);padding:var(--space-4) var(--space-5) var(--space-5)}
.ad-dev{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl)}
.ad-dev.is-off{border-color:var(--text-danger);background:var(--fill-error-soft)}
.ad-dev header{display:flex;align-items:flex-start;gap:var(--space-3)}
.ad-dev header b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ad-dl{display:grid;grid-template-columns:auto 1fr;gap:4px var(--space-3);margin:0;font-size:var(--text-xs)}
.ad-dl dt{color:var(--text-muted)}
.ad-dl dd{margin:0;color:var(--text-heading);font-family:var(--font-data);overflow-wrap:anywhere}
.ad-dot{display:inline-block;width:8px;height:8px;margin-right:6px;border-radius:var(--radius-full);background:var(--text-success)}
.ad-dot.is-off{background:var(--text-danger)}
.ad-split{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:var(--space-4);align-items:start}
.ad-log{display:flex;flex-direction:column;max-height:560px;overflow:auto}
.ad-log > div{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-5);border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.ad-log time{width:72px;flex:none;font-family:var(--font-data);color:var(--text-heading)}
.ad-steps{margin:0;padding:0 var(--space-5) var(--space-5) calc(var(--space-5) + 18px);font-size:var(--text-sm);line-height:1.7;color:var(--text-body)}
@media (max-width:1500px){.ad-split{grid-template-columns:minmax(0,1fr)}}
`;
const BRANDS = ['ZKTeco', 'Hikvision', 'Suprema', 'Dahua', 'Other'];

export default function AttendanceDevices() {
  const { S } = useHr();
  const today = todayKey(S);
  const devs = S.devices || [];
  const [edit, setEdit] = useState(null);
  const [enrol, setEnrol] = useState(null);
  const [place, setPlace] = useState('');
  const punches = punchesOn(S, today);
  const atMachines = S.staff.filter((s) => s.status !== 'left' && devicesAt(S, s.branch).length);
  const rows = atMachines.filter((s) => !place || s.branch === place).map((s) => ({ s, en: enrolmentOf(S, s) }));
  const missing = atMachines.filter((s) => !enrolmentOf(S, s).ok);
  const off = devs.filter((d) => d.status !== 'online');

  const save = (e) => {
    e.preventDefault();
    if (!edit.name.trim()) { toast('Name the machine', { tone: 'error' }); return; }
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(edit.ip.trim())) { toast('The IP address looks wrong, e.g. 192.168.10.21', { tone: 'error' }); return; }
    const row = saveDevice({ ...edit, name: edit.name.trim(), ip: edit.ip.trim() });
    toast(edit.id ? `${row.name} saved.` : `${row.name} added. Enrol people at ${row.place} on it.`);
    setEdit(null);
  };
  const sync = (d) => {
    syncDevice(d.id);
    toast(d.status === 'online' ? `${d.name} synced — no new punches since ${formatTime(d.lastSync)}.` : `${d.name} answered again and is back online.`);
  };
  const remove = async (d) => {
    if (!(await confirmDialog({ title: `Remove ${d.name}?`, body: `People at ${d.place} will need the staff app or the POS to clock in. Punches already pulled are kept.`, confirmLabel: 'Remove', tone: 'danger' }))) return;
    removeDevice(d.id);
    toast(`${d.name} removed.`);
  };
  const saveEnrol = (e) => {
    e.preventDefault();
    saveEnrolment(enrol.s.code, { fingers: enrol.fingers, face: enrol.face, card: enrol.card });
    toast(`${enrol.s.name}’s enrolment saved.`);
    setEnrol(null);
  };

  return (
    <HrPage screen="AttendanceDevices" active="hr-devices" page="Attendance devices" title="Attendance devices" css={FORM_CSS + CSS}
      about="Fingerprint and face machines at each place, who is enrolled on them, and today’s punches."
      actions={<button type="button" className="gc-btn gc-btn--solid" onClick={() => setEdit({ name: '', place: HR_PLACES[1] || HR_PLACES[0], kind: 'finger', brand: 'ZKTeco', model: '', serial: '', ip: '192.168.', port: 4370 })}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Add machine</button>}>
      <div className="gc-kpis">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: off.length ? 'var(--fill-error-soft)' : 'var(--fill-success-soft)', color: off.length ? 'var(--text-danger)' : 'var(--text-success)' }}><Icon name="fingerprint" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Machines</p><p className="gc-kpi__value">{devs.length}<small>{off.length ? `${off.length} offline` : 'all online'}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="log-in" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Punches today</p><p className="gc-kpi__value">{punches.length}<small>{punches.filter((p) => p.device).length} from machines</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: missing.length ? 'var(--fill-warning-soft)' : 'var(--fill-success-soft)', color: missing.length ? 'var(--text-warning)' : 'var(--text-success)' }}><Icon name="user-check" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Enrolled</p><p className="gc-kpi__value">{atMachines.length - missing.length} of {atMachines.length}<small>{missing.length ? `${missing.map((s) => s.name.split(' ')[0]).join(', ')} not yet` : 'everyone at a machine'}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="refresh-cw" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Last sync</p><p className="gc-kpi__value">{devs.length ? formatTime(Math.max(...devs.map((d) => d.lastSync || 0))) : '—'}<small>machines push every 5 minutes</small></p></div></div>
      </div>

      <section className="gc-card hr-card">
        <div className="hr-head"><div><h2>Machines</h2><p>Each machine sends its punches to GridCommerce over the internet.</p></div></div>
        {devs.length ? (
          <div className="ad-grid">
            {devs.map((d) => {
              const isOff = d.status !== 'online';
              const [kind, icon] = DEVICE_KINDS[d.kind] || DEVICE_KINDS.finger;
              const people = S.staff.filter((s) => s.status !== 'left' && s.branch === d.place);
              return (
                <div key={d.id} className={'ad-dev' + (isOff ? ' is-off' : '')}>
                  <header>
                    <span className="rp-tile"><Icon name={icon} width="18" height="18" aria-hidden="true" /></span>
                    <div style={{ flex: 1, minWidth: 0 }}><b>{d.name}</b><span className="hr-sub">{d.place} · {kind}</span></div>
                    <span className={'gc-badge gc-badge--' + (isOff ? 'error' : 'success')}><span className={'ad-dot' + (isOff ? ' is-off' : '')} aria-hidden="true" />{isOff ? 'Offline' : 'Online'}</span>
                  </header>
                  <dl className="ad-dl">
                    <dt>Model</dt><dd>{d.brand} {d.model || '—'}</dd>
                    <dt>Serial</dt><dd>{d.serial || '—'}</dd>
                    <dt>Address</dt><dd>{d.ip}:{d.port}</dd>
                    <dt>Last sync</dt><dd>{d.lastSync ? `${formatDate(d.lastSync)} ${formatTime(d.lastSync)}` : '—'}</dd>
                    <dt>People</dt><dd>{people.filter((s) => enrolmentOf(S, s).ok).length} of {people.length} enrolled</dd>
                  </dl>
                  {isOff && d.note ? <div className="hr-note hr-note--error"><Icon name="wifi-off" width="16" height="16" aria-hidden="true" /><span>{d.note}</span></div> : null}
                  <div className="hr-actions" style={{ justifyContent: 'flex-start' }}>
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => sync(d)}><Icon name="refresh-cw" width="14" height="14" aria-hidden="true" /> {isOff ? 'Try again' : 'Sync now'}</button>
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setEdit({ ...d })}>Edit</button>
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" aria-label={`Remove ${d.name}`} onClick={() => remove(d)}><Icon name="trash-2" width="14" height="14" aria-hidden="true" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <EmptyState icon="fingerprint" title="No machines yet" body="Add the fingerprint or face machine at each place so punches come in on their own." />}
      </section>

      <div className="ad-split">
        <section className="gc-card hr-card">
          <div className="hr-bar">
            <div><b className="hr-strong">Enrolment</b><span className="hr-sub">Save a person’s fingerprint or face on the machine, then mark it here.</span></div>
            <select className="gc-input gc-select" style={{ width: 'auto' }} aria-label="Place" value={place} onChange={(e) => setPlace(e.target.value)}><option value="">All places</option>{[...new Set(devs.map((d) => d.place))].map((p) => <option key={p}>{p}</option>)}</select>
          </div>
          {rows.length ? (
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact">
                <thead><tr><th scope="col">Staff</th><th scope="col">Machine</th><th scope="col" className="hr-num">User no.</th><th scope="col">Saved</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{rows.map(({ s, en }) => {
                  const b = s.bio || {};
                  return (
                    <tr key={s.code}>
                      <td><Person st={s} sub={`${s.code} · clocks in with ${s.checkIn || '—'}`} /></td>
                      <td>{en.device ? en.device.name : '—'}</td>
                      <td className="hr-num hr-fig">{b.uid || Number(s.code.replace(/\D/g, ''))}</td>
                      <td>{[b.fingers ? `${b.fingers} finger${b.fingers > 1 ? 's' : ''}` : '', b.face ? 'face' : '', b.card ? 'card' : ''].filter(Boolean).join(' · ') || <span className="hr-sub">Nothing</span>}</td>
                      <td>{en.ok ? <span className="gc-badge gc-badge--success">Enrolled</span> : <span className="gc-badge gc-badge--warning">{en.needs} needed</span>}</td>
                      <td><div className="hr-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setEnrol({ s, device: en.device, fingers: b.fingers || 0, face: !!b.face, card: b.card || '' })}>{en.ok ? 'Change' : 'Enrol'}</button></div></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          ) : <EmptyState icon="users" title="No one here" body="People at places with a machine show here." />}
        </section>
        <section className="gc-card hr-card">
          <div className="hr-head"><div><h2>Today’s punches</h2><p>Newest first, from the machines, the staff app and POS log-ins.</p></div><Link href="/attendance" className="gc-btn gc-btn--sm gc-btn--neutral">Attendance</Link></div>
          {punches.length ? (
            <div className="ad-log">
              {punches.map((p, i) => (
                <div key={i}>
                  <time>{t12(p.time)}</time>
                  <Icon name={p.kind === 'in' ? 'log-in' : 'log-out'} width="16" height="16" aria-hidden="true" style={{ color: p.kind === 'in' ? 'var(--text-success)' : 'var(--text-muted)' }} />
                  <span style={{ flex: 1, minWidth: 0 }}><span className="hr-strong">{p.st.name}</span><span className="hr-sub">{p.kind === 'in' ? 'In' : 'Out'} · {p.device ? p.device.name : p.src}</span></span>
                </div>
              ))}
            </div>
          ) : <EmptyState icon="clock" title="No punches yet today" body="They show as soon as people clock in." />}
        </section>
      </div>

      <details className="gc-card hr-card gc-disclose">
        <summary>How to connect a new machine</summary>
        <ol className="ad-steps">
          <li>On the machine: Menu › Comm. › Cloud Server Setting. Server address <b className="hr-fig">push.gridcommerce.com.bd</b>, port <b className="hr-fig">8081</b>, HTTPS on.</li>
          <li>Add it here with its serial number (Menu › System Info › Device Info) so its punches are matched to the place.</li>
          <li>Enrol each person with their user number — it is the number in their employee number (EMP-0142 → 142).</li>
          <li>Punches show in Attendance within 5 minutes. If a machine stops answering for 30 minutes, the HR dashboard says so.</li>
        </ol>
      </details>

      <Dialog open={!!edit} title={edit && edit.id ? `Edit · ${edit.name}` : 'Add a machine'} onClose={() => setEdit(null)} width={620}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button><button type="submit" form="ad-form" className="gc-btn gc-btn--solid">{edit && edit.id ? 'Save' : 'Add machine'}</button></>}>
        {edit ? (
          <form id="ad-form" className="hr-form" onSubmit={save}>
            <div className="hr-two">
              <div><label className="gc-label" htmlFor="ad-name">Name</label><input id="ad-name" className="gc-input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. Mirpur back door" data-autofocus /></div>
              <div><label className="gc-label" htmlFor="ad-place">Place</label><select id="ad-place" className="gc-input gc-select" value={edit.place} onChange={(e) => setEdit({ ...edit, place: e.target.value })}>{HR_PLACES.map((p) => <option key={p}>{p}</option>)}</select></div>
            </div>
            <div><span className="gc-label">Reads</span><Seg label="Reads" value={edit.kind} options={Object.entries(DEVICE_KINDS).map(([k, [l]]) => [k, l])} onChange={(v) => setEdit({ ...edit, kind: v })} /></div>
            <div className="hr-three">
              <div><label className="gc-label" htmlFor="ad-brand">Brand</label><select id="ad-brand" className="gc-input gc-select" value={edit.brand} onChange={(e) => setEdit({ ...edit, brand: e.target.value })}>{BRANDS.map((b) => <option key={b}>{b}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="ad-model">Model</label><input id="ad-model" className="gc-input" value={edit.model} onChange={(e) => setEdit({ ...edit, model: e.target.value })} placeholder="K40 Pro" /></div>
              <div><label className="gc-label" htmlFor="ad-serial">Serial number</label><input id="ad-serial" className="gc-input hr-fig" value={edit.serial} onChange={(e) => setEdit({ ...edit, serial: e.target.value.toUpperCase() })} /></div>
              <div><label className="gc-label" htmlFor="ad-ip">IP address</label><input id="ad-ip" className="gc-input hr-fig" inputMode="decimal" value={edit.ip} onChange={(e) => setEdit({ ...edit, ip: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="ad-port">Port</label><input id="ad-port" className="gc-input hr-fig" inputMode="numeric" value={edit.port} onChange={(e) => setEdit({ ...edit, port: e.target.value.replace(/\D/g, '') })} /></div>
            </div>
            {devs.some((d) => d.id !== edit.id && d.place === edit.place) ? <div className="hr-note hr-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>{edit.place} already has a machine. People enrolled there need saving on this one too.</span></div> : null}
          </form>
        ) : null}
      </Dialog>
      <Dialog open={!!enrol} title={enrol ? `Enrolment · ${enrol.s.name}` : 'Enrolment'} onClose={() => setEnrol(null)} width={520}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEnrol(null)}>Cancel</button><button type="submit" form="ad-enrol" className="gc-btn gc-btn--solid">Save</button></>}>
        {enrol ? (
          <form id="ad-enrol" className="hr-form" onSubmit={saveEnrol}>
            <p className="gc-help" style={{ margin: 0 }}>On {enrol.device ? enrol.device.name : 'the machine'}: Menu › User Mgt. › New User, user number <b className="hr-fig">{Number(enrol.s.code.replace(/\D/g, ''))}</b>, then save the fingerprint or face. Mark what was saved:</p>
            {!enrol.device || enrol.device.kind !== 'face' ? <div><span className="gc-label">Fingerprints</span><Seg label="Fingerprints" value={enrol.fingers} options={[[0, 'None'], [1, 'One'], [2, 'Two']]} onChange={(v) => setEnrol({ ...enrol, fingers: v })} /></div> : null}
            {enrol.device && (enrol.device.kind === 'face' || enrol.device.kind === 'both') ? <div><span className="gc-label">Face</span><Seg label="Face" value={enrol.face} options={[[false, 'Not yet'], [true, 'Saved']]} onChange={(v) => setEnrol({ ...enrol, face: v })} /></div> : null}
            <div><label className="gc-label" htmlFor="ad-card">Card number</label><input id="ad-card" className="gc-input hr-fig" value={enrol.card} onChange={(e) => setEnrol({ ...enrol, card: e.target.value.replace(/[^\dA-Za-z]/g, '') })} /></div>
          </form>
        ) : null}
      </Dialog>
    </HrPage>
  );
}
