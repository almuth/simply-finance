import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

/**
 * Migration runner script
 * Run this script to apply all pending migrations to the database
 * Usage: npm run db:migrate
 */

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not defined in environment variables');
    process.exit(1);
  }

  console.log('🔄 Running migrations...');

  const connection = await mysql.createConnection(databaseUrl);
  const db = drizzle(connection);

  try {
    await migrate(db, { migrationsFolder: './server/db/migrations' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }

  process.exit(0);
}

main();
