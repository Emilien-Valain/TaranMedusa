/* Entity: Company */

export enum ModuleCompanySpendingLimitResetFrequency {
  NEVER = 'jamais',
  DAILY = 'quotidien',
  WEEKLY = 'hebdomadaire',
  MONTHLY = 'mensuel',
  YEARLY = 'annuel',
}

export enum ModuleSiretValidationStatus {
  NONE = 'none',
  PENDING = 'pending',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
}

export type ModuleCompany = {
  id: string
  name: string
  phone: string
  email: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  logo_url: string | null
  currency_code: string | null
  spending_limit_reset_frequency: ModuleCompanySpendingLimitResetFrequency
  siret: string | null
  siret_validation_status: ModuleSiretValidationStatus
  siret_validated_at: Date | null
  siret_insee_data: Record<string, any> | null
  siret_rejection_reason: string | null
  created_at: Date
  updated_at: Date
}

export type ModuleCreateCompany = {
  name: string
  phone: string
  email: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  logo_url: string | null
  currency_code: string
  spending_limit_reset_frequency: ModuleCompanySpendingLimitResetFrequency | null
}

export interface ModuleUpdateCompany extends Partial<ModuleCompany> {
  id: string
}

export type ModuleDeleteCompany = {
  id: string
}

/* Entity: Employee */

export interface ModuleEmployee {
  id: string
  spending_limit: number
  is_admin: boolean
  company_id: string
  created_at: Date
  updated_at: Date
}

export type ModuleCreateEmployee = {
  customer_id: string
  spending_limit: number
  is_admin: boolean
  company_id: string
}

export interface ModuleUpdateEmployee extends Partial<ModuleEmployee> {
  id: string
}

export type ModuleDeleteEmployee = {
  id: string
}
