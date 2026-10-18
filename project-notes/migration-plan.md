# GitHub Pages migration implementation plan

**Goal:** Move all current deliverables to ThisismynameNOT/Cyber-threat-awareness and publish the visitor-facing pages with GitHub Pages.

**Architecture:** Serve static HTML from main/docs. Keep the existing Hungarian warning, skull, education section, and anchor interaction. Rebuild three Outlook EML files with embedded images and GitHub Pages links. Keep optional durable tracking in a separate portable backend: GitHub Pages cannot execute the existing server or store its database.

**Constraints:** No mailbox sending; no real credential collection; visibly labeled exercises; no runtime dependency on ChatGPT Sites; no credentials or operational data committed; preserve repository contents if they appear during preparation.

## Tasks

- [ ] Write and run migration checks before generating pages and EML files.
- [ ] Stage the preserved landing page, three labeled email sources and images; implement a standard-library email builder.
- [ ] Add disabled-by-default optional analytics client and a separately deployable backend that accepts only campaign/event metadata; test persistence, CORS, and owner access.
- [ ] Document the hosting steps and awareness-framework research, with primary source links and limitations.
- [ ] Run the complete checks, review the repository, push to main without force, configure main/docs as the Pages source, and verify the public pages.

## Review focus

Project-path links must work below /Cyber-threat-awareness/. Embedded email images must not depend on a web image host. Tracking must never pretend to be active before its endpoint is configured. Owner results must not become public static files. The fictional political story must remain labeled.

Sign-in scope: research a future mock sign-in exercise; preserve the current email-click destination. No sign-in page or credential-capture package is installed in this migration.
