import { redirect } from 'next/navigation';

// Batch E: suppliers became vendors (Grid Shop › Vendors).
export default function Page() {
  redirect('/admin/grid-shop/vendors');
}
