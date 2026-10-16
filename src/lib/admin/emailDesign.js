// admin/emailDesign — GridCommerce's own designed emails (Communications › Email design and each email template's
// designer; Batch B step 1). Uses the shared email kit (lib/email/emailKit.js, pure) and the comms store
// (data.emailDesign, template.design); never the merchant panel's libs.
//   PLATFORM_DESIGN · designOf(data) · designedOf(tpl) → { en: { subject, preheader, blocks }, bn: { … } }
//   renderTemplate(data, tpl, lang, { vars, dark })

import { DEFAULT_DESIGN, newBlock, blocksFromText, renderEmail } from '../email/emailKit.js';
import { VARIABLES } from './comms';

export const PLATFORM_DESIGN = {
  ...DEFAULT_DESIGN, brandName: 'GridCommerce', logo: '/assets/820d4a69b45ed8fa40c9bc6015985c0e.png', primary: '#003087', accent: '#009cde',
  header: 'left', footerText: 'GridCommerce · commerce for Bangladesh shops. You get this email about your store on GridCommerce.',
  address: 'Banani, Dhaka 1213', phone: '09678-112233', email: 'support@gridcommerce.com.bd',
  social: { facebook: 'https://facebook.com/gridcommerce', instagram: '', youtube: 'https://youtube.com/@gridcommerce', whatsapp: '' },
};
export const designOf = (data) => ({ ...PLATFORM_DESIGN, ...((data && data.emailDesign) || {}) });
export const PLATFORM_SAMPLE = Object.fromEntries(VARIABLES.map(([k, , v]) => [k, v]));

const SIGN_RE = /\n*(The GridCommerce team|GridCommerce টিম)\s*$/;
/** A template's email as parts: its own design, else made from its text (greeting, text, the link as a button). */
function fromText(side, lang) {
  const body = String((side && side.body) || '').replace(SIGN_RE, '').trim();
  const blocks = [newBlock('heading', { text: (side && side.subject) || '' })];
  blocksFromText(body).forEach((b) => {
    if (b.type === 'button') blocks.push({ ...b, label: lang === 'bn' ? 'খুলুন' : 'Open', url: b.url.replace('{{link}}', 'https://{{link}}') });
    else blocks.push(b);
  });
  blocks.push(newBlock('text', { text: lang === 'bn' ? 'GridCommerce টিম' : 'The GridCommerce team' }));
  return { subject: (side && side.subject) || '', preheader: String(body.split('\n').slice(1).join(' ')).slice(0, 110), blocks };
}
export function designedOf(tpl) {
  const d = (tpl && tpl.design) || {};
  const pick = (lang) => { const own = d[lang]; const src = lang === 'bn' && !(tpl.bn && tpl.bn.body) ? tpl.en : tpl[lang]; return own ? { ...own, subject: (tpl[lang] && tpl[lang].subject) || own.subject || '' } : fromText(src, lang); };
  return { en: pick('en'), bn: pick('bn') };
}
export function renderTemplate(data, tpl, lang = 'en', { vars, dark = false } = {}) {
  const e = designedOf(tpl)[lang === 'bn' ? 'bn' : 'en'];
  return renderEmail({ design: designOf(data), blocks: e.blocks, vars: vars || PLATFORM_SAMPLE, data: { lines: [], products: [] }, lang, dark, preheader: e.preheader, subject: e.subject, kind: tpl.purpose === 'promo' ? 'offer' : 'service' });
}
