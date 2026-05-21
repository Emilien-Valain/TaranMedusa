import { Migration } from '@mikro-orm/migrations';

export class Migration20260520153842 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "shipping_weight_profile" ("id" text not null, "name" text not null, "description" text null, "free_shipping_threshold" numeric null, "currency_code" text not null default 'eur', "is_active" boolean not null default true, "raw_free_shipping_threshold" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shipping_weight_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipping_weight_profile_deleted_at" ON "shipping_weight_profile" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "shipping_weight_tier" ("id" text not null, "min_weight" integer not null, "max_weight" integer not null, "price" numeric not null, "profile_id" text not null, "raw_price" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shipping_weight_tier_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipping_weight_tier_profile_id" ON "shipping_weight_tier" (profile_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipping_weight_tier_deleted_at" ON "shipping_weight_tier" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "shipping_weight_tier" add constraint "shipping_weight_tier_profile_id_foreign" foreign key ("profile_id") references "shipping_weight_profile" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "shipping_weight_tier" drop constraint if exists "shipping_weight_tier_profile_id_foreign";`);

    this.addSql(`drop table if exists "shipping_weight_profile" cascade;`);

    this.addSql(`drop table if exists "shipping_weight_tier" cascade;`);
  }

}
