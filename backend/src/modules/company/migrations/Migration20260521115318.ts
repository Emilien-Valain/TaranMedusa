import { Migration } from '@mikro-orm/migrations';

export class Migration20260521115318 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "company" add column if not exists "siret" text null, add column if not exists "siret_validation_status" text check ("siret_validation_status" in ('none', 'pending', 'validated', 'rejected')) not null default 'none', add column if not exists "siret_validated_at" timestamptz null, add column if not exists "siret_insee_data" jsonb null, add column if not exists "siret_rejection_reason" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "company" drop column if exists "siret", drop column if exists "siret_validation_status", drop column if exists "siret_validated_at", drop column if exists "siret_insee_data", drop column if exists "siret_rejection_reason";`);
  }

}
