# Database Schema Documentation

## Overview

This document provides detailed information about the database schema, relationships, and best practices for working with the financial tracking system.

## Schema Design Principles

### 1. Data Integrity
- All foreign keys use appropriate cascade rules
- User deletions cascade to all related records
- Category deletions are restricted if transactions exist
- Timestamps track record creation and updates

### 2. Performance Optimization
- Indexes on frequently queried fields (userId, date, categoryId)
- Composite indexes for common query patterns
- Efficient date range queries with indexed date fields

### 3. Financial Precision
- All monetary amounts use `DECIMAL(10,2)` type
- Supports values up to 99,999,999.99
- Prevents floating-point arithmetic errors

## Table Specifications

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX email_idx (email)
);
```

**Usage:**
- Stores user account information
- Email must be unique across the system
- Soft deletion not implemented (use status field if needed)

### Categories Table
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX user_id_idx (user_id),
  INDEX type_idx (type),
  INDEX user_type_idx (user_id, type)
);
```

**Usage:**
- Organize transactions into meaningful groups
- Each user can have custom categories
- Type field determines if category is for income or expenses
- Common income categories: Salary, Freelance, Investments, Gifts
- Common expense categories: Rent, Groceries, Transportation, Entertainment

**Business Rules:**
- Category names should be descriptive and unique per user
- Cannot delete category if transactions reference it
- Recommended: Create default categories on user signup

### Income Table
```sql
CREATE TABLE income (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(500),
  date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX income_user_id_idx (user_id),
  INDEX income_date_idx (date),
  INDEX income_category_id_idx (category_id),
  INDEX income_user_date_idx (user_id, date)
);
```

**Usage:**
- Track all income sources
- Date field represents when income was received
- Description is optional but recommended for clarity

**Business Rules:**
- Amount must be positive
- Date should not be in the future (application-level validation)
- Category must be of type 'income'

### Expenses Table
```sql
CREATE TABLE expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(500),
  date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX expenses_user_id_idx (user_id),
  INDEX expenses_date_idx (date),
  INDEX expenses_category_id_idx (category_id),
  INDEX expenses_user_date_idx (user_id, date)
);
```

**Usage:**
- Track all expenses
- Date field represents when expense occurred
- Description helps track what was purchased

**Business Rules:**
- Amount must be positive
- Date should not be in the future (application-level validation)
- Category must be of type 'expense'

### Balances Table
```sql
CREATE TABLE balances (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX balances_user_id_idx (user_id),
  INDEX balances_date_idx (date),
  INDEX balances_user_date_idx (user_id, date),
  INDEX balances_currency_idx (currency)
);
```

**Usage:**
- Track account balance snapshots over time
- Support multiple currencies per user
- Used for balance history and trend analysis

**Business Rules:**
- Currency code should follow ISO 4217 (3-letter codes)
- Balance can be negative (overdraft)
- Recommended: Update balance after each transaction

## Common Query Patterns

### Get User's Recent Transactions
```typescript
const db = await getDb();
const queries = new DatabaseQueries(db);

// Get last 30 days of expenses
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const recentExpenses = await queries.getExpensesByUser(
  userId,
  thirtyDaysAgo,
  new Date()
);
```

### Calculate Monthly Summary
```typescript
const db = await getDb();
const queries = new DatabaseQueries(db);

const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);

const endOfMonth = new Date();
endOfMonth.setMonth(endOfMonth.getMonth() + 1);
endOfMonth.setDate(0);
endOfMonth.setHours(23, 59, 59, 999);

const summary = await queries.getTransactionSummary(
  userId,
  startOfMonth,
  endOfMonth
);
```

### Get Category Breakdown
```typescript
const db = await getDb();
const queries = new DatabaseQueries(db);

const categoryBreakdown = await queries.getCategorySpending(
  userId,
  startDate,
  endDate
);
```

### Create New Transaction
```typescript
const db = await getDb();
const queries = new DatabaseQueries(db);

// Add income
await queries.createIncome({
  userId: 1,
  categoryId: 1,
  amount: '1500.00',
  description: 'Freelance project payment',
  date: new Date(),
});

// Add expense
await queries.createExpense({
  userId: 1,
  categoryId: 5,
  amount: '85.50',
  description: 'Grocery shopping',
  date: new Date(),
});
```

