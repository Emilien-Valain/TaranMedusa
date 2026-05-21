import { Button, Drawer, Input, Label, Switch, Text, toast } from "@medusajs/ui";
import { useState } from "react";
import {
  CreateProfilePayload,
  ShippingWeightProfile,
} from "../../../hooks/api/shipping-weight";

type Props = {
  profile?: ShippingWeightProfile;
  handleSubmit: (data: CreateProfilePayload) => Promise<void>;
  loading: boolean;
  error: Error | null;
};

export function ProfileForm({ profile, handleSubmit, loading, error }: Props) {
  const [formData, setFormData] = useState<CreateProfilePayload>({
    name: profile?.name ?? "",
    description: profile?.description ?? "",
    free_shipping_threshold:
      profile?.free_shipping_threshold !== undefined &&
      profile?.free_shipping_threshold !== null
        ? Number(profile.free_shipping_threshold)
        : null,
    currency_code: profile?.currency_code ?? "eur",
    is_active: profile?.is_active ?? true,
  });

  const update = <K extends keyof CreateProfilePayload>(
    key: K,
    value: CreateProfilePayload[K]
  ) => setFormData((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error("Le nom du profil tarifaire est requis");
      return;
    }
    try {
      await handleSubmit(formData);
      toast.success(
        profile ? "Profil tarifaire mis à jour" : "Profil tarifaire créé"
      );
    } catch (err: any) {
      toast.error(err?.message ?? "Une erreur est survenue");
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Drawer.Body className="p-4">
        <div className="flex flex-col gap-3">
          <div>
            <Label size="xsmall">Nom du profil</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ex : Colissimo France"
            />
            <Text className="txt-compact-xsmall text-ui-fg-muted mt-1">
              Ce nom apparaîtra dans le sélecteur de méthode de livraison.
            </Text>
          </div>

          <div>
            <Label size="xsmall">Description (optionnel)</Label>
            <Input
              type="text"
              value={formData.description ?? ""}
              onChange={(e) => update("description", e.target.value || null)}
              placeholder="Note interne pour aider à identifier le profil"
            />
          </div>

          <div>
            <Label size="xsmall">
              Seuil de livraison gratuite
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={
                formData.free_shipping_threshold === null ||
                formData.free_shipping_threshold === undefined
                  ? ""
                  : String(formData.free_shipping_threshold)
              }
              onChange={(e) =>
                update(
                  "free_shipping_threshold",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              placeholder="Ex : 150"
            />
            <Text className="txt-compact-xsmall text-ui-fg-muted mt-1">
              Montant à partir duquel la livraison devient gratuite. Laissez
              vide pour désactiver.
            </Text>
          </div>

          <div>
            <Label size="xsmall">Devise (code ISO sur 3 lettres)</Label>
            <Input
              type="text"
              value={formData.currency_code ?? "eur"}
              onChange={(e) =>
                update("currency_code", e.target.value.toLowerCase())
              }
              placeholder="EUR"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label size="xsmall">Profil actif</Label>
            <Switch
              checked={formData.is_active ?? true}
              onCheckedChange={(checked) => update("is_active", checked)}
            />
          </div>
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Drawer.Close asChild>
          <Button type="button" variant="secondary">
            Annuler
          </Button>
        </Drawer.Close>
        <Button type="submit" isLoading={loading}>
          Enregistrer
        </Button>
        {error && (
          <Text className="txt-compact-small text-ui-fg-error">
            Erreur : {error.message}
          </Text>
        )}
      </Drawer.Footer>
    </form>
  );
}
