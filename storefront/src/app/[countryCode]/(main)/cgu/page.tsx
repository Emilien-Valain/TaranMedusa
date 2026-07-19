import { Metadata } from "next"
import LegalLayout from "@/modules/legal/components/legal-layout"
import { COMPANY_INFO } from "@/lib/legal/company-info"

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description:
    "Conditions générales d'utilisation (CGU) du site Taran Industrie : accès au site, compte client, responsabilités.",
}

export default function CguPage() {
  const c = COMPANY_INFO

  return (
    <LegalLayout
      title="Conditions générales d'utilisation"
      lastUpdated="8 juillet 2026"
    >
      <p>
        Les présentes conditions générales d'utilisation (les « CGU »)
        définissent les modalités d'accès et d'utilisation du site édité par{" "}
        {c.legalName}. Tout utilisateur du site reconnaît en avoir pris
        connaissance et les accepter.
      </p>

      <h2>Article 1 — Accès au site</h2>
      <p>
        Le site est accessible gratuitement à tout utilisateur disposant d'un
        accès à Internet. Les coûts liés à l'accès (matériel, connexion) sont à
        la charge de l'utilisateur. {c.legalName} met en œuvre les moyens
        raisonnables pour assurer un accès de qualité au site, sans obligation
        de résultat, et peut suspendre ou interrompre l'accès notamment pour des
        opérations de maintenance.
      </p>

      <h2>Article 2 — Compte client</h2>
      <p>
        Certaines fonctionnalités nécessitent la création d'un compte.
        L'utilisateur s'engage à fournir des informations exactes et à les tenir
        à jour. Il est seul responsable de la confidentialité de ses
        identifiants et de toute activité effectuée depuis son compte. En cas
        d'utilisation non autorisée, il s'engage à en informer sans délai{" "}
        {c.legalName}.
      </p>

      <h2>Article 3 — Comptes professionnels</h2>
      <p>
        Les utilisateurs agissant pour le compte d'une société peuvent être
        rattachés à un compte professionnel. La personne créant le compte
        garantit disposer des pouvoirs nécessaires pour engager la société qu'elle
        représente. Les informations d'immatriculation (SIRET notamment)
        fournies doivent être exactes.
      </p>

      <h2>Article 4 — Obligations de l'utilisateur</h2>
      <p>L'utilisateur s'engage à ne pas :</p>
      <ul>
        <li>
          utiliser le site à des fins illicites ou contraires à l'ordre public ;
        </li>
        <li>
          porter atteinte au fonctionnement du site (intrusion, injection,
          surcharge, contournement des mesures de sécurité) ;
        </li>
        <li>
          collecter des données concernant d'autres utilisateurs sans leur
          consentement ;
        </li>
        <li>
          reproduire ou exploiter le contenu du site en violation des droits de
          propriété intellectuelle.
        </li>
      </ul>

      <h2>Article 5 — Propriété intellectuelle</h2>
      <p>
        L'ensemble des contenus du site est protégé. Toute utilisation non
        expressément autorisée est constitutive d'une contrefaçon. Les
        conditions détaillées figurent dans nos{" "}
        <a href="/mentions-legales">mentions légales</a>.
      </p>

      <h2>Article 6 — Responsabilité</h2>
      <p>
        {c.legalName} ne saurait être tenue responsable des dommages résultant
        d'une mauvaise utilisation du site, d'une indisponibilité temporaire, ou
        de la présence de virus malgré les mesures de protection mises en place.
      </p>

      <h2>Article 7 — Données personnelles</h2>
      <p>
        Le traitement des données personnelles des utilisateurs est décrit dans
        la <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>Article 8 — Modification des CGU</h2>
      <p>
        {c.legalName} se réserve le droit de modifier les présentes CGU à tout
        moment. La version applicable est celle en vigueur au moment de
        l'utilisation du site.
      </p>

      <h2>Article 9 — Droit applicable</h2>
      <p>
        Les présentes CGU sont soumises au droit français. Tout litige relatif à
        leur interprétation ou exécution relève des tribunaux français.
      </p>
    </LegalLayout>
  )
}
