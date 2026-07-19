import { Metadata } from "next"
import LegalLayout from "@/modules/legal/components/legal-layout"
import { COMPANY_INFO, fullAddress } from "@/lib/legal/company-info"

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site Taran Industrie : éditeur, hébergeur et informations réglementaires.",
}

export default function MentionsLegalesPage() {
  const c = COMPANY_INFO

  return (
    <LegalLayout title="Mentions légales" lastUpdated="8 juillet 2026">
      <p>
        Conformément aux dispositions de l'article 6-III de la loi n° 2004-575
        du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), il
        est porté à la connaissance des utilisateurs du site les présentes
        mentions légales.
      </p>

      <h2>1. Éditeur du site</h2>
      <ul>
        <li>Dénomination sociale : <strong>{c.legalName}</strong></li>
        <li>Forme juridique : {c.legalForm}</li>
        <li>Capital social : {c.shareCapital}</li>
        <li>Siège social : {fullAddress}</li>
        <li>SIRET : {c.siret}</li>
        <li>RCS : {c.rcs}</li>
        <li>N° de TVA intracommunautaire : {c.vatNumber}</li>
        <li>Téléphone : {c.phone}</li>
        <li>
          E-mail : <a href={`mailto:${c.email}`}>{c.email}</a>
        </li>
        <li>Directeur de la publication : {c.publicationDirector}</li>
      </ul>

      <h2>2. Hébergeur du site</h2>
      <ul>
        <li>{c.host.name}</li>
        <li>{c.host.address}</li>
        <li>{c.host.phone}</li>
      </ul>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L'ensemble des éléments composant le site (textes, images, logos,
        graphismes, structure, base de données) est la propriété exclusive de{" "}
        {c.legalName} ou de ses partenaires, et est protégé par le droit de la
        propriété intellectuelle. Toute reproduction, représentation,
        modification ou exploitation, totale ou partielle, sans autorisation
        écrite préalable, est interdite et constitue une contrefaçon.
      </p>

      <h2>4. Responsabilité</h2>
      <p>
        {c.legalName} s'efforce d'assurer l'exactitude et la mise à jour des
        informations diffusées sur le site, mais ne saurait être tenue
        responsable des erreurs, omissions ou d'une indisponibilité des
        informations. Les liens hypertextes présents sur le site vers d'autres
        sites n'engagent pas la responsabilité de {c.legalName} quant à leur
        contenu.
      </p>

      <h2>5. Données personnelles et cookies</h2>
      <p>
        Le traitement de vos données personnelles est décrit dans notre{" "}
        <a href="/confidentialite">politique de confidentialité</a>. La gestion
        des traceurs est décrite dans notre{" "}
        <a href="/cookies">politique de gestion des cookies</a>.
      </p>
    </LegalLayout>
  )
}
