const INSEE_SIRENE_BASE_URL = "https://api.insee.fr/api-sirene/3.11";

export type InseeEtablissement = {
  siret: string;
  siren: string;
  etablissementSiege: boolean;
  dateCreationEtablissement: string | null;
  etatAdministratifEtablissement?: string;
  periodesEtablissement?: Array<{
    dateFin: string | null;
    dateDebut: string | null;
    etatAdministratifEtablissement: string;
    [k: string]: any;
  }>;
  uniteLegale: {
    denominationUniteLegale: string | null;
    categorieJuridiqueUniteLegale: string | null;
    activitePrincipaleUniteLegale: string | null;
    etatAdministratifUniteLegale: string;
    nomUniteLegale?: string | null;
    prenom1UniteLegale?: string | null;
  };
  adresseEtablissement: {
    numeroVoieEtablissement: string | null;
    typeVoieEtablissement: string | null;
    libelleVoieEtablissement: string | null;
    codePostalEtablissement: string | null;
    libelleCommuneEtablissement: string | null;
  };
};

/**
 * Nom « officiel » de l'établissement côté INSEE.
 * - Personne morale : denominationUniteLegale.
 * - Entreprise individuelle / auto-entrepreneur : pas de dénomination,
 *   on reconstruit à partir du prénom + nom.
 */
export function getInseeName(
  etab: InseeEtablissement | undefined | null
): string {
  const ul = etab?.uniteLegale;
  if (!ul) return "";
  if (ul.denominationUniteLegale) return ul.denominationUniteLegale;
  return [ul.prenom1UniteLegale, ul.nomUniteLegale]
    .filter(Boolean)
    .join(" ")
    .trim();
}

const LEGAL_FORMS =
  /\b(SARLU?|SASU?|EURL|SA|SCI|SCM|SCP|EIRL|EI|SNC|SCOP|SELARL|SELAS|SEL|GIE|SAS|SARL)\b/g;

/** Normalise un nom pour comparaison : MAJ, sans accents, sans forme juridique. */
export function normalizeCompanyName(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .toUpperCase()
    .replace(LEGAL_FORMS, " ")
    .replace(/[^A-Z0-9]+/g, " ") // ponctuation
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Correspondance « floue » entre le nom saisi et le nom INSEE.
 * Vrai si égalité, inclusion, ou recouvrement de tokens >= 60 %.
 */
export function isNameMatch(
  entered: string | null | undefined,
  inseeName: string | null | undefined
): boolean {
  const a = normalizeCompanyName(entered);
  const b = normalizeCompanyName(inseeName);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const ta = new Set(a.split(" ").filter(Boolean));
  const tb = new Set(b.split(" ").filter(Boolean));
  if (ta.size === 0 || tb.size === 0) return false;

  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  const overlap = shared / Math.min(ta.size, tb.size);
  return overlap >= 0.6;
}

export function getEtablissementState(
  etab: InseeEtablissement | undefined | null
): string | undefined {
  if (!etab) return undefined;
  if (etab.etatAdministratifEtablissement) {
    return etab.etatAdministratifEtablissement;
  }
  const periode = etab.periodesEtablissement?.find((p) => !p.dateFin);
  return (
    periode?.etatAdministratifEtablissement ??
    etab.periodesEtablissement?.[0]?.etatAdministratifEtablissement
  );
}

export type InseeLookupResult =
  | { found: true; etablissement: InseeEtablissement }
  | {
      found: false;
      reason: "not_found" | "ceased" | "api_error" | "unauthorized";
      message?: string;
      etablissement?: InseeEtablissement;
    };

function getApiKey(): string | null {
  return process.env.INSEE_API_KEY || null;
}

export function isInseeConfigured(): boolean {
  return Boolean(getApiKey());
}

export function isValidSiretFormat(siret: string): boolean {
  const cleaned = siret.replace(/\s/g, "");
  if (!/^\d{14}$/.test(cleaned)) return false;

  // La Poste exception: SIRET starting with 356 000 000 has a special rule
  if (cleaned.startsWith("356000000")) {
    const sum = cleaned
      .split("")
      .reduce((acc, d) => acc + parseInt(d, 10), 0);
    return sum % 5 === 0;
  }

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(cleaned[13 - i], 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export async function lookupSiret(siret: string): Promise<InseeLookupResult> {
  const cleaned = siret.replace(/\s/g, "");
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      found: false,
      reason: "api_error",
      message:
        "INSEE_API_KEY non configurée. Récupérez votre clé depuis portail-api.insee.fr et ajoutez-la au .env.",
    };
  }

  const res = await fetch(`${INSEE_SIRENE_BASE_URL}/siret/${cleaned}`, {
    headers: {
      "X-INSEE-Api-Key-Integration": apiKey,
      Accept: "application/json",
    },
  });

  if (res.status === 401 || res.status === 403) {
    const text = await res.text();
    return {
      found: false,
      reason: "unauthorized",
      message: `INSEE API key rejetée (${res.status}): ${text}`,
    };
  }

  if (res.status === 404) {
    return { found: false, reason: "not_found" };
  }

  if (!res.ok) {
    const text = await res.text();
    return {
      found: false,
      reason: "api_error",
      message: `INSEE API error (${res.status}): ${text}`,
    };
  }

  const data = (await res.json()) as { etablissement: InseeEtablissement };
  const etab = data.etablissement;
  const state = getEtablissementState(etab);

  if (state !== "A") {
    console.log(
      `[INSEE] SIRET ${cleaned} → état="${state}", raw response:`,
      JSON.stringify(data).slice(0, 1500)
    );
    return { found: false, reason: "ceased", etablissement: etab };
  }

  return { found: true, etablissement: etab };
}
