-- seed.sql

insert into modules (id, key, is_enabled, updated_at) values
  (gen_random_uuid(), 'clinic', true, now()),
  (gen_random_uuid(), 'monitoring', true, now()),
  (gen_random_uuid(), 'inpatient', true, now()),
  (gen_random_uuid(), 'grooming', true, now()),
  (gen_random_uuid(), 'petshop', true, now()),
  (gen_random_uuid(), 'inventory', true, now()),
  (gen_random_uuid(), 'accounting', true, now()),
  (gen_random_uuid(), 'website', true, now())
on conflict (key) do update set is_enabled = excluded.is_enabled, updated_at = excluded.updated_at;

insert into settings (id, key, value, updated_at) values
  (gen_random_uuid(), 'clinic_profile', '{}'::jsonb, now()),
  (gen_random_uuid(), 'business_hours', '{}'::jsonb, now()),
  (gen_random_uuid(), 'invoice_settings', '{}'::jsonb, now()),
  (gen_random_uuid(), 'whatsapp_config', '{}'::jsonb, now()),
  (gen_random_uuid(), 'smtp_config', '{}'::jsonb, now()),
  (gen_random_uuid(), 'notification_templates', '{}'::jsonb, now())
on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at;

insert into species (id, name, created_at) values
  (gen_random_uuid(), 'Dog', now()),
  (gen_random_uuid(), 'Cat', now()),
  (gen_random_uuid(), 'Rabbit', now()),
  (gen_random_uuid(), 'Bird', now()),
  (gen_random_uuid(), 'Hamster', now())
on conflict (name) do nothing;

insert into breeds (id, species_id, name, created_at)
select gen_random_uuid(), s.id, name, now()
from species s
where s.name = 'Dog'
on conflict on constraint breeds_species_id_name_key do nothing;

with dogbreeds as (
  select unnest(array['Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Beagle', 'Poodle', 'Shih Tzu', 'Dachshund', 'Boxer', 'Cocker Spaniel']) as name
)
insert into breeds (id, species_id, name, created_at)
select gen_random_uuid(), s.id, d.name, now()
from species s
cross join dogbreeds d
where s.name = 'Dog'
on conflict on constraint breeds_species_id_name_key do nothing;

with catbreeds as (
  select unnest(array['Siamese', 'Persian', 'Maine Coon', 'Ragdoll', 'Bengal']) as name
)
insert into breeds (id, species_id, name, created_at)
select gen_random_uuid(), s.id, c.name, now()
from species s
cross join catbreeds c
where s.name = 'Cat'
on conflict on constraint breeds_species_id_name_key do nothing;

insert into grooming_services (id, name, description, price, is_active, created_at) values
  (gen_random_uuid(), 'Bath', 'Standard bath and dry', 250.00, true, now()),
  (gen_random_uuid(), 'Full Grooming', 'Bath, haircut, nail trim, and ear cleaning', 750.00, true, now()),
  (gen_random_uuid(), 'Flea Treatment', 'Flea and tick treatment', 300.00, true, now()),
  (gen_random_uuid(), 'Spa', 'Luxury spa treatment with conditioner', 950.00, true, now())
on conflict (name) do nothing;

insert into accounts (id, name, type, description, is_active, created_at) values
  (gen_random_uuid(), 'Revenue', 'revenue', 'Revenue account', true, now()),
  (gen_random_uuid(), 'COGS', 'expense', 'Cost of goods sold', true, now()),
  (gen_random_uuid(), 'Operating Expenses', 'expense', 'Operating expenses', true, now()),
  (gen_random_uuid(), 'Cash', 'asset', 'Cash asset account', true, now())
on conflict (name) do nothing;
