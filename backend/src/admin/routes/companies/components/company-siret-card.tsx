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
import { CheckCircleSolid, ExclamationCircle } from "@medusajs/icons";
import { Fragment, useState } from "react";
import { QueryCompany } from "../../../../types";
import {
  compareAddress,
  getInseeName,
  isNameMatch,
} from "../../../../lib/insee-sirene";
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

function MatchIndicator({ ok }: { ok: boolean }) {
  return ok ? (
    <Badge size="2xsmall" color="green" className="gap-1">
      <CheckCircleSolid className="w-3 h-3" /> Correspond
    </Badge>
  ) : (
    <Badge size="2xsmall" color="orange" className="gap-1">
      <ExclamationCircle className="w-3 h-3" /> À vérifier
    </Badge>
  );
}

function ComparisonTable({ company }: { company: QueryCompany }) {
  const etab = company.siret_insee_data as any;
  const inseeName = getInseeName(etab);
  const nameOk = isNameMatch(company.name, inseeName);
  const addr = compareAddress(
    { address: company.address, city: company.city, zip: company.zip },
    etab
  );

  const rows: Array<{
    label: string;
    declared: string;
    insee: string;
    ok: boolean;
  }> = [
    {
      label: "Nom",
      declared: company.name || "—",
      insee: inseeName || "—",
      ok: nameOk,
    },
    {
      label: "Adresse",
      declared: addr.declaredStreet || "—",
      insee: addr.inseeStreet || "—",
      ok: addr.streetMatch,
    },
    {
      label: "Code postal",
      declared: addr.declaredZip || "—",
      insee: addr.inseeZip || "—",
      ok: addr.zipMatch,
    },
    {
      label: "Ville",
      declared: addr.declaredCity || "—",
      insee: addr.inseeCity || "—",
      ok: addr.cityMatch,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Text className="txt-small font-medium">
        Comparaison déclaratif / INSEE
      </Text>
      <div className="grid grid-cols-[minmax(0,auto)_1fr_1fr_auto] gap-x-4 gap-y-1.5 txt-small">
        <span className="font-medium text-ui-fg-subtle" />
        <span className="font-medium text-ui-fg-subtle">Déclaré</span>
        <span className="font-medium text-ui-fg-subtle">INSEE</span>
        <span />
        {rows.map((row) => (
          <Fragment key={row.label}>
            <span className="font-medium">{row.label}</span>
            <span className="text-ui-fg-subtle">{row.declared}</span>
            <span className="text-ui-fg-subtle">{row.insee}</span>
            <MatchIndicator ok={row.ok} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function InseeSummary({ data }: { data: Record<string, any> }) {
  const u = data?.uniteLegale || {};
  const periodes: Array<Record<string, any>> = data?.periodesEtablissement || [];
  const currentPeriode =
    periodes.find((p) => !p.dateFin) || periodes[0] || null;
  const etatEtab =
    data?.etatAdministratifEtablissement ??
    currentPeriode?.etatAdministratifEtablissement;
  const annuaireUrl = data?.siret
    ? `https://annuaire-entreprises.data.gouv.fr/etablissement/${data.siret}`
    : null;

  return (
    <div className="flex flex-col gap-1 text-ui-fg-subtle txt-small">
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
                Vérification
              </Table.Cell>
              <Table.Cell>
                <ComparisonTable company={company} />
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
