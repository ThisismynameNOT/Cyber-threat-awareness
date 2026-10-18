# Legacy Cloudflare alternative

This is an undeployed reference implementation from the first migration. **The active click collector uses Supabase**; see the repository [README](../README.md) and [supabase/](../supabase/) for the deployed source.

The Worker here accepts the older `{campaign,event}` payload. The current frontend sends `{rid,event,eventId}` to the Supabase Edge Function and includes a public alias-to-opaque-ID mapping. Do not point the current frontend at this Worker without adapting and testing the interface and deduplication first.

`worker.mjs`, `schema.sql`, and `wrangler.jsonc.example` are retained for possible future migration. They do not run on GitHub Pages and are not required by the deployed website. No Cloudflare account or paid service was created.
