import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Les champs « Poids » du dashboard Medusa sont libellés via deux clés i18n :
//   - `fields.weight` : section Attributes (page produit), variantes, inventaire
//   - `products.fields.weight.label` : formulaire de création/édition produit
// On les surcharge en français pour préciser l'unité attendue (grammes), car le
// calcul des frais de port au poids interprète cette valeur en grammes.
//
// Note : ces clés servent aussi aux variantes/inventaire, eux aussi en grammes —
// la précision reste donc cohérente partout.
const OVERRIDES: Record<string, Record<string, unknown>> = {
  fr: {
    fields: { weight: "Poids (grammes)" },
    products: { fields: { weight: { label: "Poids (grammes)" } } },
  },
};

const ProductWeightLabelWidget = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    let changed = false;

    for (const [lng, resources] of Object.entries(OVERRIDES)) {
      // deep=true, overwrite=true : fusionne sans écraser le reste du bundle.
      i18n.addResourceBundle(lng, "translation", resources, true, true);
      changed = true;
    }

    // react-i18next ne re-render pas sur un simple ajout de ressources ;
    // on force le rafraîchissement des composants déjà montés (SectionRow).
    if (changed) {
      i18n.changeLanguage(i18n.language);
    }
  }, [i18n]);

  return null;
};

export const config = defineWidgetConfig({
  zone: "product.details.before",
});

export default ProductWeightLabelWidget;
