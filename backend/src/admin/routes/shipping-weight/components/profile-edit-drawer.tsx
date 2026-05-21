import { Button, Drawer, IconButton } from "@medusajs/ui";
import { PencilSquare } from "@medusajs/icons";
import { useState } from "react";
import {
  CreateProfilePayload,
  ShippingWeightProfile,
  useUpdateShippingWeightProfile,
} from "../../../hooks/api/shipping-weight";
import { ProfileForm } from "./profile-form";

export function ProfileEditDrawer({
  profile,
}: {
  profile: ShippingWeightProfile;
}) {
  const [open, setOpen] = useState(false);

  const { mutateAsync, isPending, error } = useUpdateShippingWeightProfile(
    profile.id
  );

  const handleSubmit = async (formData: CreateProfilePayload) => {
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
          <Drawer.Title>Modifier "{profile.name}"</Drawer.Title>
        </Drawer.Header>
        <ProfileForm
          profile={profile}
          handleSubmit={handleSubmit}
          loading={isPending}
          error={error}
        />
      </Drawer.Content>
    </Drawer>
  );
}
