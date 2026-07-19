import { Metadata } from "next"
import LegalLayout from "@/modules/legal/components/legal-layout"
import CookieSettingsButton from "@/modules/legal/components/cookie-settings-button"

export const metadata: Metadata = {
  title: "Gestion des cookies",
  description:
    "Politique de gestion des cookies de Taran Industrie : types de cookies utilisés et gestion de votre consentement.",
}

export default function CookiesPage() {
  return (
    <LegalLayout title="Gestion des cookies" lastUpdated="8 juillet 2026">
      <p>
        Un cookie est un petit fichier déposé sur votre terminal lors de la
        visite d'un site. La présente politique explique quels cookies sont
        utilisés et comment gérer votre consentement, conformément aux
        recommandations de la CNIL.
      </p>

      <h2>1. Cookies strictement nécessaires</h2>
      <p>
        Ces cookies sont indispensables au fonctionnement du site (gestion du
        panier, session, sécurité, mémorisation de votre choix de consentement).
        Ils ne requièrent pas votre consentement et ne peuvent pas être
        désactivés.
      </p>

      <h2>2. Cookies de mesure d'audience et de préférences</h2>
      <p>
        Ces cookies nous permettent de mesurer la fréquentation du site et
        d'améliorer votre expérience. Ils ne sont déposés qu'après votre
        consentement.
      </p>

      <h2>3. Cookies marketing</h2>
      <p>
        Ces cookies permettent de vous proposer des contenus et offres adaptés.
        Ils ne sont déposés qu'avec votre consentement explicite.
      </p>

      <h2>4. Durée de conservation</h2>
      <p>
        Les cookies soumis à consentement sont conservés pour une durée maximale
        de 13 mois. Votre choix de consentement est lui-même conservé pour cette
        même durée, au terme de laquelle il vous sera à nouveau demandé.
      </p>

      <h2>5. Gérer votre consentement</h2>
      <p>
        Vous pouvez à tout moment modifier vos préférences ou retirer votre
        consentement à l'aide du bouton ci-dessous. Vous pouvez également
        configurer votre navigateur pour bloquer les cookies.
      </p>
      <div className="mt-2">
        <CookieSettingsButton />
      </div>
    </LegalLayout>
  )
}
