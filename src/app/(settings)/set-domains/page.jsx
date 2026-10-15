import Screen from '@/screens/settings-console/SetHosting';

export const metadata = { title: "Domains" };

// Domains is a tab of Settings › Hosting now; this address opens it
export default function Page() {
  return <Screen tab="domains" />;
}
