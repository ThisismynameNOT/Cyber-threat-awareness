# Cyber Threat Awareness

Hungarian cybersecurity awareness materials for a small family exercise: three Outlook EML messages with embedded artwork and a warning page followed by practical education.

**Website:** https://thisismynamenot.github.io/Cyber-threat-awareness/

**Email previews and downloads:** https://thisismynamenot.github.io/Cyber-threat-awareness/templates/

**Private results:** https://thisismynamenot.github.io/Cyber-threat-awareness/results/ (owner access key required)

| Topic | Email | Page |
| --- | --- | --- |
| December travel from Bratislava to Spain | [utazas.eml](emails/utazas.eml) | [Travel](https://thisismynamenot.github.io/Cyber-threat-awareness/utazas/) |
| Fictional political news from Bratislava | [politika.eml](emails/politika.eml) | [Politics](https://thisismynamenot.github.io/Cyber-threat-awareness/politika/) |
| Piano teacher and score exercise | [zongora.eml](emails/zongora.eml) | [Piano](https://thisismynamenot.github.io/Cyber-threat-awareness/zongora/) |

All three links open the preserved Hungarian warning and education page. The skull, warning wording, red and black design, simulation disclosure, and educational anchor button remain. No visitor sign-in form or real credential collection is included. The old ChatGPT Site was deleted on October 18, 2026; this repository has no runtime dependency on it.

## Outlook

Download an EML from the template page and open it in Outlook. If it opens read-only, use Forward to compose an editable copy. Select your Gmail sender account, remove any forwarding header, and send yourself a test first. Images are embedded; fonts use system fallbacks. No sender or recipients are preset. Actual Outlook rendering depends on the client and has not been tested here.

Each email and landing page discloses that the exercise records page loads and educational-button use. Existing topic links still work.

## Click recording

GitHub Pages serves the static frontend. The active collector runs in a separate **Supabase Free** project, `iijkbeclmrvfejqogxey`, in EU Central. No paid upgrade was selected. The source and schema are in [supabase/](supabase/).

- Each topic maps to an opaque link ID in `docs/tracking-config.json`.
- A successful page load records `visit`; the first educational-button activation on that load records `education`.
- Only the opaque ID, event type, random event UUID, and server timestamp enter the application database. No names, email addresses, passwords, IP addresses, browser strings, or cookies are stored by application code. Infrastructure can have operational logs.
- Duplicate submissions with the same event UUID are ignored. Repeat page loads count separately.
- `/results/` is a public static shell; results require a separate owner key. The key is never included in GitHub, URLs, browser storage, or cookies. It stays in memory until Lock or the page is closed. The database holds only its SHA-256 hash.
- The root page uses a separate `teszt` counter. Use it to test both actions without affecting campaign totals.

Counts measure requests, not unique people. Scanners, forwarding, repeated visits, blocked JavaScript, and network failures can affect totals. Educational-button use does not prove the notes were read. Current links identify topics, not individual recipients.

To disable collection, set `enabled` to `false`, rebuild and publish. Backend infrastructure must remain available for recording; a static Pages website alone cannot save events. Supabase may pause a Free project after low activity over a seven-day period; restore it in Supabase Studio and test before starting a later campaign. Free project availability and limits are governed by [Supabase's plan](https://supabase.com/docs/guides/platform/billing-on-supabase).

## Backend maintenance

`supabase/schema.sql` is the already-applied initial schema, not a repeatable reset script. It creates private RLS-enabled tables and service-role-only RPCs. No anonymous policies are intentional: visitors use the validated Edge Function, never the tables directly.

The Edge Function is deployed as `awareness-tracker`, with platform JWT verification disabled because it implements its own owner-key validation for results and accepts constrained anonymous event writes. It uses server-provided Supabase secrets; no service key is in this repository. Deploy `supabase/functions/awareness-tracker/index.ts` with its sibling files after changes.

Owner-key recovery/rotation requires an administrator to generate a new random key, replace the single `tracking_private.owner_access.key_hash` value with its SHA-256 hash, and deliver the new key privately. Do not put it in this repo or the public config.

The [legacy Cloudflare backend](backend/) is retained for reference and is not the active service. Its older payload differs from the current collector.

## GitHub Pages and Actions storage

Publish `main` → `/docs` through **Settings → Pages → Deploy from a branch**. `.nojekyll` preserves static HTML. No dependency install or custom workflow is required.

Click events are stored in Supabase, not Actions artifacts. The account's Actions budget was already $0 with paid usage blocked when checked on October 18, 2026; no billing settings were changed. This repository's then-current Pages artifact was about 1.1 MiB with a one-day expiry. The account-wide storage warning includes other Actions artifacts and shared storage; it is not a click counter limit. Deleting artifacts stops future accrual but does not erase storage usage already accrued during the billing cycle. See [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

## Rebuild and verify

Python 3.10+ builds EMLs with the standard library. Node 24+ runs the backend and browser-script tests. No package installation is needed.

```sh
python3 scripts/build.py
python3 -m unittest discover -s tests -v
node --test tests/*.test.mjs
```

Edit `site/landing.html` for the shared warning and `emails/source/` for email content. The builder updates routes, previews, downloads, and EMLs with deterministic MIME boundaries and the active tracking disclosure.

[Framework research](project-notes/awareness-frameworks.md) remains available. No third-party phishing framework is installed. The political story is fictional and labeled.
