'use client';
// MeetingProvider — how a meeting happens, with the real logo for video: Zoom (its wordmark) and Google Meet (its mark +
// name); a phone call, the shop or the office keep their icon. Used by Customers › Meetings, the super admin's meetings
// and the meeting forms (provider ids 'zoom', 'meet', 'phone', 'visit', 'office').
//   <ProviderLogo id size />   just the mark (size = its height in px)
//   <ProviderTag id label />   a quiet pill: the mark and the name (Zoom shows only its wordmark, which is its name)

import React from 'react';
import { Icon } from '@/runtime/dc';

export const ZOOM_SRC = '/assets/brands/zoom.png';
export const MEET_SRC = '/assets/brands/google-meet.svg';
const ICONS = { phone: 'phone', visit: 'store', office: 'building' };

export function ProviderLogo({ id, size = 16, alt = '' }) {
  if (id === 'zoom') return <img src={ZOOM_SRC} alt={alt} style={{ height: Math.round(size * 0.85), width: 'auto', display: 'block', flex: 'none' }} />;
  if (id === 'meet') return <img src={MEET_SRC} alt={alt} style={{ height: size, width: 'auto', display: 'block', flex: 'none' }} />;
  return <Icon name={ICONS[id] || 'video'} width={size} height={size} aria-hidden="true" />;
}

const PILL = { display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 22, padding: '2px 8px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', background: 'var(--surface-card)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--text-body)', whiteSpace: 'nowrap' };

export function ProviderTag({ id, label }) {
  return (
    <span style={PILL}>
      <ProviderLogo id={id} size={14} alt={id === 'zoom' ? label || 'Zoom' : ''} />
      {id === 'zoom' ? null : <span>{label}</span>}
    </span>
  );
}
