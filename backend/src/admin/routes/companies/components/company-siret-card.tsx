import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useState } from "react";
import { QueryCompany } from "../../../../types";
import {
  useApproveCompanySiret,
  useRejectCompanySiret,
} from "../../../hooks/api/companies";

const statusBadge = (status: string | null | undefined) => {
  switch (status) {
    case "validated":
      return (
        <Badge size="small" color="green">
          Validé
        </Badge>
      );
    case "pending":
      return (
        <Badge size="small" color="orange">
          En attente
        </Badge>
      );
    case "rejected":
      return (
        <Badge size="small" color="red">
          Rejeté
        </Badge>
      );
    default:
      return (
        <Badge size="small" color="grey">
          Non renseigné
        </Badge>
      );
  }
};

function InseeSummary({ data }: { data: Record<string, any> }) {
  const u = data?.uniteLegale || {};
  const a = data?.adresseEtablissement || {};
  const periodes: Array<Record<string, any>> = data?.periodesEtablissement || [];
  const currentPeriode =
    periodes.find((p) => !p.dateFin) || periodes[0] || null;
  const etatEtab =
    data?.etatAdministratifEtablissement ??
    currentPeriode?.etatAdministratifEtablissement;
  const denom =
    u.denominationUniteLegale ||
    [u.prenom1UniteLegale, u.nomUniteLegale].filter(Boolean).join(" ");
  const adresse = [
    a.numeroVoieEtablissement,
    a.typeVoieEtablissement,
    a.libelleVoieEtablissement,
  ]
    .filter(Boolean)
    .join(" ");
  const ville = [a.codePostalEtablissement, a.libelleCommuneEtablissement]
    .filter(Boolean)
    .join(" ");
  const annuaireUrl = data?.siret
    ? `https://annuaire-entreprises.data.gouv.fr/etablissement/${data.siret}`
    : null;

  return (
    <div className="flex flex-col gap-1 text-ui-fg-subtle txt-small">
      {denom && (
        <div>
          <span className="font-medium">Dénomination :</span> {denom}
        </div>
      )}
      {data?.siren && (
        <div>
          <span className="font-medium">SIREN :</span>{" "}
          <span className="font-mono">{data.siren}</span>
        </div>
      )}
      <div>
        <span className="font-medium">Type :</span>{" "}
        {data?.etablissementSiege ? "Siège social" : "Établissement secondaire"}
      </div>
      {adresse && (
        <div>
          <span className="font-medium">Adresse :</span> {adresse}
        </div>
      )}
      {ville && <div className="pl-[5.5rem]">{ville}</div>}
      {u.activitePrincipaleUniteLegale && (
        <div>
          <span className="font-medium">Activité (NAF) :</span>{" "}
          {u.activitePrincipaleUniteLegale}
        </div>
      )}
      {data?.dateCreationEtablissement && (
        <div>
          <span className="font-medium">Créé le :</span>{" "}
          {data.dateCreationEtablissement}
        </div>
      )}
      <div>
        <span className="font-medium">État établissement :</span>{" "}
        <span
          className={
            etatEtab === "A" ? "text-emerald-700" : "text-red-600"
          }
        >
          {etatEtab === "A"
            ? "Actif"
            : etatEtab === "F"
              ? "Fermé"
              : `Inconnu (${etatEtab})`}
        </span>
      </div>
      {u.etatAdministratifUniteLegale && (
        <div>
          <span className="font-medium">État unité légale :</span>{" "}
          <span
            className={
              u.etatAdministratifUniteLegale === "A"
                ? "text-emerald-700"
                : "text-red-600"
            }
          >
            {u.etatAdministratifUniteLegale === "A" ? "Active" : "Cessée"}
          </span>
        </div>
      )}
      {annuaireUrl && (
        <a
          href={annuaireUrl}
          target="_blank"
          rel="noreferrer"
          className="text-ui-fg-interactive underline mt-1"
        >
          Voir sur annuaire-entreprises.data.gouv.fr ↗
        </a>
      )}
    </div>
  );
}

function RejectDrawer({
  open,
  setOpen,
  companyId,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  companyId: string;
}) {
  const [reason, setReason] = useState("");
  const { mutateAsync, isPending } = useRejectCompanySiret(companyId);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Veuillez indiquer un motif de rejet");
      return;
    }
    await mutateAsync(reason, {
      onSuccess: () => {
        toast.success("SIRET rejeté");
        setOpen(false);
        setReason("");
      },
      onError: () => toast.error("Erreur lors du rejet"),
    });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content className="z-50">
        <Drawer.Header>
          <Drawer.Title>Rejeter le SIRET</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-2">
          <Text className="txt-small text-ui-fg-subtle">
            Motif communiqué au client (visible dans son espace).
          </Text>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex : Numéro non rattaché à l'entité commande..."
            rows={4}
          />
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} isLoading={isPending}>
            Rejeter
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}

export function CompanySiretCard({ company }: { company: QueryCompany }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const { mutateAsync: approve, isPending: isApproving } =
    useApproveCompanySiret(company.id);

  const handleApprove = async () => {
    await approve(undefined, {
      onSuccess: () => toast.success("SIRET validé — client passé en HT"),
      onError: () => toast.error("Erreur lors de la validation"),
    });
  };

  return (
    <Container className="flex flex-col p-0 overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 justify-between">
        <Heading className="font-sans font-medium h1-core">
          Validation SIRET
        </Heading>
        {company.siret && (
          <div className="flex gap-2">
            {company.siret_validation_status !== "rejected" && (
              <Button
                size="small"
                variant="secondary"
                onClick={() => setRejectOpen(true)}
              >
                {company.siret_validation_status === "validated"
                  ? "Révoquer"
                  : "Rejeter"}
              </Button>
            )}
            {company.siret_validation_status !== "validated" && (
              <Button
                size="small"
                onClick={handleApprove}
                isLoading={isApproving}
              >
                {company.siret_validation_status === "rejected"
                  ? "Valider quand même"
                  : "Approuver"}
              </Button>
            )}
          </div>
        )}
      </div>
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell className="font-medium font-sans txt-compact-small max-w-fit">
              SIRET
            </Table.Cell>
            <Table.Cell>
              {company.siret ? (
                <span className="font-mono">{company.siret}</span>
              ) : (
                <Text className="text-ui-fg-muted">Non renseigné</Text>
              )}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell className="font-medium font-sans txt-compact-small">
              Statut
            </Table.Cell>
            <Table.Cell>
              {statusBadge(company.siret_validation_status)}
            </Table.Cell>
          </Table.Row>
          {company.siret_validated_at && (
            <Table.Row>
              <Table.Cell className="font-medium font-sans txt-compact-small">
                Validé le
              </Table.Cell>
              <Table.Cell>
                {new Date(company.siret_validated_at).toLocaleString("fr-FR")}
              </Table.Cell>
            </Table.Row>
          )}
          {company.siret_rejection_reason && (
            <Table.Row>
              <Table.Cell className="font-medium font-sans txt-compact-small">
                Motif de rejet
              </Table.Cell>
              <Table.Cell>
                <Text className="text-ui-fg-error">
                  {company.siret_rejection_reason}
                </Text>
              </Table.Cell>
            </Table.Row>
          )}
          {company.siret_insee_data && (
            <Table.Row>
              <Table.Cell className="font-medium font-sans txt-compact-small align-top">
                Données INSEE
              </Table.Cell>
              <Table.Cell>
                <InseeSummary data={company.siret_insee_data as any} />
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      <RejectDrawer
        open={rejectOpen}
        setOpen={setRejectOpen}
        companyId={company.id}
      />
    </Container>
  );
}
