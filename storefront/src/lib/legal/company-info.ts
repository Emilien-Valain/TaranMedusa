/**
 * Informations légales de l'entreprise, centralisées ici pour être réutilisées
 * dans toutes les pages légales (mentions légales, CGV, CGU, confidentialité).
 *
 * ⚠️ À COMPLÉTER / VÉRIFIER par Taran Industrie avant mise en production.
 * Les valeurs entre crochets [...] sont des espaces réservés obligatoires.
 */
export const COMPANY_INFO = {
  // Identité
  legalName: 'Taran Industrie',
  legalForm: 'SAS',
  shareCapital: '300,00 €',

  // Adresse du siège
  address: "62 AVENUE DE L'ARBORESCENTE",
  postalCode: '85500',
  city: 'Les Herbiers',
  country: 'France',

  // Immatriculation
  siret: '82496073600026',
  rcs: '824 960 736 R.C.S. Laroche-sur-yon',
  vatNumber: 'FR67824960736',

  // Contact
  phone: '02 51 92 49 41',
  email: 'contact@taran-industrie.com',

  // Publication
  publicationDirector: 'DAGDA INVEST 5',

  // Hébergeur (obligatoire dans les mentions légales — LCEN art. 6-III)
  host: {
    name: 'OVH SAS',
    address: '2 rue Kellermann - 59100 Roubaix - France',
    phone: '',
  },

  // Médiateur de la consommation (obligatoire B2C — Code conso. L612-1)
  mediator: {
    name: '[À COMPLÉTER : nom du médiateur agréé]',
    website: '[À COMPLÉTER : site web du médiateur]',
    address: '[À COMPLÉTER : adresse du médiateur]',
  },

  // Délégué à la protection des données (DPO), le cas échéant
  dpoContact: 'contact@taran-industrie.com',
} as const

export const fullAddress = `${COMPANY_INFO.address}, ${COMPANY_INFO.postalCode} ${COMPANY_INFO.city}, ${COMPANY_INFO.country}`

/** Plateforme européenne de Règlement en Ligne des Litiges (obligatoire B2C). */
export const EU_ODR_PLATFORM = 'https://ec.europa.eu/consumers/odr'
