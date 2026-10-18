import { createHandler } from './handler.mjs';

const url = Deno.env.get('SUPABASE_URL');
const secrets = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
const key = secrets.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

async function rpc(name: string, args: Record<string, string>) {
  if (!url || !key) throw new Error('Backend configuration unavailable');
  const headers: Record<string, string> = { apikey: key, 'Content-Type': 'application/json' };
  if (!key.startsWith('sb_secret_')) headers.Authorization = 'Bearer ' + key;
  const response = await fetch(url + '/rest/v1/rpc/' + name, {
    method: 'POST', headers, body: JSON.stringify(args), signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Database request failed');
  return response.json();
}

Deno.serve(createHandler({
  record: (rid: string, event: string, eventId: string) => rpc('record_training_event', {
    p_rid: rid, p_event: event, p_event_id: eventId,
  }),
  results: (hash: string) => rpc('training_results', { p_owner_hash: hash }),
}));
