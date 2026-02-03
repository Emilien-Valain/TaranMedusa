import { model } from "@medusajs/framework/utils";

export const Invoice = model.define("invoice", {
  id: model
    .id({
      prefix: "inv",
    })
    .primaryKey(),
  order_id: model.text(),
  display_id: model.autoincrement(),
  status: model.enum(["latest", "outdated"]).default("latest"),
  pdf_content: model.json().nullable(),
});
