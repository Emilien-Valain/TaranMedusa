import { QUOTE_MODULE } from './src/modules/quote';
import { APPROVAL_MODULE } from './src/modules/approval';
import { COMPANY_MODULE } from './src/modules/company';
import { INVOICE_MODULE } from './src/modules/invoice';
import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV!, process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.CACHE_REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  modules: {
    [COMPANY_MODULE]: {
      resolve: './modules/company',
    },
    [QUOTE_MODULE]: {
      resolve: './modules/quote',
    },
    [APPROVAL_MODULE]: {
      resolve: './modules/approval',
    },
    [INVOICE_MODULE]: {
      resolve: './modules/invoice',
    },
    [Modules.CACHE]: {
      resolve: '@medusajs/cache-redis',
      options: {
        redisUrl: process.env.CACHE_REDIS_URL,
      },
    },
    [Modules.EVENT_BUS]: {
      resolve: '@medusajs/medusa/event-bus-redis',
      options: {
        redisUrl: process.env.CACHE_REDIS_URL,
      },
    },
    [Modules.WORKFLOW_ENGINE]: {
      resolve: '@medusajs/medusa/workflow-engine-inmemory',
    },
    [Modules.NOTIFICATION]: {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: './src/modules/smtp-notification',
            id: 'smtp',
            options: {
              host: process.env.SMTP_HOST,
              port: process.env.SMTP_PORT || 465,
              secure: process.env.SMTP_SECURE !== 'false',
              user: process.env.SMTP_USER,
              password: process.env.SMTP_PASSWORD,
              from: process.env.SMTP_FROM,
            },
          },
        ],
      },
    },
    [Modules.PAYMENT]: {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
        ],
      },
    },
  },
});
