import { redirect } from 'next/navigation';

// Replaced by the single POS register.
export default function Page() {
  redirect('/pos?panel=recent');
}
