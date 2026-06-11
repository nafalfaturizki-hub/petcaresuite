-- 016_fix_enums.sql

create type if not exists payment_method_enum_helper as enum ('cash', 'card', 'bank-transfer', 'e-wallet');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
    ALTER TYPE payment_method_enum_helper RENAME TO payment_method_enum;
  ELSIF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'payment_method_enum'
    AND enumlabel NOT IN ('cash', 'card', 'bank-transfer', 'e-wallet')
  ) OR NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'payment_method_enum'
    AND enumlabel IN ('cash', 'card', 'bank-transfer', 'e-wallet')
    GROUP BY t.oid
    HAVING count(*) = 4
  ) THEN
    ALTER TABLE IF EXISTS invoices ALTER COLUMN payment_method TYPE payment_method_enum_helper USING payment_method::text::payment_method_enum_helper;
    ALTER TABLE IF EXISTS invoices ALTER COLUMN payment_method_secondary TYPE payment_method_enum_helper USING payment_method_secondary::text::payment_method_enum_helper;
    DROP TYPE IF EXISTS payment_method_enum CASCADE;
    ALTER TYPE payment_method_enum_helper RENAME TO payment_method_enum;
  ELSE
    DROP TYPE IF EXISTS payment_method_enum_helper;
  END IF;
END;
$$;

alter table if exists invoices add column if not exists split_payment_detail jsonb;
alter table if exists invoices add column if not exists payment_method_secondary payment_method_enum;
