'use client';
// QrCode — a QR code as an SVG (src/lib/qr.js makes the modules). Scales cleanly on screen and in print.

import React, { useMemo } from 'react';
import { qrMatrix, qrPath } from '@/lib/qr';

export function QrCode({ text, size = 96, label, quiet = 2, className = '' }) {
  const q = useMemo(() => { try { return qrPath(qrMatrix(text), quiet); } catch { return null; } }, [text, quiet]);
  if (!q) return null;
  return (
    <svg className={className} width={size} height={size} viewBox={`0 0 ${q.size} ${q.size}`} role="img" aria-label={label || `QR code: ${text}`} shapeRendering="crispEdges">
      <rect width={q.size} height={q.size} fill="#fff" />
      <path d={q.d} fill="#0f172a" />
    </svg>
  );
}
