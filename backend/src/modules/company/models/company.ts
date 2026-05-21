import { model } from "@medusajs/framework/utils";
import { Employee } from "./employee";

export const Company = model.define("company", {
  id: model
    .id({
      prefix: "comp",
    })
    .primaryKey(),
  name: model.text(),
  email: model.text(),
  phone: model.text().nullable(),
  address: model.text().nullable(),
  city: model.text().nullable(),
  state: model.text().nullable(),
  zip: model.text().nullable(),
  country: model.text().nullable(),
  logo_url: model.text().nullable(),
  currency_code: model.text().nullable(),
  spending_limit_reset_frequency: model
    .enum(["never", "daily", "weekly", "monthly", "yearly"])
    .default("monthly"),
  siret: model.text().nullable(),
  siret_validation_status: model
    .enum(["none", "pending", "validated", "rejected"])
    .default("none"),
  siret_validated_at: model.dateTime().nullable(),
  siret_insee_data: model.json().nullable(),
  siret_rejection_reason: model.text().nullable(),
  employees: model.hasMany(() => Employee),
});
