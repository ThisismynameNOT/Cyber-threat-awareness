# Optional durable click counter

This backend is source-only. It has not been deployed to a user-owned backend account. GitHub Pages cannot execute it; analytics is disabled in the published Pages configuration until a separate endpoint is configured.

The Cloudflare Worker accepts only `{campaign,event}`. Allowed campaigns are `utazas-01`, `politika-01`, `zongora-01`, and `teszt`; allowed events are `visit` and `education`. Any other field is rejected. No visitor email, IP, password, browser string, cookies, or individual event history is stored by application code. Hosting infrastructure may have its own operational logs.

## Activation

1. In your own Cloudflare account, create a D1 database and apply `schema.sql` once.
2. Copy `wrangler.jsonc.example` to an untracked local `wrangler.jsonc`, replacing the database ID with the real value. Set `ADMIN_TOKEN` using Cloudflare's secret mechanism to a cryptographically random value of at least 32 characters; never put its value in GitHub, HTML, query strings, or the tracking configuration.
3. Deploy `worker.mjs` with the D1 binding `DB` and `ALLOWED_ORIGIN=https://thisismynamenot.github.io`.
4. Set `docs/tracking-config.json` to `{"enabled":true,"endpoint":"https://YOUR_DEPLOYED_WORKER/events"}` using the actual verified URL, then push the change. The frontend displays its tracking notice only when this configuration is active.
5. Check the separate test campaign first. Fetch `GET /results` from a trusted API client with `Authorization: Bearer <ADMIN_TOKEN>`. Results must return 401 without that secret.

See the official [Workers deployment documentation](https://developers.cloudflare.com/workers/get-started/guide/), [D1 binding guidance](https://developers.cloudflare.com/d1/get-started/), and [secret management](https://developers.cloudflare.com/workers/configuration/secrets/).

Counters measure requests, not verified humans. Forwarded email, repeated loads, bots that execute JavaScript, blocked JavaScript, and network failures can affect totals. Button activation does not prove the notes were read. Current campaign IDs distinguish the three email templates; they do not identify recipients. Recipient-specific copies need separate opaque IDs registered in both frontend and backend, with any identity mapping kept privately.
