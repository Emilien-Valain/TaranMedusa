import { Migration } from '@mikro-orm/migrations';

export class Migration20260610152404 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "colissimo_config" ("id" text not null, "enabled" boolean not null default true, "api_key" text null, "contract_number" text null, "password" text null, "label_format" text null, "sender_name" text null, "sender_street" text null, "sender_street2" text null, "sender_zip" text null, "sender_city" text null, "sender_country" text null, "sender_phone" text null, "sender_email" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "colissimo_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_colissimo_config_deleted_at" ON "colissimo_config" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "colissimo_config" cascade;`);
  }

}
