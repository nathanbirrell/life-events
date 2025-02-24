/* Replace with your SQL commands */

create table messaging_event_logs(
    id uuid default gen_random_uuid() primary key,
    message_id uuid not null,
    event_status text not null,
    event_type text not null,
    data jsonb,
    created_at timestamptz default now()
);

alter table messages add scheduled_at timestamptz;

create index messaging_event_logs_msgid_idx  on messaging_event_logs(message_id);