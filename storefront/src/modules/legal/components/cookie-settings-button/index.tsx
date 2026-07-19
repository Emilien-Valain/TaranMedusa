"use client"

import { OPEN_COOKIE_SETTINGS_EVENT } from "@/modules/legal/components/cookie-consent"

/** Bouton rouvrant le bandeau de consentement aux cookies. */
const CookieSettingsButton = () => {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
      }
      className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#0d2b5e] text-white hover:bg-[#0099d6] transition-colors w-fit"
    >
      Modifier mes préférences de cookies
    </button>
  )
}

export default CookieSettingsButton
