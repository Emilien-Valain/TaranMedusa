import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";
import { COMPANY_MODULE } from "../../../modules/company";
import {
  ICompanyModuleService,
  ModuleSiretValidationStatus,
} from "../../../types";

type Input = {
  company_id: string;
};

export const approveCompanySiretStep = createStep(
  "approve-company-siret",
  async (input: Input, { container }) => {
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

    if (!previousData.siret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Aucun SIRET n'a été soumis pour cette entreprise"
      );
    }

    const updated = await companyModule.updateCompanies({
      id: input.company_id,
      siret_validation_status: ModuleSiretValidationStatus.VALIDATED,
      siret_validated_at: new Date(),
      siret_rejection_reason: null,
    });

    return new StepResponse(updated, previousData);
  },
  async (previousData, { container }) => {
    if (!previousData) return;
    const companyModule =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);
    await companyModule.updateCompanies({
      id: previousData.id,
      siret_validation_status: previousData.siret_validation_status,
      siret_validated_at: previousData.siret_validated_at,
      siret_rejection_reason: previousData.siret_rejection_reason,
    });
  }
);
