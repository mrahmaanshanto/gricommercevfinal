import { redirect } from 'next/navigation';

// Wholesale no longer has its own screens: invoices are one list, made from New sale.
export default function Page() {
  redirect('/sales-invoices');
}
