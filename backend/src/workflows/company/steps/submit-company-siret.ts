import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";
import { COMPANY_MODULE } from "../../../modules/company";
import {
  ICompanyModuleService,
  ModuleSiretValidationStatus,
} from "../../../types";
import {
  isValidSiretFormat,
  isInseeConfigured,
  lookupSiret,
} from "../../../lib/insee-sirene";

type Input = {
  company_id: string;
  siret: string;
};

export const submitCompanySiretStep = createStep(
  "submit-company-siret",
  async (input: Input, { container }) => {
    const cleaned = input.siret.replace(/\s/g, "");

    if (!isValidSiretFormat(cleaned)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Le numéro SIRET fourni est invalide (14 chiffres requis, contrôle Luhn)"
      );
    }

    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    const [previousData] = await companyModule.listCompanies({
      id: input.company_id,
    });

    if (!previousData) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Company ${input.company_id} not found`
      );
    }

    let inseeData: Record<string, any> | null = null;
    let nextStatus: ModuleSiretValidationStatus =
      ModuleSiretValidationStatus.PENDING;
    let rejectionReason: string | null = null;

    if (isInseeConfigured()) {
      const result = await lookupSiret(cleaned);
      if (result.found) {
        inseeData = result.etablissement as unknown as Record<string, any>;
      } else {
        if ("etablissement" in result && result.etablissement) {
          inseeData = result.etablissement as unknown as Record<string, any>;
        }
        if (result.reason === "not_found") {
          nextStatus = ModuleSiretValidationStatus.REJECTED;
          rejectionReason = "SIRET introuvable dans la base INSEE";
        } else if (result.reason === "ceased") {
          nextStatus = ModuleSiretValidationStatus.REJECTED;
          rejectionReason =
            "Établissement marqué fermé par l'INSEE — à vérifier manuellement";
        }
      }
    }

    await companyModule.updateCompanies({
      id: input.company_id,
      siret: cleaned,
      siret_validation_status: nextStatus,
      siret_insee_data: inseeData,
      siret_rejection_reason: rejectionReason,
      siret_validated_at: null,
    });

    return new StepResponse(
      { status: nextStatus, insee_data: inseeData },
      previousData
    );
  },
  async (previousData, { container }) => {
    if (!previousData) return;
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);
    await companyModule.updateCompanies({
      id: previousData.id,
      siret: previousData.siret,
      siret_validation_status: previousData.siret_validation_status,
      siret_insee_data: previousData.siret_insee_data,
      siret_rejection_reason: previousData.siret_rejection_reason,
      siret_validated_at: previousData.siret_validated_at,
    });
  }
);
