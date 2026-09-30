// BrandLogo — logos of the banks, wallets, payment gateways and couriers the shop works with.
// variant="tile" (default): a square white tile with the logo contained, for lists and cards.
// variant="full": the whole logo at a given height, for headers.
// Brands without a supplied logo show a tile with their initials in their colours.
import React from 'react';
import { Icon } from '@/runtime/dc';

const B = '/assets/brands/';
export const BRANDS = {
  bkash: { name: 'bKash', src: B + 'bkash.svg', pad: 0 },
  nagad: { name: 'Nagad', src: B + 'nagad.svg', pad: 0 },
  rocket: { name: 'Rocket', src: B + 'rocket.webp' },
  sslcommerz: { name: 'SSLCOMMERZ', src: B + 'sslcommerz.png' },
  eps: { name: 'EPS', src: B + 'eps.webp' },
  pathao: { name: 'Pathao', src: B + 'pathao.png', zoom: 1.35 },
  steadfast: { name: 'Steadfast', src: B + 'steadfast.png' },
  carrybee: { name: 'Carrybee', src: B + 'carrybee.png' },
  citybank: { name: 'City Bank', src: B + 'citybank.png' },
  bracbank: { name: 'BRAC Bank', src: B + 'bracbank.webp' },
  redx: { name: 'RedX', text: 'RX', bg: '#e11d2a', fg: '#fff' },
  dbbl: { name: 'Dutch-Bangla Bank', text: 'DBBL', bg: '#0b7a3e', fg: '#fff' },
  card: { name: 'Card', icon: 'credit-card', bg: 'var(--fill-primary-soft)', fg: 'var(--primary)' },
  cash: { name: 'Cash', icon: 'banknote', bg: 'var(--fill-success-soft)', fg: 'var(--text-success)' },
  safe: { name: 'Safe', icon: 'vault', bg: 'var(--fill-warning-soft)', fg: 'var(--text-warning)' },
  drawer: { name: 'Counter drawer', icon: 'inbox', bg: 'var(--fill-info-soft)', fg: 'var(--text-info)' },
};

export function BrandLogo({ brand, size = 36, variant = 'tile', decorative = false, style }) {
  const b = BRANDS[brand] || { name: brand, text: String(brand || '?').slice(0, 2).toUpperCase(), bg: 'var(--surface-subtle)', fg: 'var(--text-body)' };
  const alt = decorative ? '' : b.name;
  if (variant === 'full' && b.src) return <img src={b.src} alt={alt} style={{ height: size, width: 'auto', display: 'block', flex: 'none', ...style }} />;
  const tile = { display: 'grid', placeItems: 'center', width: size, height: size, flex: 'none', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxSizing: 'border-box', ...style };
  if (b.src) {
    return (
      <span role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : alt} style={{ ...tile, background: '#fff', border: '1px solid var(--border-subtle)', padding: b.pad === 0 ? 0 : Math.max(2, Math.round(size * 0.08)) }}>
        <img src={b.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', transform: b.zoom ? `scale(${b.zoom})` : undefined }} />
      </span>
    );
  }
  if (b.icon) return <span role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : alt} style={{ ...tile, background: b.bg, color: b.fg }}><Icon name={b.icon} width={Math.round(size * 0.5)} height={Math.round(size * 0.5)} aria-hidden="true" /></span>;
  return <span role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : alt} style={{ ...tile, background: b.bg, color: b.fg, fontSize: size < 30 ? 'var(--text-2xs)' : 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', letterSpacing: size < 30 ? 0 : '.02em' }}>{size < 30 && b.text.length > 3 ? b.text.slice(0, 2) : b.text}</span>;
}
