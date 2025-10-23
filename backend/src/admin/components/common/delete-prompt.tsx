import { Trash } from "@medusajs/icons";
import { Button, Prompt } from "@medusajs/ui";

interface DeletePromptProps {
  handleDelete: () => void;
  loading: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const DeletePrompt = ({
  handleDelete,
  loading,
  open,
  setOpen,
}: DeletePromptProps) => {
  const handleConfirmDelete = async () => {
    handleDelete();
    setOpen(false);
  };

  return (
    <Prompt open={open} onOpenChange={setOpen}>
      <Prompt.Content className="p-4 pb-0 border-b shadow-ui-fg-shadow">
        <Prompt.Title>Confirmer la Suppression</Prompt.Title>
        <Prompt.Description>
          Supprimer cet élément ? Action irréversible.
        </Prompt.Description>
        <Prompt.Footer>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            isLoading={loading}
          >
            <Trash />
            Supprimer
          </Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Annuler
          </Button>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};
