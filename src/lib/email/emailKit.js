// email/emailKit — designed emails (Batch B step 1), shared by the shop (Settings › Notifications › Email design) and
// GridCommerce itself (super admin › Communications › Templates). Pure: no browser, no imports, so both sides and tools
// can use it. Sending stays simulated; the server (Bablu vai) sends the HTML this makes.
//
//   DESIGN_FIELDS · DEFAULT_DESIGN · FONTS · HEADER_STYLES
//   BLOCK_TYPES        the parts an email is built from: heading, text, button, order (order table), products (cards),
//                      coupon, tracking, info (label / value rows), image, divider, spacer
//   newBlock(type)
//   renderEmail({ design, blocks, vars, data, lang, dark, preheader, subject }) → full HTML (table layout, 600 px,
//                      inline styles, light and dark)
//   previewHtml(html, dark) → the same email pinned to light (or dark) for a preview frame: the reader's own
//                      dark-mode rule is taken out, so a computer in dark mode no longer darkens the light preview
//                      (Batch C step 4). Sent emails keep the rule. · plainText(blocks, vars, data) → the text part
//   fillVars(text, vars) · emailProblem({ subject, blocks }) · blocksFromText(body) (an old plain email → blocks)
// Text in a block may use **bold** and [a link](https://…); {{variables}} are filled and escaped.

export const FONTS = [
  ['system', 'System (fastest)', "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif"],
  ['poppins', 'Poppins', "Poppins,-apple-system,'Segoe UI',Arial,sans-serif"],
  ['serif', 'Serif', "Georgia,'Times New Roman',serif"],
];
const BN_FONT = "'Hind Siliguri','Noto Sans Bengali','Kohinoor Bangla',sans-serif";
export const HEADER_STYLES = [['left', 'Logo on the left'], ['center', 'Logo in the middle'], ['band', 'Brand-colour band']];
export const DEFAULT_DESIGN = {
  brandName: 'Your shop', logo: '', primary: '#003087', accent: '#009cde', bg: '#f3f5f9', card: '#ffffff', text: '#0f172a', muted: '#64748b',
  font: 'system', header: 'left', corners: 12, buttonShape: 'round', // round | square | pill
  footerText: 'You get this email because you shopped with us.', address: '', phone: '', email: '',
  social: { facebook: '', instagram: '', youtube: '', whatsapp: '' }, showUnsubscribe: true,
};
export const DESIGN_FIELDS = [
  ['brandName', 'Name in the header', 'text'], ['logo', 'Logo (picture address)', 'image'], ['primary', 'Brand colour', 'color'], ['accent', 'Second colour', 'color'],
  ['bg', 'Page background', 'color'], ['font', 'Font', 'choice', FONTS.map(([v, l]) => [v, l])], ['header', 'Header', 'choice', HEADER_STYLES],
  ['buttonShape', 'Buttons', 'choice', [['round', 'Rounded'], ['square', 'Square'], ['pill', 'Pill']]], ['corners', 'Card corners (px)', 'number'],
  ['footerText', 'Footer line', 'text'], ['address', 'Address', 'text'], ['phone', 'Phone', 'text'], ['email', 'Email', 'text'], ['showUnsubscribe', 'Unsubscribe link on offers', 'bool'],
];

