import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import {
  adminApprovalSettingsQueryConfig,
  adminCompanyQueryConfig,
  adminEmployeeQueryConfig,
} from "./query-config";
import {
  AdminApproveSiret,
  AdminCreateCompany,
  AdminCreateEmployee,
  AdminGetApprovalSettingsParams,
  AdminGetCompanyParams,
  AdminGetEmployeeParams,
  AdminRejectSiret,
  AdminUpdateApprovalSettings,
  AdminUpdateCompany,
  AdminUpdateEmployee,
} from "./validators";

export const adminCompaniesMiddlewares: MiddlewareRoute[] = [
  /* Companies Middlewares */
  {
    method: ["GET"],
    matcher: "/admin/companies",
    middlewares: [
      validateAndTransformQuery(
        AdminGetCompanyParams,
        adminCompanyQueryConfig.list
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/companies",
    middlewares: [
      validateAndTransformBody(AdminCreateCompany),
      validateAndTransformQuery(
        AdminGetCompanyParams,
        adminCompanyQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/companies/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetCompanyParams,
        adminCompanyQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/companies/:id",
    middlewares: [
      validateAndTransformBody(AdminUpdateCompany),
      validateAndTransformQuery(
        AdminGetCompanyParams,
        adminCompanyQueryConfig.retrieve
      ),
    ],
  },

  /* Employees Middlewares */
  {
    method: ["GET"],
    matcher: "/admin/companies/:id/employees",
    middlewares: [
      validateAndTransformQuery(
        AdminGetEmployeeParams,
        adminEmployeeQueryConfig.list
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/companies/:id/employees",
    middlewares: [
      validateAndTransformBody(AdminCreateEmployee),
      validateAndTransformQuery(
        AdminGetEmployeeParams,
        adminEmployeeQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/companies/:id/employees/:employee_id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetEmployeeParams,
        adminEmployeeQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/companies/:id/employees/:employee_id",
    middlewares: [
      validateAndTransformBody(AdminUpdateEmployee),
      validateAndTransformQuery(
        AdminGetEmployeeParams,
        adminEmployeeQueryConfig.retrieve
      ),
    ],
  },
  /* Approval Settings Middlewares */
  {
    method: ["POST"],
    matcher: "/admin/companies/:id/approval-settings",
    middlewares: [
      validateAndTransformBody(AdminUpdateApprovalSettings),
      validateAndTransformQuery(
        AdminGetApprovalSettingsParams,
        adminApprovalSettingsQueryConfig.retrieve
      ),
    ],
  },

  /* SIRET validation */
  {
    method: ["POST"],
    matcher: "/admin/companies/:id/siret/approve",
    middlewares: [
      validateAndTransformBody(AdminApproveSiret),
      validateAndTransformQuery(
        AdminGetCompanyParams,
        adminCompanyQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/companies/:id/siret/reject",
    middlewares: [
      validateAndTransformBody(AdminRejectSiret),
      validateAndTransformQuery(
        AdminGetCompanyParams,
        adminCompanyQueryConfig.retrieve
      ),
    ],
  },
];
