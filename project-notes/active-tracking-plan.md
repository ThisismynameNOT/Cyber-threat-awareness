# Activate GitHub Pages click recording

Goal: keep visitor pages on GitHub Pages, record anonymous link visits and educational-button use in a $0 Supabase project, and provide an owner-only results page.

Project: iijkbeclmrvfejqogxey (free organization; quoted $0/month). Old ChatGPT Site was explicitly deleted by the user and the delete operation succeeded.

Implementation:
- Register four opaque links (three campaigns plus a separate test link), retaining aliases already used in the EMLs.
- Store only opaque link IDs, event type, event UUID, and timestamps in a private schema with RLS; service-role-only RPCs handle writes and owner results.
- Edge Function validates input, known link capability, same-origin browser collection, request size, and owner access key for result reads. No credential fields are accepted.
- Keep the owner access key outside Git and deliver it privately. The public results shell does not contain results or the key.
- Test handler authorization, CORS, input rejection, deduplication and failure behavior; test the optional client by executing it; verify live persistence and browser interactions.
- Publish one focused GitHub commit and validate Pages deployment and live counters.

Billing findings: current Actions budget is $0 with Usage blocked, current billed amount $0, awareness Pages artifact 1,178,922 bytes and one-day expiry. No account billing settings changed.

Verification before publishing: live HTTP writes and protected reads passed. Unknown fields and foreign origins were rejected; duplicate UUID submissions increased the counter only once. Initial integration test produced one visit and one educational-button event in the separate test campaign; all three family campaign counters remained zero. SQL privilege checks confirmed anon cannot use the private schema or recording RPC, and authenticated cannot execute results RPC. The three RLS-with-no-policy advisor messages are expected for service-role-only private tables.
