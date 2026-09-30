import { redirect } from 'next/navigation';

// Buying is done with purchase orders now.
export default function Page() {
  redirect('/new-po');
}
