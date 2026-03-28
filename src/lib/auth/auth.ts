import db from '@/db';
import * as schema from '@/db/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { env } from 'cloudflare:workers';

const productionURL = env.BETTER_AUTH_URL;

export const auth = betterAuth({
  secret:
    env.BETTER_AUTH_SECRET ??
    'local-dev-only-better-auth-secret-minimum-32-chars',
  baseURL: productionURL ?? 'http://localhost:3001',
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    productionURL,
  ],
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
});

export type Session = typeof auth.$Infer.Session;
