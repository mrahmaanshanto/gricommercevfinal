'use client';
// Generated from design/templates/customers-crm/CustomerCRM.dc.html by scripts/convert-design.mjs.
// CustomerCRM — one customer's profile (person or company), laid out like Shopify's customer page
// (docs/shopify-style.md, record page). Brief #7 folds the old ten tabs into six areas:
//   Overview · Orders & commerce · Insights · Activity & communication · Details & addresses · Controls
// The customer comes from ?id= (customer ID) or ?phone= (any phone, email or outside ID) through
// customers.resolveCustomer; with neither it shows the demo customer Nusrat Jahan (C-10482), whose orders, messages,
// cart and searches are demo data. Company mode (kind = company) adds Locations and Contacts on the same shell.
// Insights read customerSignals.js (features + signals with model, time and "Not enough data") and recovery.js.
// Controls keep status apart from restrictions (restrictions.js) and consent (consent.js); IP and device data show
// only to roles allowed in Customer settings (crmAccess.js). Changes are kept in this browser.
// Edit freely: this file is now the source for the screen.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import __Link from 'next/link';
import { Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { Dialog as __Dialog, StatusBadge as __StatusBadge, InfoTip, EmptyState } from '@/components/ui';
import { RecordHeader, MetricStrip, IndexTabs, KV, Menu } from '@/components/ui/IndexKit';
import { toast as uiToast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { saveDemoEdit } from '@/lib/customerEdits';
import {
  updateCustomer, resolveCustomer, isCustomerId, updateIdentity, normalizePhone, addContactPoint, updateContactPoint, removeContactPoint,
  addExternalId, removeExternalId, EXTERNAL_SOURCES, PHONE_LABELS, EMAIL_LABELS, CONTACT_ROLES, addLocation, removeLocation, linkContact, unlinkContact,
  addCustomer, IDENTITY_EVENT, searchCustomers,
} from '@/lib/customers';
import { getCrmRows, crmRow } from '@/lib/crm';
import { getOrders } from '@/lib/orders';
import { findMember } from '@/lib/loyalty';
import { getConsent, setConsent, consentHistory, setAdsOptOut, whyNotAllowed, CONSENT_CHANNELS, CONSENT_STATES, CONSENT_TONE, CONSENT_SOURCES, CONSENT_EVENT, channelLabel } from '@/lib/consent';
import { restrictionsOf, restrictionState, restrictionText, addRestriction, liftRestriction, restrictionProblem, RESTRICTION_TYPES, STATE_LABEL, PAY_METHODS, RESTRICTIONS_EVENT } from '@/lib/restrictions';
import { getFieldDefs, getFieldValues, setFieldValue, parseValue, formatValue, fieldVisible, FIELDS_EVENT } from '@/lib/customFields';
import { signalsOf, SIGNAL_TONE, NOT_ENOUGH } from '@/lib/customerSignals';
import { segmentsOf, SEGMENTS_EVENT } from '@/lib/segments';
import { opportunitiesOf, OPP_STATES, OPP_TYPES, RECOVERY_EVENT } from '@/lib/recovery';
import { canSeeDeviceData } from '@/lib/crmAccess';
import { forgetDerived } from '@/lib/crmPrivacy';
import { currentUser } from '@/lib/team';
import { wholesaleOn, hasModule } from '@/lib/edition';
import { ManagerPin } from '@/components/ManagerPin';
import { FORM_CSS, Switch, Steps } from '@/screens/loyalty-promo/loyShared';
import CustomerEditDialog from './CustomerEditDialog';
import CustomerInvoices from './CustomerInvoices';
import CustomerWarranty from './CustomerWarranty';
import { getInvoices } from '@/lib/invoices';
import { meetingsWith, providerOf as meetingHow } from '@/lib/meetings';

// ---- demo data of the demo customer (Nusrat Jahan, C-10482) ----

const DEMO_ID = 'C-10482';
function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtD = (t) => { const d = new Date(t); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); };
const fmtDT = (t) => { const d = new Date(t), h = d.getHours(); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ', ' + (h % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM'); };
const dayAt = (y, m, d) => new Date(y, m - 1, d, 12, 0).getTime();
const todayAt = (h, mi) => { const d = new Date(); d.setHours(h, mi, 0, 0); return d.getTime(); };
const isoDay = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fromIso = (s, end) => { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, end ? 23 : 0, end ? 59 : 0).getTime(); };

const ORDERS = [
  ['#GC-10471', '12 Sep 2026', 'Anker 20W Charger, Earphones +1', 'bKash', 4860, 'Delivered'],
  ['#GC-10402', '2 Sep 2026', 'Liquid Silicone Case', 'bKash', 1450, 'Delivered'],
  ['#GC-10355', '26 Aug 2026', 'Night Repair Cream', 'Cash on delivery', 1690, 'Cancelled'],
  ['#GC-10311', '22 Aug 2026', 'Magnetic Charger, Ring Holder +3', 'Cash on delivery', 6120, 'Delivered'],
  ['#GC-10207', '14 Aug 2026', 'Foldable Phone Stand', 'Nagad', 650, 'Returned'],
  ['#GC-10150', '3 Aug 2026', 'Tempered Glass 9H +2', 'Card', 3240, 'Delivered'],
  ['#GC-10044', '20 Jul 2026', 'Cotton Face Towel ×3', 'bKash', 1180, 'Delivered'],
  ['#GC-09870', '28 Jun 2026', 'Anker 20W Charger ×2', 'Wallet', 2500, 'Delivered'],
];
const OTONE = { Delivered: 'success', Cancelled: 'error', Returned: 'warning' };
const demoTimeline = () => [
  { icon: 'log-in', what: 'Logged in', sub: 'Android', at: todayAt(10, 42), device: true },
  { icon: 'message-circle', what: 'Cart reminder sent on WhatsApp', sub: 'Opened', at: todayAt(11, 45) },
  { icon: 'package-check', what: 'Order #GC-10471 delivered', sub: '৳4,860 · bKash · 180 points earned', at: dayAt(2026, 9, 12) },
  { icon: 'life-buoy', what: 'Ticket #T-2210 solved', sub: 'Asked about delivery time · 14 min', at: dayAt(2026, 9, 10) },
  { icon: 'ticket-percent', what: 'Got coupon CASE15', sub: 'From “Bought a phone, add a case”', at: dayAt(2026, 9, 8) },
  { icon: 'undo-2', what: 'Returned Foldable Phone Stand', sub: 'Wrong model · refund ৳650 to wallet', at: dayAt(2026, 8, 28) },
];
const COUP = [
  ['NUS7Q2', '10% off Redmi Note 13', 'Smart offer · Looked but didn’t buy', '19 Sep 2026', 'Unused', 'Ends 22 Sep'],
  ['CASE15', '15% off accessories', 'Offers page', '8 Sep 2026', 'Used', 'On #GC-10471 · saved ৳726'],
  ['EID300', '৳300 off on ৳2,000+', 'Checkout', '20 Aug 2026', 'Used', 'On #GC-10311'],
  ['NUSWB5', '5% off', 'Smart offer · Win them back', '1 Aug 2026', 'Expired', 'Not used'],
  ['FIRST20', '20% off first order', 'Sign-up', '2 Mar 2026', 'Used', 'On #GC-10150'],
  ['SORRY100', '৳100 off', 'Given by Tania', '10 Sep 2026', 'Unused', 'No end date'],
];
const CTONE = { Used: 'success', Unused: 'info', Expired: 'neutral' };
const HIST = [
  ['WhatsApp', 'Today 11:45 AM', 'Automatic · cart reminder', 'Read', 'Hi Nusrat, you left something in your cart at Dazzle Shop. Finish your order here: dazzleshop.com.bd/c/8K2Q'],
  ['SMS', '19 Sep 9:10 AM', 'Smart offer', 'Delivered', 'Hi Nusrat, still thinking about Redmi Note 13? 10% off with code NUS7Q2, till 22 Sep.'],
  ['Email', '12 Sep 6:02 PM', 'Automatic · order', 'Opened', 'Your order #GC-10471 is delivered. You earned 180 points.'],
  ['SMS', '10 Sep 3:20 PM', 'Tania (support)', 'Delivered', 'দুঃখিত দেরির জন্য। আপনার জন্য ৳১০০ ছাড়: SORRY100'],
];
const IPS = [
  ['103.112.54.21', 'Mirpur, Dhaka', 'Grameenphone', 'Chrome · Android', '4 Jun 2026', 'Today 10:42 AM', 38],
  ['103.87.214.9', 'Dhanmondi, Dhaka', 'Link3 broadband', 'Chrome · Windows', '2 Mar 2026', '16 Sep 2026', 21],
  ['37.111.205.64', 'Mirpur, Dhaka', 'Robi', 'Safari · iPhone', '12 Jul 2026', '28 Aug 2026', 6],
  ['180.211.160.17', 'Chattogram', 'Banglalink', 'Chrome · Android', '14 Aug 2026', '14 Aug 2026', 1],
];
const ADDR0 = [
  { id: 'a1', label: 'Home', line: 'House 14, Road 2, Block C, Mirpur 10, Dhaka 1216', who: 'Nusrat Jahan', phone: '01552-3X1-907', used: 'used in 11 orders' },
  { id: 'a2', label: 'Office', line: 'Level 6, Rangs Nasim Square, Road 16 (old 27), Dhanmondi, Dhaka 1209', who: 'Nusrat Jahan', phone: '01552-3X1-907', used: 'used in 2 orders' },
  { id: 'a3', label: 'Sister’s house', line: 'Flat 3B, Chandrima Tower, Agrabad C/A, Chattogram 4100', who: 'Nasrin Jahan', phone: '01819-4X2-770', used: 'used in 1 order' },
];
const NOTES0 = [{ t: 'Prefers delivery after 6:00 PM. Call before sending.', by: 'Tania · 10 Sep 2026' }, { t: 'Buys for her sister too — good for bundle offers.', by: 'Shanto · 22 Aug 2026' }];
const TICKETS = [{ no: '#T-2210', title: 'When will my order arrive?', sub: 'WhatsApp · 10 Sep · solved by Tania in 14 min', st: 'Solved', tone: 'success' }, { no: '#T-2104', title: 'Wrong model phone stand', sub: 'Phone · 26 Aug · return approved', st: 'Solved', tone: 'success' }, { no: '#T-2318', title: 'Can I change the delivery address?', sub: 'Messenger · today · waiting for reply', st: 'Open', tone: 'warning' }];
const FAVS = [['iPhone 15 128GB', '৳1,19,999', 'Price dropped ৳3,000', 'ly-in'], ['Redmi Note 13 8/256GB', '৳26,999', '', ''], ['Redmi Buds 5', '৳3,650', 'Back in stock', 'ly-in'], ['Xiaomi Smart Band 8', '৳3,450', 'Low stock', 'ix-warn']];
const SEARCHES = [['redmi note 13', 'Today', '12 found'], ['phone under 20000', '16 Sep', '8 found'], ['pixel 8', '14 Sep', 'Nothing found'], ['আইফোন', '10 Sep', '6 found'], ['oneplus nord', '2 Sep', 'Nothing found'], ['eid offer phone', '20 Aug', '24 found']];
const VIEWED = [['Redmi Note 13 8/256GB', '4 times in 7 days', 'last today'], ['Liquid Silicone Case · Navy / iPhone 15', '3 times in 7 days', 'last 1 Oct'], ['Type-C Wired Earphones', '2 times in 30 days', 'last 16 Sep'], ['iPhone 15 128GB', '1 time in 30 days', 'last 14 Sep']];
const BARS = [['Oct', 0], ['Nov', 1200], ['Dec', 3400], ['Jan', 0], ['Feb', 2100], ['Mar', 5200], ['Apr', 4100], ['May', 6800], ['Jun', 2500], ['Jul', 4600], ['Aug', 11850], ['Sep', 6310]];

// the areas a profile shows: the main things about one customer. Insights (signals, segments) and Controls (consent,
// restrictions, devices, privacy) are kept in the code but not shown; their actions are in the header's More menu.
const AREAS = [['overview', 'Overview'], ['orders', 'Orders'], ['invoices', 'Invoices'], ['activity', 'Messages & activity'], ['details', 'Details']];
// wholesale (type, price list, profile) shows only while it is on (edition.js › WHOLESALE; off for now)
const WS = wholesaleOn();
const TAGS = ['VIP', 'Wholesale', 'Influencer', 'Staff', 'Follow up', 'Prefers call'].filter((t) => t !== 'Wholesale' || WS);
const ALABELS = ['Home', 'Office', 'Family', 'Shop', 'Branch', 'Other'];
const STAFF = ['Tania', 'Karim', 'Shanto', 'Rupa'];
const PREFERRED = ['WhatsApp', 'Phone', 'SMS', 'Email'];
const MDEF = { sms: 'Hi {name}, ', whatsapp: 'Hi {name}, ', email: 'Hi {name},\n\n' };
const REASONS = { cod: ['Refused cash-on-delivery parcels', 'Fake or prank orders', 'Address could not be found'], prepaid: ['Large orders', 'Orders above the credit limit'], review: ['Address check needed', 'Unusual orders'], order_cap: ['New account', 'Large orders'], method: ['Payment disputes', 'Chargeback'], credit_hold: ['Overdue invoices', 'Credit limit reached'], blocked: ['Abusive to staff', 'Fraud confirmed'] };
const STATUS_TONE = { Active: 'success', Suspended: 'error', Closed: 'neutral' };

// ---- styles ----

const CSS = `
.crm-card .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
.crm-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.crm-nba{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.crm-nba>svg{flex:none;color:var(--primary)}
.crm-nba>div{flex:1 1 260px;min-width:0}
.crm-nba b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.crm-nba__acts{display:flex;gap:var(--space-2)}
.crm-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.crm-list>li{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.crm-list>li:first-child{border-top:0;padding-top:0}
.crm-list>li>div{flex:1;min-width:0}
.crm-list b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.crm-list .crm-when{flex:none;font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.crm-ic{display:grid;flex:none;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body)}
.crm-pane{padding:var(--space-3) var(--space-4) var(--space-4)}
.crm-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4)}
.crm-two h3,.crm-h3{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.crm-msg{display:flex;flex-direction:column;gap:var(--space-2)}
.crm-vars{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.crm-vars button{height:24px;padding:0 8px;border:1px dashed var(--border-strong);border-radius:var(--radius-md);background:var(--surface-card);font-family:var(--font-data);font-size:var(--text-xs);color:var(--primary);cursor:pointer}
.crm-vars span:last-child{margin-left:auto}
.crm-hist{display:flex;flex-direction:column;gap:var(--space-2)}
.crm-hist>div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.crm-hist>div.is-new{background:var(--fill-primary-soft)}
.crm-hist small{display:flex;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.crm-hist small b{font-weight:var(--weight-medium);color:var(--text-heading)}
.crm-hist small span:last-child{margin-left:auto;color:var(--text-success)}
.crm-bn{font-family:var(--font-bn);font-size:var(--text-xs-plus);line-height:1.5}
.crm-bars{display:flex;align-items:flex-end;gap:6px;height:120px;padding-top:var(--space-2);border-bottom:1px solid var(--border-subtle)}
.crm-bars>div{display:flex;flex:1 1 0;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}
.crm-bars i{display:block;width:100%;max-width:28px;border-radius:var(--radius-sm) var(--radius-sm) 0 0;background:var(--primary-200)}
.crm-bars i.is-last{background:var(--primary)}
.crm-bars i.is-top{background:var(--warning)}
.crm-months{display:flex;gap:6px}
.crm-months span{flex:1 1 0;font-size:var(--text-2xs);color:var(--text-muted);text-align:center}
.crm-meter{display:flex;flex-direction:column;gap:4px;font-size:var(--text-xs);color:var(--text-body)}
.crm-meter>div{display:flex;justify-content:space-between;gap:var(--space-2)}
.crm-meter .gc-progress{height:6px}
.crm-addr{display:flex;flex-direction:column;gap:2px;font-size:var(--text-xs-plus);color:var(--text-body)}
.crm-addr>span:first-child{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.crm-addr b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.crm-set-h{margin:var(--space-1) 0 0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.crm-sel{width:150px}
.crm-dialog{display:flex;flex-direction:column;gap:var(--space-3)}
.crm-box{border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.crm-areas{overflow:hidden}
.crm-sig{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.crm-sig>div{display:flex;flex-direction:column;gap:4px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);min-width:0}
.crm-sig__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.crm-sig p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.crm-hidden{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--text-muted)}
.crm-row{display:flex;align-items:center;gap:var(--space-2) var(--space-3);flex-wrap:wrap;min-width:0}
.crm-row>.crm-grow{flex:1 1 180px;min-width:0}
@media (max-width:760px){.crm-two,.crm-sig{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.crm-list>li{flex-wrap:wrap}.crm-list .crm-when{flex-basis:100%;padding-left:40px}}
`;

// ---- small parts ----

function Card({ id, title, action, children, cls = '' }) {
  return (
    <section className={'ix-card crm-card ' + cls} aria-labelledby={id}>
      <header className="ix-card__head"><h2 id={id}>{title}</h2>{action || null}</header>
      <div className="ix-card__body">{children}</div>
    </section>
  );
}
const Plain = ({ onClick, children, dialog }) => <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={onClick} aria-haspopup={dialog ? 'dialog' : undefined}>{children}</button>;
const Field = ({ id, label, children, help, err }) => (
  <div className="ly-field"><label className="gc-label" htmlFor={id}>{label}</label>{children}{err ? <p className="gc-help gc-help--error" style={{ margin: 0 }}>{err}</p> : help ? <p className="gc-help" style={{ margin: 0 }}>{help}</p> : null}</div>
);
function SignalBox({ s }) {
  if (!s) return null;
  const none = s.value === NOT_ENOUGH;
  return (
    <div>
      <span className="crm-sig__top"><span>{s.label}</span><__StatusBadge tone={none ? 'neutral' : SIGNAL_TONE[s.value] || 'info'}>{s.value}</__StatusBadge></span>
      <p>{s.explanation}</p>
      <span className="crm-sub">{s.modelKind} {s.model} · made {fmtDT(s.generatedAt)} · holds until {fmtDT(s.validUntil)}</span>
    </div>
  );
}

// ---- the screen ----

export default function CustomerCRMScreen() {
  const [ready, setReady] = useState(false);
  const [ref, setRef] = useState(DEMO_ID);
  const [tab, setTabState] = useState('overview');
  const [ver, setVer] = useState(0);
  const bump = useCallback(() => setVer((v) => v + 1), []);
  const [m, setM] = useState(null);          // open dialog
  const [f, setF] = useState({});            // dialog fields
  const [err, setErr] = useState('');
  const [pin, setPin] = useState(null);      // a restriction waiting for a manager
  const [editProf, setEditProf] = useState(null);
  const [ui, setUi] = useState({ nba: null, pts: 1845, credit: 1250, mch: 'sms', mb: {}, subj: 'A little something for you', sent: [], nt: '', ordAll: false, rng: '12m', tlAll: false });
  const set = (p) => setUi((u) => ({ ...u, ...p }));
  const me = (currentUser() || {}).name || 'Staff';
  const role = (currentUser() || {}).role;

  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      const r = qs.get('id') || qs.get('phone') || qs.get('customer');
      if (r) setRef(r);
      const t = qs.get('tab');
      if (AREAS.some((a) => a[0] === t)) setTabState(t);
    } catch { /* no URL access */ }
    setReady(true);
    const evs = [IDENTITY_EVENT, CONSENT_EVENT, RESTRICTIONS_EVENT, FIELDS_EVENT, SEGMENTS_EVENT, RECOVERY_EVENT];
    evs.forEach((e) => window.addEventListener(e, bump));
    return () => evs.forEach((e) => window.removeEventListener(e, bump));
  }, [bump]);
  const setTab = (k) => {
    setTabState(k);
    try { const u = new URL(window.location.href); if (k === 'overview') u.searchParams.delete('tab'); else u.searchParams.set('tab', k); window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash); } catch { /* no URL access */ }
  };

  const rows = useMemo(() => (ready ? getCrmRows() : []), [ready, ver]);
  const c = useMemo(() => {
    if (!ready) return null;
    if (isCustomerId(ref)) return crmRow(String(ref).toUpperCase(), rows);
    const hit = resolveCustomer(ref);
    return hit ? crmRow(hit.id, rows) : null;
  }, [ready, ref, rows]);
  const demo = !!c && c.id === DEMO_ID;
  const company = !!c && c.kind === 'company';
  const allOrders = useMemo(() => (ready ? getOrders() : []), [ready]);
  const data = useMemo(() => {
    if (!c) return null;
    const phones = new Set(c.phones.map((p) => normalizePhone(p.value)).filter(Boolean));
    const orders = demo ? ORDERS.map((o) => ({ no: o[0], date: o[1], items: o[2], pay: o[3], amt: o[4], st: o[5], tone: OTONE[o[5]], href: '/order-detail' }))
      : allOrders.filter((o) => phones.has(normalizePhone(o.phone))).map((o) => ({ no: o.id, date: fmtD(o.at), items: o.itemTitle, pay: o.payment, amt: o.amount, st: o.status, tone: OTONE[o.status] || 'info', href: '/order-detail?id=' + encodeURIComponent(o.id), at: o.at }));
    const sig = signalsOf(c);
    const consent = getConsent(c);
    const restr = restrictionsOf(c);
    const opps = opportunitiesOf(c.id);
    const segs = segmentsOf(c, rows);
    const member = demo ? null : findMember(c.digits);
    const contacts = company ? rows.filter((x) => x.companyId === c.id) : [];
    const coRow = c.companyId ? rows.find((x) => x.id === c.companyId) : null;
    const dupes = rows.filter((x) => x.id !== c.id && x.kind === c.kind && ((x.name === c.name) || x.phones.some((p) => phones.has(normalizePhone(p.value)))));
    // one timeline from every area: orders, recovery, consent, restrictions, account status
    const tl = [];
    if (demo) demoTimeline().forEach((e) => tl.push(e));
    orders.forEach((o) => { if (o.at) tl.push({ icon: 'package', what: 'Order ' + o.no + ' · ' + o.st, sub: bdt(o.amt) + ' · ' + o.items, at: o.at }); });
    opps.forEach((o) => { tl.push({ icon: 'shopping-cart', what: o.type === 'payment' ? 'Payment ' + (o.payment || {}).state + ' · ' + bdt(o.value) : 'Left ' + o.items.length + (o.items.length === 1 ? ' item' : ' items') + ' in the ' + OPP_TYPES[o.type].toLowerCase(), sub: o.items.map((i) => i.name).join(', ') + ' · ' + bdt(o.value), at: o.leftAt }); o.contacts.forEach((x) => tl.push({ icon: x.channel === 'call' ? 'phone' : 'message-circle', what: (x.kind === 'auto' ? 'Reminder' : 'Contacted') + ' by ' + channelLabel(x.channel), sub: x.by + (x.code ? ' · code ' + x.code : ''), at: x.at })); });
    consentHistory(c.id).forEach((h) => { if (h.at) tl.push({ icon: 'shield-check', what: (h.channel === 'ads' ? 'Ad audiences' : channelLabel(h.channel)) + ': ' + (CONSENT_STATES[h.to] || h.to), sub: (h.source || '') + (h.by ? ' · ' + h.by : ''), at: h.at }); });
    restr.forEach((r) => { tl.push({ icon: 'ban', what: 'Restriction added: ' + restrictionText(r), sub: r.reason + ' · ' + r.by, at: r.createdAt }); if (r.liftedAt) tl.push({ icon: 'circle-check', what: 'Restriction lifted: ' + restrictionText(r), sub: (r.liftReason || '') + ' · ' + r.liftedBy, at: r.liftedAt }); });
    if (c.statusNote && c.statusNote.at) tl.push({ icon: 'user-cog', what: 'Account ' + c.status.toLowerCase(), sub: (c.statusNote.reason || '') + ' · ' + c.statusNote.by, at: c.statusNote.at });
    // meetings with this customer (Customers › Meetings)
    const myPh = [...c.phones.map((p) => p.value), c.bookPhone, c.digits].filter(Boolean);
    const seenM = new Set();
    if (hasModule('comms')) myPh.forEach((p) => meetingsWith({ phone: p }).forEach((mt) => { if (seenM.has(mt.id)) return; seenM.add(mt.id); tl.push({ icon: 'video', what: 'Meeting · ' + mt.title, sub: meetingHow(mt.provider).label + ' · ' + mt.host + (mt.note ? ' · ' + mt.note : ''), at: mt.at }); }));
    tl.sort((a, b) => b.at - a.at);
    // invoices made out to any of this customer's numbers that still have money due (the Invoices area's count)
    const digitsOf = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');
    const myPhones = [...c.phones.map((p) => p.value), c.bookPhone, c.digits, c.phone].filter(Boolean);
    const mine = new Set(myPhones.map(digitsOf));
    const unpaid = getInvoices().filter((r) => r.due > 0 && mine.has(digitsOf(r.customer && r.customer.phone))).length;
    return { orders, sig, consent, restr, opps, segs, member, contacts, coRow, dupes, tl, unpaid, myPhones };
  }, [c, demo, company, allOrders, rows]);

  // ---- not found / loading ----
  const shell = (body, title = 'Customer') => (
    <div className="dc-screen ds" data-screen="CustomerCRM">
      <style dangerouslySetInnerHTML={{ __html: FORM_CSS + CSS }} />
      <div className="gc-shell">
        <__Sidebar sticky="" active="customers" />
        <main className="gc-shell__main">
          <__Topbar crumb="Customers / All customers" page="Customer profile" placeholder="Search customer by name or phone" />
          <div className="gc-shell__content">{body}</div>
        </main>
      </div>
    </div>
  );
  if (!ready) return shell(<div className="ix-page"><RecordHeader back="/all-customers" backLabel="All customers" title="Customer" /></div>);
  if (!c) return shell(<div className="ix-page"><RecordHeader back="/all-customers" backLabel="All customers" title="Customer not found" /><section className="ix-card ix-card--pad"><EmptyState icon="user-x" title="No customer with this ID, phone or email." actionLabel="All customers" onAction={() => navigate('/all-customers')} /></section></div>);

  // ---- derived for display ----
  const D = data;
  const first = c.name.split(' ')[0];
  const addrs = c.addresses || (demo ? ADDR0 : c.address ? [{ id: 'a1', label: company ? 'Head office' : 'Home', line: c.address, who: c.name, phone: c.phone, used: '' }] : []);
  const defId = c.defAddr || (addrs[0] || {}).id;
  const orderedAddrs = addrs.filter((a) => a.id === defId).concat(addrs.filter((a) => a.id !== defId));
  const notes = c.notes || (demo ? NOTES0 : []);
  const active = D.restr.filter((r) => restrictionState(r) === 'active' || restrictionState(r) === 'scheduled');
  const past = D.restr.filter((r) => !active.includes(r));
  const consentOk = CONSENT_CHANNELS.filter((ch) => D.consent[ch.k].state === 'in').map((ch) => ch.label);
  const deviceOk = canSeeDeviceData();
  const fieldDefs = getFieldDefs().filter((d) => fieldVisible(d, role));
  const fieldVals = getFieldValues(c.id);
  const whole = WS && (c.types || []).indexOf('Wholesale') >= 0;
  const pts = demo ? ui.pts : D.member ? D.member.points : 0;
  const level = demo ? 'Gold' : D.member && D.member.tierObj ? D.member.tierObj.name : c.level;
  const verified = c.phones.find((p) => p.primary) || c.phones[0];
  const company0 = D.coRow;
  // a book customer's figures come from their invoices; when they only have online orders, count those
  const live = D.orders.filter((o) => o.st !== 'Cancelled');
  const figs = c.orders || !live.length ? { orders: c.orders, spent: c.spent, aov: c.aov } : { orders: live.length, spent: live.reduce((a, o) => a + o.amt, 0), aov: Math.round(live.reduce((a, o) => a + o.amt, 0) / live.length) };
  const openCart = D.opps.find((o) => ['waiting', 'contactable', 'call_queued'].indexOf(o.state) >= 0);

  // ---- actions ----
  const open = (mode, fields = {}) => { setM(mode); setF(fields); setErr(''); };
  const close = () => { setM(null); setErr(''); };
  const ff = (k) => (e) => setF({ ...f, [k]: e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e });
  const saveIdentity = (patch, msg) => { updateIdentity(c.id, patch); bump(); if (msg) uiToast(msg); };
  const openEdit = () => setEditProf({ name: c.name, phone: c.phone, address: c.address || '', types: c.types && c.types.length ? c.types : ['Online'], tier: c.tier || 'A', creditLimit: c.creditLimit || 0 });
  const saveProfile = (vals) => {
    const wasWhole = whole, isWhole = vals.types.indexOf('Wholesale') >= 0;
    if (c.origin === 'book') updateCustomer(c.bookPhone, { name: vals.name, address: vals.address, types: vals.types, tier: vals.tier, creditLimit: vals.creditLimit });
    else if (c.origin === 'demo') saveDemoEdit(c.demoId, { name: vals.name, phone: vals.phone, address: vals.address, types: vals.types, tier: vals.tier, creditLimit: vals.creditLimit, due: c.due });
    else updateIdentity(c.id, { name: vals.name, address: vals.address, types: vals.types, tier: vals.tier, creditLimit: vals.creditLimit });
    setEditProf(null); bump();
    uiToast(vals.name + ' was updated.' + (isWhole && !wasWhole ? ' They now show under Wholesale customers.' : ''));
  };
  const call = () => uiToast('Calling ' + c.phone + ' …');
  const goMessage = () => { setTab('activity'); setTimeout(() => { const el = document.getElementById('crm-compose'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 0); };
  const msgBody = ui.mb[ui.mch] != null ? ui.mb[ui.mch] : MDEF[ui.mch];
  const msgBlock = whyNotAllowed(c, ui.mch, 'service');
  const bn = /[ঀ-৿]/.test(msgBody), parts = msgBody.length <= (bn ? 70 : 160) ? 1 : Math.ceil(msgBody.length / (bn ? 67 : 153));
  const sendMsg = () => {
    if (msgBlock) { uiToast(msgBlock, { tone: 'error' }); return; }
    set({ mb: { ...ui.mb, [ui.mch]: MDEF[ui.mch] }, sent: ui.sent.concat([{ ch: channelLabel(ui.mch), text: msgBody.replace('{name}', first) }]) });
    uiToast(channelLabel(ui.mch) + ' sent to ' + first + '.');
  };
  // restrictions
  const startRestr = (type, extra = {}) => open('restr', { type, amount: '', method: PAY_METHODS[0], reason: '', starts: isoDay(Date.now()), ends: '', note: '', ...extra });
  const saveRestr = () => {
    const t = RESTRICTION_TYPES[f.type];
    const payload = { type: f.type, amount: f.amount, method: f.method, reason: f.reason, by: me, startsAt: fromIso(f.starts), endsAt: fromIso(f.ends, true), note: f.note };
    if (t && t.approval) {
      const problem = restrictionProblem(payload);
      if (problem) { setErr(problem); return; }
      // the record is written once a manager approves it with their PIN
      setPin(payload); setM(null); return;
    }
    const r = addRestriction(c, payload);
    if (!r.ok) { setErr(r.error); return; }
    close(); bump(); uiToast(restrictionText(r.record) + ' added for ' + first + '.');
  };
  const approveRestr = (who) => {
    const r = addRestriction(c, { ...pin, approvedBy: who });
    setPin(null); bump();
    if (r.ok) uiToast(restrictionText(r.record) + ' added, approved by ' + who + '.'); else uiToast(r.error, { tone: 'error' });
  };
  const lift = async (r) => {
    if (await confirmDialog({ title: 'Lift this restriction?', body: restrictionText(r) + ' ends now. It stays in the history.', confirmLabel: 'Lift' })) { liftRestriction(r.id, { by: me, reason: 'Lifted on the profile' }); bump(); uiToast('Restriction lifted.'); }
  };
  const payOn = (key) => !active.some((r) => (key === 'cod' ? r.type === 'cod' : r.type === 'method' && r.method === key));
  const togglePay = (key) => {
    const hit = active.find((r) => (key === 'cod' ? r.type === 'cod' : r.type === 'method' && r.method === key));
    if (hit) lift(hit); else startRestr(key === 'cod' ? 'cod' : 'method', key === 'cod' ? {} : { method: key });
  };
  // consent
  const saveConsentDlg = () => {
    if (f.state === 'in' && whyNotAllowed(c, f.channel, 'transactional')) { setErr(whyNotAllowed(c, f.channel, 'transactional')); return; }
    const ok = setConsent(c.id, f.channel, f.state, { source: f.source, by: me, note: f.note });
    close(); bump(); uiToast(ok ? channelLabel(f.channel) + ': ' + CONSENT_STATES[f.state] + '.' : 'No change.');
  };
  // contact points and outside IDs
  const saveContact = () => {
    const kind = m === 'phone' ? 'phones' : 'emails';
    const v = String(f.value || '').trim();
    if (kind === 'phones' && normalizePhone(v).length < 9) { setErr('Enter a phone number, like 01712345678 or +8801712345678.'); return; }
    if (kind === 'emails' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setErr('Enter an email like name@example.com.'); return; }
    const other = resolveCustomer(v);
    if (other && other.id !== c.id) { setErr('This is already on ' + other.name + ' (' + other.id + ').'); return; }
    const r = addContactPoint(c.id, kind, { value: v, label: f.label, verified: !!f.verified, primary: !!f.primary });
    if (!r) { setErr('This customer already has it.'); return; }
    close(); bump(); uiToast((kind === 'phones' ? 'Phone' : 'Email') + ' added.');
  };
  const saveExt = () => {
    if (!String(f.value || '').trim()) { setErr('Enter the ID.'); return; }
    if (!addExternalId(c.id, f.source, f.value)) { setErr('Another customer already has this ID.'); return; }
    close(); bump(); uiToast(EXTERNAL_SOURCES[f.source] + ' ID added. Imports with it now match ' + first + '.');
  };
  // custom fields
  const saveFields = () => {
    const errs = {};
    fieldDefs.forEach((d) => { const r = parseValue(d, f[d.key]); if (r.error) errs[d.key] = r.error; else setFieldValue(c.id, d.key, r.value); });
    if (Object.keys(errs).length) { setErr(Object.values(errs)[0]); return; }
    close(); bump(); uiToast('Custom fields saved.');
  };
  // addresses
  const saveAddr = () => {
    const line = String(f.line || '').trim();
    if (!line) { setErr('Enter the address.'); return; }
    const id = f.id || 'a' + (addrs.length + 1) + '-' + (Date.now() % 1000);
    const row = { id, label: f.label || 'Other', line, who: String(f.who || '').trim() || c.name, phone: String(f.phone || '').trim() || c.phone, used: f.id ? (addrs.find((a) => a.id === f.id) || {}).used || '' : 'not used yet', area: f.area || '', postcode: f.postcode || '' };
    const next = f.id ? addrs.map((a) => (a.id === f.id ? row : a)) : addrs.concat([row]);
    saveIdentity({ addresses: next, ...(f.def ? { defAddr: id } : {}) }, f.id ? 'Address updated.' : 'Address added' + (f.def ? ' and set as default.' : '.'));
    close();
  };
  // company
  const saveLoc = () => { if (!String(f.name || '').trim()) { setErr('Name the location.'); return; } addLocation(c.id, { name: f.name.trim(), address: f.address, phone: f.phone }); close(); bump(); uiToast('Location added.'); };
  const contactMatches = m === 'contact' && String(f.q || '').trim().length >= 2 ? searchCustomers(f.q).filter((x) => x.kind === 'person' && x.companyId !== c.id).slice(0, 5) : [];
  const linkExisting = (p) => { linkContact(p.id, c.id, f.role || 'Buyer', f.loc || ''); close(); bump(); uiToast(p.name + ' is now a contact of ' + c.name + '.'); };
  const addNewContact = () => {
    const d = normalizePhone(f.phone);
    if (!String(f.name || '').trim()) { setErr('Enter the contact’s name.'); return; }
    if (!/^01[3-9]\d{8}$/.test(d)) { setErr('Enter an 11-digit Bangladeshi mobile number.'); return; }
    const other = resolveCustomer(d);
    if (other) { setErr(other.name + ' already has this number. Link them above.'); return; }
    const row = addCustomer({ name: f.name.trim(), phone: d, address: '', types: c.types && c.types.length ? c.types : [WS ? 'Wholesale' : 'Retail'], creditLimit: 0, signup: fmtD(Date.now()), src: 'Contact of ' + c.name });
    linkContact(row.id, c.id, f.role || 'Buyer', f.loc || ''); close(); bump(); uiToast(f.name.trim() + ' added as a contact.');
  };
  const saveLink = () => { if (!f.company) { setErr('Choose a company.'); return; } linkContact(c.id, f.company, f.role, f.loc); close(); bump(); uiToast(first + ' is linked to ' + ((rows.find((x) => x.id === f.company) || {}).name || 'the company') + '.'); };
  // status and privacy
  const suspend = () => { saveIdentity({ status: 'Suspended', statusNote: { by: me, at: Date.now(), reason: f.reason || 'Too many returned orders', until: f.until || '' } }, 'Account suspended. ' + first + ' can’t log in or order now.'); close(); };
  const reactivate = () => saveIdentity({ status: 'Active', statusNote: { by: me, at: Date.now(), reason: 'Turned back on' } }, 'Account is active again.');
  const closeAcct = async () => { if (await confirmDialog({ title: 'Close this account?', body: 'They can’t log in or order. Orders and invoices stay. You can turn it back on later.', confirmLabel: 'Close account', tone: 'danger' })) saveIdentity({ status: 'Closed', statusNote: { by: me, at: Date.now(), reason: 'Closed on the profile' } }, 'Account closed.'); };
  const forget = async () => {
    if (!(await confirmDialog({ title: 'Clear insight data?', body: 'Deletes this customer’s signals and recovery records, removes them from ad audiences and leaves them out of ads from now on. Orders and the customer record stay.', confirmLabel: 'Clear data', tone: 'danger' }))) return;
    const r = forgetDerived(c.id, me); bump();
    uiToast('Cleared: ' + r.recovery + ' recovery records, ' + r.audiences + ' ad audiences.');
  };

  // ---- header ----
  const badges = <>{company ? <__StatusBadge tone="info" icon="building-2">Company</__StatusBadge> : <__StatusBadge tone={level === 'Gold' ? 'warning' : level === 'Platinum' ? 'primary' : 'neutral'} icon="crown">{level}</__StatusBadge>}<__StatusBadge tone={STATUS_TONE[c.status] || 'neutral'}>{c.status}</__StatusBadge></>;
  const meta = [c.id, company ? 'Company' : 'Person', c.signup && c.signup !== '—' ? 'Customer since ' + c.signup : '', c.area, c.owner ? 'Looked after by ' + c.owner : ''].filter(Boolean).join(' · ');
  const tabs = AREAS.map(([k, l]) => ({ key: k, id: 'crm-area-' + k, label: l, on: k === tab, onClick: () => setTab(k), count: k === 'orders' && D.orders.length ? D.orders.length : k === 'invoices' && D.unpaid ? D.unpaid : k === 'controls' && active.length ? active.length : undefined }));

  // ---- areas ----
  const ordersCard = (limit) => {
    const list = ui.ordAll || !limit ? D.orders : D.orders.slice(0, limit);
    return (
      <section className="ix-card" aria-labelledby="crm-orders">
        <header className="ix-card__head"><h2 id="crm-orders">Orders</h2>{D.orders.length > 5 ? <Plain onClick={() => set({ ordAll: !ui.ordAll })}>{ui.ordAll ? 'Show less' : 'View all'}</Plain> : null}</header>
        {!list.length ? <div className="ix-card__body"><p className="ly-help">{company ? 'Orders placed by its contacts show here.' : 'No orders yet.'}</p></div> : (<>
          <ul className="ix-plist" aria-label="Orders">
            {list.map((o) => <li key={o.no}><__Link href={o.href} className="ix-pitem"><span className="ix-pitem__top"><b className="ly-fig">{o.no}</b><span>{bdt(o.amt)}</span></span><span className="ix-pitem__mid">{o.date} · {o.items}</span><span className="ix-pitem__tags"><__StatusBadge tone={o.tone}>{o.st}</__StatusBadge></span></__Link></li>)}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table ix-table--static gc-table--keep">
              <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Items</th><th scope="col" className="ix-num">Amount</th><th scope="col">Status</th></tr></thead>
              <tbody>{list.map((o) => <tr key={o.no}><td><__Link href={o.href} className="ix-strong ly-fig">{o.no}</__Link></td><td className="ix-muted">{o.date}</td><td>{o.items}</td><td className="ix-num">{bdt(o.amt)}</td><td><__StatusBadge tone={o.tone}>{o.st}</__StatusBadge></td></tr>)}</tbody>
            </table>
          </div>
        </>)}
      </section>
    );
  };
  const timeline = (n) => {
    const list = n && !ui.tlAll ? D.tl.slice(0, n) : D.tl;
    if (!list.length) return <p className="ly-help">Nothing yet.</p>;
    return (
      <ul className="crm-list" aria-label="Timeline">
        {list.map((e, i) => <li key={i}><span className="crm-ic" aria-hidden="true"><__Icon name={e.icon} width="14" height="14" /></span><div><b>{e.what}</b><span className="crm-sub">{e.device && !deviceOk ? 'Device hidden' : e.sub}</span></div><span className="crm-when">{fmtDT(e.at)}</span></li>)}
      </ul>
    );
  };
  const nba = (() => {
    if (demo) return { title: 'Send 10% off Redmi Note 13', why: 'She viewed it 4 times in 7 days (Tracking) and left a ৳3,240 cart today (Recovery). Advice only: the offer comes from Promotions.', ch: 'whatsapp', act: 'Send on WhatsApp' };
    if (openCart) return { title: 'Remind ' + first + ' about the ' + bdt(openCart.value) + ' ' + OPP_TYPES[openCart.type].toLowerCase(), why: 'Left ' + fmtDT(openCart.leftAt) + ' (Recovery · ' + OPP_STATES[openCart.state].label + ').', href: '/abandoned-carts', act: 'Open in Abandoned carts' };
    const ch = D.sig.signals.churn;
    if (ch.value === 'At risk' || ch.value === 'Watch') return { title: 'Win ' + first + ' back', why: ch.explanation + ' (' + ch.model + ').', href: '/coupons', act: 'Pick an offer' };
    const no = D.sig.signals.nextOrder;
    if (no.sufficient) return { title: 'Next order expected ' + no.value, why: no.explanation + ' (' + no.model + ').', ch: 'sms', act: 'Write a message' };
    return null;
  })();
  const nbaGo = () => {
    if (nba.href) { navigate(nba.href); return; }
    if (demo) { const why = whyNotAllowed(c, 'whatsapp', 'marketing'); if (why) { uiToast(why, { tone: 'error' }); return; } set({ nba: 'sent' }); uiToast('Handed to Communications: 10% off Redmi Note 13 on WhatsApp.'); return; }
    set({ mch: nba.ch }); goMessage();
  };

  const overview = (<>
    {D.orders.length ? ordersCard(3) : null}
    <CustomerWarranty phones={D.myPhones} name={c.name} limit={3} />
    <Card id="crm-recent" title="Recent activity" action={<Plain onClick={() => setTab('activity')}>View all</Plain>}>{timeline(5)}</Card>
    {company ? (
      <Card id="crm-co-sum" title={'Locations · ' + c.locations.length + ' · Contacts · ' + D.contacts.length} action={<Plain onClick={() => setTab('details')}>Manage</Plain>}>
        <ul className="crm-list">{D.contacts.slice(0, 4).map((p) => <li key={p.id}><div><__Link href={'/customer-crm?id=' + p.id} className="ix-strong">{p.name}</__Link><span className="crm-sub">{p.role} · {((c.locations || []).find((l) => l.id === p.locationId) || {}).name || 'No location'}</span></div></li>)}</ul>
      </Card>
    ) : null}
    {demo ? (
      <details className="ix-card gc-disclose">
        <summary>Spending and buying</summary>
        <div className="crm-pane crm-two">
          <div className="crm-msg">
            <div className="ly-row"><span className="ly-grow crm-sub">Last 12 months · ৳58,200 total · from orders</span>
              <span className="gc-seg" role="group" aria-label="Range">{[['12m', '12 months'], ['6m', '6 months']].map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (ui.rng === k ? ' gc-seg__btn--active' : '')} aria-pressed={ui.rng === k} onClick={() => set({ rng: k })}>{l}</button>)}</span>
            </div>
            {(() => { const M = ui.rng === '6m' ? BARS.slice(6) : BARS; return (<>
              <div className="crm-bars" role="img" aria-label={M.map((b) => b[0] + ': ' + bdt(b[1])).join(', ')}>{M.map((b, i) => <div key={b[0]} title={b[0] + ': ' + bdt(b[1])}><i className={i === M.length - 1 ? 'is-last' : b[1] === 11850 ? 'is-top' : ''} style={{ height: Math.max(3, Math.round(b[1] / 11850 * 100)) + '%' }} /></div>)}</div>
              <div className="crm-months">{M.map((b) => <span key={b[0]}>{b[0]}</span>)}</div>
            </>); })()}
          </div>
          <div className="crm-msg">
            <h3 className="crm-set-h">Order outcomes · 14 orders · 86% delivered</h3>
            {[['Delivered', 12, 'var(--success)'], ['Returned', 1, 'var(--warning)'], ['Cancelled', 1, 'var(--error)']].map((d) => <div key={d[0]} className="crm-meter"><div><span>{d[0]}</span><b>{d[1]}</b></div><span className="gc-progress"><span className="gc-progress__fill" style={{ display: 'block', width: Math.round(d[1] / 14 * 100) + '%', background: d[2] }} /></span></div>)}
            <h3 className="crm-set-h">What she buys · by money spent</h3>
            {[['Phones', 36400], ['Accessories', 13100], ['Audio', 6200], ['Power banks', 2500]].map((x) => <div key={x[0]} className="crm-meter"><div><span>{x[0]}</span><b>{bdt(x[1])}</b></div><span className="gc-progress"><span className="gc-progress__fill" style={{ display: 'block', width: Math.round(x[1] / 36400 * 100) + '%' }} /></span></div>)}
          </div>
        </div>
      </details>
    ) : null}
  </>);
  const overviewSide = (
    <Card id="crm-facts" title="Good to know">
      <KV rows={[
        ['Likes messages by', c.preferred || '—'],
        ['Marketing consent', consentOk.length ? consentOk.join(', ') : 'None on file'],
        ['Restrictions', active.length ? active.map(restrictionText).join(', ') : 'None'],
      ]} />
    </Card>
  );

  const commerce = (<>
    {ordersCard(5)}
    <CustomerWarranty phones={D.myPhones} name={c.name} />
    <Card id="crm-pay" title="Payments">
      <dl className="ix-sum">
        <dt>Total spent</dt><dd>{bdt(figs.spent)}</dd>
        {demo ? <><dt>Refunded</dt><dd>৳650</dd><dt>Cancelled</dt><dd>৳1,240</dd></> : null}
        <dt>Due</dt><dd>{bdt(c.due)}</dd>
        {whole || company ? <><dt>Credit limit</dt><dd>{c.creditLimit ? bdt(c.creditLimit) : 'No limit'}</dd></> : null}
        {company ? <><dt>Payment terms</dt><dd>{c.terms || '—'}</dd></> : null}
        <dt className="is-total">Average order</dt><dd className="is-total">{bdt(figs.aov)}</dd>
      </dl>
    </Card>
    {demo ? (
      <Card id="crm-rewards" title="Coupons and rewards" action={<Plain onClick={() => open('coupon')} dialog>Assign coupon</Plain>}>
        <div className="ix-chips">
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('points', { op: 'give', n: 100 })}><__Icon name="star" width="16" height="16" aria-hidden="true" />Give or take points</button>
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('credit', { n: 200 })}><__Icon name="wallet" width="16" height="16" aria-hidden="true" />Add credit</button>
        </div>
        <ul className="crm-list" aria-label="Coupons">{COUP.map((x) => <li key={x[0]}><div><b className="ly-fig">{x[0]}</b><span className="crm-sub">{x[1]} · {x[2]} · {x[3]}</span></div><span style={{ textAlign: 'right' }}><__StatusBadge tone={CTONE[x[4]]}>{x[4]}</__StatusBadge><span className="crm-sub">{x[5]}</span></span></li>)}</ul>
        <KV rows={[['Loyalty points', ui.pts.toLocaleString('en-IN') + ' · earned 2,105 · used 260'], ['Wallet credit', bdt(ui.credit)]]} />
      </Card>
    ) : D.member ? (
      <Card id="crm-rewards" title="Loyalty" action={<__Link href={'/member-detail?phone=' + c.digits}>Member</__Link>}>
        <KV rows={[['Level', level], ['Points', D.member.points.toLocaleString('en-IN')], ['Wallet', bdt(D.member.wallet || 0)]]} />
      </Card>
    ) : null}
  </>);
  const commerceSide = demo ? (
    <Card id="crm-loy" title="Road to Platinum" action={<__Link href="/member-detail">Member</__Link>}>
      <div className="crm-meter"><div><span>GOLD · 1.5× points</span><b>39%</b></div><span className="gc-progress"><span className="gc-progress__fill" style={{ display: 'block', width: '39%' }} /></span><span className="crm-sub">৳58,200 of ৳1,50,000 · Buy ৳91,800 more to unlock 2× points</span></div>
    </Card>
  ) : company || whole ? (
    <Card id="crm-terms" title="Account terms">
      <KV rows={[...(WS ? [['Price list', c.tier ? 'Wholesale ' + c.tier : '—']] : []), ['Payment terms', c.terms || '—'], ['Credit limit', c.creditLimit ? bdt(c.creditLimit) : 'No limit'], ['Owed now', bdt(c.due)]]} />
      {whole && !company ? <__Link href={'/wholesale-customer?phone=' + (c.bookPhone || c.digits) + (c.demoId ? '&demo=' + c.demoId : '')}>Wholesale profile</__Link> : null}
    </Card>
  ) : null;

  const insights = (<>
    <Card id="crm-signals" title="Signals" action={<InfoTip text="Worked out from this customer's history. Rules and models give advice only; they never change orders or send anything." />}>
      <div className="crm-sig">{['churn', 'vip', 'nextOrder', 'history'].map((k) => <SignalBox key={k} s={D.sig.signals[k]} />)}</div>
    </Card>
    <Card id="crm-features" title="Figures behind the signals">
      <KV rows={[
        ['Last order', D.sig.features.recencyDays == null ? 'Never' : D.sig.features.recencyDays + ' days ago'],
        ['Orders', String(D.sig.features.frequency)], ['Spent', bdt(D.sig.features.spend)], ['Average order', bdt(D.sig.features.aov)],
        ['Returned', Math.round(D.sig.features.returnRate * 100) + '%'], ['Usual gap', D.sig.features.gapDays ? D.sig.features.gapDays + ' days' : '—'],
      ]} />
      <span className="crm-sub">As of {fmtDT(D.sig.features.asOf)} · last {D.sig.features.window} days · from {D.sig.features.source}</span>
    </Card>
    <Card id="crm-recovery" title="Carts and payments" action={<__Link href="/abandoned-carts">Abandoned carts</__Link>}>
      {!D.opps.length ? <p className="ly-help">No open carts or payment problems.</p> : (
        <ul className="crm-list">{D.opps.map((o) => <li key={o.id}><div><b>{OPP_TYPES[o.type]} · {bdt(o.value)}</b><span className="crm-sub">{o.items.map((i) => i.name).join(', ')} · left {fmtDT(o.leftAt)} · {o.nextAction}</span></div><__StatusBadge tone={OPP_STATES[o.state].tone}>{OPP_STATES[o.state].label}</__StatusBadge></li>)}</ul>
      )}
    </Card>
    {demo ? (<>
      <Card id="crm-behaviour" title="Viewed and searched">
        <div className="crm-two">
          <div><h3>Viewed, didn’t buy · Tracking</h3><ul className="crm-list">{VIEWED.map((x) => <li key={x[0]}><div><b>{x[0]}</b><span className="crm-sub">{x[1]} · {x[2]}</span></div></li>)}</ul></div>
          <div><h3>Searches · Online store <InfoTip text="A search that found nothing is one sign of demand, not a reason to stock it on its own." /></h3><ul className="crm-list">{SEARCHES.map((q) => <li key={q[0]}><div><b className="crm-bn">{q[0]}</b><span className="crm-sub">{q[1]}</span></div><span className={/Nothing/.test(q[2]) ? 'ix-warn' : 'ix-muted'} style={{ fontSize: 'var(--text-xs)' }}>{q[2]}</span></li>)}</ul></div>
        </div>
      </Card>
      <Card id="crm-favs" title="Wishlist · Online store">
        <ul className="crm-list">{FAVS.map((x) => <li key={x[0]}><div><b>{x[0]}</b>{x[2] ? <span className={'crm-sub ' + x[3]}>{x[2]}</span> : null}</div><span className="ix-strong">{x[1]}</span></li>)}</ul>
      </Card>
    </>) : null}
  </>);
  const insightsSide = (<>
    <Card id="crm-source" title="Where they came from">
      <KV rows={[['First came from', (c.src || '—') + ' · Analytics'], ['Last visit from', demo ? 'Google search · today' : '—'], ['Area', c.area + ' (from the address)']]} />
    </Card>
    <Card id="crm-segs" title="Segments">
      {D.segs.length ? <div className="ix-chips">{D.segs.map((s) => <__Link key={s.id} className="ix-chip" href={'/all-customers?segment=' + s.id}>{s.name}</__Link>)}</div> : <p className="ly-help">Not in any segment.</p>}
    </Card>
  </>);

  const chans = CONSENT_CHANNELS.filter((x) => x.k !== 'call');
  const activity = (<>
    <Card id="crm-timeline" title="Timeline" action={D.tl.length > 12 ? <Plain onClick={() => set({ tlAll: !ui.tlAll })}>{ui.tlAll ? 'Show less' : 'Show all'}</Plain> : null}>{timeline(12)}</Card>
    <section className="ix-card" id="crm-compose" aria-labelledby="crm-msg-h">
      <header className="ix-card__head"><h2 id="crm-msg-h">Messages</h2></header>
      <div className="crm-pane crm-two">
        <div className="crm-msg">
          <div className="gc-seg" role="group" aria-label="Channel">{chans.map((x) => <button key={x.k} type="button" className={'gc-seg__btn' + (ui.mch === x.k ? ' gc-seg__btn--active' : '')} aria-pressed={ui.mch === x.k} onClick={() => set({ mch: x.k })}>{x.label}</button>)}</div>
          {msgBlock ? <p className="gc-help gc-help--error" style={{ margin: 0 }}>{msgBlock} Only order updates can go on this channel.</p> : null}
          {ui.mch === 'email' ? <input className="gc-input" value={ui.subj} onChange={(e) => set({ subj: e.target.value })} aria-label="Email subject" placeholder="Subject" /> : null}
          <textarea className="gc-input crm-bn" rows={ui.mch === 'email' ? 7 : 4} value={msgBody} onChange={(e) => set({ mb: { ...ui.mb, [ui.mch]: e.target.value } })} aria-label="Message" style={{ height: 'auto', resize: 'vertical' }} />
          <div className="crm-vars"><span>Insert:</span>{['{name}', '{points}', '{code}', '{link}'].map((t) => <button key={t} type="button" onClick={() => set({ mb: { ...ui.mb, [ui.mch]: msgBody + t + ' ' } })}>{t}</button>)}<span>{ui.mch === 'sms' ? msgBody.length + ' letters · ' + parts + ' SMS' : ui.mch === 'whatsapp' ? msgBody.length + ' / 1,000' : 'No limit'}</span></div>
          <div className="ix-chips"><button type="button" className="ix-btn ix-btn--primary" onClick={sendMsg} disabled={!!msgBlock}><__Icon name="send" width="16" height="16" aria-hidden="true" />Send {channelLabel(ui.mch)}</button></div>
        </div>
        <div>
          <h3>Message history</h3>
          <div className="crm-hist">
            {ui.sent.slice().reverse().map((h, i) => <div key={'n' + i} className="is-new"><small><b>{h.ch}</b><span>Just now · You</span><span>Sent</span></small><span className="crm-bn">{h.text}</span></div>)}
            {demo ? HIST.map((h, i) => <div key={i}><small><b>{h[0]}</b><span>{h[1]} · {h[2]}</span><span>{h[3]}</span></small><span className="crm-bn">{h[4]}</span></div>) : null}
            {!demo && !ui.sent.length ? <p className="ly-help">No messages yet.</p> : null}
          </div>
        </div>
      </div>
    </section>
    {demo ? (
      <Card id="crm-tickets" title="Support tickets" action={<__Link href="/support-tickets">All tickets</__Link>}>
        <ul className="crm-list">{TICKETS.map((t) => <li key={t.no}><div><__Link href="/support-tickets" className="ix-strong">{t.title}</__Link><span className="crm-sub"><span className="ly-fig">{t.no}</span> · {t.sub}</span></div><__StatusBadge tone={t.tone}>{t.st}</__StatusBadge></li>)}</ul>
      </Card>
    ) : null}
  </>);

  const pointList = (kind) => (
    <ul className="crm-list">
      {c[kind].map((p, i) => (
        <li key={kind + i}>
          <div><b className={kind === 'phones' ? 'ly-fig' : ''}>{p.value}</b><span className="crm-sub">{p.label}{p.primary ? ' · primary' : ''}</span></div>
          <__StatusBadge tone={p.verified ? 'success' : 'neutral'}>{p.verified ? 'Verified' : 'Not verified'}</__StatusBadge>
          <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[
            !p.primary ? { label: 'Make primary', onClick: () => { updateContactPoint(c.id, kind, i, { primary: true }); bump(); } } : null,
            { label: p.verified ? 'Mark not verified' : 'Mark verified', onClick: () => { updateContactPoint(c.id, kind, i, { verified: !p.verified }); bump(); } },
            c[kind].length > 1 || kind === 'emails' ? { label: 'Remove', tone: 'danger', onClick: () => { removeContactPoint(c.id, kind, i); bump(); uiToast('Removed.'); } } : null,
          ].filter(Boolean)} />
        </li>
      ))}
      {!c[kind].length ? <li><div><span className="crm-sub">None yet.</span></div></li> : null}
    </ul>
  );
  const details = (<>
    <Card id="crm-ident" title="Phones and emails">
      <p className="crm-set-h">Phones</p>{pointList('phones')}
      <span><Plain onClick={() => open('phone', { value: '', label: 'Mobile', verified: false, primary: false })} dialog>Add phone</Plain></span>
      <p className="crm-set-h">Emails</p>{pointList('emails')}
      <span><Plain onClick={() => open('email', { value: '', label: 'Personal', verified: false, primary: false })} dialog>Add email</Plain></span>
    </Card>
    <section className="ix-card crm-card" aria-labelledby="crm-addr">
      <header className="ix-card__head"><h2 id="crm-addr">Addresses · {addrs.length}</h2><Plain onClick={() => open('addr', { label: 'Other', line: '', who: c.name, phone: c.phone, def: false })} dialog>Add address</Plain></header>
      <div className="ix-card__body">
        {!addrs.length ? <p className="ly-help">No address yet.</p> : (
          <ul className="crm-list">
            {orderedAddrs.map((ad) => { const isDef = ad.id === defId; return (
              <li key={ad.id}>
                <div className="crm-addr">
                  <span><b>{ad.label}</b>{isDef ? <__StatusBadge tone="primary" icon="star">Default</__StatusBadge> : null}</span>
                  <span>{ad.line}</span>
                  <span className="crm-sub">Receiver: {ad.who} · <span className="ly-fig">{ad.phone}</span>{ad.used ? ' · ' + ad.used : ''}</span>
                </div>
                <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[
                  !isDef ? { label: 'Make default', onClick: () => saveIdentity({ addresses: addrs, defAddr: ad.id }, ad.label + ' is now the default address. New orders will use it.') } : null,
                  { label: 'Edit', onClick: () => open('addr', { ...ad, def: isDef }) },
                  !isDef ? { label: 'Remove', tone: 'danger', aria: `Remove ${ad.label}`, onClick: () => saveIdentity({ addresses: addrs.filter((x) => x.id !== ad.id) }, ad.label + ' address removed.') } : null,
                ].filter(Boolean)} />
              </li>); })}
          </ul>
        )}
      </div>
    </section>
    {company ? (<>
      <Card id="crm-locs" title={'Locations · ' + c.locations.length} action={<Plain onClick={() => open('loc', { name: '', address: '', phone: '' })} dialog>Add location</Plain>}>
        <ul className="crm-list">{c.locations.map((l) => <li key={l.id}><div><b>{l.name}{l.billing ? ' · billing' : ''}</b><span className="crm-sub">{l.address} · <span className="ly-fig">{l.phone}</span> · {D.contacts.filter((p) => p.locationId === l.id).length} contacts</span></div>{!l.billing ? <Plain onClick={() => { removeLocation(c.id, l.id); bump(); }}>Remove</Plain> : null}</li>)}</ul>
      </Card>
      <Card id="crm-contacts" title={'Contacts · ' + D.contacts.length} action={<Plain onClick={() => open('contact', { q: '', role: 'Buyer', loc: (c.locations[0] || {}).id || '', name: '', phone: '' })} dialog>Add contact</Plain>}>
        {D.contacts.length ? <ul className="crm-list">{D.contacts.map((p) => <li key={p.id}><div><__Link href={'/customer-crm?id=' + p.id} className="ix-strong">{p.name}</__Link><span className="crm-sub">{p.role} · {(c.locations.find((l) => l.id === p.locationId) || {}).name || 'No location'} · <span className="ly-fig">{p.phone}</span></span></div><Plain onClick={() => { unlinkContact(p.id); bump(); uiToast(p.name + ' is no longer a contact.'); }}>Unlink</Plain></li>)}</ul> : <p className="ly-help">No contact people yet.</p>}
      </Card>
    </>) : null}
  </>);
  const detailsSide = (<>
    <Card id="crm-about" title="About">
      <KV rows={[['Type', company ? 'Company' : 'Person'], ['Customer ID', <span key="i" className="ly-fig">{c.id}</span>], ['Buys', (c.types || []).join(' · ') || '—'], company ? ['BIN', c.bin || '—'] : ['Birthday', c.birthday || '—'], ['Came from', c.src || '—']]} />
      <Field id="crm-owner" label="Looked after by"><select id="crm-owner" className="gc-input gc-select" value={c.owner || ''} onChange={(e) => saveIdentity({ owner: e.target.value }, e.target.value ? e.target.value + ' now looks after ' + first + '.' : 'No one is set.')}><option value="">No one</option>{STAFF.map((s) => <option key={s}>{s}</option>)}</select></Field>
      <Field id="crm-pref" label="Likes messages by" help="A preference, not consent."><select id="crm-pref" className="gc-input gc-select" value={c.preferred || ''} onChange={(e) => saveIdentity({ preferred: e.target.value })}><option value="">Not known</option>{PREFERRED.map((s) => <option key={s}>{s}</option>)}</select></Field>
    </Card>
    {!company ? (
      <Card id="crm-co" title="Company" action={c.companyId ? <Plain onClick={() => { unlinkContact(c.id); bump(); }}>Unlink</Plain> : <Plain onClick={() => open('link', { company: '', role: 'Buyer', loc: '' })} dialog>Link</Plain>}>
        {company0 ? <p className="ly-help" style={{ color: 'var(--text-body)' }}>{c.role} at <__Link href={'/customer-crm?id=' + company0.id}>{company0.name}</__Link>{c.locationId ? ' · ' + ((company0.locations || []).find((l) => l.id === c.locationId) || {}).name : ''}</p> : <p className="ly-help">Not linked to a company.</p>}
      </Card>
    ) : null}
    <Card id="crm-fields" title="Custom fields" action={<Plain onClick={() => { const o = {}; fieldDefs.forEach((d) => { const v = fieldVals[d.key]; o[d.key] = v == null ? '' : d.type === 'bool' ? (v ? 'true' : 'false') : String(v); }); open('fields', o); }} dialog>Edit</Plain>}>
      {fieldDefs.length ? <KV rows={fieldDefs.map((d) => [d.label, formatValue(d, fieldVals[d.key])])} /> : <p className="ly-help">No fields yet. <__Link href="/customer-settings">Set them up</__Link>.</p>}
    </Card>
    <Card id="crm-tags" title="Tags">
      <div className="ix-chips">{TAGS.concat((c.tags || []).filter((t) => TAGS.indexOf(t) < 0)).map((t) => { const on = (c.tags || []).indexOf(t) >= 0; return <button key={t} type="button" className="ix-chip" aria-pressed={on} onClick={() => saveIdentity({ tags: on ? c.tags.filter((x) => x !== t) : (c.tags || []).concat([t]) })}>{t}</button>; })}</div>
    </Card>
  </>);

  const controls = (<>
    <Card id="crm-restr" title="Commerce controls" action={<Plain onClick={() => startRestr('cod')} dialog>Add restriction</Plain>}>
      {active.length ? <ul className="crm-list">{active.map((r) => <li key={r.id}><div><b>{restrictionText(r)}</b><span className="crm-sub">{r.reason} · {r.by} · from {fmtD(r.startsAt)}{r.endsAt ? ' to ' + fmtD(r.endsAt) : ', no end'}{r.approval ? ' · approved by ' + r.approval.by : ''}{r.note ? ' · ' + r.note : ''}</span></div>{restrictionState(r) === 'scheduled' ? <__StatusBadge tone="info">{STATE_LABEL.scheduled}</__StatusBadge> : null}<Plain onClick={() => lift(r)}>Lift</Plain></li>)}</ul> : <p className="ly-help">No restrictions. {first} can order and pay any way.</p>}
      <div>
        <p className="crm-set-h">Payment methods</p>
        {[['cod', 'Cash on delivery'], ...PAY_METHODS.map((x) => [x, x])].map(([k, l]) => <div key={k} className="ly-set"><div><b>{l}</b></div><span className={payOn(k) ? 'ly-in' : 'ly-out'} style={{ fontSize: 'var(--text-xs)' }}>{payOn(k) ? 'Allowed' : 'Off'}</span><Switch on={payOn(k)} onToggle={() => togglePay(k)} label={l} /></div>)}
      </div>
      {past.length ? (
        <details className="gc-disclose"><summary>History · {past.length}</summary>
          <ul className="crm-list">{past.map((r) => <li key={r.id}><div><b>{restrictionText(r)}</b><span className="crm-sub">{r.reason} · {r.by} · {fmtD(r.startsAt)}{r.liftedAt ? ' · lifted by ' + r.liftedBy + ' on ' + fmtD(r.liftedAt) : r.endsAt ? ' · ended ' + fmtD(r.endsAt) : ''}</span></div><__StatusBadge tone="neutral">{STATE_LABEL[restrictionState(r)]}</__StatusBadge></li>)}</ul>
        </details>
      ) : null}
    </Card>
    <Card id="crm-consent" title="Consent" action={<Plain onClick={() => open('consent', { channel: 'sms', state: 'in', source: 'Staff', note: '' })} dialog>Change</Plain>}>
      <ul className="crm-list">{CONSENT_CHANNELS.map((ch) => { const x = D.consent[ch.k]; return <li key={ch.k}><div><b>{ch.label}</b><span className="crm-sub">{x.state === 'unknown' ? 'Never asked' : (x.source || '—') + (x.at ? ' · ' + fmtD(x.at) : '')}</span></div><__StatusBadge tone={CONSENT_TONE[x.state]}>{CONSENT_STATES[x.state]}</__StatusBadge></li>; })}</ul>
      <div className="ly-set"><div><b>Leave out of ad audiences</b><small>Meta and TikTok audiences skip them</small></div><Switch on={!!D.consent.adsOut} onToggle={() => { setAdsOptOut(c.id, !D.consent.adsOut, me); bump(); }} label="Leave out of ad audiences" /></div>
      <details className="gc-disclose"><summary>Consent history</summary>
        <ul className="crm-list">{consentHistory(c.id).map((h, i) => <li key={i}><div><b>{h.channel === 'ads' ? 'Ad audiences' : channelLabel(h.channel)}: {CONSENT_STATES[h.from] || h.from} → {CONSENT_STATES[h.to] || h.to}</b><span className="crm-sub">{h.source} · {h.by}{h.note ? ' · ' + h.note : ''}</span></div><span className="crm-when">{h.at ? fmtD(h.at) : ''}</span></li>)}</ul>
      </details>
    </Card>
    <Card id="crm-sec" title="Logins and devices">
      {deviceOk ? (demo ? (<>
        <KV rows={[['Last login', 'Today 10:42 AM'], ['Last login IP', <span key="ip" className="ly-fig">103.112.54.21 · Mirpur, Dhaka (approx.)</span>]]} />
        <div className="ix-table-wrap ix-table-wrap--show crm-box">
          <table className="ix-table ix-table--static gc-table--keep">
            <thead><tr><th scope="col">IP address</th><th scope="col">Area (approx.)</th><th scope="col">Device</th><th scope="col">Last seen</th><th scope="col" className="ix-num">Logins</th></tr></thead>
            <tbody>{IPS.map((x) => <tr key={x[0]}><td className="ly-fig">{x[0]}</td><td>{x[1]}<span className="crm-sub">{x[2]}</span></td><td className="ix-muted">{x[3]}</td><td className="ix-muted">{x[5]}<span className="crm-sub">first {x[4]}</span></td><td className="ix-num">{x[6]}</td></tr>)}</tbody>
          </table>
        </div>
        <span className="crm-sub">A shared device or network is normal for families and offices. It is not proof of anything.</span>
      </>) : <p className="ly-help">No sign-ins recorded.</p>) : <div className="crm-hidden"><__Icon name="lock" width="16" height="16" aria-hidden="true" />Hidden. IP addresses and devices are for the roles set in Customer settings.</div>}
      <div className="ix-chips">
        <button type="button" className="ix-btn ix-btn--sm" onClick={() => uiToast(first + ' was logged out of every device.')}><__Icon name="lock" width="16" height="16" aria-hidden="true" />Log out of all devices</button>
        <button type="button" className="ix-btn ix-btn--sm" onClick={() => uiToast('Password reset link sent by SMS.')}><__Icon name="refresh-cw" width="16" height="16" aria-hidden="true" />Send password reset</button>
      </div>
    </Card>
  </>);
  const controlsSide = (<>
    <Card id="crm-acct" title={'Account · ' + c.status}>
      {c.status !== 'Active' && c.statusNote ? <p className="ly-help">{c.status} on {fmtD(c.statusNote.at)} by {c.statusNote.by}{c.statusNote.reason ? ' — ' + c.statusNote.reason : ''}.</p> : <p className="ly-help">Suspending stops logging in and ordering. Open orders are not touched.</p>}
      {c.status === 'Active' ? <span className="ix-chips"><button type="button" className="ix-btn ix-btn--danger" onClick={() => open('suspend', { reason: 'Too many returned orders', until: '' })}>Suspend</button><button type="button" className="ix-btn" onClick={closeAcct}>Close account</button></span> : <span><button type="button" className="ix-btn" onClick={reactivate}>Turn account back on</button></span>}
    </Card>
    <Card id="crm-privacy" title="Privacy">
      <p className="ly-help">Clears signals, recovery records and ad audiences for this customer. Orders stay.</p>
      <span><button type="button" className="ix-btn ix-btn--sm" onClick={forget}>Clear insight data</button></span>
    </Card>
  </>);

  const area = { overview: [overview, overviewSide], orders: [commerce, commerceSide], invoices: [<CustomerInvoices key="inv" phones={D.myPhones} name={c.name} onChange={bump} />, null], insights: [insights, insightsSide], activity: [activity, null], details: [details, detailsSide], controls: [controls, controlsSide] }[tab];
  const custCard = (
    <Card id="crm-who" title={company ? 'Company' : 'Customer'} action={<Plain onClick={openEdit} dialog>Edit</Plain>}>
      <KV rows={[
        ['Phone', verified ? <span key="p"><span className="ly-fig">{verified.value}</span>{verified.verified ? ' · verified' : ''}</span> : '—'],
        ['Email', c.email || '—'],
        ['Customer ID', <span key="id" className="ly-fig">{c.id}</span>],
        company0 ? ['Company', <__Link key="co" href={'/customer-crm?id=' + company0.id}>{company0.name}</__Link>] : ['Area', c.area],
      ]} />
    </Card>
  );
  const notesCard = (
    <Card id="crm-notes" title="Notes">
      <div className="ly-row">
        <input className="gc-input ly-grow" value={ui.nt} onChange={(e) => set({ nt: e.target.value })} placeholder="Write a note for your team — the customer never sees it" aria-label="New note" />
        <button type="button" className="ix-btn" onClick={() => { if (!ui.nt.trim()) return; saveIdentity({ notes: [{ t: ui.nt.trim(), by: me + ' · ' + fmtD(Date.now()) }].concat(notes) }); set({ nt: '' }); }}>Add note</button>
      </div>
      {notes.length ? <ul className="crm-list">{notes.map((n, i) => <li key={i}><div><span style={{ fontSize: 'var(--text-sm)' }}>{n.t}</span><span className="crm-sub">{n.by}</span></div></li>)}</ul> : null}
    </Card>
  );

  const restrType = RESTRICTION_TYPES[f.type] || {};
  const visibleFor = fieldDefs;
  return shell(
    <div className="ix-page">
      <RecordHeader back="/all-customers" backLabel="All customers" title={c.name}
        about="One customer or company: what they bought, their insights, messages, details and addresses, and the controls on their account."
        badges={badges} meta={meta}
        secondary={[{ label: 'Edit', onClick: openEdit }, { label: 'Call', onClick: call }]}
        more={[
          whole && !company ? { label: 'Wholesale profile', href: '/wholesale-customer?phone=' + (c.bookPhone || c.digits) + (c.demoId ? '&demo=' + c.demoId : '') } : null,
          hasModule('comms') && { label: 'Schedule meeting', href: '/meetings?new=1&customer=' + encodeURIComponent(c.bookPhone || c.phone || (c.phones[0] || {}).value || '') },
          { label: 'Merge customer', href: '/all-customers?view=dupes' },
          company ? { label: 'Add contact', onClick: () => { setTab('details'); open('contact', { q: '', role: 'Buyer', loc: (c.locations[0] || {}).id || '' }); } } : { label: 'Add to a company', onClick: () => open('link', { company: '', role: 'Buyer', loc: '' }) },
          { label: 'Custom fields', onClick: () => setTab('details') },
          { label: 'Edit consent', onClick: () => open('consent', { channel: 'sms', state: 'in', source: 'Staff', note: '' }) },
          { label: 'Add restriction', onClick: () => startRestr('cod') },
          demo ? { label: 'Assign coupon', onClick: () => open('coupon') } : null,
          c.status === 'Active' ? { label: 'Suspend customer', tone: 'danger', onClick: () => open('suspend', { reason: 'Too many returned orders', until: '' }) } : { label: 'Turn account back on', onClick: reactivate },
        ].filter(Boolean)}
        primary={{ label: 'Message', onClick: goMessage }} />

      <MetricStrip label="Customer figures" items={[
        { label: 'Lifetime value', value: bdt(figs.spent), sub: c.signup && c.signup !== '—' ? 'since ' + c.signup : undefined },
        { label: 'Orders', value: figs.orders.toLocaleString('en-IN'), sub: c.returns ? c.returns + ' returned' : undefined },
        { label: 'Average order', value: bdt(figs.aov) },
        company || whole || c.due > 0 ? { label: 'Due', value: bdt(c.due), sub: c.creditLimit ? 'limit ' + bdt(c.creditLimit) : undefined } : { label: 'Loyalty points', value: pts.toLocaleString('en-IN') },
      ]} />

      <section className="ix-card crm-areas" aria-label="Customer areas"><div className="ix-bar"><IndexTabs tabs={tabs} label="Customer areas" /></div></section>

      <div className="ix-record">
        <div className="ix-main">{area[0]}</div>
        <aside className="ix-side">{custCard}{area[1]}{notesCard}</aside>
      </div>

      <__Dialog open={!!m} title={{ addr: f.id ? 'Edit address' : 'Add an address', coupon: 'Assign a coupon', credit: 'Add wallet credit', points: 'Give or take points', suspend: 'Suspend ' + c.name, restr: 'Add a restriction', consent: 'Change consent', phone: 'Add a phone', email: 'Add an email', ext: 'Add an outside ID', fields: 'Custom fields', loc: 'Add a location', contact: 'Add a contact', link: 'Link to a company' }[m] || ''} onClose={close} width={520}
        footer={m === 'contact' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={close}>Close</button> : <>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={close}>Cancel</button>
          <button type="button" className={'gc-btn gc-btn--sm gc-btn--solid' + (m === 'suspend' ? ' gc-btn--error' : '')} onClick={() => {
            if (m === 'addr') saveAddr(); else if (m === 'restr') saveRestr(); else if (m === 'consent') saveConsentDlg(); else if (m === 'phone' || m === 'email') saveContact(); else if (m === 'ext') saveExt(); else if (m === 'fields') saveFields(); else if (m === 'loc') saveLoc(); else if (m === 'link') saveLink(); else if (m === 'suspend') suspend();
            else if (m === 'coupon') { close(); uiToast('One-time code NUSV10 assigned and sent on WhatsApp.'); }
            else if (m === 'credit') { set({ credit: ui.credit + (f.n || 200) }); close(); uiToast(bdt(f.n || 200) + ' added to her wallet.'); }
            else if (m === 'points') { const d = (f.op === 'take' ? -1 : 1) * (f.n || 100); set({ pts: Math.max(0, ui.pts + d) }); close(); uiToast((d > 0 ? 'Gave ' : 'Took ') + Math.abs(d) + ' points.'); }
          }}>{{ addr: 'Save address', restr: restrType.approval ? 'Ask a manager' : 'Add restriction', consent: 'Save', phone: 'Add phone', email: 'Add email', ext: 'Add ID', fields: 'Save', loc: 'Add location', link: 'Link', suspend: 'Suspend account', coupon: 'Assign coupon', credit: 'Add ' + bdt(f.n || 200), points: (f.op === 'take' ? 'Take ' : 'Give ') + (f.n || 100) + ' points' }[m] || 'Save'}</button>
        </>}>
        <div className="crm-dialog">
          {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
          {m === 'addr' ? (<>
            <div className="ix-chips" role="group" aria-label="Label">{ALABELS.map((l) => <button key={l} type="button" className="ix-chip" aria-pressed={f.label === l} onClick={() => setF({ ...f, label: l })}>{l}</button>)}</div>
            <div className="ly-two">
              <Field id="crm-a-name" label="Receiver name"><input id="crm-a-name" className="gc-input" value={f.who || ''} onChange={ff('who')} /></Field>
              <Field id="crm-a-phone" label="Receiver phone"><input id="crm-a-phone" className="gc-input ly-fig" value={f.phone || ''} onChange={ff('phone')} /></Field>
            </div>
            <div className="ly-two">
              <Field id="crm-a-area" label="Area / thana"><input id="crm-a-area" className="gc-input" value={f.area || ''} onChange={ff('area')} placeholder="e.g. Mirpur" /></Field>
              <Field id="crm-a-post" label="Postcode (optional)"><input id="crm-a-post" className="gc-input ly-fig" value={f.postcode || ''} onChange={ff('postcode')} inputMode="numeric" maxLength={4} /></Field>
            </div>
            <Field id="crm-a-line" label="House, road, landmark" help="Kept exactly as the customer gave it."><input id="crm-a-line" className="gc-input" value={f.line || ''} onChange={ff('line')} placeholder="e.g. House 5, Road 12, near Rapa Plaza" /></Field>
            <label className="ly-row"><input type="checkbox" className="gc-check" checked={!!f.def} onChange={ff('def')} />Make this the default address</label>
          </>) : null}
          {m === 'restr' ? (<>
            <Field id="crm-r-type" label="Restriction"><select id="crm-r-type" className="gc-input gc-select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value, reason: '' })}>{Object.keys(RESTRICTION_TYPES).map((k) => <option key={k} value={k}>{RESTRICTION_TYPES[k].label}</option>)}</select></Field>
            {restrType.amount ? <Field id="crm-r-amt" label={restrType.amountLabel + (restrType.amount === 'optional' ? ' (optional)' : '')}><input id="crm-r-amt" className="gc-input" inputMode="numeric" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/[^0-9]/g, '') })} placeholder="৳" /></Field> : null}
            {restrType.method ? <Field id="crm-r-m" label="Payment method"><select id="crm-r-m" className="gc-input gc-select" value={f.method} onChange={ff('method')}>{PAY_METHODS.map((x) => <option key={x}>{x}</option>)}</select></Field> : null}
            <Field id="crm-r-why" label="Reason"><input id="crm-r-why" className="gc-input" value={f.reason} onChange={ff('reason')} list="crm-r-reasons" maxLength={120} /><datalist id="crm-r-reasons">{(REASONS[f.type] || []).map((x) => <option key={x} value={x} />)}</datalist></Field>
            <div className="ly-two">
              <Field id="crm-r-from" label="Starts"><input id="crm-r-from" type="date" className="gc-input" value={f.starts} onChange={ff('starts')} /></Field>
              <Field id="crm-r-to" label="Ends (optional)"><input id="crm-r-to" type="date" className="gc-input" value={f.ends} onChange={ff('ends')} /></Field>
            </div>
            <Field id="crm-r-note" label="Note (optional)"><input id="crm-r-note" className="gc-input" value={f.note} onChange={ff('note')} maxLength={160} /></Field>
            {restrType.approval ? <p className="gc-help" style={{ margin: 0 }}>A manager approves this with their PIN.</p> : null}
          </>) : null}
          {m === 'consent' ? (<>
            <div className="ly-two">
              <Field id="crm-c-ch" label="Channel"><select id="crm-c-ch" className="gc-input gc-select" value={f.channel} onChange={ff('channel')}>{CONSENT_CHANNELS.map((x) => <option key={x.k} value={x.k}>{x.label}</option>)}</select></Field>
              <Field id="crm-c-st" label="Answer"><select id="crm-c-st" className="gc-input gc-select" value={f.state} onChange={ff('state')}>{Object.keys(CONSENT_STATES).map((k) => <option key={k} value={k}>{CONSENT_STATES[k]}</option>)}</select></Field>
            </div>
            <Field id="crm-c-src" label="Where it came from" help="Only record a yes the customer gave you."><select id="crm-c-src" className="gc-input gc-select" value={f.source} onChange={ff('source')}>{CONSENT_SOURCES.map((x) => <option key={x}>{x}</option>)}</select></Field>
            <Field id="crm-c-note" label="Note (optional)"><input id="crm-c-note" className="gc-input" value={f.note} onChange={ff('note')} maxLength={120} /></Field>
          </>) : null}
          {m === 'phone' || m === 'email' ? (<>
            <Field id="crm-p-val" label={m === 'phone' ? 'Phone number' : 'Email'} help={m === 'phone' ? '01712345678, 8801712345678 and +8801712345678 are the same number. Other countries start with +.' : undefined}><input id="crm-p-val" className={'gc-input' + (m === 'phone' ? ' ly-fig' : '')} type={m === 'phone' ? 'tel' : 'email'} value={f.value} onChange={(e) => { setF({ ...f, value: e.target.value }); setErr(''); }} /></Field>
            <Field id="crm-p-lbl" label="Label"><select id="crm-p-lbl" className="gc-input gc-select" value={f.label} onChange={ff('label')}>{(m === 'phone' ? PHONE_LABELS : EMAIL_LABELS).map((x) => <option key={x}>{x}</option>)}</select></Field>
            <label className="ly-row"><input type="checkbox" className="gc-check" checked={!!f.verified} onChange={ff('verified')} />Verified (code confirmed)</label>
            <label className="ly-row"><input type="checkbox" className="gc-check" checked={!!f.primary} onChange={ff('primary')} />Make it the primary one</label>
          </>) : null}
          {m === 'ext' ? (<>
            <Field id="crm-x-src" label="Where it comes from"><select id="crm-x-src" className="gc-input gc-select" value={f.source} onChange={ff('source')}>{Object.keys(EXTERNAL_SOURCES).map((k) => <option key={k} value={k}>{EXTERNAL_SOURCES[k]}</option>)}</select></Field>
            <Field id="crm-x-val" label="ID there"><input id="crm-x-val" className="gc-input ly-fig" value={f.value} onChange={(e) => { setF({ ...f, value: e.target.value }); setErr(''); }} placeholder="e.g. WC-4821" /></Field>
          </>) : null}
          {m === 'fields' ? visibleFor.map((d) => (
            <Field key={d.key} id={'crm-f-' + d.key} label={d.label}>
              {d.type === 'select' ? <select id={'crm-f-' + d.key} className="gc-input gc-select" value={f[d.key] || ''} onChange={ff(d.key)}><option value="">—</option>{d.options.map((o) => <option key={o}>{o}</option>)}</select>
                : d.type === 'bool' ? <select id={'crm-f-' + d.key} className="gc-input gc-select" value={f[d.key] || ''} onChange={ff(d.key)}><option value="">—</option><option value="true">Yes</option><option value="false">No</option></select>
                  : <input id={'crm-f-' + d.key} className="gc-input" type={d.type === 'date' ? 'date' : 'text'} inputMode={d.type === 'number' ? 'decimal' : undefined} value={f[d.key] || ''} onChange={ff(d.key)} />}
            </Field>
          )) : null}
          {m === 'loc' ? (<>
            <Field id="crm-l-name" label="Location name"><input id="crm-l-name" className="gc-input" value={f.name} onChange={ff('name')} placeholder="e.g. Mirpur Branch" /></Field>
            <Field id="crm-l-addr" label="Address"><input id="crm-l-addr" className="gc-input" value={f.address} onChange={ff('address')} /></Field>
            <Field id="crm-l-ph" label="Phone"><input id="crm-l-ph" className="gc-input ly-fig" value={f.phone} onChange={ff('phone')} /></Field>
          </>) : null}
          {m === 'contact' ? (<>
            <div className="ly-two">
              <Field id="crm-k-role" label="Role"><select id="crm-k-role" className="gc-input gc-select" value={f.role} onChange={ff('role')}>{CONTACT_ROLES.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field id="crm-k-loc" label="Location"><select id="crm-k-loc" className="gc-input gc-select" value={f.loc} onChange={ff('loc')}><option value="">No location</option>{c.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></Field>
            </div>
            <Field id="crm-k-q" label="Find a customer" help="Name, phone or email of someone already in your customers."><input id="crm-k-q" className="gc-input" value={f.q} onChange={ff('q')} /></Field>
            {contactMatches.length ? <ul className="crm-list">{contactMatches.map((p) => <li key={p.id}><div><b>{p.name}</b><span className="crm-sub">{p.phone} · {p.id}</span></div><button type="button" className="ix-btn ix-btn--sm" onClick={() => linkExisting(p)}>Link</button></li>)}</ul> : null}
            <p className="crm-set-h">Or add a new person</p>
            <div className="ly-two">
              <Field id="crm-k-name" label="Name"><input id="crm-k-name" className="gc-input" value={f.name || ''} onChange={ff('name')} /></Field>
              <Field id="crm-k-ph" label="Mobile number"><input id="crm-k-ph" className="gc-input ly-fig" type="tel" value={f.phone || ''} onChange={ff('phone')} placeholder="01XXXXXXXXX" /></Field>
            </div>
            <span><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={addNewContact}>Add and link</button></span>
          </>) : null}
          {m === 'link' ? (<>
            <Field id="crm-lk-co" label="Company"><select id="crm-lk-co" className="gc-input gc-select" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value, loc: '' })}><option value="">Choose…</option>{rows.filter((x) => x.kind === 'company').map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
            <div className="ly-two">
              <Field id="crm-lk-role" label="Role"><select id="crm-lk-role" className="gc-input gc-select" value={f.role} onChange={ff('role')}>{CONTACT_ROLES.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field id="crm-lk-loc" label="Location"><select id="crm-lk-loc" className="gc-input gc-select" value={f.loc} onChange={ff('loc')}><option value="">No location</option>{((rows.find((x) => x.id === f.company) || {}).locations || []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></Field>
            </div>
          </>) : null}
          {m === 'suspend' ? (<>
            <Field id="crm-s-why" label="Reason"><select id="crm-s-why" className="gc-input gc-select" value={f.reason} onChange={ff('reason')}><option>Too many returned orders</option><option>Fake or prank orders</option><option>Abusive to staff</option><option>Asked to close the account</option></select></Field>
            <Field id="crm-s-long" label="For how long"><select id="crm-s-long" className="gc-input gc-select" value={f.until} onChange={ff('until')}><option value="">Until I turn it back on</option><option>7 days</option><option>30 days</option></select></Field>
            <p className="gc-help gc-help--error" style={{ margin: 0 }}>They will not be able to log in or place orders. Open orders stay as they are. To stop only cash on delivery, add a restriction instead.</p>
          </>) : null}
          {m === 'coupon' ? (<>
            <Field id="crm-c-coupon" label="Coupon"><select id="crm-c-coupon" className="gc-input gc-select"><option>Make a one-time code just for her</option><option>EID300 — ৳300 off on ৳2,000+</option><option>CASE15 — 15% off accessories</option><option>GOLD500 — ৳500 off on ৳5,000+</option></select></Field>
            <div className="ly-two">
              <Field id="crm-c-disc" label="Discount"><select id="crm-c-disc" className="gc-input gc-select"><option>10% off, up to ৳300</option><option>৳100 off</option><option>৳200 off</option><option>Free delivery</option></select></Field>
              <Field id="crm-c-valid" label="Works for"><select id="crm-c-valid" className="gc-input gc-select"><option>7 days</option><option>3 days</option><option>14 days</option><option>30 days</option></select></Field>
            </div>
            <Field id="crm-c-tell" label="Tell her by"><select id="crm-c-tell" className="gc-input gc-select"><option>WhatsApp</option><option>SMS</option><option>Email</option><option>Don’t send a message</option></select></Field>
          </>) : null}
          {m === 'credit' ? (<>
            <div className="ly-row"><Steps label="credit amount" less="Less credit amount" more="More credit amount" display={bdt(f.n || 200)} onDec={() => setF({ ...f, n: Math.max(50, (f.n || 200) - 50) })} onInc={() => setF({ ...f, n: (f.n || 200) + 50 })} /><span>goes into her wallet — she can pay with it</span></div>
            <Field id="crm-cr-why" label="Why?"><select id="crm-cr-why" className="gc-input gc-select"><option>Sorry for a late delivery</option><option>Refund</option><option>Gift</option><option>Fix a mistake</option></select></Field>
          </>) : null}
          {m === 'points' ? (<>
            <div className="gc-seg" role="group" aria-label="Give or take">{[['give', 'Give'], ['take', 'Take']].map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + ((f.op || 'give') === k ? ' gc-seg__btn--active' : '')} aria-pressed={(f.op || 'give') === k} onClick={() => setF({ ...f, op: k })}>{l}</button>)}</div>
            <div className="ly-row"><Steps label="points" less="Less points" more="More points" display={f.n || 100} onDec={() => setF({ ...f, n: Math.max(10, (f.n || 100) - 10) })} onInc={() => setF({ ...f, n: (f.n || 100) + 10 })} /><span>points</span></div>
            <Field id="crm-p-why" label="Why?"><input id="crm-p-why" className="gc-input" placeholder="e.g. Sorry gift" /></Field>
          </>) : null}
        </div>
      </__Dialog>
      <ManagerPin open={!!pin} reason={pin ? 'Add “' + (RESTRICTION_TYPES[pin.type] || {}).label + '” for ' + c.name + ': ' + pin.reason : ''} action="Customer restriction" by={me} refId={c.id} onApprove={approveRestr} onClose={() => setPin(null)} />
      <CustomerEditDialog open={!!editProf} customer={editProf} phoneLocked={c.origin === 'book'} onSave={saveProfile} onClose={() => setEditProf(null)} />
    </div>
  );
}
