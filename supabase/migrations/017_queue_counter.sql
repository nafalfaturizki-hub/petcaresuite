-- 017_queue_counter.sql

create table if not exists queue_counters (
  date date primary key,
  counter int not null default 0
);

alter table if exists queue_counters enable row level security;

-- Owner can do everything.
create policy queue_counters_owner_full on queue_counters for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
);

-- Staff and doctor can select.
create policy queue_counters_staff_select on queue_counters for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'staff')
);

create policy queue_counters_doctor_select on queue_counters for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'doctor')
);

-- Staff may insert/update.
create policy queue_counters_staff_write on queue_counters for insert, update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'staff')
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'staff')
);
