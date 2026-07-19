# Context — Taran Industrie

Glossary of the domain language for the Taran Industrie B2B commerce platform
(Medusa backend + Next.js storefront). This file is a glossary only — no
implementation details, no specs.

## Terms

### Pro
A customer whose company has a **validated SIRET** (`siret_validation_status =
"validated"`). Pros see prices in **HT**. A pro pays the same total as a
Particulier — being a Pro changes price *presentation*, not price *amount*.

### Particulier
Any customer who is not a Pro (no company, or SIRET not yet validated). Sees
prices in **TTC**.

### HT (hors taxes)
Price display mode showing the amount **without VAT folded in**. Shown to Pros.
VAT is still collected at payment; the Pro reclaims it via their VAT return.

### TTC (toutes taxes comprises)
Price display mode showing the amount **with VAT included**. Shown to
Particuliers. Default mode.

### SIRET validation status
Lifecycle of a company's SIRET check: `none` → `pending` → `validated` /
`rejected`. Only `validated` unlocks HT display (Pro status). Validation can be
automatic (INSEE Sirene lookup) or manual (admin approval/rejection).

### Entreprises / Particuliers (customer groups)
Customer groups assigned at signup based on whether a `company_name` was given.
Currently **not** wired to any pricing — distinct from the Pro/Particulier
pricing distinction above, which is driven by SIRET status.

### Shipping profile
A named, currency-scoped set of weight-based shipping prices, optionally with a
free-shipping threshold, and carrying a **Colissimo product code**. Surfaced as a
fulfillment option; one profile = one selectable shipping option = one Colissimo
service.

### Colissimo product code
The Colissimo service a Shipping profile maps to, sent to the Colissimo Web
Service when generating a label. In scope: `DOM` (Domicile sans signature) and
`DOS` (Domicile avec signature).

### Colissimo Web Service (Affranchissement)
The Colissimo Entreprise label-generation API. Given recipient + sender + weight
+ contract number, it returns a **shipping label** and a **tracking number**.
This is the automation path (La Poste Pro Expédition has no API).

### Shipping label (étiquette)
The PDF document returned by Colissimo to affix on the parcel. Stored via the
Medusa File Module; its URL is exposed on the fulfillment for the admin to print.

### Tracking number (numéro de suivi)
The parcel identifier returned by Colissimo, stored on the fulfillment and sent
to the customer with a laposte.fr tracking link. May also be **entered manually**
as a fallback when the Web Service is unavailable.

### Weight tier
A `[min_weight, max_weight]` band (in **kg**) within a Shipping profile that maps
the cart's total weight to a flat shipping price. Product weights are stored in
**grams** and converted to kg for tier matching.

### Free-shipping threshold
A cart-subtotal amount on a Shipping profile above which shipping is free,
bypassing weight tiers.
