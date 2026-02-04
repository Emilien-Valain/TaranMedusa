import { Migration } from '@mikro-orm/migrations';

export class Migration20260204114406 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "invoice" ("id" text not null, "order_id" text not null, "display_id" serial, "status" text check ("status" in ('latest', 'outdated')) not null default 'latest', "pdf_content" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "invoice_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_invoice_deleted_at" ON "invoice" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "invoice_config" ("id" text not null, "company_name" text null, "company_logo" text null, "company_address" text null, "company_phone" text null, "company_email" text null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "invoice_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_invoice_config_deleted_at" ON "invoice_config" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "invoice" cascade;`);

    this.addSql(`drop table if exists "invoice_config" cascade;`);
  }

}