// type · label · icon · fields [key, label, kind, default]
export const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: 'heading', fields: [['text', 'Text', 'text', 'Your order is confirmed'], ['align', 'Align', 'choice', 'left', [['left', 'Left'], ['center', 'Centre']]]] },
  { type: 'text', label: 'Text', icon: 'pilcrow', fields: [['text', 'Text', 'area', 'Hi {{customer_name}},'], ['align', 'Align', 'choice', 'left', [['left', 'Left'], ['center', 'Centre']]]] },
  { type: 'button', label: 'Button', icon: 'mouse-pointer-click', fields: [['label', 'Label', 'text', 'View order'], ['url', 'Link', 'text', '{{tracking_url}}'], ['style', 'Style', 'choice', 'solid', [['solid', 'Filled'], ['outline', 'Outline']]], ['align', 'Align', 'choice', 'left', [['left', 'Left'], ['center', 'Centre'], ['full', 'Full width']]]] },
  { type: 'order', label: 'Order table', icon: 'receipt', fields: [['title', 'Title', 'text', 'Order {{order_id}}'], ['images', 'Show pictures', 'bool', true]] },
  { type: 'products', label: 'Product cards', icon: 'shopping-bag', fields: [['title', 'Title', 'text', 'You may also like'], ['count', 'How many', 'number', 3], ['button', 'Button', 'text', 'Shop now']] },
  { type: 'coupon', label: 'Coupon', icon: 'ticket-percent', fields: [['title', 'Title', 'text', 'A gift for you'], ['code', 'Code', 'text', '{{coupon_code}}'], ['text', 'Text', 'text', '{{coupon_text}}']] },
  { type: 'tracking', label: 'Tracking box', icon: 'truck', fields: [['courier', 'Courier', 'text', '{{courier_name}}'], ['tracking', 'Tracking ID', 'text', '{{tracking_id}}'], ['url', 'Link', 'text', '{{tracking_url}}'], ['cod', 'Cash on delivery', 'text', '{{cod_amount}}']] },
  { type: 'info', label: 'Details box', icon: 'list', fields: [['rows', 'Rows (Label: value, one a line)', 'area', 'Amount: {{order_total}}']] },
  { type: 'image', label: 'Picture', icon: 'image', fields: [['src', 'Picture address', 'text', ''], ['alt', 'Describe it', 'text', ''], ['url', 'Link', 'text', '']] },
  { type: 'divider', label: 'Divider', icon: 'minus', fields: [] },
  { type: 'spacer', label: 'Space', icon: 'move-vertical', fields: [['size', 'Height (px)', 'number', 16]] },
];
export const blockType = (t) => BLOCK_TYPES.find((b) => b.type === t) || null;
let seq = 0;
const uid = () => 'eb' + Date.now().toString(36).slice(-4) + (seq++).toString(36);
export function newBlock(type, patch = {}) {
  const t = blockType(type);
  const b = { id: uid(), type };
  (t ? t.fields : []).forEach(([k, , , d]) => { b[k] = d; });
  return { ...b, ...patch };
}

// ---- text ------------------------------------------------------------------------------------------------------
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const safeUrl = (u) => { const s = String(u || '').trim(); return /^(https?:\/\/|mailto:|tel:|\/)/i.test(s) && !/^\/\//.test(s) ? s : ''; };
/** {{key}} → the value (unknown keys stay as typed, so a missing value is easy to spot). */
export const fillVars = (text, vars = {}) => String(text == null ? '' : text).replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
/** Escaped, filled text with **bold**, [links](url) and line breaks. */
function rich(text, vars, linkColor) {
  let s = esc(fillVars(text, vars));
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => { const url = safeUrl(u.replace(/&amp;/g, '&')); return url ? `<a href="${esc(url)}" style="color:${linkColor};text-decoration:underline">${t}</a>` : t; });
  return s.replace(/\n/g, '<br>');
}

// ---- render ----------------------------------------------------------------------------------------------------
const PALETTE_DARK = { bg: '#0b1020', card: '#151c2e', text: '#e5e9f2', muted: '#97a3ba', line: '#26314a', soft: '#1c2539' };
const fontOf = (d, lang) => (lang === 'bn' ? BN_FONT + ',' : '') + ((FONTS.find((f) => f[0] === d.font) || FONTS[0])[2]);
const radiusBtn = (d) => (d.buttonShape === 'pill' ? 999 : d.buttonShape === 'square' ? 0 : 8);
const onColor = (hex) => { const h = String(hex || '#000').replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16); const r = (n >> 16) & 255; const g = (n >> 8) & 255; const b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? '#0f172a' : '#ffffff'; };

