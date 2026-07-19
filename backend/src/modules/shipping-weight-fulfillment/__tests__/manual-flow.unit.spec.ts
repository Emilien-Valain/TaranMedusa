/**
 * Vérifie le flux d'expédition MANUEL du provider Colissimo.
 *
 * Objectif : garantir qu'aucune des branches « manuelles » de
 * `createFulfillment` ne déclenche d'appel au Web Service Colissimo
 * (appel facturable). On mocke la lib `colissimo` : `generateColissimoLabel`
 * lève si elle est appelée, ce qui ferait échouer le test.
 */

// La lib Colissimo est mockée : tout appel réseau est ainsi impossible.
jest.mock("../../../lib/colissimo", () => ({
  generateColissimoLabel: jest.fn(async () => {
    throw new Error("APPEL COLISSIMO INTERDIT dans le flux manuel");
  }),
  isColissimoConfigured: jest.fn(() => true),
  toColissimoAddress: jest.fn(() => ({ line2: "", city: "", zipCode: "", countryCode: "FR" })),
}));

import { SHIPPING_WEIGHT_MODULE } from "../../shipping-weight";
import { generateColissimoLabel } from "../../../lib/colissimo";
import ShippingWeightFulfillmentService from "../service";

const generateLabelMock = generateColissimoLabel as jest.Mock;

type ProfileStub = { colissimo_product_code: string | null };

function buildService(opts: {
  profile?: ProfileStub;
  configEnabled?: boolean;
}) {
  const container: any = {
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    [SHIPPING_WEIGHT_MODULE]: {
      retrieveProfileWithTiers: jest.fn(async () => opts.profile ?? { colissimo_product_code: "DOM" }),
      getOrCreateColissimoConfig: jest.fn(async () => ({
        enabled: opts.configEnabled ?? true,
      })),
    },
  };
  return new ShippingWeightFulfillmentService(container);
}

describe("ShippingWeightFulfillmentService — flux manuel (aucun appel Colissimo)", () => {
  beforeEach(() => {
    generateLabelMock.mockClear();
  });

  it("numéro de suivi saisi à la main → étiquette manuelle, pas d'appel Colissimo", async () => {
    const svc = buildService({});
    const res = await svc.createFulfillment(
      { manual_tracking_number: "6A11122233344" },
      [],
      {} as any,
      {} as any
    );

    expect(res.labels?.[0]?.tracking_number).toBe("6A11122233344");
    expect(res.labels?.[0]?.tracking_url).toContain("laposte.fr");
    expect((res.data as any).colissimo_manual).toBe(true);
    expect(generateLabelMock).not.toHaveBeenCalled();
  });

  it("colis déjà affranchi → anti-doublon, pas de nouvel appel Colissimo", async () => {
    const svc = buildService({});
    const res = await svc.createFulfillment(
      { colissimo_parcel_number: "6A999888777", colissimo_label_url: "http://x/l.pdf" },
      [],
      {} as any,
      {} as any
    );

    expect(res.labels?.[0]?.tracking_number).toBe("6A999888777");
    expect(res.labels?.[0]?.label_url).toBe("http://x/l.pdf");
    expect(generateLabelMock).not.toHaveBeenCalled();
  });

  it("Colissimo désactivé (enabled=false) → fulfillment sans étiquette, pas d'appel", async () => {
    const svc = buildService({ configEnabled: false });
    const res = await svc.createFulfillment(
      { id: "profile_1" },
      [],
      {} as any,
      {} as any
    );

    expect(res.labels).toEqual([]);
    expect(generateLabelMock).not.toHaveBeenCalled();
  });

  it("profil sans code produit Colissimo → skip manuel, pas d'appel", async () => {
    const svc = buildService({ profile: { colissimo_product_code: null } });
    const res = await svc.createFulfillment(
      { id: "profile_sans_code" },
      [],
      {} as any,
      {} as any
    );

    expect(res.labels).toEqual([]);
    expect(generateLabelMock).not.toHaveBeenCalled();
  });
});
