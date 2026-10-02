import fs from 'node:fs';
import path from 'node:path';
import Screen from '@/screens/dev-reference/ProposalDoc';

export const metadata = { title: "Build vs proposal" };

// read when the page is built; the screen shows a note when the file is not in this checkout
export default function Page() {
  let md = null;
  try { md = fs.readFileSync(path.join(process.cwd(), 'docs', 'proposal-vs-build.md'), 'utf8'); } catch { /* not in this checkout */ }
  return <Screen md={md} />;
}
