"use client"

import { requestPasswordReset } from "@/lib/data/password"
import { LOGIN_VIEW } from "@/modules/account/templates/login-template"
import Button from "@/modules/common/components/button"
import Input from "@/modules/common/components/input"
import { Text } from "@medusajs/ui"
import { useState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await requestPasswordReset(email)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error || "Une erreur est survenue")
      return
    }

    setSent(true)
  }

  return (
    <div className="max-w-sm w-full h-full flex flex-col justify-center gap-6 my-auto">
      <div className="flex flex-col gap-y-2">
        <Text className="text-4xl text-neutral-950 text-left">
          Mot de passe
          <br />
          oublié ?
        </Text>
        {!sent && (
          <Text className="text-neutral-500 text-sm">
            Saisissez votre email et nous vous enverrons un lien pour
            réinitialiser votre mot de passe.
          </Text>
        )}
      </div>

      {sent ? (
        <div className="flex flex-col gap-y-4">
          <div
            className="rounded-lg p-4 text-sm"
            style={{ background: "#e6f7f5", color: "var(--color-navy)" }}
          >
            Un email vous a été envoyé à <strong>{email}</strong>. Vérifiez
            votre boîte de réception et cliquez sur le lien pour réinitialiser
            votre mot de passe.
          </div>
          <Button
            variant="secondary"
            onClick={() => setCurrentView(LOGIN_VIEW.LOG_IN)}
            className="w-full h-10"
          >
            Retour à la connexion
          </Button>
        </div>
      ) : (
        <form className="w-full flex flex-col gap-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && (
            <Text className="text-red-500 text-sm">{error}</Text>
          )}
          <Button
            variant="primary"
            type="submit"
            isLoading={isLoading}
            className="w-full h-10"
          >
            Envoyer le lien
          </Button>
          <Button
            variant="secondary"
            onClick={() => setCurrentView(LOGIN_VIEW.LOG_IN)}
            className="w-full h-10"
            type="button"
          >
            Retour à la connexion
          </Button>
        </form>
      )}
    </div>
  )
}

export default ForgotPassword
