create schema if not exists tracking_private;
revoke all on schema tracking_private from public, anon, authenticated;
grant usage on schema tracking_private to service_role;

create table tracking_private.links (
  rid text primary key check (rid ~ '^[a-f0-9]{32}$'),
  alias text unique not null,
  label text not null,
  active boolean not null default true
);
create table tracking_private.events (
  event_id uuid primary key,
  rid text not null references tracking_private.links(rid),
  event_type text not null check (event_type in ('visit','education')),
  created_at timestamptz not null default now()
);
create index events_link_created on tracking_private.events(rid,created_at desc);
create table tracking_private.owner_access (
  id integer primary key check (id=1),
  key_hash text not null check (key_hash ~ '^[a-f0-9]{64}$')
);
alter table tracking_private.links enable row level security;
alter table tracking_private.events enable row level security;
alter table tracking_private.owner_access enable row level security;
revoke all on all tables in schema tracking_private from public, anon, authenticated;
grant select,insert,update,delete on all tables in schema tracking_private to service_role;

create function public.record_training_event(p_rid text,p_event text,p_event_id uuid)
returns boolean language plpgsql security invoker set search_path='' as $$
begin
  if p_event not in ('visit','education') or p_event_id is null then return false; end if;
  if not exists(select 1 from tracking_private.links where rid=p_rid and active) then return false; end if;
  insert into tracking_private.events(event_id,rid,event_type)
    values(p_event_id,p_rid,p_event) on conflict(event_id) do nothing;
  return true;
end;
$$;

create function public.training_results(p_owner_hash text)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare link_rows jsonb; recent_rows jsonb;
begin
  if not exists(select 1 from tracking_private.owner_access where id=1 and key_hash=p_owner_hash)
    then return null; end if;
  select coalesce(jsonb_agg(to_jsonb(t) order by t.alias),'[]'::jsonb) into link_rows from (
    select l.alias,l.label,l.rid,
      count(e.event_id) filter(where e.event_type='visit') as visits,
      count(e.event_id) filter(where e.event_type='education') as education,
      min(e.created_at) filter(where e.event_type='visit') as first_visit,
      max(e.created_at) filter(where e.event_type='visit') as last_visit,
      max(e.created_at) filter(where e.event_type='education') as last_education
    from tracking_private.links l left join tracking_private.events e on e.rid=l.rid
    group by l.alias,l.label,l.rid
  ) t;
  select coalesce(jsonb_agg(to_jsonb(t) order by t.created_at desc),'[]'::jsonb) into recent_rows from (
    select l.label,e.event_type,e.created_at from tracking_private.events e
    join tracking_private.links l on l.rid=e.rid order by e.created_at desc limit 50
  ) t;
  return jsonb_build_object('links',link_rows,'recent',recent_rows,'generatedAt',now());
end;
$$;

revoke all on function public.record_training_event(text,text,uuid) from public,anon,authenticated;
revoke all on function public.training_results(text) from public,anon,authenticated;
grant execute on function public.record_training_event(text,text,uuid) to service_role;
grant execute on function public.training_results(text) to service_role;
notify pgrst,'reload schema';
