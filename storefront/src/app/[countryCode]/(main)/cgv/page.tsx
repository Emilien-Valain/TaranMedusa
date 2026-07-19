import { Metadata } from "next"
import LegalLayout from "@/modules/legal/components/legal-layout"
import {
  COMPANY_INFO,
  fullAddress,
  EU_ODR_PLATFORM,
} from "@/lib/legal/company-info"

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente (CGV) du site Taran Industrie : commande, prix, livraison, droit de rétractation, garanties et litiges.",
}

export default function CgvPage() {
  const c = COMPANY_INFO

  return (
    <LegalLayout
      title="Conditions générales de vente"
      lastUpdated="8 juillet 2026"
    >
      <p>
        Les présentes conditions générales de vente (les « CGV ») régissent les
        ventes de produits conclues sur le site de {c.legalName} ({fullAddress}).
        Elles s'appliquent aux clients particuliers (consommateurs) comme aux
        clients professionnels. Certaines clauses, expressément identifiées,
        s'appliquent uniquement à l'une de ces catégories.
      </p>

      <h2>Article 1 — Objet et acceptation</h2>
      <p>
        Toute commande passée sur le site implique l'acceptation sans réserve
        des présentes CGV. Le client déclare en avoir pris connaissance et les
        avoir acceptées en cochant la case prévue à cet effet avant la
        validation de sa commande.
      </p>

      <h2>Article 2 — Produits</h2>
      <p>
        Les produits proposés sont ceux figurant sur le site au jour de la
        consultation, dans la limite des stocks disponibles. Les
        caractéristiques essentielles de chaque produit sont présentées sur les
        fiches produits. Les photographies et visuels sont non contractuels.
      </p>

      <h2>Article 3 — Prix</h2>
      <ul>
        <li>
          Les prix sont indiqués en euros. Pour les clients particuliers, ils
          sont affichés toutes taxes comprises (TTC). Pour les clients
          professionnels, l'affichage peut être proposé hors taxes (HT), la TVA
          au taux en vigueur étant ajoutée.
        </li>
        <li>
          Les frais de livraison sont indiqués avant la validation de la
          commande et s'ajoutent au prix des produits.
        </li>
        <li>
          {c.legalName} se réserve le droit de modifier ses prix à tout moment,
          étant entendu que les produits sont facturés sur la base des tarifs en
          vigueur au moment de la validation de la commande.
        </li>
      </ul>

      <h2>Article 4 — Commande</h2>
      <p>
        Le processus de commande comprend la sélection des produits, la
        vérification du panier, la saisie des informations de livraison et de
        facturation, le choix du mode de livraison, l'acceptation des présentes
        CGV puis le paiement. La commande n'est définitive qu'après confirmation
        du paiement. Un e-mail de confirmation récapitulant la commande est
        adressé au client.
      </p>

      <h2>Article 5 — Paiement</h2>
      <p>
        Le paiement s'effectue en ligne par carte bancaire via notre prestataire
        de paiement sécurisé Stripe, ou par tout autre moyen proposé lors de la
        commande. Les données de paiement sont transmises de manière chiffrée et
        ne sont pas conservées par {c.legalName}. La commande est traitée après
        acceptation du paiement.
      </p>

      <h2>Article 6 — Livraison</h2>
      <ul>
        <li>
          Les produits sont livrés à l'adresse indiquée par le client lors de la
          commande, dans les délais précisés lors de la commande.
        </li>
        <li>
          Conformément à l'article L216-1 du Code de la consommation, en
          l'absence d'indication, la livraison intervient au plus tard 30 jours
          après la conclusion du contrat.
        </li>
        <li>
          En cas de retard de livraison, le client consommateur peut, dans les
          conditions des articles L216-2 et suivants, résoudre le contrat si la
          livraison n'intervient pas dans un délai supplémentaire raisonnable.
        </li>
        <li>
          Les risques liés au transport sont transférés au client consommateur à
          la remise physique du produit. Pour les clients professionnels, le
          transfert des risques intervient à la remise au transporteur.
        </li>
      </ul>

      <h2>
        Article 7 — Droit de rétractation{" "}
        <span className="text-sm font-normal text-neutral-500">
          (clients consommateurs uniquement)
        </span>
      </h2>
      <p>
        Conformément aux articles L221-18 et suivants du Code de la
        consommation, le client consommateur dispose d'un délai de{" "}
        <strong>quatorze (14) jours</strong> à compter de la réception des
        produits pour exercer son droit de rétractation, sans avoir à justifier
        de motif ni à payer de pénalité.
      </p>
      <p>
        Pour exercer ce droit, le client notifie sa décision au moyen d'une
        déclaration dénuée d'ambiguïté (courrier ou e-mail à{" "}
        <a href={`mailto:${c.email}`}>{c.email}</a>) ou en utilisant le
        formulaire type ci-dessous. Les produits doivent être retournés dans un
        délai de 14 jours suivant la notification. Les frais de retour sont à la
        charge du client, sauf mention contraire. Le remboursement intervient au
        plus tard 14 jours après récupération des produits (ou preuve de
        l'expédition), par le même moyen de paiement que celui utilisé lors de
        la commande.
      </p>
      <p>
        Conformément à l'article L221-28 du Code de la consommation, le droit de
        rétractation ne s'applique pas notamment aux biens confectionnés selon
        les spécifications du consommateur ou nettement personnalisés, ni aux
        biens qui, après avoir été livrés et de par leur nature, sont mélangés
        de manière indissociable avec d'autres articles.
      </p>

      <h3>Formulaire type de rétractation</h3>
      <p className="border border-neutral-200 rounded-md p-4 bg-neutral-50 whitespace-pre-line text-sm">
        {`À l'attention de ${c.legalName}, ${fullAddress} — ${c.email} :

Je vous notifie par la présente ma rétractation du contrat portant sur la vente du bien ci-dessous :

- Commandé le / reçu le : __________
- Numéro de commande : __________
- Nom du consommateur : __________
- Adresse du consommateur : __________
- Date : __________
- Signature (si notification papier) : __________`}
      </p>

      <h2>
        Article 8 — Ventes aux professionnels{" "}
        <span className="text-sm font-normal text-neutral-500">
          (clients professionnels uniquement)
        </span>
      </h2>
      <p>
        Les ventes conclues avec un client professionnel agissant dans le cadre
        de son activité ne bénéficient pas du droit de rétractation prévu à
        l'article 7. Sauf convention particulière, les commandes professionnelles
        sont fermes et définitives dès leur validation. Les éventuelles
        conditions de facturation, de délais de paiement et de pénalités de
        retard applicables aux professionnels sont régies par les articles
        L441-9 et suivants du Code de commerce.
      </p>

      <h2>Article 9 — Garanties légales</h2>
      <p>
        Indépendamment de toute garantie commerciale, le client consommateur
        bénéficie des garanties légales suivantes :
      </p>
      <ul>
        <li>
          <strong>Garantie légale de conformité</strong> (articles L217-3 et
          suivants du Code de la consommation) : le vendeur est tenu de livrer un
          bien conforme au contrat. Le consommateur dispose d'un délai de deux
          ans à compter de la délivrance du bien pour agir, et peut choisir entre
          la réparation ou le remplacement du bien.
        </li>
        <li>
          <strong>Garantie des vices cachés</strong> (articles 1641 et suivants
          du Code civil) : le consommateur peut décider de mettre en œuvre la
          garantie contre les défauts cachés de la chose vendue, dans un délai de
          deux ans à compter de la découverte du vice.
        </li>
      </ul>

      <h2>Article 10 — Service client</h2>
      <p>
        Pour toute question ou réclamation, le service client est joignable par
        e-mail à <a href={`mailto:${c.email}`}>{c.email}</a> ou par téléphone au{" "}
        {c.phone}.
      </p>

      <h2>Article 11 — Médiation et règlement des litiges</h2>
      <p>
        Conformément à l'article L612-1 du Code de la consommation, le client
        consommateur peut recourir gratuitement à un médiateur de la
        consommation en vue de la résolution amiable d'un litige l'opposant à{" "}
        {c.legalName}. Le médiateur compétent est :
      </p>
      <ul>
        <li>{c.mediator.name}</li>
        <li>{c.mediator.address}</li>
        <li>{c.mediator.website}</li>
      </ul>
      <p>
        Le consommateur peut également recourir à la plateforme européenne de
        règlement en ligne des litiges :{" "}
        <a href={EU_ODR_PLATFORM} target="_blank" rel="noopener noreferrer">
          {EU_ODR_PLATFORM}
        </a>
        .
      </p>

      <h2>Article 12 — Droit applicable</h2>
      <p>
        Les présentes CGV sont soumises au droit français. En cas de litige et à
        défaut de résolution amiable, les tribunaux français seront compétents
        dans les conditions de droit commun.
      </p>
    </LegalLayout>
  )
}
