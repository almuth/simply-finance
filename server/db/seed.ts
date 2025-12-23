import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

/**
 * Seed script to populate the database with sample data
 * Usage: tsx server/db/seed.ts
 */

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not defined in environment variables');
    process.exit(1);
  }

  console.log('🌱 Seeding database...');

  const connection = await mysql.createConnection(databaseUrl);
  const db = drizzle(connection, { schema });

  try {
    console.log('Creating users...');
    const [user1] = await db
      .insert(schema.users)
      .values([
        {
          email: 'john@example.com',
          name: 'John Doe',
        },
        {
          email: 'jane@example.com',
          name: 'Jane Smith',
        },
      ]);

    const userId = user1.insertId;

    console.log('Creating categories...');
    const [incomeCategories] = await db
      .insert(schema.categories)
      .values([
        {
          name: 'Salary',
          type: 'income',
          userId,
        },
        {
          name: 'Freelance',
          type: 'income',
          userId,
        },
        {
          name: 'Investments',
          type: 'income',
          userId,
        },
      ]);

    const [expenseCategories] = await db
      .insert(schema.categories)
      .values([
        {
          name: 'Groceries',
          type: 'expense',
          userId,
        },
        {
          name: 'Rent',
          type: 'expense',
          userId,
        },
        {
          name: 'Transportation',
          type: 'expense',
          userId,
        },
        {
          name: 'Entertainment',
          type: 'expense',
          userId,
        },
        {
          name: 'Utilities',
          type: 'expense',
          userId,
        },
      ]);

    const salaryCategoryId = incomeCategories.insertId;
    const freelanceCategoryId = incomeCategories.insertId + 1;
    const groceriesCategoryId = expenseCategories.insertId;
    const rentCategoryId = expenseCategories.insertId + 1;
    const transportCategoryId = expenseCategories.insertId + 2;

    console.log('Creating income records...');
    await db.insert(schema.income).values([
      {
        userId,
        categoryId: salaryCategoryId,
        amount: '5000.00',
        description: 'Monthly salary',
        date: new Date('2024-01-01'),
      },
      {
        userId,
        categoryId: freelanceCategoryId,
        amount: '1500.00',
        description: 'Website development project',
        date: new Date('2024-01-15'),
      },
      {
        userId,
        categoryId: salaryCategoryId,
        amount: '5000.00',
        description: 'Monthly salary',
        date: new Date('2024-02-01'),
      },
    ]);

    console.log('Creating expense records...');
    await db.insert(schema.expenses).values([
      {
        userId,
        categoryId: rentCategoryId,
        amount: '1200.00',
        description: 'Monthly rent payment',
        date: new Date('2024-01-05'),
      },
      {
        userId,
        categoryId: groceriesCategoryId,
        amount: '350.50',
        description: 'Weekly groceries',
        date: new Date('2024-01-10'),
      },
      {
        userId,
        categoryId: transportCategoryId,
        amount: '80.00',
        description: 'Gas and parking',
        date: new Date('2024-01-12'),
      },
      {
        userId,
        categoryId: groceriesCategoryId,
        amount: '280.75',
        description: 'Weekly groceries',
        date: new Date('2024-01-17'),
      },
      {
        userId,
        categoryId: rentCategoryId,
        amount: '1200.00',
        description: 'Monthly rent payment',
        date: new Date('2024-02-05'),
      },
    ]);

    console.log('Creating balance records...');
    await db.insert(schema.balances).values([
      {
        userId,
        amount: '10000.00',
        currency: 'USD',
        date: new Date('2024-01-01'),
      },
      {
        userId,
        amount: '13588.75',
        currency: 'USD',
        date: new Date('2024-02-01'),
      },
    ]);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }

  process.exit(0);
}

main();
