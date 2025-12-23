# Drizzle ORM Query Examples

This document provides practical examples for common database operations using Drizzle ORM with the Finance Tracker schema.

## Table of Contents
- [Setup & Connection](#setup--connection)
- [User Operations](#user-operations)
- [Category Operations](#category-operations)
- [Income Operations](#income-operations)
- [Expense Operations](#expense-operations)
- [Balance Operations](#balance-operations)
- [Advanced Queries](#advanced-queries)
- [Aggregations](#aggregations)
- [Transactions](#transactions)

---

## Setup & Connection

### Get Database Instance

```typescript
import { getDb } from '~/server/db';

const db = await getDb();
```

### Import Schema

```typescript
import { users, categories, income, expenses, balances } from '~/server/db/schema';
import { eq, and, or, gte, lte, desc, asc, sql } from 'drizzle-orm';
```

---

## User Operations

### Create a User

```typescript
const [result] = await db.insert(users).values({
  email: 'user@example.com',
  name: 'John Doe',
});

const userId = result.insertId;
```

### Find User by ID

```typescript
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});
```

### Find User by Email

```typescript
const user = await db.query.users.findFirst({
  where: eq(users.email, 'user@example.com'),
});
```

### Get User with All Related Data

```typescript
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    categories: true,
    income: {
      limit: 10,
      orderBy: desc(income.date),
    },
    expenses: {
      limit: 10,
      orderBy: desc(expenses.date),
    },
    balances: {
      limit: 1,
      orderBy: desc(balances.date),
    },
  },
});
```

### Update User

```typescript
await db
  .update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, userId));
```

### Delete User (cascades to all related records)

```typescript
await db.delete(users).where(eq(users.id, userId));
```

---

## Category Operations

### Create Category

```typescript
await db.insert(categories).values({
  name: 'Salary',
  type: 'income',
  userId: 1,
});
```

### Bulk Create Categories

```typescript
await db.insert(categories).values([
  { name: 'Salary', type: 'income', userId: 1 },
  { name: 'Freelance', type: 'income', userId: 1 },
  { name: 'Groceries', type: 'expense', userId: 1 },
  { name: 'Rent', type: 'expense', userId: 1 },
]);
```

### Get All Categories for User

```typescript
const userCategories = await db.query.categories.findMany({
  where: eq(categories.userId, userId),
  orderBy: asc(categories.name),
});
```

### Get Income Categories Only

```typescript
const incomeCategories = await db.query.categories.findMany({
  where: and(
    eq(categories.userId, userId),
    eq(categories.type, 'income')
  ),
});
```

### Get Category with Transaction Count

```typescript
const categoryWithStats = await db
  .select({
    id: categories.id,
    name: categories.name,
    type: categories.type,
    incomeCount: sql<number>`COUNT(DISTINCT ${income.id})`,
    expenseCount: sql<number>`COUNT(DISTINCT ${expenses.id})`,
  })
  .from(categories)
  .leftJoin(income, eq(categories.id, income.categoryId))
  .leftJoin(expenses, eq(categories.id, expenses.categoryId))
  .where(eq(categories.userId, userId))
  .groupBy(categories.id, categories.name, categories.type);
```

---

## Income Operations

### Create Income Record

```typescript
await db.insert(income).values({
  userId: 1,
  categoryId: 1,
  amount: '5000.00',
  description: 'Monthly salary',
  date: new Date('2024-01-01'),
});
```

### Get All Income for User

```typescript
const allIncome = await db.query.income.findMany({
  where: eq(income.userId, userId),
  orderBy: desc(income.date),
  with: {
    category: true,
  },
});
```

### Get Income by Date Range

```typescript
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-12-31');

const incomeInRange = await db.query.income.findMany({
  where: and(
    eq(income.userId, userId),
    gte(income.date, startDate),
    lte(income.date, endDate)
  ),
  orderBy: desc(income.date),
});
```

### Get Income by Category

```typescript
const salaryIncome = await db.query.income.findMany({
  where: and(
    eq(income.userId, userId),
    eq(income.categoryId, categoryId)
  ),
  orderBy: desc(income.date),
});
```

### Update Income Record

```typescript
await db
  .update(income)
  .set({
    amount: '5500.00',
    description: 'Monthly salary (updated)',
  })
  .where(eq(income.id, incomeId));
```

### Delete Income Record

```typescript
await db.delete(income).where(eq(income.id, incomeId));
```

---

## Expense Operations

### Create Expense Record

```typescript
await db.insert(expenses).values({
  userId: 1,
  categoryId: 3,
  amount: '150.75',
  description: 'Weekly groceries',
  date: new Date(),
});
```

### Get Recent Expenses (Last 30 Days)

```typescript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const recentExpenses = await db.query.expenses.findMany({
  where: and(
    eq(expenses.userId, userId),
    gte(expenses.date, thirtyDaysAgo)
  ),
  orderBy: desc(expenses.date),
  with: {
    category: true,
  },
});
```

### Get Expenses by Category

```typescript
const groceryExpenses = await db.query.expenses.findMany({
  where: and(
    eq(expenses.userId, userId),
    eq(expenses.categoryId, categoryId)
  ),
  orderBy: desc(expenses.date),
});
```

### Get Paginated Expenses

```typescript
const page = 1;
const pageSize = 20;

const paginatedExpenses = await db.query.expenses.findMany({
  where: eq(expenses.userId, userId),
  orderBy: desc(expenses.date),
  limit: pageSize,
  offset: (page - 1) * pageSize,
});
```

### Search Expenses by Description

```typescript
import { like } from 'drizzle-orm';

const searchResults = await db.query.expenses.findMany({
  where: and(
    eq(expenses.userId, userId),
    like(expenses.description, '%grocery%')
  ),
});
```

---

## Balance Operations

### Create Balance Record

```typescript
await db.insert(balances).values({
  userId: 1,
  amount: '10000.00',
  currency: 'USD',
  date: new Date(),
});
```

### Get Latest Balance

```typescript
const latestBalance = await db.query.balances.findFirst({
  where: and(
    eq(balances.userId, userId),
    eq(balances.currency, 'USD')
  ),
  orderBy: desc(balances.date),
});
```

### Get Balance History

```typescript
const balanceHistory = await db.query.balances.findMany({
  where: eq(balances.userId, userId),
  orderBy: desc(balances.date),
  limit: 12, // Last 12 balance snapshots
});
```

### Get Balance at Specific Date

```typescript
const specificDate = new Date('2024-01-01');

const balanceAtDate = await db.query.balances.findFirst({
  where: and(
    eq(balances.userId, userId),
    lte(balances.date, specificDate)
  ),
  orderBy: desc(balances.date),
});
```

---

## Advanced Queries

### Get Monthly Summary

```typescript
const getMonthlyData = async (userId: number, year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const [incomeResult] = await db
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

  const [expenseResult] = await db
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
      total: Number(incomeResult.total),
      count: Number(incomeResult.count),
    },
    expenses: {
      total: Number(expenseResult.total),
      count: Number(expenseResult.count),
    },
    net: Number(incomeResult.total) - Number(expenseResult.total),
  };
};
```

### Get Spending by Category

```typescript
const spendingByCategory = await db
  .select({
    categoryId: expenses.categoryId,
    categoryName: categories.name,
    total: sql<number>`SUM(${expenses.amount})`,
    count: sql<number>`COUNT(*)`,
    avgAmount: sql<number>`AVG(${expenses.amount})`,
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
  .groupBy(expenses.categoryId, categories.name)
  .orderBy(sql`SUM(${expenses.amount}) DESC`);
```

### Get Top Expense Categories

```typescript
const topCategories = await db
  .select({
    categoryName: categories.name,
    totalSpent: sql<number>`SUM(${expenses.amount})`,
    transactionCount: sql<number>`COUNT(*)`,
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
  .groupBy(categories.name)
  .orderBy(sql`SUM(${expenses.amount}) DESC`)
  .limit(5);
```

### Get Daily Expense Trend

```typescript
const dailyTrend = await db
  .select({
    date: sql<string>`DATE(${expenses.date})`,
    total: sql<number>`SUM(${expenses.amount})`,
    count: sql<number>`COUNT(*)`,
  })
  .from(expenses)
  .where(
    and(
      eq(expenses.userId, userId),
      gte(expenses.date, startDate),
      lte(expenses.date, endDate)
    )
  )
  .groupBy(sql`DATE(${expenses.date})`)
  .orderBy(sql`DATE(${expenses.date})`);
```

---

## Aggregations

### Total Income

```typescript
const [result] = await db
  .select({
    total: sql<number>`COALESCE(SUM(${income.amount}), 0)`,
  })
  .from(income)
  .where(eq(income.userId, userId));

const totalIncome = Number(result.total);
```

### Average Expense Amount

```typescript
const [result] = await db
  .select({
    avg: sql<number>`AVG(${expenses.amount})`,
  })
  .from(expenses)
  .where(eq(expenses.userId, userId));

const averageExpense = Number(result.avg);
```

### Count Transactions

```typescript
const [incomeCount] = await db
  .select({ count: sql<number>`COUNT(*)` })
  .from(income)
  .where(eq(income.userId, userId));

const [expenseCount] = await db
  .select({ count: sql<number>`COUNT(*)` })
  .from(expenses)
  .where(eq(expenses.userId, userId));
```

---

## Transactions

### Database Transaction (Multiple Operations)

```typescript
import { getDb } from '~/server/db';

const db = await getDb();

// Using manual transaction control
const connection = await db.execute(sql`START TRANSACTION`);

try {
  // Create income
  const [incomeResult] = await db.insert(income).values({
    userId: 1,
    categoryId: 1,
    amount: '1000.00',
    description: 'Freelance payment',
    date: new Date(),
  });

  // Update balance
  const currentBalance = await db.query.balances.findFirst({
    where: eq(balances.userId, 1),
    orderBy: desc(balances.date),
  });

  const newBalance = Number(currentBalance?.amount || 0) + 1000;

  await db.insert(balances).values({
    userId: 1,
    amount: newBalance.toFixed(2),
    currency: 'USD',
    date: new Date(),
  });

  // Commit transaction
  await db.execute(sql`COMMIT`);
  
  console.log('Transaction completed successfully');
} catch (error) {
  // Rollback on error
  await db.execute(sql`ROLLBACK`);
  console.error('Transaction failed:', error);
  throw error;
}
```

---

## Complex Filters

### Multiple Conditions (OR)

```typescript
import { or } from 'drizzle-orm';

// Get expenses from multiple categories
const multiCategoryExpenses = await db.query.expenses.findMany({
  where: and(
    eq(expenses.userId, userId),
    or(
      eq(expenses.categoryId, 1),
      eq(expenses.categoryId, 2),
      eq(expenses.categoryId, 3)
    )
  ),
});
```

### Amount Range Filter

```typescript
import { between } from 'drizzle-orm';

// Get expenses between $50 and $200
const expensesInRange = await db.query.expenses.findMany({
  where: and(
    eq(expenses.userId, userId),
    gte(expenses.amount, '50.00'),
    lte(expenses.amount, '200.00')
  ),
});
```

### Exclude Certain Categories

```typescript
import { not } from 'drizzle-orm';

const expensesExcludingRent = await db.query.expenses.findMany({
  where: and(
    eq(expenses.userId, userId),
    not(eq(expenses.categoryId, rentCategoryId))
  ),
});
```

---

## Performance Tips

### Use Indexes Effectively

```typescript
// ✅ GOOD - Uses indexed userId first
await db.query.expenses.findMany({
  where: and(
    eq(expenses.userId, userId),  // Indexed
    gte(expenses.date, startDate) // Indexed
  ),
});

// ❌ BAD - Full table scan
await db.query.expenses.findMany({
  where: like(expenses.description, '%grocery%'), // Not indexed
});
```

### Select Only Needed Columns

```typescript
// ✅ GOOD - Select specific columns
const expenses = await db
  .select({
    id: expenses.id,
    amount: expenses.amount,
    date: expenses.date,
  })
  .from(expenses)
  .where(eq(expenses.userId, userId));

// ❌ BAD - Selects all columns
const expenses = await db.query.expenses.findMany({
  where: eq(expenses.userId, userId),
});
```

### Use Pagination

```typescript
// ✅ GOOD - Paginated results
const expenses = await db.query.expenses.findMany({
  where: eq(expenses.userId, userId),
  limit: 20,
  offset: 0,
});

// ❌ BAD - Loads all records
const expenses = await db.query.expenses.findMany({
  where: eq(expenses.userId, userId),
});
```

---

## Helpful Utilities

### Format Currency

```typescript
const formatCurrency = (amount: string | number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(amount));
};

// Usage
console.log(formatCurrency('1234.56')); // $1,234.56
```

### Get Date Range

```typescript
const getMonthRange = (year: number, month: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const getYearRange = (year: number) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end };
};
```

---

This guide covers the most common query patterns for the Finance Tracker application. For more advanced Drizzle ORM features, visit: https://orm.drizzle.team/docs/overview
