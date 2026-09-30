// One place for money, date and time strings, so every screen prints them the same way.
// `locale: 'bn'` switches the digits to Bangla.

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "1,42,330" -> "১,৪২,৩৩০" */
export function toBnDigits(text) {
  return String(text).replace(/[0-9]/g, (d) => BN_DIGITS[d]);
}

function localise(text, locale) {
  return locale === 'bn' ? toBnDigits(text) : text;
}

/** Indian (lakh) grouping: 142330 -> "1,42,330". */
export function groupIndian(n, decimals = 0) {
  const neg = n < 0;
  const [int, frac] = Math.abs(Number(n) || 0).toFixed(decimals).split('.');
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return (neg ? '-' : '') + (rest ? rest + ',' : '') + last3 + (frac ? '.' + frac : '');
}

/** ৳ + lakh grouping: formatBDT(142330) -> "৳1,42,330". The only way amounts are written. */
export function formatBDT(n, { decimals = 0, locale = 'en' } = {}) {
  return localise('৳' + groupIndian(n, decimals), locale);
}

/** "7 Sep 2026" */
export function formatDate(date, { locale = 'en' } = {}) {
  const d = date instanceof Date ? date : new Date(date);
  return localise(`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`, locale);
}

/** "8:48 PM" — uppercase meridiem, always with minutes. */
export function formatTime(date, { locale = 'en' } = {}) {
  const d = date instanceof Date ? date : new Date(date);
  const h = d.getHours();
  const text = `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  return localise(text, locale);
}

export function formatDateTime(date, opts) {
  return `${formatDate(date, opts)}, ${formatTime(date, opts)}`;
}
