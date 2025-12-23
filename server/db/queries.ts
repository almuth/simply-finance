import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { getDb } from './index';
import {
  users,
  categories,
  income,
  expenses,
  balances,
  type NewUser,
  type NewCategory,
  type NewIncome,
  type NewExpense,
  type NewBalance,
} from './schema';

/**
 * Database query helpers
 * Reusable functions for common database operations
 */

export class DatabaseQueries {
  private db: Awaited<ReturnType<typeof getDb>>;

  constructor(db: Awaited<ReturnType<typeof getDb>>) {
    this.db = db;
  }

  async getUserById(id: number) {
    return await this.db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        categories: true,
        balances: {
          orderBy: desc(balances.date),
          limit: 1,
        },
      },
    });
  }

  async getUserByEmail(email: string) {
    return await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async createUser(userData: NewUser) {
    return await this.db.insert(users).values(userData);
  }

  async getCategoriesByUser(userId: number, type?: 'income' | 'expense') {
    const conditions = type
      ? and(eq(categories.userId, userId), eq(categories.type, type))
      : eq(categories.userId, userId);

    return await this.db.query.categories.findMany({
      where: conditions,
    });
  }

  async createCategory(categoryData: NewCategory) {
    return await this.db.insert(categories).values(categoryData);
  }

  async getIncomeByUser(
    userId: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const conditions = [eq(income.userId, userId)];

    if (startDate) {
      conditions.push(gte(income.date, startDate));
    }

    if (endDate) {
      conditions.push(lte(income.date, endDate));
    }

    return await this.db.query.income.findMany({
      where: and(...conditions),
      with: {
        category: true,
      },
      orderBy: desc(income.date),
    });
  }

  async createIncome(incomeData: NewIncome) {
    return await this.db.insert(income).values(incomeData);
  }

  async getExpensesByUser(
    userId: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const conditions = [eq(expenses.userId, userId)];

    if (startDate) {
      conditions.push(gte(expenses.date, startDate));
    }

    if (endDate) {
      conditions.push(lte(expenses.date, endDate));
    }

    return await this.db.query.expenses.findMany({
      where: and(...conditions),
      with: {
        category: true,
      },
      orderBy: desc(expenses.date),
    });
  }

  async createExpense(expenseData: NewExpense) {
    return await this.db.insert(expenses).values(expenseData);
  }

  async getBalancesByUser(userId: number, currency?: string) {
    const conditions = currency
      ? and(eq(balances.userId, userId), eq(balances.currency, currency))
      : eq(balances.userId, userId);

    return await this.db.query.balances.findMany({
      where: conditions,
      orderBy: desc(balances.date),
    });
  }

  async getLatestBalance(userId: number, currency: string = 'USD') {
    return await this.db.query.balances.findFirst({
      where: and(eq(balances.userId, userId), eq(balances.currency, currency)),
      orderBy: desc(balances.date),
    });
  }

  async createBalance(balanceData: NewBalance) {
    return await this.db.insert(balances).values(balanceData);
  }

  async getTransactionSummary(
    userId: number,
    startDate: Date,
    endDate: Date
  ) {
    const totalIncome = await this.db
      .select({
        total: sql<number>`COALESCE(SUM(${income.amount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(income)
      .where(
        and(
          eq(income.userId, userId),
          gte(income.date, startDate),
          lte(income.date, endDate)
        )
      );

    const totalExpenses = await this.db
      .select({
        total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      );

    return {
      income: {
        total: Number(totalIncome[0]?.total || 0),
        count: Number(totalIncome[0]?.count || 0),
      },
      expenses: {
        total: Number(totalExpenses[0]?.total || 0),
        count: Number(totalExpenses[0]?.count || 0),
      },
      net: Number(totalIncome[0]?.total || 0) - Number(totalExpenses[0]?.total || 0),
    };
  }

  async getCategorySpending(
    userId: number,
    startDate: Date,
    endDate: Date
  ) {
    return await this.db
      .select({
        categoryId: expenses.categoryId,
        categoryName: categories.name,
        total: sql<number>`SUM(${expenses.amount})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      )
      .groupBy(expenses.categoryId, categories.name);
  }
}

export async function createDatabaseQueries() {
  const db = await getDb();
  return new DatabaseQueries(db);
}
