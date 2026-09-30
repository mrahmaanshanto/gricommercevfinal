import { redirect } from 'next/navigation';

// "New sale" opens the POS register.
export default function Page() {
  redirect('/pos');
}
