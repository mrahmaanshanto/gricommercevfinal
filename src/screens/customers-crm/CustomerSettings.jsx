'use client';
// CustomerSettings — Customers › Customer settings (/customer-settings), a settings page (docs/shopify-style.md):
//   Custom fields      the shop's own typed customer fields (text, number, date, choice, yes/no), set up once and
//                      shown on every profile (lib/customFields.js)
//   Segments           saved segments with their rules and counts, ready-made ones from Recovery (lib/segments.js)
//   IP and devices     which roles may see raw IP addresses and devices on a profile (lib/crmAccess.js)
//   Data kept          how long signals and recovery records are kept; delete old ones now (lib/crmPrivacy.js)

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, StatusBadge, InfoTip } from '@/components/ui';
import { RecordHeader, Menu } from '@/components/ui/IndexKit';
import { toast, confirmDialog } from '@/runtime/ui';
import { getFieldDefs, saveFieldDef, removeFieldDef, moveFieldDef, FIELD_TYPES, FIELD_VISIBILITY, FIELDS_EVENT } from '@/lib/customFields';
import { getSegments, deleteSegment, segmentCount, defText, SEGMENT_TEMPLATES, saveSegment, SEGMENTS_EVENT } from '@/lib/segments';
import { getCrmRows } from '@/lib/crm';
import { getDeviceRoles, setDeviceRoles } from '@/lib/crmAccess';
import { getRetention, saveRetention, applyRetention, RETENTION_CHOICES } from '@/lib/crmPrivacy';
import { snapshotCount } from '@/lib/customerSignals';
import { pendingRemovals } from '@/lib/audiences';
import { ROLES, currentUser } from '@/lib/team';
import { FORM_CSS, Switch } from '@/screens/loyalty-promo/loyShared';
import { getCreditRules, saveCreditRules, DEFAULT_CREDIT_RULES } from '@/lib/creditRules';
import { SegmentBuilder, CRM_PARTS_CSS } from './crmParts';

const CSS = `
.cs-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.cs-list>li{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.cs-list>li:first-child{border-top:0;padding-top:0}
.cs-list>li>div{flex:1;min-width:0}
.cs-list b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cs-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cs-card .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
.cs-count{flex:none;font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading)}
`;
const BLANK = { key: '', label: '', type: 'text', options: '', searchable: false, filterable: true, segmentable: true, visibleTo: 'everyone' };
const flags = (d) => [d.searchable ? 'Search' : '', d.filterable ? 'Filter' : '', d.segmentable ? 'Segments' : ''].filter(Boolean).join(' · ') || 'Shown on the profile only';

