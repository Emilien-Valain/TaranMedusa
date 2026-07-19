import { Metadata } from "next"
import LegalLayout from "@/modules/legal/components/legal-layout"
import { COMPANY_INFO, fullAddress } from "@/lib/legal/company-info"

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Taran Industrie : données collectées, finalités, durées de conservation et droits RGPD.",
}

export default function ConfidentialitePage() {
  const c = COMPANY_INFO

  return (
    <LegalLayout
      title="Politique de confidentialité"
      lastUpdated="8 juillet 2026"
    >
      <p>
        {c.legalName} accorde une grande importance à la protection de vos
        données personnelles. La présente politique décrit, conformément au
        Règlement général sur la protection des données (RGPD — règlement UE
        2016/679) et à la loi Informatique et Libertés, la manière dont vos
        données sont collectées et traitées.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement est {c.legalName}, {fullAddress}. Pour
        toute question relative à vos données, vous pouvez écrire à{" "}
        <a href={`mailto:${c.dpoContact}`}>{c.dpoContact}</a>.
      </p>

      <h2>2. Données collectées</h2>
      <ul>
        <li>
          <strong>Données d'identification et de contact</strong> : nom, prénom,
          adresse e-mail, numéro de téléphone.
        </li>
        <li>
          <strong>Données de commande et de livraison</strong> : adresses,
          contenu des commandes, historique d'achat.
        </li>
        <li>
          <strong>Données professionnelles</strong> (le cas échéant) : société,
          numéro SIRET, fonction.
        </li>
        <li>
          <strong>Données de paiement</strong> : traitées directement par notre
          prestataire Stripe ; {c.legalName} ne conserve pas les numéros de carte
          bancaire.
        </li>
        <li>
          <strong>Données de navigation</strong> : via les cookies et traceurs
          (voir la <a href="/cookies">politique de cookies</a>).
        </li>
      </ul>

      <h2>3. Finalités et bases légales</h2>
      <ul>
        <li>
          Gestion des commandes, de la livraison et du service client —{" "}
          <em>exécution du contrat</em>.
        </li>
        <li>
          Gestion du compte client — <em>exécution du contrat</em>.
        </li>
        <li>
          Respect des obligations légales et comptables (facturation) —{" "}
          <em>obligation légale</em>.
        </li>
        <li>
          Envoi de communications commerciales — <em>consentement</em> (que vous
          pouvez retirer à tout moment).
        </li>
        <li>
          Mesure d'audience et amélioration du site — <em>consentement</em> pour
          les traceurs non essentiels, ou <em>intérêt légitime</em>.
        </li>
        <li>
          Prévention de la fraude et sécurité — <em>intérêt légitime</em>.
        </li>
      </ul>

      <h2>4. Destinataires des données</h2>
      <p>
        Vos données sont destinées aux services internes habilités de{" "}
        {c.legalName} et à ses sous-traitants agissant pour son compte
        (prestataire de paiement Stripe, transporteurs, hébergeur, prestataire
        d'e-mailing). Ces sous-traitants sont tenus par des obligations de
        confidentialité et de sécurité. Vos données ne sont jamais vendues.
      </p>

      <h2>5. Transferts hors Union européenne</h2>
      <p>
        Certains prestataires peuvent être situés hors de l'Union européenne. Le
        cas échéant, ces transferts sont encadrés par des garanties appropriées
        (clauses contractuelles types de la Commission européenne).
      </p>

      <h2>6. Durée de conservation</h2>
      <ul>
        <li>Données de compte client : pendant la durée de la relation, puis 3 ans après le dernier contact.</li>
        <li>Données de commande et factures : 10 ans (obligation comptable).</li>
        <li>Données de prospection : 3 ans à compter du dernier contact.</li>
        <li>Cookies : 13 mois maximum.</li>
      </ul>

      <h2>7. Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez des droits d'accès, de rectification,
        d'effacement, de limitation, d'opposition et de portabilité de vos
        données, ainsi que du droit de définir des directives relatives à leur
        sort après votre décès. Vous pouvez exercer ces droits en écrivant à{" "}
        <a href={`mailto:${c.dpoContact}`}>{c.dpoContact}</a>, en justifiant de
        votre identité.
      </p>
      <p>
        Vous pouvez également introduire une réclamation auprès de la CNIL (3
        place de Fontenoy, 75007 Paris —{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          www.cnil.fr
        </a>
        ).
      </p>

      <h2>8. Sécurité</h2>
      <p>
        {c.legalName} met en œuvre des mesures techniques et organisationnelles
        appropriées pour protéger vos données contre la perte, l'accès non
        autorisé ou la divulgation (chiffrement des échanges, contrôle des
        accès).
      </p>
    </LegalLayout>
  )
}
