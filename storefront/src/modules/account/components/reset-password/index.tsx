"use client"

import { resetPassword } from "@/lib/data/password"
import { LOGIN_VIEW } from "@/modules/account/templates/login-template"
import Button from "@/modules/common/components/button"
import Input from "@/modules/common/components/input"
import { Text } from "@medusajs/ui"
import { useState } from "react"

type Props = {
  token: string
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ResetPassword = ({ token, setCurrentView }: Props) => {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.newPassword || form.newPassword.length < 8) {
      newErrors.newPassword = "8 caractères minimum"
    }
    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setError(null)

    const result = await resetPassword(token, form.newPassword)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error || "Une erreur est survenue")
      return
    }

    setDone(true)
  }

  return (
    <div className="max-w-sm w-full h-full flex flex-col justify-center gap-6 my-auto">
      <Text className="text-4xl text-neutral-950 text-left">
        Nouveau
        <br />
        mot de passe
      </Text>

      {done ? (
        <div className="flex flex-col gap-y-4">
          <div
            className="rounded-lg p-4 text-sm"
            style={{ background: "#e6f7f5", color: "var(--color-navy)" }}
          >
            Votre mot de passe a été réinitialisé avec succès. Vous pouvez
            maintenant vous connecter.
          </div>
          <Button
            variant="primary"
            onClick={() => setCurrentView(LOGIN_VIEW.LOG_IN)}
            className="w-full h-10"
          >
            Se connecter
          </Button>
        </div>
      ) : (
        <form className="w-full flex flex-col gap-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-y-1">
            <Input
              label="Nouveau mot de passe"
              name="newPassword"
              type="password"
              required
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
            {errors.newPassword && (
              <Text className="text-red-500 text-xs">{errors.newPassword}</Text>
            )}
          </div>
          <div className="flex flex-col gap-y-1">
            <Input
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            {errors.confirmPassword && (
              <Text className="text-red-500 text-xs">
                {errors.confirmPassword}
              </Text>
            )}
          </div>
          {error && <Text className="text-red-500 text-sm">{error}</Text>}
          <Button
            variant="primary"
            type="submit"
            isLoading={isLoading}
            className="w-full h-10"
          >
            Réinitialiser le mot de passe
          </Button>
        </form>
      )}
    </div>
  )
}

export default ResetPassword
