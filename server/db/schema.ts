import { relations } from 'drizzle-orm';
import {
  mysqlTable,
  int,
  varchar,
  decimal,
  datetime,
  mysqlEnum,
  index,
  timestamp,
} from 'drizzle-orm/mysql-core';

/**
 * Users table - Store user/account information
 * Each user represents an account holder who can track their finances
 */
export const users = mysqlTable(
  'users',
  {
    id: int('id').primaryKey().autoincrement(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    emailIdx: index('email_idx').on(table.email),
  })
);

/**
 * Categories table - Categorize income and expense transactions
 * Categories can be either 'income' or 'expense' type
 * Each category belongs to a specific user for customization
 */
export const categories = mysqlTable(
  'categories',
  {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 100 }).notNull(),
    type: mysqlEnum('type', ['income', 'expense']).notNull(),
    userId: int('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('user_id_idx').on(table.userId),
    typeIdx: index('type_idx').on(table.type),
    userTypeIdx: index('user_type_idx').on(table.userId, table.type),
  })
);

/**
 * Income table - Track all income sources and transactions
 * Uses DECIMAL(10,2) for precise financial calculations
 * Indexed by userId and date for efficient querying
 */
export const income = mysqlTable(
  'income',
  {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryId: int('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    description: varchar('description', { length: 500 }),
    date: datetime('date').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index('income_user_id_idx').on(table.userId),
    dateIdx: index('income_date_idx').on(table.date),
    categoryIdIdx: index('income_category_id_idx').on(table.categoryId),
    userDateIdx: index('income_user_date_idx').on(table.userId, table.date),
  })
);

/**
 * Expenses table - Track all expense transactions
 * Uses DECIMAL(10,2) for precise financial calculations
 * Indexed by userId and date for efficient querying and reporting
 */
export const expenses = mysqlTable(
  'expenses',
  {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryId: int('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    description: varchar('description', { length: 500 }),
    date: datetime('date').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index('expenses_user_id_idx').on(table.userId),
    dateIdx: index('expenses_date_idx').on(table.date),
    categoryIdIdx: index('expenses_category_id_idx').on(table.categoryId),
    userDateIdx: index('expenses_user_date_idx').on(table.userId, table.date),
  })
);

/**
 * Balances table - Track account balances over time
 * Supports multiple currencies for international users
 * Uses DECIMAL(10,2) for precise balance tracking
 */
export const balances = mysqlTable(
  'balances',
  {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    date: datetime('date').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('balances_user_id_idx').on(table.userId),
    dateIdx: index('balances_date_idx').on(table.date),
    userDateIdx: index('balances_user_date_idx').on(table.userId, table.date),
    currencyIdx: index('balances_currency_idx').on(table.currency),
  })
);

/**
 * Define relationships between tables
 * These enable type-safe joins and eager loading with Drizzle ORM
 */

export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  income: many(income),
  expenses: many(expenses),
  balances: many(balances),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  income: many(income),
  expenses: many(expenses),
}));

export const incomeRelations = relations(income, ({ one }) => ({
  user: one(users, {
    fields: [income.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [income.categoryId],
    references: [categories.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
}));

export const balancesRelations = relations(balances, ({ one }) => ({
  user: one(users, {
    fields: [balances.userId],
    references: [users.id],
  }),
}));

// Export types for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Income = typeof income.$inferSelect;
export type NewIncome = typeof income.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type Balance = typeof balances.$inferSelect;
export type NewBalance = typeof balances.$inferInsert;
