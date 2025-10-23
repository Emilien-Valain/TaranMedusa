import { HttpTypes } from "@medusajs/types";
import { Button, Drawer, toast } from "@medusajs/ui";
import { AdminCreateEmployee, QueryCompany } from "../../../../../types";
import { useState } from "react";
import {
  useAdminCreateCustomer,
  useCreateEmployee,
} from "../../../../hooks/api";
import { EmployeesCreateForm } from "./employees-create-form";

export function EmployeeCreateDrawer({ company }: { company: QueryCompany }) {
  const [open, setOpen] = useState(false);

  const {
    mutateAsync: createEmployee,
    isPending: createEmployeeLoading,
    error: createEmployeeError,
  } = useCreateEmployee(company.id);

  const {
    mutateAsync: createCustomer,
    isPending: createCustomerLoading,
    error: createCustomerError,
  } = useAdminCreateCustomer();

  const handleSubmit = async (
    formData: AdminCreateEmployee & HttpTypes.AdminCreateCustomer
  ) => {
    const { customer } = await createCustomer({
      email: formData.email!,
      first_name: formData.first_name!,
      last_name: formData.last_name!,
      phone: formData.phone!,
      company_name: company.name,
    });

    if (!customer?.id) {
      toast.error("Echec lors de la création du client");
      return;
    }

    const employee = await createEmployee({
      spending_limit: formData.spending_limit!,
      is_admin: formData.is_admin!,
      customer_id: customer.id,
    });

    if (!employee) {
      toast.error("Echec lors de la création de l'employé");
      return;
    }

    setOpen(false);
    toast.success(
      `Employé ${customer?.first_name} ${customer?.last_name} créé avec succès`
    );
  };

  const loading = createCustomerLoading || createEmployeeLoading;
  const error = createCustomerError || createEmployeeError;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="secondary" size="small">
          Ajouter
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Ajouter un Client pour la Société</Drawer.Title>
        </Drawer.Header>
        <EmployeesCreateForm
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          company={company}
        />
      </Drawer.Content>
    </Drawer>
  );
}
