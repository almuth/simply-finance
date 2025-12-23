import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { getDb } from '~/server/db';
import { income, expenses } from '~/server/db/schema';

/**
 * GET /api/transactions/summary
 * Example endpoint to get transaction summary for a user
 * Query params: userId (required), startDate, endDate
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const userId = Number(query.userId);

  if (!userId || isNaN(userId)) {
    return {
      success: false,
      error: 'Valid userId is required',
    };
  }

  try {
    const db = await getDb();

    const startDate = query.startDate
      ? new Date(query.startDate as string)
      : new Date(new Date().getFullYear(), 0, 1);

    const endDate = query.endDate
      ? new Date(query.endDate as string)
      : new Date();

    const dateConditions = (dateField: any) => [
      eq(dateField, userId),
      gte(dateField, startDate),
      lte(dateField, endDate),
    ];

    const totalIncome = await db
      .select({
        total: sql<number>`COALESCE(SUM(${income.amount}), 0)`,
      })
      .from(income)
      .where(
        and(
          eq(income.userId, userId),
          gte(income.date, startDate),
          lte(income.date, endDate)
        )
      );

    const totalExpenses = await db
      .select({
        total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      );

    const incomeAmount = Number(totalIncome[0]?.total || 0);
    const expenseAmount = Number(totalExpenses[0]?.total || 0);
    const netAmount = incomeAmount - expenseAmount;

    return {
      success: true,
      data: {
        userId,
        period: {
          start: startDate,
          end: endDate,
        },
        summary: {
          totalIncome: incomeAmount,
          totalExpenses: expenseAmount,
          netAmount,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    return {
      success: false,
      error: 'Failed to fetch transaction summary',
    };
  }
});
