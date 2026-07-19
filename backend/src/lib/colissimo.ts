/**
 * Client minimal du Web Service Colissimo « Affranchissement » (SLS REST).
 *
 * Doc officielle :
 * https://www.applications.colissimo.entreprise.laposte.fr/doc-colissimo/redoc-sls/fr
 *
 * Méthode utilisée : POST {base}/generateLabel
 * Réponse : multipart/mixed — une partie JSON ("jsonInfos") + une partie
 * binaire ("label") contenant l'étiquette (PDF/ZPL selon outputPrintingType).
 *
 * Authentification : on privilégie l'apiKey (recommandé par Colissimo) ; à
 * défaut on retombe sur contractNumber + password (déprécié mais fonctionnel).
 */

export type ColissimoAddress = {
  companyName?: string | null;
  lastName?: string | null;
  firstName?: string | null;
  /** Étage, couloir, escalier, appartement. */
  line0?: string | null;
  /** Entrée, bâtiment, immeuble, résidence. */
  line1?: string | null;
  /** Numéro et libellé de voie (ligne principale). */
  line2: string;
  /** Lieu-dit ou autre mention. */
  line3?: string | null;
  /** Code pays ISO 2 lettres. */
  countryCode: string;
  city: string;
  zipCode: string;
  phoneNumber?: string | null;
  mobileNumber?: string | null;
  email?: string | null;
};

/** Identifiants Colissimo, fournis par l'appelant (config admin), repli env. */
export type ColissimoCredentials = {
  apiKey?: string | null;
  contractNumber?: string | null;
  password?: string | null;
  baseUrl?: string | null;
};

export type GenerateLabelParams = {
  /** Code produit Colissimo (ex. "DOM", "DOS"). */
  productCode: string;
  /** Poids du colis en kilogrammes. */
  weightKg: number;
  sender: ColissimoAddress;
  addressee: ColissimoAddress;
  orderNumber?: string;
  commercialName?: string;
  senderParcelRef?: string;
  addresseeParcelRef?: string;
  /** Format d'impression (sinon COLISSIMO_LABEL_FORMAT ou PDF_A4_300dpi). */
  outputPrintingType?: string;
  /** Identifiants (sinon variables d'environnement). */
  credentials?: ColissimoCredentials;
};

export type GenerateLabelResult = {
  parcelNumber: string;
  parcelNumberPartner?: string;
  label: Buffer;
  /** application/pdf, application/zpl, ... déduit du format demandé. */
  labelContentType: string;
  labelExtension: string;
};

export class ColissimoError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = "ColissimoError";
  }
}

function getBaseUrl(creds?: ColissimoCredentials): string {
  return (
    creds?.baseUrl ||
    process.env.COLISSIMO_WS_BASE_URL ||
    "https://ws.colissimo.fr/sls-ws/SlsServiceWSRest/2.0"
  );
}

function getDefaultFormat(): string {
  return process.env.COLISSIMO_LABEL_FORMAT || "PDF_A4_300dpi";
}

export function isColissimoConfigured(creds?: ColissimoCredentials): boolean {
  const apiKey = creds?.apiKey || process.env.COLISSIMO_API_KEY;
  const contract = creds?.contractNumber || process.env.COLISSIMO_CONTRACT_NUMBER;
  const password = creds?.password || process.env.COLISSIMO_PASSWORD;
  return Boolean(apiKey || (contract && password));
}

function todayDepositDate(): string {
  // Format attendu : YYYY-MM-DD
  return new Date().toISOString().slice(0, 10);
}

function contentTypeForFormat(format: string): {
  contentType: string;
  extension: string;
} {
  const f = format.toUpperCase();
  if (f.startsWith("ZPL")) return { contentType: "application/zpl", extension: "zpl" };
  if (f.startsWith("DPL")) return { contentType: "application/dpl", extension: "dpl" };
  return { contentType: "application/pdf", extension: "pdf" };
}

