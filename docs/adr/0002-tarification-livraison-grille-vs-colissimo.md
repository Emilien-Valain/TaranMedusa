# 2. Tarification de la livraison : grille au poids manuelle (bascule possible vers le tarif Colissimo)

Date : 2026-06-10
Statut : Accepté

## Contexte

Le prix de port **payé par le client** au checkout peut être fixé de deux façons :

- **(A) Grille au poids définie par le marchand** — des tranches `[min, max] kg →
  prix` configurées dans l'admin (module `shipping-weight`). C'est l'implémentation
  actuelle (`calculatePrice` du provider).
- **(B) Tarif Colissimo en temps réel** — interroger Colissimo pour répercuter au
  client le tarif réel du transporteur.

Important : ce prix (ce que paie le client) est **distinct** du coût que Colissimo
facture au marchand à l'édition de l'étiquette. Cf. `CONTEXT.md` (Weight tier) et
`docs/adr/0001-colissimo-via-createfulfillment.md`.

## Décision

On garde **(A)**, la grille au poids manuelle. Raisons : contrôle total du prix
affiché (paliers ronds, marge, franco de port au-delà d'un montant), lisibilité
client, et fonctionnement sans dépendance à une API de cotation.

## Conséquences

- Le marchand doit **maintenir ses tranches** pour qu'elles couvrent au moins le
  coût réel Colissimo (sinon marge négative sur le port).
- Pas de répercussion automatique des évolutions tarifaires Colissimo.

## Voie de migration vers une « tarification Colissimo »

Deux niveaux, du plus simple au plus engageant :

### Niveau 1 — Recopier la grille officielle Colissimo (aucun dev)
Configurer les tranches de poids de chaque profil pour qu'elles **reprennent la
grille tarifaire officielle Colissimo** du contrat. On obtient de fait le « tarif
Colissimo », tout en gardant la maîtrise (arrondis, franco). C'est l'option
recommandée si l'objectif est juste « facturer le tarif Colissimo ».

### Niveau 2 — Cotation en temps réel via API (dev + vérification préalable)
> ⚠️ À confirmer d'abord avec Colissimo : le Web Service SLS couvre
> l'affranchissement (étiquettes), pas forcément une **cotation tarifaire** en
> ligne. Vérifier auprès du support (02 41 74 20 88) qu'un service de
> cotation/tarification est disponible sur le contrat **avant** d'envisager ce
> niveau.

Si une API de cotation existe :
1. Dans `calculatePrice` (provider `shipping-weight-fulfillment`), remplacer la
   recherche de tranche par un appel à l'API de cotation Colissimo, en réutilisant
   le poids déjà calculé et l'adresse de destination (`context`).
2. Conserver les tranches comme **repli** si l'API est indisponible (robustesse),
   et le franco de port (gratuité au-delà d'un seuil) en surcouche.
3. Mettre en cache les cotations pour ne pas appeler l'API à chaque rafraîchissement
   de panier.

Le point d'extension est déjà en place : `calculatePrice` est le seul endroit à
modifier, le reste de la chaîne (étiquette, suivi, e-mail) est indépendant du mode
de tarification.