## Migration Strategy

### Initial Setup
1. Generate migration from schema:
```bash
npm run db:generate
```

2. Review generated SQL in `server/db/migrations/`

3. Apply migration:
```bash
npm run db:migrate
```

### Adding New Fields
1. Update `server/db/schema.ts`
2. Generate new migration
3. Test migration on development database
4. Apply to production

### Example: Adding Tags
```typescript
// In schema.ts
export const tags = mysqlTable('tags', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const expenseTags = mysqlTable('expense_tags', {
  expenseId: int('expense_id').notNull().references(() => expenses.id, { onDelete: 'cascade' }),
  tagId: int('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
});
```

## Performance Considerations

### Index Usage
- Always filter by `userId` first in multi-tenant queries
- Use composite indexes (userId + date) for date range queries
- Avoid SELECT * in production code

### Query Optimization
- Use pagination for large result sets
- Limit result counts with `.limit()`
- Use aggregations at database level, not in application

### Example: Paginated Results
```typescript
const pageSize = 20;
const page = 1;

const expenses = await db.query.expenses.findMany({
  where: eq(expenses.userId, userId),
  limit: pageSize,
  offset: (page - 1) * pageSize,
  orderBy: desc(expenses.date),
});
```

## Security Best Practices

### 1. Row-Level Security
Always filter by userId in queries to prevent data leakage:
```typescript
// ❌ BAD - Returns all expenses
const allExpenses = await db.query.expenses.findMany();

// ✅ GOOD - Only user's expenses
const userExpenses = await db.query.expenses.findMany({
  where: eq(expenses.userId, authenticatedUserId),
});
```

### 2. Input Validation
Validate all inputs before database operations:
```typescript
// Amount validation
if (amount <= 0) {
  throw new Error('Amount must be positive');
}

// Date validation
if (date > new Date()) {
  throw new Error('Date cannot be in the future');
}
```

### 3. SQL Injection Prevention
Drizzle ORM provides parameterized queries by default. Never concatenate user input into queries.

## Backup Strategy

### Recommended Backup Schedule
- Daily: Automated backups at off-peak hours
- Weekly: Full backup with verification
- Monthly: Long-term archive

### Backup Command
```bash
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
```

### Restore Command
```bash
mysql -u username -p database_name < backup_file.sql
```

## Troubleshooting

### Connection Issues
```typescript
// Check DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not configured');
}

// Test connection
try {
  const db = await getDb();
  console.log('Database connected successfully');
} catch (error) {
  console.error('Database connection failed:', error);
}
```

### Migration Failures
- Check MySQL version compatibility
- Verify user permissions (CREATE, ALTER, DROP)
- Review migration SQL for syntax errors
- Test on development database first

## Future Enhancements

### Potential Schema Additions
1. **Recurring Transactions**: Track recurring income/expenses
2. **Budgets**: Set spending limits per category
3. **Tags**: Additional transaction categorization
4. **Attachments**: Store receipts and documents
5. **Multi-Currency**: Support for currency conversion rates
6. **Account Types**: Separate checking, savings, credit accounts
7. **Goals**: Financial goal tracking
8. **Notifications**: Alert system for overspending

### Example: Recurring Transactions
```typescript
export const recurringTransactions = mysqlTable('recurring_transactions', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id),
  type: mysqlEnum('type', ['income', 'expense']).notNull(),
  categoryId: int('category_id').notNull().references(() => categories.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  frequency: mysqlEnum('frequency', ['daily', 'weekly', 'monthly', 'yearly']).notNull(),
  startDate: datetime('start_date').notNull(),
  endDate: datetime('end_date'),
  description: varchar('description', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

## Support

For questions or issues:
1. Check this documentation
2. Review example API endpoints in `server/api/`
3. Consult Drizzle ORM documentation: https://orm.drizzle.team/
4. Check MySQL documentation for specific SQL features
