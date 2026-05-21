import { Button, Drawer, Input, Label, Text, toast } from "@medusajs/ui";
import { useState } from "react";
import {
  CreateTierPayload,
  ShippingWeightTier,
} from "../../../hooks/api/shipping-weight";

type Props = {
  tier?: ShippingWeightTier;
  handleSubmit: (data: CreateTierPayload) => Promise<void>;
  loading: boolean;
  error: Error | null;
};

export function TierForm({ tier, handleSubmit, loading, error }: Props) {
  const [formData, setFormData] = useState<CreateTierPayload>({
    min_weight: tier ? Number(tier.min_weight) : 0,
    max_weight: tier ? Number(tier.max_weight) : 0,
    price: tier ? Number(tier.price) : 0,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.max_weight < formData.min_weight) {
      toast.error("Le poids maximum doit être supérieur au minimum");
      return;
    }
    try {
      await handleSubmit(formData);
      toast.success(tier ? "Tranche mise à jour" : "Tranche créée");
    } catch (err: any) {
      toast.error(err?.message ?? "Une erreur est survenue");
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Drawer.Body className="p-4">
        <div className="flex flex-col gap-3">
          <div>
            <Label size="xsmall">Poids minimum (kg)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.min_weight}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  min_weight: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label size="xsmall">Poids maximum (kg)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.max_weight}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_weight: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label size="xsmall">Tarif appliqué (TTC)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
            />
            <Text className="txt-compact-xsmall text-ui-fg-muted mt-1">
              Prix de la livraison pour cette tranche de poids.
            </Text>
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