type ParsedPart = { headers: string; body: Buffer };

/** Découpe une réponse multipart/mixed en parties (headers + corps binaire). */
function parseMultipart(buffer: Buffer, boundary: string): ParsedPart[] {
  const delimiter = Buffer.from(`--${boundary}`);
  const parts: ParsedPart[] = [];

  let start = buffer.indexOf(delimiter);
  if (start === -1) return parts;
  start += delimiter.length;

  while (start < buffer.length) {
    // Fin du multipart : "--boundary--"
    if (buffer[start] === 0x2d && buffer[start + 1] === 0x2d) break;

    // Sauter le CRLF qui suit le délimiteur.
    if (buffer[start] === 0x0d && buffer[start + 1] === 0x0a) start += 2;

    const next = buffer.indexOf(delimiter, start);
    const end = next === -1 ? buffer.length : next;

    const segment = buffer.subarray(start, end);
    const sep = segment.indexOf(Buffer.from("\r\n\r\n"));
    if (sep !== -1) {
      const headers = segment.subarray(0, sep).toString("utf8");
      let body = segment.subarray(sep + 4);
      // Retirer le CRLF de fin précédant le prochain délimiteur.
      if (body.length >= 2 && body[body.length - 2] === 0x0d && body[body.length - 1] === 0x0a) {
        body = body.subarray(0, body.length - 2);
      }
      parts.push({ headers, body });
    }

    if (next === -1) break;
    start = next + delimiter.length;
  }

  return parts;
}

