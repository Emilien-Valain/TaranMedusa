"use client"

import { submitCompanySiret } from "@/lib/data/companies"
import Button from "@/modules/common/components/button"
import Input from "@/modules/common/components/input"
import { QueryCompany } from "@/types"
import { Badge, Container, Text, toast } from "@medusajs/ui"
import { useState } from "react"

type Props = {
  company: QueryCompany
}

const StatusBadge = ({ status }: { status: string | null | undefined }) => {
  switch (status) {
    case "validated":
      return (
        <Badge size="small" color="green">
          Validé
        </Badge>
      )
    case "pending":
      return (
        <Badge size="small" color="orange">
          En cours de validation
        </Badge>
      )
    case "rejected":
      return (
        <Badge size="small" color="red">
          Rejeté
        </Badge>
      )
    default:
      return (
        <Badge size="small" color="grey">
          Non renseigné
        </Badge>
      )
  }
}

const SiretCard = ({ company }: Props) => {
  const [isEditing, setIsEditing] = useState(
    !company.siret || company.siret_validation_status === "rejected"
  )
  const [isSaving, setIsSaving] = useState(false)
  const [siret, setSiret] = useState(company.siret || "")

  const cleaned = siret.replace(/\s/g, "")
  const isFormatValid = /^\d{14}$/.test(cleaned)

  const handleSubmit = async () => {
    if (!isFormatValid) {
      toast.error("Le SIRET doit contenir 14 chiffres")
      return
    }
    setIsSaving(true)
    try {
      await submitCompanySiret(company.id, cleaned)
      toast.success(
        "SIRET soumis. Vous serez notifié une fois la validation effectuée."
      )
      setIsEditing(false)
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la soumission du SIRET")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container className="p-0 overflow-hidden">
      <div className="p-4 border-b border-neutral-200 flex flex-col gap-y-3">
        <div className="flex items-center justify-between">
          <Text className="font-medium text-neutral-950">Numéro SIRET</Text>
          <StatusBadge status={company.siret_validation_status} />
        </div>

        {company.siret_validation_status === "validated" && (
          <Text className="text-sm text-emerald-700">
            Votre SIRET est validé. Vous voyez désormais les prix HT sur le
            site. La TVA reste collectée au paiement et vous la récupérez via
            votre déclaration habituelle.
          </Text>
        )}

        {company.siret_validation_status === "pending" && (
          <Text className="text-sm text-neutral-600">
            Votre SIRET est en cours de validation par notre équipe. En
            attendant, les prix s'affichent TTC.
          </Text>
        )}

        {company.siret_validation_status === "rejected" &&
          company.siret_rejection_reason && (
            <div className="text-sm text-red-600">
              <span className="font-medium">Motif du rejet : </span>
              {company.siret_rejection_reason}
            </div>
          )}

        {!isEditing && company.siret && (
          <div className="font-mono text-neutral-700">{company.siret}</div>
        )}

        {isEditing && (
          <>
            <Input
              label="SIRET (14 chiffres)"
              name="siret"
              inputMode="numeric"
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
            />
            <Text className="text-xs text-ui-fg-muted">
              Une fois soumis, votre SIRET sera vérifié auprès de l'INSEE puis
              validé manuellement.
            </Text>
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 bg-neutral-50 p-4">
        {isEditing ? (
          <>
            {company.siret && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSiret(company.siret || "")
                  setIsEditing(false)
                }}
                disabled={isSaving}
              >
                Annuler
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!isFormatValid}
              isLoading={isSaving}
            >
              {company.siret ? "Resoumettre" : "Soumettre"}
            </Button>
          </>
        ) : (
          company.siret_validation_status !== "validated" && (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Modifier
            </Button>
          )
        )}
      </div>
    </Container>
  )
}

export default SiretCard
