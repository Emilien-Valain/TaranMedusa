import { Button, Drawer, Input, Label, Select, Text } from "@medusajs/ui";
import { AdminUpdateCompany } from "../../../../types";
import { useState } from "react";
import { useRegions } from "../../../hooks/api";

export function CompanyForm({
  company,
  handleSubmit,
  loading,
  error,
}: {
  company?: AdminUpdateCompany;
  handleSubmit: (data: AdminUpdateCompany) => Promise<void>;
  loading: boolean;
  error: Error | null;
}) {
  const [formData, setFormData] = useState<AdminUpdateCompany>(
    company || ({} as AdminUpdateCompany)
  );

  const { regions, isPending: regionsLoading } = useRegions();

  const currencyCodes = regions?.map((region) => region.currency_code);
  const countries = regions?.flatMap((region) => region.countries);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCurrencyChange = (value: string) => {
    setFormData({ ...formData, currency_code: value });
  };

  const handleCountryChange = (value: string) => {
    setFormData({ ...formData, country: value });
  };

  return (
    <form>
      <Drawer.Body className="p-4">
        <div className="flex flex-col gap-2">
          <Label size="xsmall">Nom de la Société</Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Medusa"
          />
          <Label size="xsmall">Téléphone de la Société</Label>
          <Input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="1234567890"
          />
          <Label size="xsmall">Email de la Société</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@mail.com"
          />
          <Label size="xsmall">Adresse de la Société</Label>
          <Input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            placeholder="10 rue Victor Hugo"
          />
          <Label size="xsmall">Ville de la Société</Label>
          <Input
            type="text"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            placeholder="Nantes"
          />
          <Label size="xsmall">Région de la Société</Label>
          <Input
            type="text"
            name="state"
            value={formData.state || ""}
            onChange={handleChange}
            placeholder="Pays de la Loire"
          />
          <Label size="xsmall">Code Postal de la Société</Label>
          <Input
            type="text"
            name="zip"
            value={formData.zip || ""}
            onChange={handleChange}
            placeholder="44000"
          />
          <div className="flex gap-4 w-full">
            <div className="flex flex-col gap-2 w-1/2">
              <Label size="xsmall">Pays de la Société</Label>
              <Select
                name="country"
                value={formData.country || ""}
                onValueChange={handleCountryChange}
                disabled={regionsLoading}
              >
                <Select.Trigger disabled={regionsLoading}>
                  <Select.Value placeholder="Choisissez un pays" />
                </Select.Trigger>
                <Select.Content className="z-50">
                  {countries?.map((country) => (
                    <Select.Item
                      key={country?.iso_2 || ""}
                      value={country?.iso_2 || ""}
                    >
                      {country?.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <Label size="xsmall">Devise</Label>

              <Select
                name="currency_code"
                value={formData.currency_code || ""}
                onValueChange={handleCurrencyChange}
                defaultValue={currencyCodes?.[0]}
                disabled={regionsLoading}
              >
                <Select.Trigger disabled={regionsLoading}>
                  <Select.Value placeholder="Choisissez une devise" />
                </Select.Trigger>

                <Select.Content className="z-50">
                  {currencyCodes?.map((currencyCode) => (
                    <Select.Item key={currencyCode} value={currencyCode}>
                      {currencyCode.toUpperCase()}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>
          {/* TODO: Add logo upload */}
          <Label size="xsmall">URL du Logo de la Société</Label>
          <Input
            type="text"
            name="logo_url"
            value={formData.logo_url || ""}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
          />
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Drawer.Close asChild>
          <Button variant="secondary">Annuler</Button>
        </Drawer.Close>
        <Button
          isLoading={loading}
          onClick={async () => await handleSubmit(formData)}
        >
          Enregistrer
        </Button>
        {error && (
          <Text className="txt-compact-small text-ui-fg-warning">
            Erreur : {error?.message}
          </Text>
        )}
      </Drawer.Footer>
    </form>
  );
}
