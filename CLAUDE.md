@AGENTS.md

# Grid Commerce — working rules for Nayeem's copy (read before any change)

`AGENTS.md` above is Mostafiz vai's build guide (code style, files, patterns). Follow it. The rules below sit on top of it
and win where they differ.

## Separation
- Grid Commerce is a partnership product of GridGo Technologies. Never mix it with Space4Next, DeltaBox IT, Premium Tech
  Panda, Kioraa, NRxWEB or any other venture: no shared files, briefs, branding, people, data or decisions.

## Branches
- `handover/mostafiz-2026-10-12` is Mostafiz vai's handover exactly as received (12 Oct 2026). It is the frozen backup
  and the starting point. Never commit to it, rebase it, force-push it or delete it.
- `main` is our working copy (Nayeem + Claude). It started identical to the handover branch.
- Each piece of work goes on its own branch off `main`, named `nayeem/<short-topic>` (e.g. `nayeem/order-page`), and is
  merged into `main` when Nayeem approves it. Never commit straight to `main` except docs like this file.
- Future handovers from Mostafiz vai go to a new frozen branch `handover/mostafiz-<date>`; merging them into `main` is
  done only when Nayeem asks.

## Scope
- Front end and front-end logic only (screens, components, demo data, browser-side libs). Real backend, database, API
  and server work belong to Bablu vai: do not build or change them.
- Do not run `npm run convert`: it overwrites every hand-edited screen.

## Free plans only (hard limits — never cross them)
Netlify and GitHub stay on their free plans; upgrading is not an option.
- Netlify Free = 300 credits a month, hard stop. When they run out, every page of the site shows "Site not available"
  until the next month. A successful production deploy (a push to `main`) costs 15 credits; branch deploys and deploy
  previews cost 0; failed deploys cost 0. Traffic also costs credits (20 per GB of bandwidth, 2 per 10,000 requests).
- So: all day-to-day work is pushed to `nayeem/*` branches (free previews). `main` is updated only at milestones Nayeem
  approves, in batches: at most 8 pushes to `main` a month (120 credits), leaving the rest for traffic. "A month" is Netlify's billing
  period, the 13th to the 12th (credits reset on the 13th), not the calendar month.
- Docs-only commits to `main` carry `[skip netlify]` in the message so they do not build.
- Never add build plugins, scheduled functions, background functions, image CDN transforms or anything else that bills
  compute. Don't share the preview link publicly (traffic costs credits); send it only to the partners.
- Before merging to `main`, ask Nayeem to glance at Netlify › Usage & billing if the billing period is past its middle
  (after the 27th or so).
- GitHub Free: private repo, no GitHub Actions, no Git LFS, no Packages. No file over 50 MB, no archives, build output or
  node_modules in the repo; keep the repo well under 1 GB.

## Deploys
- Never deploy to, link or change Mostafiz vai's Netlify sites (gricommerce-online, gricommerce-retail-wholesale,
  gricommerce-retail-online, gricommerce-final, gridc-backend, gridcomshopifyv1) or push to his repo
  `mrahmaanshanto/gricommercevfinal`.
- Our own preview is https://gridcommerce-studio.netlify.app (Netlify project `gridcommerce-studio`, team "Grid Commerce",
  a separate free Netlify account from Space4Next; public). `main` = our approved latest; each `nayeem/*` branch gets
  its own preview link (`<branch-with-dashes>--gridcommerce-studio.netlify.app`).

## Handing work to Mostafiz vai (local files, not GitHub)
- Mostafiz vai does not get repo access. Work goes to him as a handover package he feeds to his own Claude.
- Every change gets an entry in `docs/changes-nayeem.md`: date, branch, what changed and why, files touched, how to see it.
- Package = one zip `GridCommerce-update-<YYYY-MM-DD>.zip`, built against the handover branch he last gave us
  (now `handover/mostafiz-2026-10-12`), containing:
  - `README-for-Claude.md`: what changed and why (from the change log), the base it was made against, how to apply it,
    what to check after, and a ready prompt for his Claude;
  - `changes.patch`: `git diff --binary <handover branch>..main` (applies with `git apply --3way`);
  - `files/`: full copies of every new or changed file at its repo path (for applying by hand or if the patch conflicts);
  - `deleted.txt`: files removed, one path per line;
  - the batch's change-record PDF (below).
- The zip is sent to Nayeem as a file and, when his computer is linked, also saved outside the code folder. Nayeem passes
  it to Mostafiz vai. Never put the zip in the repo.

## Change records (one PDF per batch — required)
Nayeem must be able to trace every change without reading code. Every work batch produces a change-record PDF.
- Plain language (Nayeem's rule): every entry reads like a note to a shop owner, not a developer. Title ≤ 8 words.
  "Problem" = one sentence (≤ 20 words) about what the person saw or couldn't do. "Now" = one sentence (≤ 25 words)
  about what happens now. "Try it" = 2–4 short numbered steps. No file names, function names or code words in these;
  technical details (files, notes) go in small print at the bottom of the entry.
- Two kinds of entry, each keyed to its review ID where there is one (e.g. `ON-U5`; see `docs/review/`):
  - **Fix**: what was wrong · BEFORE screenshot · what was changed · AFTER screenshot · files touched · how to check it
    (route + steps) · status (done / partly done, with what is left).
  - **New feature**: why it was added (the need it answers) · screenshot(s) of the new feature · where to find it (menu
    path + route) · files added or touched · how to check it · status.
- Fair screenshots: BEFORE comes from the frozen handover branch, AFTER from the work branch; same route, same viewport
  (1440×900; add 390×844 only when the change affects phones), same demo user (`?as=`), same edition (`?edition=`),
  `?quiet=1`, and the same browser data. Crop to the part that changed when the page is long; mark the changed area
  with a box. A change with no visible effect (a calculation, a saved setting) shows the number or result that changed,
  or says "no visible change" with the check steps — never a meaningless screenshot.
- Small copy-only fixes go on one shared page as a table (where · old text · new text), not one screenshot pair each.
- The PDF also lists what was skipped or left partly done in the batch, and why. Nothing is hidden.
- Layout: cover (batch, date, branch, preview link, counts of fixes / new features / skipped) → index table → one page
  per entry → copy-fix table → skipped list.
- Storage: record data and images live in `docs/records/<batch>/` on the work branch (`record.json` + JPEG screenshots,
  1440 px wide, quality ~70, so a batch stays a few MB). The PDF is built from them with Playwright's print-to-PDF
  (no paid services), sent to Nayeem with SendUserFile, and put in the handover zip. The PDF itself is not committed.
- The generator lives in `tools/records/` (built in the first batch, reused after). Keep it simple: HTML template → PDF.

## Before calling anything done
- `npm run build`, `npx tsc --noEmit` and `npm run check:screens` pass, and the changed pages are checked in a browser.
  Never claim a result that was not observed.
- Keep the repo lean: no node_modules, build output, archives or duplicate copies.
