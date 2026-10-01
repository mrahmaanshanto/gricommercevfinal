import { redirect } from 'next/navigation';

// The home link of every GridCommerce site opens sign-in, where the merchant chooses the system.
export default function Home() {
  redirect('/merchant-sign-in');
}
