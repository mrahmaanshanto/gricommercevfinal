'use client';
// Channels › Google Merchant Center (/google-merchant) — products on Google Search and Shopping. The page is
// ./ProductChannel.jsx (with the Issue column and Google's statuses: Approved, Limited, Disapproved).

import React from 'react';
import ProductChannel from './ProductChannel';

export default function GoogleMerchant() {
  return <ProductChannel ch="gmc" active="ch-gmc" screen="GoogleMerchant" />;
}
