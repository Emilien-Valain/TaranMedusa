import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CurrencyDollar, Trash } from "@medusajs/icons";
import {
  Badge,
  Container,
  Heading,
  IconButton,
  Table,
  Text,
  Toaster,
  usePrompt,
} from "@medusajs/ui";
import {
  ShippingWeightProfile,
  ShippingWeightTier,
  useDeleteShippingWeightProfile,
  useDeleteShippingWeightTier,
  useShippingWeightProfiles,
} from "../../hooks/api/shipping-weight";
import {
  ColissimoConfigCard,
  ProfileCreateDrawer,
  ProfileEditDrawer,
  TierCreateDrawer,
  TierEditDrawer,
} from "./components";

const formatPrice = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return num.toFixed(2);
};

const TiersTable = ({ profile }: { profile: ShippingWeightProfile }) => {
  const prompt = usePrompt();
  const { mutateAsync: deleteTier } = useDeleteShippingWeightTier(profile.id);

  const tiers = (profile.tiers ?? [])
    .slice()
    .sort((a, b) => Number(a.min_weight) - Number(b.min_weight));

  const handleDelete = async (tier: ShippingWeightTier) => {
    const confirmed = await prompt({
      title: "Supprimer la tranche",
      description: `Confirmez la suppression de la tranche ${tier.min_weight}-${tier.max_weight} kg ?`,
    });
    if (!confirmed) return;
    await deleteTier(tier.id);
  };

  if (tiers.length === 0) {
    return (
      <div className="px-6 py-4 border-t">
        <Text className="text-ui-fg-subtle">
          Aucune tranche définie. Ajoutez-en une pour activer le calcul du
          prix.
        </Text>
      </div>
    );
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Poids min (kg)</Table.HeaderCell>
          <Table.HeaderCell>Poids max (kg)</Table.HeaderCell>
          <Table.HeaderCell>Tarif</Table.HeaderCell>
          <Table.HeaderCell>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {tiers.map((tier) => (
          <Table.Row key={tier.id}>
            <Table.Cell>{formatPrice(tier.min_weight)}</Table.Cell>
            <Table.Cell>{formatPrice(tier.max_weight)}</Table.Cell>
            <Table.Cell>
              {formatPrice(tier.price)}{" "}
              {profile.currency_code?.toUpperCase()}
            </Table.Cell>
            <Table.Cell>
              <div className="flex gap-1">
                <TierEditDrawer profileId={profile.id} tier={tier} />
                <IconButton
                  variant="transparent"
                  size="small"
                  onClick={() => handleDelete(tier)}
                >
                  <Trash />
                </IconButton>
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

const ProfileCard = ({ profile }: { profile: ShippingWeightProfile }) => {
  const prompt = usePrompt();
  const { mutateAsync: deleteProfile } = useDeleteShippingWeightProfile();

  const handleDelete = async () => {
    const confirmed = await prompt({
      title: "Supprimer le profil tarifaire",
      description: `Toutes les tranches associées seront aussi supprimées. Confirmez la suppression de « ${profile.name} » ?`,
    });
    if (!confirmed) return;
    await deleteProfile(profile.id);
  };

  const threshold =
    profile.free_shipping_threshold !== null &&
    profile.free_shipping_threshold !== undefined
      ? Number(profile.free_shipping_threshold)
      : null;

  return (
    <Container className="flex flex-col p-0 overflow-hidden">
      <div className="p-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Heading level="h2">{profile.name}</Heading>
            {profile.is_active ? (
              <Badge size="small" color="green">
                Actif
              </Badge>
            ) : (
              <Badge size="small" color="red">
                Inactif
              </Badge>
            )}
          </div>
          {profile.description && (
            <Text className="text-ui-fg-subtle txt-small">
              {profile.description}
            </Text>
          )}
          <Text className="txt-compact-small text-ui-fg-subtle">
            Devise : {profile.currency_code?.toUpperCase()} · Livraison
            gratuite à partir de :{" "}
            {threshold !== null && threshold > 0
              ? `${formatPrice(threshold)} ${profile.currency_code?.toUpperCase()}`
              : "désactivée"}
          </Text>
          <Text className="txt-compact-small text-ui-fg-muted">
            Identifiant interne : <code>{profile.id}</code>
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <ProfileEditDrawer profile={profile} />
          <IconButton
            variant="transparent"
            size="small"
            onClick={handleDelete}
          >
            <Trash />
          </IconButton>
        </div>
      </div>
      <div className="border-t flex items-center justify-between px-6 py-3 bg-ui-bg-subtle">
        <Text className="txt-compact-small font-medium">
          Tranches de poids
        </Text>
        <TierCreateDrawer profileId={profile.id} />
      </div>
      <TiersTable profile={profile} />
    </Container>
  );
};

const ShippingWeightPage = () => {
  const { data, isPending } = useShippingWeightProfiles();

  return (
    <>
      <Container className="flex flex-col p-0 overflow-hidden">
        <div className="p-6 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <Heading className="font-sans font-medium h1-core">
              Frais de livraison au poids
            </Heading>
            <Text className="text-ui-fg-subtle txt-small">
              Définissez ici des barèmes tarifaires basés sur le poids du
              panier, ainsi qu'un éventuel seuil de livraison gratuite. Pour
              les utiliser, ajoutez une méthode de livraison dans Paramètres
              → Localisations puis sélectionnez le fournisseur{" "}
              <code>shipping-weight</code> ; chaque profil tarifaire créé
              ici apparaîtra alors dans la liste « Fulfillment Option ». À
              ne pas confondre avec le « Shipping Profile » natif de Medusa
              qui sert, lui, à catégoriser les produits.
            </Text>
          </div>
          <ProfileCreateDrawer />
        </div>
        {isPending && (
          <div className="px-6 pb-6">
            <Text>Chargement...</Text>
          </div>
        )}
        {!isPending && (data?.profiles ?? []).length === 0 && (
          <div className="px-6 pb-6">
            <Text className="text-ui-fg-subtle">
              Aucun profil tarifaire pour le moment. Créez votre premier
              profil avec le bouton ci-dessus.
            </Text>
          </div>
        )}
      </Container>
      <div className="flex flex-col gap-4 mt-4">
        {data?.profiles?.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
      <div className="mt-4">
        <ColissimoConfigCard />
      </div>
      <Toaster />
    </>
  );
};

export const config = defineRouteConfig({
  label: "Frais de port",
  icon: CurrencyDollar,
});

export default ShippingWeightPage;
