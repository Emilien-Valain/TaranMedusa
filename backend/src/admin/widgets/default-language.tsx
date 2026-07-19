import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Medusa n'expose aucune option serveur pour la langue par défaut de l'admin :
// la langue est détectée côté client par i18next (cookie/localStorage `lng`,
// puis langue du navigateur, avec fallback `en`).
//
// Ce widget force le français au tout premier chargement, une seule fois.
// Ensuite, le choix de langue de l'utilisateur (Paramètres > Profil) est
// respecté : on ne réécrit jamais sa préférence.
const DEFAULT_LANGUAGE = "fr";
const APPLIED_FLAG = "lng_default_applied";

const DefaultLanguageWidget = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (localStorage.getItem(APPLIED_FLAG)) {
      return;
    }

    localStorage.setItem(APPLIED_FLAG, "1");

    if (i18n.language !== DEFAULT_LANGUAGE) {
      i18n.changeLanguage(DEFAULT_LANGUAGE);
    }
  }, [i18n]);

  return null;
};

export const config = defineWidgetConfig({
  zone: "login.after",
});

export default DefaultLanguageWidget;
