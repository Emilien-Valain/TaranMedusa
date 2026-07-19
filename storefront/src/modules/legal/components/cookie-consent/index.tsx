"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"

const CONSENT_COOKIE = "taran_cookie_consent"
const CONSENT_MAX_AGE = 60 * 60 * 24 * 390 // 13 mois (recommandation CNIL)

export type ConsentValue = "accepted" | "rejected"

/** Événement permettant de rouvrir le bandeau depuis la page /cookies. */
export const OPEN_COOKIE_SETTINGS_EVENT = "open-cookie-settings"

function readConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`))
  const value = match?.split("=")[1]
  return value === "accepted" || value === "rejected" ? value : null
}

function writeConsent(value: ConsentValue) {
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax`
  // Permet aux scripts tiers (analytics…) d'écouter le choix.
  window.dispatchEvent(
    new CustomEvent("cookie-consent-changed", { detail: value })
  )
}

/**
 * Bandeau de consentement aux cookies conforme aux exigences CNIL :
 * consentement préalable, refus aussi simple que l'acceptation, choix
 * conservé 13 mois et réversible via la page « Gestion des cookies ».
 *
 * Tant qu'aucun choix n'est fait, aucun traceur non essentiel ne doit être
 * déposé. Les scripts de mesure d'audience/marketing doivent écouter
 * l'événement `cookie-consent-changed` avant de se charger.
 */
const CookieConsent = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!readConsent()) {
      setVisible(true)
    }
    const reopen = () => setVisible(true)
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen)
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen)
  }, [])

  const handleChoice = (value: ConsentValue) => {
    writeConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      aria-live="polite"
      className="fixed bottom-0 inset-x-0 z-50 border-t-2 border-[#0099d6] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
    >
      <div className="content-container py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-neutral-700 max-w-2xl">
          <p>
            Nous utilisons des cookies pour assurer le bon fonctionnement du
            site et, avec votre accord, pour mesurer l'audience et améliorer
            votre expérience. Vous pouvez accepter, refuser, ou en savoir plus
            dans notre{" "}
            <LocalizedClientLink
              href="/cookies"
              className="text-[#0099d6] underline"
            >
              politique de cookies
            </LocalizedClientLink>
            .
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleChoice("rejected")}
            className="px-5 py-2.5 rounded-full text-sm font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Tout refuser
          </button>
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#0d2b5e] text-white hover:bg-[#0099d6] transition-colors"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
