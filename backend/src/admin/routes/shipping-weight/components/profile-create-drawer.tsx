import { Button, Drawer } from "@medusajs/ui";
import { useState } from "react";
import {
  CreateProfilePayload,
  useCreateShippingWeightProfile,
} from "../../../hooks/api/shipping-weight";
import { ProfileForm } from "./profile-form";

export function ProfileCreateDrawer() {
  const [open, setOpen] = useState(false);

  const { mutateAsync, isPending, error } = useCreateShippingWeightProfile();

  const handleSubmit = async (formData: CreateProfilePayload) => {
    await mutateAsync(formData, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="secondary" size="small">
          Nouveau profil tarifaire
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Nouveau profil tarifaire</Drawer.Title>
        </Drawer.Header>
        <ProfileForm
          handleSubmit={handleSubmit}
          loading={isPending}
          error={error}
        />
      </Drawer.Content>
    </Drawer>
  );
}
