import { Migration } from '@mikro-orm/migrations';

export class Migration20260610115710 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "shipping_weight_profile" add column if not exists "colissimo_product_code" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "shipping_weight_profile" drop column if exists "colissimo_product_code";`);
  }

}
