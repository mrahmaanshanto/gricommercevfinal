// Payment provider marks. Providers keep their own brand colours (see the handoff rules).
// `variant="mark"` is a square tile for lists and buttons (Rocket shows its paper plane at 40px
// and below, where the wordmark is unreadable); `variant="full"` is the whole logo
// at a given height for checkout and "paid through" lines.
// Providers without a supplied logo yet fall back to a tile with their initials in brand colours
// (text at least 11px and 4.5:1 contrast, per the Impeccable detector).

const LOGOS = {
  rocket: { name: 'Rocket', full: '/assets/payments/rocket.png', mark: '/assets/payments/rocket-mark.png', small: '/assets/payments/rocket-plane.png' },
  eps: { name: 'EPS', full: '/assets/payments/eps.png', mark: '/assets/payments/eps-mark.png' },
  sslcommerz: { name: 'SSLCOMMERZ', full: '/assets/payments/sslcommerz.png', mark: '/assets/payments/sslcommerz-mark.png', fill: true },
};

const FALLBACK = {
  bkash: { name: 'bKash', text: 'bK', bg: '#c8105f', fg: '#fff' },
  nagad: { name: 'Nagad', text: 'Ng', bg: '#f6821f', fg: '#2b1400' },
  upay: { name: 'Upay', text: 'U', bg: '#0b3d91', fg: '#fff' },
};

/** Maps a label such as "Rocket ·01611-390155" or "SSLCommerz" to a provider key. */
export function paymentProviderOf(label) {
  const s = String(label || '').toLowerCase();
  if (s.startsWith('rocket')) return 'rocket';
  if (s.startsWith('sslcommerz')) return 'sslcommerz';
  if (s.startsWith('eps')) return 'eps';
  if (s.startsWith('bkash')) return 'bkash';
  if (s.startsWith('nagad')) return 'nagad';
  if (s.startsWith('upay')) return 'upay';
  return null;
}

export function PaymentLogo({ provider, variant = 'mark', size = 34, radius, style, decorative = false }) {
  const key = String(provider || '').toLowerCase();
  const logo = LOGOS[key];
  const alt = decorative ? '' : (logo || FALLBACK[key] || { name: provider }).name;

  if (variant === 'full' && logo) {
    return <img src={logo.full} alt={alt} style={{ height: size, width: 'auto', display: 'block', flex: 'none', ...style }} />;
  }

  const tile = {
    display: 'grid', placeItems: 'center', width: size, height: size, flex: 'none',
    borderRadius: radius ?? Math.round(size * 0.26), overflow: 'hidden', boxSizing: 'border-box', ...style,
  };

  if (logo) {
    if (logo.fill) return <img src={logo.mark} alt={alt} style={{ ...tile, objectFit: 'cover' }} />;
    return (
      <span role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : alt} style={{ ...tile, background: '#fff', border: '1px solid #e2e8f0', padding: Math.max(2, Math.round(size * 0.1)) }}>
        <img src={size <= 40 && logo.small ? logo.small : logo.mark} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
      </span>
    );
  }

  const fb = FALLBACK[key];
  if (!fb) return null;
  return (
    <span role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : alt} style={{ ...tile, background: fb.bg, color: fb.fg, fontSize: Math.max(11, Math.round(size * 0.34)), fontWeight: 600, letterSpacing: '.02em' }}>
      {fb.text}
    </span>
  );
}
