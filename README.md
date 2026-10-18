# Cyber Threat Awareness

Hungarian cybersecurity awareness materials for a small family exercise: three designed Outlook EML messages, embedded artwork, and a warning page followed by practical education.

**Website:** https://thisismynamenot.github.io/Cyber-threat-awareness/

**Email previews and downloads:** https://thisismynamenot.github.io/Cyber-threat-awareness/templates/

| Topic | Email | Page |
| --- | --- | --- |
| December travel from Bratislava to Spain | [utazas.eml](emails/utazas.eml) | [Travel](https://thisismynamenot.github.io/Cyber-threat-awareness/utazas/) |
| Fictional political news from Bratislava | [politika.eml](emails/politika.eml) | [Politics](https://thisismynamenot.github.io/Cyber-threat-awareness/politika/) |
| Piano teacher and score exercise | [zongora.eml](emails/zongora.eml) | [Piano](https://thisismynamenot.github.io/Cyber-threat-awareness/zongora/) |

All three email links open the preserved Hungarian warning and education page. The skull, warning wording, red and black design, simulation disclosure, and educational anchor button are retained. No sign-in form is inserted into that path.

## Outlook

Download an EML from the template page and open it in Outlook. If it opens read-only, use Forward to compose an editable copy. Select your own Gmail sender account, remove the forwarding header if present, and send yourself a test before distributing it. Images are embedded in each EML; fonts use system fallbacks. No sender or recipients are preset. Actual Outlook client rendering has not been tested in this migration.

## GitHub Pages

Publish `main` → `/docs` from **Settings → Pages → Deploy from a branch**. `.nojekyll` keeps the static HTML unchanged. Changes to the publishing folder are served by Pages after the GitHub build succeeds. Only generated static content belongs in `docs/`.

The repository contains no runtime dependency on ChatGPT Sites. The previously hosted version is not deleted automatically.

## Tracking status

**Durable click tracking is currently disabled on GitHub Pages.** Pages has no application server or database, so the previous database counter cannot run there. The optional portable Worker and schema are included in [backend/](backend/). Configure a separate backend first; then enable `docs/tracking-config.json`. The public site never contains an owner secret or private results.

## Rebuild and verify

Python 3.10+ builds the EMLs using the standard library. Node 24+ runs the optional backend's SQLite tests. No package installation is needed for the website.

```sh
python3 scripts/build.py
python3 -m unittest discover -s tests -v
node --test tests/backend.test.mjs
```

Edit `site/landing.html` to change the shared landing page, and `emails/source/` for email layouts and plain text. `scripts/build.py` updates routes, previews, downloads, and EML files with deterministic MIME boundaries.

## Future sign-in exercise

[Framework research and the proposed mock sign-in flow](project-notes/awareness-frameworks.md) are included. No third-party campaign framework is installed, and no real credentials are requested or collected. The current political news story is fictional and labeled.
