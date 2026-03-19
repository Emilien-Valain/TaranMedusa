"use client"

import { currencySymbolMap } from "@/lib/constants"
import { signup } from "@/lib/data/customer"
import { LOGIN_VIEW } from "@/modules/account/templates/login-template"
import ErrorMessage from "@/modules/checkout/components/error-message"
import { SubmitButton } from "@/modules/checkout/components/submit-button"
import Input from "@/modules/common/components/input"
import { HttpTypes } from "@medusajs/types"
import { Checkbox, Label, Select, Text } from "@medusajs/ui"
import { ChangeEvent, useActionState, useState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  regions: HttpTypes.StoreRegion[]
}

interface FormData {
  email: string
  first_name: string
  last_name: string
  company_name: string
  password: string
  company_address: string
  company_city: string
  company_state: string
  company_zip: string
  company_country: string
  currency_code: string
}

const initialFormData: FormData = {
  email: "",
  first_name: "",
  last_name: "",
  company_name: "",
  password: "",
  company_address: "",
  company_city: "",
  company_state: "",
  company_zip: "",
  company_country: "",
  currency_code: "",
}

const placeholder = ({
  placeholder,
  required,
}: {
  placeholder: string
  required: boolean
}) => {
  return (
    <span className="text-ui-fg-muted">
      {placeholder}
      {required && <span className="text-ui-fg-error">*</span>}
    </span>
  )
}

const Register = ({ setCurrentView, regions }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isCompany, setIsCompany] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: keyof FormData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleIsCompanyChange = (checked: boolean) => {
    setIsCompany(checked)
    if (!checked) {
      setFormData((prev) => ({
        ...prev,
        company_name: "",
        company_address: "",
        company_city: "",
        company_state: "",
        company_zip: "",
        company_country: "",
        currency_code: "",
      }))
    }
  }

  const baseValid =
    termsAccepted &&
    !!formData.email &&
    !!formData.first_name &&
    !!formData.last_name &&
    !!formData.password

  const companyValid =
    !!formData.company_name &&
    !!formData.company_address &&
    !!formData.company_city &&
    !!formData.company_zip &&
    !!formData.company_country &&
    !!formData.currency_code

  const isValid = baseValid && (isCompany ? companyValid : true)

  const countries = regions
    .flatMap((region) =>
      region.countries?.map((country) => ({
        iso_2: country.iso_2,
        name: country?.display_name || country?.name || country?.iso_2,
      }))
    )
    .filter((c): c is { iso_2: string; name: string } => !!c && !!c.iso_2)

  const currencies = regions.map((region) => region.currency_code)

  return (
    <div
      className="max-w-sm flex flex-col items-start gap-2 my-8"
      data-testid="register-page"
    >
      <Text className="text-4xl text-neutral-950 text-left mb-4">
        {isCompany ? (
          <>
            Créer le compte
            <br />
            de votre société.
          </>
        ) : (
          <>
            Créer votre
            <br />
            compte.
          </>
        )}
      </Text>
      <form className="w-full flex flex-col" action={formAction}>
        <input type="hidden" name="is_company" value={isCompany ? "true" : "false"} />
        <div className="flex flex-col w-full gap-y-4">
          {/* Toggle entreprise */}
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <Checkbox
              id="is-company-checkbox"
              checked={isCompany}
              onCheckedChange={(checked) => handleIsCompanyChange(!!checked)}
            />
            <Label
              htmlFor="is-company-checkbox"
              className="flex flex-col !transform-none hover:cursor-pointer"
            >
              <span className="text-sm font-medium text-ui-fg-base">Vous représentez une entreprise</span>
              <span className="text-xs text-ui-fg-muted">Cochez cette case pour créer un compte professionnel</span>
            </Label>
          </div>

          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
            className="bg-white"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label="Prénom"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
            className="bg-white"
            value={formData.first_name}
            onChange={handleChange}
          />
          <Input
            label="Nom"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
            className="bg-white"
            value={formData.last_name}
            onChange={handleChange}
          />
          <Input
            label="Mot de passe"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
            className="bg-white"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Champs entreprise */}
          {isCompany && (
            <>
              <div className="border-t border-neutral-200 pt-2">
                <Text className="text-sm font-medium text-ui-fg-subtle mb-3">
                  Informations de la société
                </Text>
              </div>
              <Input
                label="Nom de la société"
                name="company_name"
                required
                autoComplete="organization"
                data-testid="company-name-input"
                className="bg-white"
                value={formData.company_name}
                onChange={handleChange}
              />
              <Input
                label="Adresse de la société"
                name="company_address"
                required
                autoComplete="address"
                data-testid="company-address-input"
                className="bg-white"
                value={formData.company_address}
                onChange={handleChange}
              />
              <Input
                label="Ville de la société"
                name="company_city"
                required
                autoComplete="city"
                data-testid="company-city-input"
                className="bg-white"
                value={formData.company_city}
                onChange={handleChange}
              />
              <Input
                label="Région de la société"
                name="company_state"
                autoComplete="state"
                data-testid="company-state-input"
                className="bg-white"
                value={formData.company_state}
                onChange={handleChange}
              />
              <Input
                label="Code postal de la société"
                name="company_zip"
                required
                autoComplete="postal-code"
                data-testid="company-zip-input"
                className="bg-white"
                value={formData.company_zip}
                onChange={handleChange}
              />
              <Select
                name="company_country"
                required
                autoComplete="country"
                data-testid="company-country-input"
                value={formData.company_country}
                onValueChange={handleSelectChange("company_country")}
              >
                <Select.Trigger className="rounded-full h-10 px-4">
                  <Select.Value
                    placeholder={placeholder({
                      placeholder: "Pays de la société",
                      required: true,
                    })}
                  />
                </Select.Trigger>
                <Select.Content>
                  {countries?.map((country) => (
                    <Select.Item key={country.iso_2} value={country.iso_2}>
                      {country.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Select
                name="currency_code"
                required
                autoComplete="currency"
                data-testid="company-currency-input"
                value={formData.currency_code}
                onValueChange={handleSelectChange("currency_code")}
              >
                <Select.Trigger className="rounded-full h-10 px-4">
                  <Select.Value
                    placeholder={placeholder({
                      placeholder: "Choisissez une devise",
                      required: true,
                    })}
                  />
                </Select.Trigger>
                <Select.Content>
                  {[...new Set(currencies)].map((currency) => (
                    <Select.Item key={currency} value={currency}>
                      {currency.toUpperCase()} ({currencySymbolMap[currency]})
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </>
          )}
        </div>
        <div className="border-b border-neutral-200 my-6" />
        <ErrorMessage error={message} data-testid="register-error" />
        <div className="flex items-center gap-2">
          <Checkbox
            name="terms"
            id="terms-checkbox"
            data-testid="terms-checkbox"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(!!checked)}
          ></Checkbox>
          <Label
            id="terms-label"
            className="flex items-center text-ui-fg-base !text-xs hover:cursor-pointer !transform-none"
            htmlFor="terms-checkbox"
            data-testid="terms-label"
          >
            J'accepte les conditions générales.
          </Label>
        </div>
        <SubmitButton
          className="w-full mt-6"
          data-testid="register-button"
          disabled={!isValid}
        >
          S'inscrire
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Déjà membre ? {" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.LOG_IN)}
          className="underline"
        >
          Se connecter

        </button>
        .
      </span>
    </div>
  )
}

export default Register
