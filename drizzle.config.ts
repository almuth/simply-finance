import type { Config } from 'drizzle-kit';

export default {
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  driver: 'mysql2',
  dbCredentials: {
    uri: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/finance_tracker',
  },
  verbose: true,
  strict: true,
} satisfies Config;
