import { Button, Drawer } from "@medusajs/ui";
import { useState } from "react";
import {
  CreateTierPayload,
  useCreateShippingWeightTier,
} from "../../../hooks/api/shipping-weight";
import { TierForm } from "./tier-form";

export function TierCreateDrawer({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);

  const { mutateAsync, isPending, error } =
    useCreateShippingWeightTier(profileId);

  const handleSubmit = async (formData: CreateTierPayload) => {
    await mutateAsync(formData, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="secondary" size="small">
          Ajouter une tranche
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Nouvelle tranche de poids</Drawer.Title>
        </Drawer.Header>
        <TierForm
          handleSubmit={handleSubmit}
          loading={isPending}
          error={error}
        />
      </Drawer.Content>
    </Drawer>
  );
}