function buildAddress(addr: ColissimoAddress): Record<string, unknown> {
  const out: Record<string, unknown> = {
    countryCode: addr.countryCode,
    city: addr.city,
    zipCode: addr.zipCode,
    line2: addr.line2,
  };
  // On n'envoie pas les champs facultatifs vides (recommandation Colissimo).
  const optional: (keyof ColissimoAddress)[] = [
    "companyName",
    "lastName",
    "firstName",
    "line0",
    "line1",
    "line3",
    "phoneNumber",
    "mobileNumber",
    "email",
  ];
  for (const key of optional) {
    const value = addr[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Source d'adresse « à la Medusa » (delivery_address, shipping_address,
 * stock location address) → adresse Colissimo. Helper pur, réutilisable
 * (provider createFulfillment aujourd'hui, traitement en lot plus tard).
 */
export type MedusaLikeAddress = {
  company?: string | null;
  company_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  phone?: string | null;
};

function isMobile(phone?: string | null): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, "");
  return /^(\+?33|0)?[67]/.test(digits) || /^0[67]/.test(phone);
}

export function toColissimoAddress(
  src: MedusaLikeAddress,
  opts: { fallbackCompanyName?: string | null; email?: string | null } = {}
): ColissimoAddress {
  const phone = src.phone ?? null;
  return {
    companyName: src.company ?? src.company_name ?? opts.fallbackCompanyName ?? null,
    firstName: src.first_name ?? null,
    lastName: src.last_name ?? null,
    line1: src.address_2 ?? null,
    line2: src.address_1 ?? "",
    city: src.city ?? "",
    zipCode: src.postal_code ?? "",
    countryCode: (src.country_code ?? "FR").toUpperCase(),
    phoneNumber: phone && !isMobile(phone) ? phone : null,
    mobileNumber: phone && isMobile(phone) ? phone : null,
    email: opts.email ?? null,
  };
}

export async function generateColissimoLabel(
  params: GenerateLabelParams
): Promise<GenerateLabelResult> {
  const creds = params.credentials;
  if (!isColissimoConfigured(creds)) {
    throw new ColissimoError(
      "Colissimo non configuré : renseignez l'apiKey (ou contrat + mot de passe) dans l'admin ou les variables d'environnement."
    );
  }

  if (!(params.weightKg > 0)) {
    throw new ColissimoError(
      "Poids du colis invalide (0 kg) : vérifiez que les produits ont un poids renseigné."
    );
  }

  const format = params.outputPrintingType || getDefaultFormat();
  const apiKey = creds?.apiKey || process.env.COLISSIMO_API_KEY;

  const body: Record<string, unknown> = {
    outputFormat: {
      x: 0,
      y: 0,
      outputPrintingType: format,
    },
    letter: {
      service: {
        productCode: params.productCode,
        depositDate: todayDepositDate(),
        ...(params.orderNumber ? { orderNumber: params.orderNumber } : {}),
        ...(params.commercialName
          ? { commercialName: params.commercialName }
          : {}),
      },
      parcel: {
        weight: Number(params.weightKg.toFixed(3)),
      },
      sender: {
        ...(params.senderParcelRef
          ? { senderParcelRef: params.senderParcelRef }
          : {}),
        address: buildAddress(params.sender),
      },
      addressee: {
        ...(params.addresseeParcelRef
          ? { addresseeParcelRef: params.addresseeParcelRef }
          : {}),
        address: buildAddress(params.addressee),
      },
    },
  };

  if (!apiKey) {
    body.contractNumber =
      creds?.contractNumber || process.env.COLISSIMO_CONTRACT_NUMBER;
    body.password = creds?.password || process.env.COLISSIMO_PASSWORD;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "multipart/mixed",
  };
  if (apiKey) headers["apiKey"] = apiKey;

  let res: Response;
  try {
    res = await fetch(`${getBaseUrl(creds)}/generateLabel`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new ColissimoError(
      `Colissimo injoignable : ${(e as Error).message}`,
      e
    );
  }

  const contentType = res.headers.get("content-type") || "";

  // Réponse multipart attendue en cas de succès.
  if (contentType.includes("multipart/")) {
    const boundaryMatch = /boundary=("?)([^";]+)\1/i.exec(contentType);
    const boundary = boundaryMatch?.[2];
    const buffer = Buffer.from(await res.arrayBuffer());

    if (!boundary) {
      throw new ColissimoError(
        "Réponse Colissimo multipart sans boundary exploitable."
      );
    }

    const parts = parseMultipart(buffer, boundary);
    const jsonPart = parts.find(
      (p) =>
        /content-type:\s*application\/json/i.test(p.headers) ||
        /jsonInfos/i.test(p.headers)
    );
    const labelPart = parts.find((p) => /\blabel\b/i.test(p.headers));

    let info: any = {};
    if (jsonPart) {
      try {
        info = JSON.parse(jsonPart.body.toString("utf8"));
      } catch {
        // garde info = {}
      }
    }

    const messages = info?.messages ?? [];
    const parcelNumber =
      info?.labelV2Response?.parcelNumber ?? info?.parcelNumber;

    const errorMsg = (messages as any[]).find((m) =>
      /ERROR|ERREUR/i.test(m?.type || "")
    );
    if (errorMsg) {
      throw new ColissimoError(
        `Colissimo a refusé l'étiquette : ${errorMsg.messageContent}`,
        messages
      );
    }

    if (!parcelNumber || !labelPart) {
      throw new ColissimoError(
        "Réponse Colissimo incomplète (numéro de colis ou étiquette manquant).",
        info
      );
    }

    const { contentType: labelCt, extension } = contentTypeForFormat(format);
    return {
      parcelNumber,
      parcelNumberPartner:
        info?.labelV2Response?.parcelNumberPartner ?? info?.parcelNumberPartner,
      label: labelPart.body,
      labelContentType: labelCt,
      labelExtension: extension,
    };
  }

  // Sinon : erreur (JSON ou texte).
  const text = await res.text();
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = undefined;
  }
  const firstMessage = parsed?.messages?.[0]?.messageContent;
  throw new ColissimoError(
    `Erreur Colissimo (HTTP ${res.status})${
      firstMessage ? " : " + firstMessage : text ? " : " + text.slice(0, 300) : ""
    }`,
    parsed ?? text
  );
}
