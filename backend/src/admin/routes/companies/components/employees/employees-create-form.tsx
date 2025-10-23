import {
  Button,
  CurrencyInput,
  Drawer,
  Input,
  Label,
  Text,
} from "@medusajs/ui";
import { useState } from "react";
import { AdminCreateEmployee, QueryCompany } from "../../../../../types";
import { CoolSwitch } from "../../../../components/common";
import { currencySymbolMap } from "../../../../utils";

export function EmployeesCreateForm({
  handleSubmit,
  loading,
  error,
  company,
}: {
  handleSubmit: (data: AdminCreateEmployee) => Promise<void>;
  loading: boolean;
  error: Error | null;
  company: QueryCompany;
}) {
  const [formData, setFormData] = useState<
    Omit<AdminCreateEmployee, "spending_limit"> & {
      spending_limit: string;
    }
  >({
    company_id: company.id,
    is_admin: false,
    spending_limit: "0",
    customer_id: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    setFormData({ ...formData, [e.target.name]: value });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const spendingLimit = formData.spending_limit
      ? parseInt(formData.spending_limit)
      : 0;

    const data = {
      ...formData,
      spending_limit: spendingLimit,
    };

    handleSubmit(data);
  };

  return (
    <form onSubmit={onSubmit}>
      <Drawer.Body className="flex flex-col p-4 gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="h2-core">Details</h2>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Prénom
            </Label>
            <Input
              type="text"
              name="first_name"
              onChange={handleChange}
              placeholder="Jean"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Nom
            </Label>
            <Input
              type="text"
              name="last_name"
              onChange={handleChange}
              placeholder="Dupont"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Email
            </Label>
            <Input
              type="email"
              name="email"
              onChange={handleChange}
              placeholder="mail@exemple.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Téléphone
            </Label>
            <Input
              type="text"
              name="phone"
              onChange={handleChange}
              placeholder="0612345678"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="h2-core">Permissions</h2>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Limite de dépense ({company.currency_code?.toUpperCase() || "USD"})
            </Label>
            <CurrencyInput
              symbol={currencySymbolMap[company.currency_code || "USD"]}
              code={company.currency_code || "USD"}
              type="text"
              name="spending_limit"
              value={formData.spending_limit ? formData.spending_limit : ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  spending_limit: e.target.value.replace(/[^0-9]/g, ""),
                })
              }
              placeholder="1000"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Accès Administrateur
            </Label>
            <CoolSwitch
              fieldName="is_admin"
              label="Is Admin"
              description="Activez pour donner l'accès admin"
              checked={formData.is_admin || false}
              onChange={(checked) =>
                setFormData({ ...formData, is_admin: checked })
              }
              tooltip="Les Admins peuvent gérer les détails de la société et les permissions des employés."
            />
          </div>
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Drawer.Close asChild>
          <Button variant="secondary">Annuler</Button>
        </Drawer.Close>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
        {error && <Text className="text-red-500">{error.message}</Text>}
      </Drawer.Footer>
    </form>
  );
}
