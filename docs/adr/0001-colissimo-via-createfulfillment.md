# 1. Génération des étiquettes Colissimo via `createFulfillment`

Date : 2026-06-10
Statut : Accepté

## Contexte

« La Poste Pro Expédition » n'offre aucune API. Le contrat **Colissimo
Entreprise**, lui, inclut le **Web Service Affranchissement** : on envoie
destinataire + poids + n° de contrat, il renvoie une étiquette (PDF/ZPL) **et**
un numéro de suivi. On veut « faciliter l'envoi des commandes » depuis
l'administration Medusa.

Contrainte Medusa : une commande est rattachée à **un seul** fulfillment
provider, et seul `createFulfillment` de ce provider est appelé lors de
l'expédition. Le provider sélectionné est déjà `shipping-weight` (calcul du prix
au poids). Un provider « Colissimo » distinct ne verrait jamais son
`createFulfillment` appelé.

Trois approches envisagées :
- **A** — implémenter `createFulfillment` dans le provider `shipping-weight`
  existant pour appeler Colissimo (unitaire, au fil de l'eau).
- **B** — outil admin en lot dédié (page de sélection + PDF fusionné),
  provider laissé en calcul de prix seul.
- **C** — les deux, sur un workflow commun.

## Décision

On retient **A**. La brique réutilisable est `src/lib/colissimo.ts` (client du
Web Service + mapping d'adresse `toColissimoAddress`), appelée depuis
`createFulfillment` du provider `shipping-weight`. On n'écrit pas d'outil en lot
pour l'instant.

Note d'architecture : `createFulfillment` s'exécute dans le conteneur du module
Fulfillment, pas le conteneur applicatif. On y injecte donc `Stock Location` et
`File` via `dependencies` (medusa-config) pour lire l'adresse expéditeur et
stocker l'étiquette. Le poids est lu directement sur la commande étendue
(`order.items[].variant.weight`, déjà chargée par le workflow de fulfillment de
Medusa), sans module supplémentaire. C'est pourquoi la brique réutilisable est
une **librairie pure** (`src/lib/colissimo.ts`) plutôt qu'un workflow Medusa
(non exécutable simplement depuis ce conteneur).

## Conséquences

**Positives :**
- On hérite gratuitement du stockage du numéro de suivi et de l'e-mail
  « commande expédiée » natifs de Medusa.
- Très peu de code ; un seul provider fait prix + étiquette.
- On reste dans la machine à états d'expédition native.

**Négatives :**
- Traitement **commande par commande** (pas d'impression groupée).

## Voie de migration vers C (en lot)

Parce que la logique d'appel vit dans `src/lib/colissimo.ts`, ajouter le lot
plus tard ne demande **aucune réécriture** du cœur :

1. Créer une page admin « Commandes à expédier » (liste filtrée sur les
   commandes payées non expédiées, avec cases à cocher).
2. Ajouter une route admin (ex. `POST /admin/colissimo/batch-labels`) qui reçoit
   une liste d'`order_id`. Cette route tourne dans le conteneur applicatif :
   elle peut donc charger chaque commande via Query (avec
   `items.variant.weight`, adresse, etc. — plus simple que dans le provider),
   appeler `generateColissimoLabel` (la même librairie), stocker le PDF via le
   File Module, puis déclencher `createOrderFulfillmentWorkflow` /
   `createShipmentWorkflow` pour garder l'état Medusa synchronisé.
3. Fusionner les PDF retournés en un seul document à imprimer.

Critère de bascule : passer à C quand le volume quotidien rend le traitement
unitaire pénible (repère indicatif : plusieurs dizaines de colis/jour).
