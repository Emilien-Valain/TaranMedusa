import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import {
  adminHeaders,
  createAdminUser,
  createStoreUser,
} from "../../utils/admin";
import {
  cartSeeder,
  productSeeder,
  regionSeeder,
  salesChannelSeeder,
} from "../../utils/seeder";
import {
  generatePublishableKey,
  generateStoreHeaders,
} from "../../utils/store";
import { syncPricingGroups } from "../../../src/lib/pricing-group";
import { COMPANY_MODULE } from "../../../src/modules/company";

jest.setTimeout(60 * 1000);

medusaIntegrationTestRunner({
  env: {
    JWT_SECRET: "supersecret",
  },
  testSuite: ({ api, getContainer }) => {
    let storeHeaders, cart, product, salesChannel, region, customerToken;

    beforeEach(async () => {
      const container = getContainer();
      await createAdminUser(adminHeaders, container);
      const publishableKey = await generatePublishableKey(container);
      storeHeaders = generateStoreHeaders({ publishableKey });
      const res = await createStoreUser({ api, storeHeaders });
      customerToken = res.token;
      console.log("vic logs customerToken", customerToken);
      storeHeaders.headers["Authorization"] = `Bearer ${customerToken}`;
      console.log("vic logs storeHeaders", storeHeaders);
      region = await regionSeeder({ api, adminHeaders, data: {} });

      salesChannel = await salesChannelSeeder({
        api,
        adminHeaders,
        data: {},
      });

      product = await productSeeder({
        api,
        adminHeaders,
        data: {
          sales_channels: [{ id: salesChannel.id }],
        },
      });

      await api.post(
        `/admin/api-keys/${publishableKey.id}/sales-channels`,
        { add: [salesChannel.id] },
        adminHeaders
      );

      cart = await cartSeeder({
        api,
        storeHeaders,
        data: {
          region_id: region.id,
          sales_channel_id: salesChannel.id,
          items: [{ quantity: 1, variant_id: product.variants[0].id }],
        },
      });
    });

    describe("POST /store/companies", () => {
      it("successfully creates a company", async () => {
        const response = await api.post(
          "/store/companies",
          {
            name: "Test Company",
            email: "test@company.com",
            phone: "1234567890",
            address: "123 Test St",
            city: "Test City",
            state: "Test State",
            zip: "12345",
            country: "Test Country",
            logo_url: "http://test.com/logo.png",
            currency_code: "USD",
            spending_limit_reset_frequency: "monthly",
          },
          storeHeaders
        );

        expect(response.status).toEqual(200);
        expect(response.data.companies[0]).toMatchObject({
          id: expect.any(String),
          name: "Test Company",
          email: "test@company.com",
          phone: "1234567890",
          address: "123 Test St",
          city: "Test City",
          state: "Test State",
          zip: "12345",
          country: "Test Country",
          logo_url: "http://test.com/logo.png",
          currency_code: "USD",
        });
      });
    });

    describe("GET /store/companies/:id", () => {
      it("successfully retrieves a company", async () => {
        const response1 = await api.post(
          "/store/companies",
          {
            name: "Test Company",
            email: "test@company.com",
            phone: "1234567890",
            address: "123 Test St",
            city: "Test City",
            state: "Test State",
            zip: "12345",
            country: "Test Country",
            logo_url: "http://test.com/logo.png",
            currency_code: "USD",
            spending_limit_reset_frequency: "monthly",
          },
          storeHeaders
        );

        const response2 = await api.get(
          `/store/companies/${response1.data.companies[0].id}`,
          storeHeaders
        );

        expect(response2.data.company).toMatchObject({
          id: expect.any(String),
          name: "Test Company",
          email: "test@company.com",
          phone: "1234567890",
          address: "123 Test St",
          city: "Test City",
          state: "Test State",
          zip: "12345",
          country: "Test Country",
          logo_url: "http://test.com/logo.png",
          currency_code: "USD",
        });
      });

      it("should throw error when company does not exist", async () => {
        const { response } = await api
          .get(`/store/companies/does-not-exist`, storeHeaders)
          .catch((e) => e);

        expect(response.data).toMatchObject({
          type: "not_found",
        });
      });
    });

    describe("POST /store/companies/:id", () => {
      let company1;

      beforeEach(async () => {
        const response = await api.post(
          "/store/companies",
          {
            name: "Test Company",
            email: "test@company.com",
            phone: "1234567890",
            address: "123 Test St",
            city: "Test City",
            state: "Test State",
            zip: "12345",
            country: "Test Country",
            logo_url: "http://test.com/logo.png",
            currency_code: "USD",
            spending_limit_reset_frequency: "monthly",
          },
          storeHeaders
        );

        company1 = response.data.companies[0];
      });

      it("successfully updates a company", async () => {
        const response = await api.post(
          `/store/companies/${company1.id}`,
          {
            name: "Updated Company",
            email: "updated@company.com",
            phone: "0987654321",
            address: "456 Updated Ave",
            city: "Updated City",
            state: "Updated State",
            zip: "54321",
            country: "Updated Country",
            logo_url: "http://updated.com/logo.png",
            currency_code: "EUR",
            spending_limit_reset_frequency: "yearly",
          },
          storeHeaders
        );

        expect(response.data.company).toMatchObject({
          id: company1.id,
          name: "Updated Company",
          email: "updated@company.com",
          phone: "0987654321",
          address: "456 Updated Ave",
          city: "Updated City",
          state: "Updated State",
          zip: "54321",
          country: "Updated Country",
          logo_url: "http://updated.com/logo.png",
          currency_code: "EUR",
        });
      });

      it("should throw an error when company does not exist", async () => {
        const { response } = await api
          .post(
            `/store/companies/does-not-exist`,
            { name: "Nonexistent Company" },
            storeHeaders
          )
          .catch((e) => e);

        expect(response.data).toMatchObject({
          type: "not_found",
        });
      });
    });

    describe("DELETE /store/companies/:id", () => {
      console.log("vic logs storeHeaders", storeHeaders);
      let company1;

      beforeEach(async () => {
        const response = await api.post(
          "/store/companies",
          {
            name: "Test Company",
            email: "test@company.com",
            phone: "1234567890",
            address: "123 Test St",
            city: "Test City",
            state: "Test State",
            zip: "12345",
            country: "Test Country",
            logo_url: "http://test.com/logo.png",
            currency_code: "USD",
            spending_limit_reset_frequency: "monthly",
          },
          storeHeaders
        );

        company1 = response.data.companies[0];
      });

      it("successfully deletes a company", async () => {
        const response = await api.delete(
          `/store/companies/${company1.id}`,
          storeHeaders
        );

        expect(response.status).toEqual(204);
      });

      it("should throw an error when company does not exist", async () => {
        const response = await api
          .delete(`/store/companies/does-not-exist`, storeHeaders)
          .catch((e) => e);

        expect(response.status).toEqual(204);
      });
    });

    // Medusa >= 2.21 retire les champs non autorisés des routes Store (cf. src/api/middlewares.ts)
    describe("Liens B2B exposés sur les routes Store", () => {
      let company;

      beforeEach(async () => {
        company = (
          await api.post(
            "/store/companies",
            {
              name: "Test Company",
              email: "test@company.com",
              currency_code: "EUR",
            },
            storeHeaders
          )
        ).data.companies[0];

        const { customer } = (
          await api.get("/store/customers/me", storeHeaders)
        ).data;

        await api.post(
          `/store/companies/${company.id}/employees`,
          { customer_id: customer.id, is_admin: true },
          storeHeaders
        );
      });

      it("GET /store/customers/me renvoie employee.company", async () => {
        const { customer } = (
          await api.get(
            "/store/customers/me?fields=*employee,*employee.company",
            storeHeaders
          )
        ).data;

        expect(customer.employee.company).toEqual(
          expect.objectContaining({
            id: company.id,
            siret_validation_status: expect.any(String),
          })
        );
      });

      it("syncPricingGroups : groupe Entreprises seulement si SIRET validé", async () => {
        const container = getContainer();
        const query = container.resolve("query");
        const { customer } = (
          await api.get("/store/customers/me", storeHeaders)
        ).data;
        const groupNames = async () => {
          const { data } = await query.graph({
            entity: "customer",
            fields: ["groups.name"],
            filters: { id: customer.id },
          });
          return data[0].groups.map((g) => g.name).sort();
        };

        await syncPricingGroups(container, [customer.id]);
        expect(await groupNames()).toEqual(["Particuliers"]);

        await container.resolve(COMPANY_MODULE).updateCompanies({
          id: company.id,
          siret_validation_status: "validated",
        });
        await syncPricingGroups(container, [customer.id]);
        expect(await groupNames()).toEqual(["Entreprises"]);

        await container.resolve(COMPANY_MODULE).updateCompanies({
          id: company.id,
          siret_validation_status: "rejected",
        });
        await syncPricingGroups(container, [customer.id]);
        expect(await groupNames()).toEqual(["Particuliers"]);
      });

      it("GET /store/carts/:id renvoie company et approvals", async () => {
        const companyCart = await cartSeeder({
          api,
          storeHeaders,
          data: {
            region_id: region.id,
            sales_channel_id: salesChannel.id,
            metadata: { company_id: company.id },
          },
        });

        const { cart: fetched } = (
          await api.get(
            `/store/carts/${companyCart.id}?fields=*company,*company.approval_settings,*approvals,*approval_status`,
            storeHeaders
          )
        ).data;

        expect(fetched.company).toEqual(
          expect.objectContaining({ id: company.id })
        );
        expect(fetched).toHaveProperty("company.approval_settings");
        expect(fetched).toHaveProperty("approvals");
      });
    });
  },
});
