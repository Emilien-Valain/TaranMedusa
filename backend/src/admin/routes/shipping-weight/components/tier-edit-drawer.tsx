import { Drawer, IconButton } from "@medusajs/ui";
import { PencilSquare } from "@medusajs/icons";
import { useState } from "react";
import {
  CreateTierPayload,
  ShippingWeightTier,
  useUpdateShippingWeightTier,
} from "../../../hooks/api/shipping-weight";
import { TierForm } from "./tier-form";

export function TierEditDrawer({
  profileId,
  tier,
}: {
  profileId: string;
  tier: ShippingWeightTier;
}) {
  const [open, setOpen] = useState(false);

  const { mutateAsync, isPending, error } = useUpdateShippingWeightTier(
    profileId,
    tier.id
  );

  const handleSubmit = async (formData: CreateTierPayload) => {
    await mutateAsync(formData, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <IconButton variant="transparent" size="small">
          <PencilSquare />
        </IconButton>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Modifier la tranche</Drawer.Title>
        </Drawer.Header>
        <TierForm
          tier={tier}
          handleSubmit={handleSubmit}
          loading={isPending}
          error={error}
        />
      </Drawer.Content>
    </Drawer>
  );
}
