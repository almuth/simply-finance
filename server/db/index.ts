import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

/**
 * Database connection configuration
 * Creates a MySQL connection pool and initializes Drizzle ORM
 */

let connection: mysql.Connection | undefined;
let db: ReturnType<typeof drizzle> | undefined;

/**
 * Get or create database connection
 * Uses connection pooling for better performance
 */
export const getDb = async () => {
  if (db) {
    return db;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not defined. Please set it in your .env file.'
    );
  }

  connection = await mysql.createConnection(databaseUrl);

  db = drizzle(connection, { schema, mode: 'default' });

  return db;
};

/**
 * Close database connection
 * Should be called when shutting down the application
 */
export const closeDb = async () => {
  if (connection) {
    await connection.end();
    connection = undefined;
    db = undefined;
  }
};

// Export schema for use in queries
export { schema };
