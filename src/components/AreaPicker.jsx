'use client';
// AreaPicker — District → Area (thana / upazila) for a Bangladesh delivery address (ON-F10, lib/bdAreas.js). Picking
// an area tells the caller its courier zone ('dhaka' | 'sub' | 'outside'), so the delivery charge fills itself.
// Used on Create order, the order link page and the storefront checkout; each passes its own field classes, so the
// two selects look like the page's other fields. The "house, road" line stays a separate free-text field.
//   <AreaPicker district area onChange={({ district, area, zone }) => …} idPrefix="no" selectClass labelClass
//     required error />

import React from 'react';
import { DISTRICTS, areasOf, zoneOf } from '@/lib/bdAreas';

export function AreaPicker({ district = '', area = '', onChange, idPrefix = 'ap', selectClass = 'gc-input gc-select', labelClass = 'gc-label', required = false, error = '', disabled = false, gap = 'var(--space-3)' }) {
  const areas = district ? areasOf(district) : [];
  const set = (d, a) => onChange && onChange({ district: d, area: a, zone: d && a ? zoneOf(d, a) : d ? zoneOf(d, '') : '' });
  const star = required ? ' *' : '';
  return (
    <div className="gc-cols-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
        <label className={labelClass} htmlFor={idPrefix + '-district'} style={{ margin: 0 }}>District{star}</label>
        <select id={idPrefix + '-district'} className={selectClass} value={district} disabled={disabled} aria-required={required ? 'true' : undefined} aria-invalid={error && !district ? 'true' : undefined}
          onChange={(e) => set(e.target.value, '')}>
          <option value="">Choose district</option>
          {DISTRICTS.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
        <label className={labelClass} htmlFor={idPrefix + '-area'} style={{ margin: 0 }}>Area / thana{star}</label>
        <select id={idPrefix + '-area'} className={selectClass} value={area} disabled={disabled || !district} aria-required={required ? 'true' : undefined} aria-invalid={error && district && !area ? 'true' : undefined}
          onChange={(e) => set(district, e.target.value)}>
          <option value="">{district ? 'Choose area' : 'Choose district first'}</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
    </div>
  );
}

export default AreaPicker;
