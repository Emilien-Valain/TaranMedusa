import { HttpTypes } from "@medusajs/types";
import { Button, Drawer, Hint, Table, toast } from "@medusajs/ui";
import { QueryCompany } from "../../../../types";
import {
  useAddCompanyToCustomerGroup,
  useRemoveCompanyFromCustomerGroup,
} from "../../../hooks/api";

export function CompanyCustomerGroupDrawer({
  company,
  customerGroups,
  open,
  setOpen,
}: {
  company: QueryCompany;
  customerGroups?: HttpTypes.AdminCustomerGroup[];
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { mutateAsync: addMutate, isPending: addLoading } =
    useAddCompanyToCustomerGroup(company.id);

  const { mutateAsync: removeMutate, isPending: removeLoading } =
    useRemoveCompanyFromCustomerGroup(company.id);

  const handleAdd = async (groupId: string) => {
    await addMutate(groupId, {
      onSuccess: async () => {
        setOpen(false);
        toast.success(`Société ajoutée au groupe de clients`);
      },
      onError: (error) => {
        toast.error("Echec de l'ajout de la société au groupe de clients");
      },
    });
  };

  const handleRemove = async (groupId: string) => {
    await removeMutate(groupId, {
      onSuccess: async () => {
        toast.success(`Société supprimée du groupe de clients`);
      },
      onError: (error) => {
        console.log(error);
        toast.error("Echec de la suppression de la société du groupe de clients");
      },
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content className="z-50">
        <Drawer.Header>
          <Drawer.Title>Ajouter {company.name} à un Groupe de Clients</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="space-y-4 h-full overflow-y-hidden">
          <Hint variant="info">
            Ajouter {company.name} à un groupe de clients va ajouter automatiquement {" "}
            {company.employees?.length} employé{company.employees?.length === 1 ? "" : "s"} lié
            {company.employees?.length === 1 ? "" : "s"} au groupe de clients.
          </Hint>
          <div className="h-full overflow-y-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Groupe de Clients</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">
                    Actions
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {customerGroups ? (
                  customerGroups.map((group) => (
                    <Table.Row key={group.id}>
                      <Table.Cell>{group.name}</Table.Cell>
                      <Table.Cell className="text-right">
                        {company.customer_group?.id &&
                          company.customer_group.id === group.id ? (
                          <Button
                            onClick={() => handleRemove(group.id)}
                            isLoading={removeLoading}
                            variant="danger"
                          >
                            Supprimer
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleAdd(group.id)}
                            disabled={
                              (company.customer_group?.id &&
                                company.customer_group.id !== group.id) ||
                              addLoading
                            }
                            isLoading={addLoading}
                          >
                            Ajouter
                          </Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell>Aucun grouep de clients</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
}