export default function CustomerSettingsScreen() {
  const [ready, setReady] = useState(false);
  const [ver, setVer] = useState(0);
  const bump = useCallback(() => setVer((v) => v + 1), []);
  const [fd, setFd] = useState(null);       // field being added / changed
  const [err, setErr] = useState('');
  const [seg, setSeg] = useState(null);     // { segment } for the builder
  useEffect(() => {
    setReady(true);
    window.addEventListener(FIELDS_EVENT, bump); window.addEventListener(SEGMENTS_EVENT, bump);
    return () => { window.removeEventListener(FIELDS_EVENT, bump); window.removeEventListener(SEGMENTS_EVENT, bump); };
  }, [bump]);
  const rows = useMemo(() => (ready ? getCrmRows() : []), [ready, ver]);
  const defs = ready ? getFieldDefs() : [];
  const segs = ready ? getSegments() : [];
  const roles = ready ? getDeviceRoles() : ['ceo', 'cto'];
  const ret = ready ? getRetention() : { signalsDays: 90, recoveryDays: 180 };
  const credit = ready ? getCreditRules() : DEFAULT_CREDIT_RULES;
  const setCredit = (patch, msg) => { saveCreditRules(patch); bump(); toast(msg || 'Saved.'); };
  const me = (currentUser() || {}).name || 'Staff';

  const saveField = () => {
    const r = saveFieldDef({ ...fd, options: String(fd.options || '').split(/[\n,]/) });
    if (!r.ok) { setErr(r.error); return; }
    setFd(null); bump(); toast('Field “' + r.def.label + '” saved. It shows on every customer profile.');
  };
  const removeField = async (d) => {
    if (await confirmDialog({ title: 'Remove “' + d.label + '”?', body: 'The field leaves every profile. Values already entered are kept and come back if you add it again.', confirmLabel: 'Remove', tone: 'danger' })) { removeFieldDef(d.key); bump(); toast('Field removed.'); }
  };
  const removeSeg = async (s) => {
    if (await confirmDialog({ title: 'Delete “' + s.name + '”?', body: 'Customers stay as they are. Ad audiences and campaigns using it stop updating.', confirmLabel: 'Delete', tone: 'danger' })) { deleteSegment(s.id); bump(); toast('Segment deleted.'); }
  };
  const copyTpl = (t) => { const r = saveSegment({ name: t.name, def: t.def, templateId: t.id, by: me }); if (r.ok) { bump(); toast('“' + t.name + '” saved as your segment.'); } else toast(r.error, { tone: 'error' }); };
  const toggleRole = (k) => { const on = roles.includes(k); setDeviceRoles(on ? roles.filter((x) => x !== k) : [...roles, k]); bump(); };
  const setRet = (k) => (e) => { saveRetention({ [k]: Number(e.target.value) }); bump(); toast('Saved.'); };
  const runNow = () => { const r = applyRetention(true); bump(); toast('Deleted ' + r.signals + ' old signal records and ' + r.recovery + ' old recovery records.'); };

  return (
    <div className="dc-screen ds" data-screen="CustomerSettings">
      <style dangerouslySetInnerHTML={{ __html: FORM_CSS + CRM_PARTS_CSS + CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="customers" />
        <main className="gc-shell__main">
          <Topbar crumb="Customers" page="Customer settings" placeholder="Search customer by name or phone" />
          <div className="gc-shell__content">
            <div className="ix-page ix-page--narrow">
              <RecordHeader back="/all-customers" backLabel="All customers" title="Customer settings"
                about="Selling on due (credit limit and days to pay), your own customer fields, saved segments, who can see IP addresses and devices, and how long insight data is kept." />

              <section className="ix-card cs-card" id="credit" aria-labelledby="cs-credit">
                <header className="ix-card__head"><h2 id="cs-credit">Credit & dues</h2></header>
                <div className="ix-card__body">
                  <div className="ly-set"><div><b>Let retail customers buy on due</b><small>The POS “Due” button leaves the rest unpaid as an invoice</small></div><Switch label="Let retail customers buy on due" on={credit.allowRetailDue} onToggle={() => setCredit({ allowRetailDue: !credit.allowRetailDue }, credit.allowRetailDue ? 'Selling on due is off. Every retail sale is paid in full.' : 'Selling on due is on.')} /></div>
                  {credit.allowRetailDue ? (<>
                    <div className="ly-two">
                      <div className="ly-field"><label className="gc-label" htmlFor="cs-limit">Default credit limit (৳)</label><input id="cs-limit" className="gc-input" type="number" min="0" step="500" inputMode="numeric" defaultValue={credit.defaultLimit} key={'l' + ver} onBlur={(e) => { if (Number(e.target.value) !== credit.defaultLimit) setCredit({ defaultLimit: e.target.value }); }} /><small className="ly-help">For customers without their own limit. 0 = no limit.</small></div>
                      <div className="ly-field"><label className="gc-label" htmlFor="cs-days">Days to pay</label><input id="cs-days" className="gc-input" type="number" min="1" max="180" inputMode="numeric" defaultValue={credit.dueDays} key={'d' + ver} onBlur={(e) => { if (Number(e.target.value) !== credit.dueDays) setCredit({ dueDays: e.target.value }); }} /><small className="ly-help">After this the invoice is overdue.</small></div>
                    </div>
                    <div className="ly-set"><div><b>Need the customer’s mobile number</b><small>So the due can be followed up</small></div><Switch label="Need the customer’s mobile number" on={credit.needPhone} onToggle={() => setCredit({ needPhone: !credit.needPhone })} /></div>
                    <div className="ly-set"><div><b>Over the limit, a manager approves</b><small>{credit.managerAboveLimit ? 'With their PIN at the counter' : 'Off: a sale over the limit is refused'}</small></div><Switch label="Over the limit, a manager approves" on={credit.managerAboveLimit} onToggle={() => setCredit({ managerAboveLimit: !credit.managerAboveLimit })} /></div>
                    <p className="ly-help set-help--keep">A sale on due becomes an unpaid invoice. Staff accept it, then record the payment (Customers › a customer › Invoices).</p>
                  </>) : <p className="ly-help">Off: every retail sale is paid in full at the counter.</p>}
                </div>
              </section>

              <section className="ix-card cs-card" aria-labelledby="cs-fields">
                <header className="ix-card__head"><h2 id="cs-fields">Custom fields</h2><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" aria-haspopup="dialog" onClick={() => { setFd({ ...BLANK }); setErr(''); }}>Add field</button></header>
                <div className="ix-card__body">
                  {defs.length ? (
                    <ul className="cs-list">
                      {defs.map((d, i) => (
                        <li key={d.key}>
                          <div><b>{d.label}</b><span className="cs-sub">{FIELD_TYPES[d.type]}{d.type === 'select' ? ': ' + d.options.join(', ') : ''} · {flags(d)}</span></div>
                          {d.visibleTo === 'managers' ? <StatusBadge tone="neutral" icon="lock">Managers only</StatusBadge> : null}
                          <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[
                            { label: 'Edit', onClick: () => { setFd({ ...d, options: (d.options || []).join('\n') }); setErr(''); } },
                            i > 0 ? { label: 'Move up', onClick: () => { moveFieldDef(d.key, -1); bump(); } } : null,
                            i < defs.length - 1 ? { label: 'Move down', onClick: () => { moveFieldDef(d.key, 1); bump(); } } : null,
                            { label: 'Remove', tone: 'danger', onClick: () => removeField(d) },
                          ].filter(Boolean)} />
                        </li>
                      ))}
                    </ul>
                  ) : <p className="ly-help">No custom fields yet.</p>}
                </div>
              </section>

              <section className="ix-card cs-card" id="segments" aria-labelledby="cs-segs">
                <header className="ix-card__head"><h2 id="cs-segs">Segments</h2><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" aria-haspopup="dialog" onClick={() => setSeg({ segment: null })}>New segment</button></header>
                <div className="ix-card__body">
                  {segs.length ? (
                    <ul className="cs-list">
                      {segs.map((s) => (
                        <li key={s.id}>
                          <div><Link href={'/all-customers?segment=' + s.id} className="ix-strong">{s.name}</Link><span className="cs-sub">{defText(s.def) || 'Added by hand'}{(s.members || []).length ? ' · ' + s.members.length + ' added by hand' : ''}</span></div>
                          <span className="cs-count">{ready ? segmentCount(s, rows).toLocaleString('en-IN') : ''}</span>
                          <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[
                            { label: 'Show customers', href: '/all-customers?segment=' + s.id },
                            { label: 'Edit rules', onClick: () => setSeg({ segment: s }) },
                            { label: 'Send to ads', href: '/ad-audiences?segment=' + s.id },
                            { label: 'Delete', tone: 'danger', onClick: () => removeSeg(s) },
                          ]} />
                        </li>
                      ))}
                    </ul>
                  ) : <p className="ly-help">No saved segments yet.</p>}
                  <details className="gc-disclose">
                    <summary>Ready-made segments · {SEGMENT_TEMPLATES.length} <InfoTip text="Made by Recovery on the same rules engine. They update by themselves; save a copy to change the rules." /></summary>
                    <ul className="cs-list">
                      {SEGMENT_TEMPLATES.map((t) => (
                        <li key={t.id}>
                          <div><Link href={'/all-customers?segment=' + t.id} className="ix-strong">{t.name}</Link><span className="cs-sub">{t.kind} · {defText(t.def)}</span></div>
                          <span className="cs-count">{ready ? segmentCount(t.id, rows).toLocaleString('en-IN') : ''}</span>
                          <button type="button" className="ix-btn ix-btn--sm" onClick={() => copyTpl(t)}>Save a copy</button>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </section>

              <section className="ix-card cs-card" aria-labelledby="cs-ip">
                <header className="ix-card__head"><h2 id="cs-ip">Who sees IP addresses and devices</h2></header>
                <div className="ix-card__body">
                  <div className="ix-chips" role="group" aria-label="Roles">
                    {Object.keys(ROLES).map((k) => <button key={k} type="button" className="ix-chip" aria-pressed={roles.includes(k)} disabled={k === 'ceo'} onClick={() => toggleRole(k)}>{ROLES[k].title}</button>)}
                  </div>
                  <p className="ly-help">Everyone else sees “Hidden” on the profile. A shared device or network is not proof of anything.</p>
                </div>
              </section>

              <section className="ix-card cs-card" aria-labelledby="cs-data">
                <header className="ix-card__head"><h2 id="cs-data">Data kept</h2></header>
                <div className="ix-card__body">
                  <div className="ly-two">
                    <div className="ly-field"><label className="gc-label" htmlFor="cs-sig">Customer signals</label><select id="cs-sig" className="gc-input gc-select" value={ret.signalsDays} onChange={setRet('signalsDays')}>{RETENTION_CHOICES.map((d) => <option key={d} value={d}>{d} days</option>)}</select></div>
                    <div className="ly-field"><label className="gc-label" htmlFor="cs-rec">Closed carts and payments</label><select id="cs-rec" className="gc-input gc-select" value={ret.recoveryDays} onChange={setRet('recoveryDays')}>{RETENTION_CHOICES.map((d) => <option key={d} value={d}>{d} days</option>)}</select></div>
                  </div>
                  <p className="ly-help">{ready ? snapshotCount() + ' signal records kept · ' + pendingRemovals() + ' ad-audience removals waiting' : ''}. Orders and payments are not affected. Older data is deleted every night.</p>
                  <span><button type="button" className="ix-btn ix-btn--sm" onClick={runNow}>Delete old data now</button></span>
                </div>
              </section>
            </div>
          </div>
          <Dialog open={!!fd} title={fd && fd.key ? 'Edit field' : 'Add a field'} onClose={() => setFd(null)} width={520} footer={<>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setFd(null)}>Cancel</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={saveField}>Save field</button>
          </>}>
            {fd ? (
              <div className="ac-form">
                {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
                <div className="ly-two">
                  <div className="ly-field"><label className="gc-label" htmlFor="cs-f-name">Field name</label><input id="cs-f-name" className="gc-input" value={fd.label} onChange={(e) => { setFd({ ...fd, label: e.target.value }); setErr(''); }} maxLength={40} placeholder="e.g. Skin type" /></div>
                  <div className="ly-field"><label className="gc-label" htmlFor="cs-f-type">Type</label><select id="cs-f-type" className="gc-input gc-select" value={fd.type} disabled={!!fd.key} onChange={(e) => setFd({ ...fd, type: e.target.value })}>{Object.keys(FIELD_TYPES).map((k) => <option key={k} value={k}>{FIELD_TYPES[k]}</option>)}</select></div>
                </div>
                {fd.type === 'select' ? <div className="ly-field"><label className="gc-label" htmlFor="cs-f-opts">Choices, one per line</label><textarea id="cs-f-opts" className="gc-input" rows={4} style={{ height: 'auto' }} value={fd.options} onChange={(e) => setFd({ ...fd, options: e.target.value })} /></div> : null}
                <div className="ly-field"><label className="gc-label" htmlFor="cs-f-vis">Who sees it</label><select id="cs-f-vis" className="gc-input gc-select" value={fd.visibleTo} onChange={(e) => setFd({ ...fd, visibleTo: e.target.value })}>{Object.keys(FIELD_VISIBILITY).map((k) => <option key={k} value={k}>{FIELD_VISIBILITY[k]}</option>)}</select></div>
                {[['searchable', 'Search finds it'], ['filterable', 'Lists can filter on it'], ['segmentable', 'Segments can use it']].map(([k, l]) => <label key={k} className="ly-row"><input type="checkbox" className="gc-check" checked={!!fd[k]} onChange={(e) => setFd({ ...fd, [k]: e.target.checked })} />{l}</label>)}
              </div>
            ) : null}
          </Dialog>
          <SegmentBuilder open={!!seg} segment={seg ? seg.segment : null} rows={rows} by={me} onClose={() => setSeg(null)} onSaved={(s) => { setSeg(null); bump(); toast('Segment “' + s.name + '” saved.'); }} />
        </main>
      </div>
    </div>
  );
}
