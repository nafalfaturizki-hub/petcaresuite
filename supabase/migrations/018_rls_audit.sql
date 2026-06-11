-- 018_rls_audit.sql

-- Profiles policies
alter table if exists profiles enable row level security;
create policy if not exists profiles_owner_full on profiles for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
);
create policy if not exists profiles_user_select on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
  or auth.uid() = id
);
create policy if not exists profiles_user_update on profiles for update using (
  auth.uid() = id
) with check (
  auth.uid() = id
);

-- Settings policies
alter table if exists settings enable row level security;
create policy if not exists settings_owner_full on settings for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
);
create policy if not exists settings_no_access on settings for select using (false);

-- Modules policies
alter table if exists modules enable row level security;
create policy if not exists modules_authenticated_select on modules for select using (
  exists (select 1 from profiles p where p.id = auth.uid())
);
create policy if not exists modules_owner_update on modules for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
);

-- Owner_uploads policies
alter table if exists owner_uploads enable row level security;
create policy if not exists owner_uploads_owner_full on owner_uploads for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
);
create policy if not exists owner_uploads_customer_insert on owner_uploads for insert using (
  exists (
    select 1 from customers c
    join pets pet on pet.customer_id = c.id
    where c.id = customer_id and pet.id = pet_id and c.profile_id = auth.uid()
  )
) with check (
  exists (
    select 1 from customers c
    join pets pet on pet.customer_id = c.id
    where c.id = customer_id and pet.id = pet_id and c.profile_id = auth.uid()
  )
);
create policy if not exists owner_uploads_doctor_staff_select_update on owner_uploads for select, update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('doctor', 'staff'))
);
create policy if not exists owner_uploads_customer_select on owner_uploads for select using (
  exists (
    select 1 from customers c where c.id = customer_id and c.profile_id = auth.uid()
  )
);

-- Notifications_log policies
alter table if exists notifications_log enable row level security;
create policy if not exists notifications_log_owner_full on notifications_log for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
);
create policy if not exists notifications_log_staff_select on notifications_log for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'staff')
);
create policy if not exists notifications_log_customer_select on notifications_log for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'customer')
  and user_id = auth.uid()
);

-- Daily_observations policies
alter table if exists daily_observations enable row level security;
create policy if not exists daily_observations_owner_full on daily_observations for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
);
create policy if not exists daily_observations_staff_select on daily_observations for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'staff')
);
create policy if not exists daily_observations_doctor_select on daily_observations for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'doctor')
);
create policy if not exists daily_observations_customer_select on daily_observations for select using (
  exists (
    select 1 from inpatient_records ir
    join pets pet on pet.id = ir.pet_id
    join customers c on c.id = pet.customer_id
    where daily_observations.inpatient_record_id = ir.id and c.profile_id = auth.uid()
  )
);
