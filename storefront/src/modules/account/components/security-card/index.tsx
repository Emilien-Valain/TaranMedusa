"use client"

import { updatePassword } from "@/lib/data/customer"
import Button from "@/modules/common/components/button"
import Input from "@/modules/common/components/input"
import { B2BCustomer } from "@/types"
import { Container, Text, clx, toast } from "@medusajs/ui"
import { useState } from "react"

const SecurityCard = ({ customer }: { customer: B2BCustomer }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.currentPassword) {
      newErrors.currentPassword = "Requis"
    }
    if (!form.newPassword || form.newPassword.length < 8) {
      newErrors.newPassword = "8 caractères minimum"
    }
    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setIsSaving(true)
    const result = await updatePassword(form.currentPassword, form.newPassword)
    setIsSaving(false)

    if (!result.success) {
      toast.error(result.error || "Erreur lors du changement de mot de passe")
      if (result.error === "Mot de passe actuel incorrect") {
        setErrors({ currentPassword: result.error })
      }
      return
    }

    toast.success("Mot de passe modifié avec succès")
    setIsEditing(false)
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setErrors({})
  }

  const handleCancel = () => {
    setIsEditing(false)
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setErrors({})
  }

  return (
    <div className="h-fit">
      <Container className="p-0 overflow-hidden">
        <form
          className={clx(
            "flex flex-col gap-4 border-b border-neutral-200 overflow-hidden transition-all duration-300 ease-in-out",
            {
              "max-h-[400px] opacity-100 p-4": isEditing,
              "max-h-0 opacity-0": !isEditing,
            }
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleSave()
            }
          }}
        >
          <div className="flex flex-col gap-y-1">
            <Text className="font-medium text-neutral-950">Mot de passe actuel</Text>
            <Input
              label="Mot de passe actuel"
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={(e) =>
                setForm({ ...form, currentPassword: e.target.value })
              }
            />
            {errors.currentPassword && (
              <Text className="text-red-500 text-xs">{errors.currentPassword}</Text>
            )}
          </div>
          <div className="flex flex-col gap-y-1">
            <Text className="font-medium text-neutral-950">Nouveau mot de passe</Text>
            <Input
              label="Nouveau mot de passe"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
            />
            {errors.newPassword && (
              <Text className="text-red-500 text-xs">{errors.newPassword}</Text>
            )}
          </div>
          <div className="flex flex-col gap-y-1">
            <Text className="font-medium text-neutral-950">Confirmer le mot de passe</Text>
            <Input
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            {errors.confirmPassword && (
              <Text className="text-red-500 text-xs">{errors.confirmPassword}</Text>
            )}
          </div>
        </form>

        <div
          className={clx(
            "grid grid-cols-2 gap-4 border-b border-neutral-200 transition-all duration-300 ease-in-out",
            {
              "opacity-0 max-h-0": isEditing,
              "opacity-100 max-h-[80px] p-4": !isEditing,
            }
          )}
        >
          <div className="flex flex-col gap-y-2">
            <Text className="font-medium text-neutral-950">Mot de passe</Text>
            <Text className="text-neutral-500">***************</Text>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 bg-neutral-50 p-4">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isSaving}
              >
                Sauvegarder
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Modifier
            </Button>
          )}
        </div>
      </Container>
    </div>
  )
}

export default SecurityCard