/** Sample data the order table, product cards and tracking box draw from (the shop passes its real ones). */
export const SAMPLE_DATA = {
  lines: [{ name: 'Galaxy A15 6/128GB', qty: 1, price: '৳19,999', image: '' }, { name: 'Anker 20W USB-C Charger', qty: 2, price: '৳2,500', image: '' }],
  totals: [['Subtotal', '৳22,499'], ['Delivery', '৳70'], ['Discount', '−৳500']], total: ['Total', '৳22,069'],
  products: [{ name: 'Redmi Note 13 8/256GB', price: '৳26,999', image: '', url: '/product' }, { name: 'Wireless Earbuds Pro', price: '৳3,490', image: '', url: '/product' }, { name: 'Liquid Silicone Case', price: '৳1,450', image: '', url: '/product' }],
};

function blockHtml(b, ctx) {
  const { d, vars, data, P, lang } = ctx;
  const al = b.align === 'center' ? 'center' : 'left';
  const td = (inner, pad = '0 32px 16px') => `<tr><td style="padding:${pad}" align="${al}">${inner}</td></tr>`;
  switch (b.type) {
    case 'heading': return td(`<h1 class="gc-t" style="margin:0;font-size:22px;line-height:1.3;font-weight:700;color:${P.text}">${rich(b.text, vars, P.brand)}</h1>`);
    case 'text': return td(`<p class="gc-t" style="margin:0;font-size:15px;line-height:1.6;color:${P.text}">${rich(b.text, vars, P.brand)}</p>`);
    case 'button': {
      const url = safeUrl(fillVars(b.url, vars)) || '#';
      const full = b.align === 'full';
      const solid = b.style !== 'outline';
      const st = `display:inline-block;${full ? 'width:100%;box-sizing:border-box;text-align:center;' : ''}padding:13px 24px;border-radius:${radiusBtn(d)}px;font-weight:600;font-size:15px;text-decoration:none;${solid ? `background:${d.primary};color:${onColor(d.primary)};border:2px solid ${d.primary}` : `background:transparent;color:${d.primary};border:2px solid ${d.primary}`}`;
      return `<tr><td style="padding:4px 32px 20px" align="${full ? 'center' : al}"><a href="${esc(url)}" style="${st}">${esc(fillVars(b.label, vars))}</a></td></tr>`;
    }
    case 'order': {
      const rows = (data.lines || []).map((l) => `<tr>${b.images ? `<td width="56" style="padding:10px 0;border-bottom:1px solid ${P.line}">${l.image ? `<img src="${esc(safeUrl(l.image))}" width="44" height="44" alt="" style="display:block;border-radius:8px;object-fit:cover">` : `<div style="width:44px;height:44px;border-radius:8px;background:${P.soft};color:${d.primary};font-weight:700;text-align:center;line-height:44px">${esc(String(l.name || '?').slice(0, 1))}</div>`}</td>` : ''}<td class="gc-t" style="padding:10px 8px 10px 0;border-bottom:1px solid ${P.line};font-size:14px;color:${P.text}">${esc(l.name)}<br><span style="color:${P.muted};font-size:13px">× ${esc(l.qty)}</span></td><td class="gc-t" align="right" style="padding:10px 0;border-bottom:1px solid ${P.line};font-size:14px;color:${P.text};white-space:nowrap">${esc(l.price)}</td></tr>`).join('');
      const tot = (data.totals || []).map(([k, v]) => `<tr><td colspan="${b.images ? 2 : 1}" style="padding:4px 0;font-size:14px;color:${P.muted}">${esc(k)}</td><td align="right" style="padding:4px 0;font-size:14px;color:${P.muted}">${esc(v)}</td></tr>`).join('');
      const total = data.total ? `<tr><td colspan="${b.images ? 2 : 1}" class="gc-t" style="padding:8px 0 0;font-size:16px;font-weight:700;color:${P.text}">${esc(data.total[0])}</td><td align="right" class="gc-t" style="padding:8px 0 0;font-size:16px;font-weight:700;color:${P.text}">${esc(data.total[1])}</td></tr>` : '';
      return td(`${b.title ? `<p class="gc-t" style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:.02em;color:${P.muted}">${esc(fillVars(b.title, vars))}</p>` : ''}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows}${tot}${total}</table>`);
    }
    case 'products': {
      const list = (data.products || []).slice(0, Math.max(1, Math.min(4, Number(b.count) || 3)));
      if (!list.length) return '';
      const w = Math.floor(100 / list.length);
      const cells = list.map((p) => `<td width="${w}%" valign="top" style="padding:0 6px"><a href="${esc(safeUrl(p.url) || '#')}" style="text-decoration:none;color:${P.text}">${p.image ? `<img src="${esc(safeUrl(p.image))}" width="160" alt="" style="display:block;width:100%;height:auto;border-radius:10px">` : `<div style="height:110px;border-radius:10px;background:${P.soft};color:${d.primary};font-size:28px;font-weight:700;text-align:center;line-height:110px">${esc(String(p.name).slice(0, 1))}</div>`}<p class="gc-t" style="margin:8px 0 2px;font-size:13px;line-height:1.4;color:${P.text}">${esc(p.name)}</p><p style="margin:0;font-size:13px;font-weight:700;color:${P.brand}">${esc(p.price)}</p></a></td>`).join('');
      return td(`${b.title ? `<p class="gc-t" style="margin:0 0 10px;font-size:16px;font-weight:700;color:${P.text}">${esc(fillVars(b.title, vars))}</p>` : ''}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 -6px"><tr>${cells}</tr></table>`);
    }
    case 'coupon': return td(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px;border:2px dashed ${d.accent};border-radius:${d.corners}px;background:${P.soft}"><p class="gc-t" style="margin:0 0 6px;font-size:15px;font-weight:600;color:${P.text}">${esc(fillVars(b.title, vars))}</p><p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:24px;font-weight:700;letter-spacing:.12em;color:${P.brand}">${esc(fillVars(b.code, vars))}</p>${b.text ? `<p style="margin:0;font-size:13px;color:${P.muted}">${rich(b.text, vars, P.brand)}</p>` : ''}</td></tr></table>`);
    case 'tracking': {
      const url = safeUrl(fillVars(b.url, vars));
      const rows = [[lang === 'bn' ? 'কুরিয়ার' : 'Courier', b.courier], [lang === 'bn' ? 'ট্র্যাকিং আইডি' : 'Tracking ID', b.tracking], [lang === 'bn' ? 'ডেলিভারিতে দিতে হবে' : 'Pay on delivery', b.cod]].filter(([, v]) => String(fillVars(v, vars)).trim());
      return td(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:${d.corners}px;background:${P.soft}"><tr><td style="padding:16px 20px">${rows.map(([k, v]) => `<p style="margin:0 0 4px;font-size:14px;color:${P.muted}">${esc(k)}: <strong class="gc-t" style="color:${P.text}">${esc(fillVars(v, vars))}</strong></p>`).join('')}${url ? `<p style="margin:10px 0 0"><a href="${esc(url)}" style="color:${P.brand};font-weight:600;font-size:14px">${lang === 'bn' ? 'পার্সেল কোথায় দেখুন →' : 'Track your parcel →'}</a></p>` : ''}</td></tr></table>`);
    }
    case 'info': {
      const rows = String(b.rows || '').split('\n').map((l) => l.split(/:(.+)/)).filter((x) => x[0] && x[0].trim());
      return td(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:${d.corners}px;border:1px solid ${P.line}">${rows.map(([k, v], i) => `<tr><td style="padding:10px 16px;font-size:14px;color:${P.muted};${i ? `border-top:1px solid ${P.line}` : ''}">${esc(fillVars(k.trim(), vars))}</td><td align="right" class="gc-t" style="padding:10px 16px;font-size:14px;font-weight:600;color:${P.text};${i ? `border-top:1px solid ${P.line}` : ''}">${esc(fillVars((v || '').trim(), vars))}</td></tr>`).join('')}</table>`);
    }
    case 'image': {
      const src = safeUrl(fillVars(b.src, vars));
      if (!src) return '';
      const img = `<img src="${esc(src)}" alt="${esc(fillVars(b.alt, vars))}" width="536" style="display:block;width:100%;height:auto;border-radius:${d.corners}px">`;
      const url = safeUrl(fillVars(b.url, vars));
      return td(url ? `<a href="${esc(url)}">${img}</a>` : img);
    }
    case 'divider': return `<tr><td style="padding:4px 32px 20px"><div style="height:1px;background:${P.line};line-height:1px;font-size:1px">&nbsp;</div></td></tr>`;
    case 'spacer': return `<tr><td style="height:${Math.max(4, Math.min(80, Number(b.size) || 16))}px;line-height:1px;font-size:1px">&nbsp;</td></tr>`;
    default: return '';
  }
}

/**
 * A whole email as HTML. design: DEFAULT_DESIGN fields · blocks: the email's parts · vars: {{variables}} ·
 * data: { lines, totals, total, products } · lang 'en' | 'bn' · dark: draw the dark version (preview) ·
 * kind 'service' | 'offer' (offers get the unsubscribe line).
 */
/** An email for a preview frame: always white (light) unless `dark` is asked for, whatever the computer's mode. */
export function previewHtml(html, dark = false) {
  return String(html || '')
    .replace(/@media \(prefers-color-scheme:dark\)\{(?:[^{}]*\{[^{}]*\})*\}/g, '')
    .replace(/<meta name="color-scheme" content="[^"]*">/, `<meta name="color-scheme" content="${dark ? 'dark' : 'light'}">`)
    .replace(/<meta name="supported-color-schemes" content="[^"]*">/, `<meta name="supported-color-schemes" content="${dark ? 'dark' : 'light'}">`);
}

export function renderEmail({ design = {}, blocks = [], vars = {}, data = SAMPLE_DATA, lang = 'en', dark = false, preheader = '', subject = '', kind = 'service' } = {}) {
  const d = { ...DEFAULT_DESIGN, ...design, social: { ...DEFAULT_DESIGN.social, ...(design.social || {}) } };
  const L = { bg: d.bg, card: d.card, text: d.text, muted: d.muted, line: '#e5e9f0', soft: '#f1f4f9' };
  const P = { ...(dark ? PALETTE_DARK : L) };
  P.brand = dark ? d.accent : d.primary;   // brand-coloured text stays readable on the dark card
  const ctx = { d, vars, data: data || {}, P, lang };
  const name = esc(fillVars(d.brandName, vars));
  const logo = safeUrl(d.logo);
  const band = d.header === 'band';
  const mark = logo ? `<img src="${esc(logo)}" height="36" alt="${name}" style="display:inline-block;height:36px;width:auto;border:0">` : `<span style="font-size:20px;font-weight:700;color:${band ? onColor(d.primary) : P.brand}">${name}</span>`;
  const head = band
    ? `<tr><td align="center" style="padding:22px 32px;background:${d.primary};border-radius:${d.corners}px ${d.corners}px 0 0">${mark}</td></tr>`
    : `<tr><td align="${d.header === 'center' ? 'center' : 'left'}" style="padding:26px 32px 18px">${mark}</td></tr>`;
  const socials = Object.entries(d.social || {}).filter(([, u]) => safeUrl(u)).map(([k, u]) => `<a href="${esc(safeUrl(u))}" style="color:${P.muted};text-decoration:underline;margin:0 6px">${{ facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', whatsapp: 'WhatsApp' }[k]}</a>`).join('');
  const contact = [d.address, d.phone, d.email].filter(Boolean).map((x) => esc(fillVars(x, vars))).join(' · ');
  const unsub = kind === 'offer' && d.showUnsubscribe ? `<p style="margin:8px 0 0"><a href="{{unsubscribe_url}}" style="color:${P.muted};text-decoration:underline">${lang === 'bn' ? 'এ ধরনের ইমেইল আর চাই না' : 'Unsubscribe from offers'}</a></p>` : '';
  const body = blocks.map((b) => blockHtml(b, ctx)).join('');
  const font = fontOf(d, lang);
  return `<!doctype html><html lang="${lang === 'bn' ? 'bn' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${esc(fillVars(subject, vars))}</title>${lang === 'bn' ? '<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">' : d.font === 'poppins' ? '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">' : ''}<style>body{margin:0;padding:0}a{color:${d.primary}}@media (max-width:620px){.gc-wrap{width:100%!important}.gc-pad{padding-left:16px!important;padding-right:16px!important}}${dark ? '' : `@media (prefers-color-scheme:dark){body,.gc-bg{background:${PALETTE_DARK.bg}!important}.gc-card{background:${PALETTE_DARK.card}!important}.gc-t{color:${PALETTE_DARK.text}!important}}`}</style></head>`
    + `<body class="gc-bg" style="margin:0;padding:0;background:${P.bg};font-family:${font}"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(fillVars(preheader, vars))}</div>`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="gc-bg" style="background:${P.bg}"><tr><td align="center" class="gc-pad" style="padding:24px 12px">`
    + `<table role="presentation" width="600" cellpadding="0" cellspacing="0" class="gc-wrap gc-card" style="width:600px;max-width:600px;background:${P.card};border-radius:${d.corners}px">${head}${body}<tr><td style="height:12px"></td></tr></table>`
    + `<table role="presentation" width="600" cellpadding="0" cellspacing="0" class="gc-wrap" style="width:600px;max-width:600px"><tr><td align="center" style="padding:18px 24px;font-size:12px;line-height:1.6;color:${P.muted}">${socials ? `<p style="margin:0 0 8px">${socials}</p>` : ''}<p style="margin:0">${esc(fillVars(d.footerText, vars))}</p>${contact ? `<p style="margin:4px 0 0">${contact}</p>` : ''}${unsub}</td></tr></table>`
    + `</td></tr></table></body></html>`;
}

/** The plain-text part: what an email client without HTML shows. */
export function plainText(blocks = [], vars = {}, data = SAMPLE_DATA) {
  const out = [];
  const t = (s) => fillVars(s, vars).replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
  blocks.forEach((b) => {
    if (b.type === 'heading' || b.type === 'text') out.push(t(b.text));
    else if (b.type === 'button') out.push(`${t(b.label)}: ${t(b.url)}`);
    else if (b.type === 'order') { out.push(t(b.title)); (data.lines || []).forEach((l) => out.push(`- ${l.name} × ${l.qty}  ${l.price}`)); (data.totals || []).forEach(([k, v]) => out.push(`${k}: ${v}`)); if (data.total) out.push(`${data.total[0]}: ${data.total[1]}`); }
    else if (b.type === 'coupon') out.push(`${t(b.title)}: ${t(b.code)}${b.text ? ' (' + t(b.text) + ')' : ''}`);
    else if (b.type === 'tracking') out.push([t(b.courier), t(b.tracking), t(b.url)].filter((x) => x.trim()).join(' · '));
    else if (b.type === 'info') out.push(t(b.rows));
    else if (b.type === 'products') (data.products || []).slice(0, Number(b.count) || 3).forEach((p) => out.push(`- ${p.name} ${p.price}`));
  });
  return out.filter((x) => String(x).trim()).join('\n\n');
}

/** An old plain email body → blocks: a link on its own line becomes a button, the rest text. */
export function blocksFromText(body = '') {
  const parts = String(body).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const out = [];
  parts.forEach((p) => {
    const lines = p.split('\n');
    const link = lines.find((l) => /^\{\{[a-z_]*(link|url)\}\}$/.test(l.trim()) || /^https?:\/\/\S+$/.test(l.trim()));
    const rest = lines.filter((l) => l !== link).join('\n').trim();
    if (rest) out.push(newBlock('text', { text: rest }));
    if (link) out.push(newBlock('button', { label: /payment|pay/.test(link) ? 'Pay now' : /track/.test(link) ? 'Track your order' : 'Open', url: link.trim() }));
  });
  return out;
}

/** '' or what is wrong with an email before it can be saved. */
export function emailProblem({ subject, blocks }) {
  if (!String(subject || '').trim()) return 'Write a subject.';
  if (!(blocks || []).length) return 'Add at least one part.';
  const bad = (blocks || []).find((b) => b.type === 'button' && !String(b.url || '').trim());
  if (bad) return 'A button needs a link.';
  return '';
}
