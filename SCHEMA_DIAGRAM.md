# Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USERS TABLE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ PK │ id            │ INT                │ AUTO_INCREMENT             │
│    │ email         │ VARCHAR(255)       │ UNIQUE, NOT NULL          │
│    │ name          │ VARCHAR(255)       │ NOT NULL                  │
│    │ created_at    │ TIMESTAMP          │ DEFAULT NOW()             │
│    │ updated_at    │ TIMESTAMP          │ ON UPDATE NOW()           │
│    │ INDEX: email_idx                                                  │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │ 1:N (One User has Many Categories)
         ├──────────────────────────────────────────────────┐
         │                                                  │
         ▼                                                  │
┌─────────────────────────────────────────────────────────────────────────┐
│                         CATEGORIES TABLE                                │
├─────────────────────────────────────────────────────────────────────────┤
│ PK │ id            │ INT                │ AUTO_INCREMENT             │
│    │ name          │ VARCHAR(100)       │ NOT NULL                  │
│    │ type          │ ENUM               │ 'income' | 'expense'      │
│ FK │ user_id       │ INT                │ → users.id (CASCADE)      │
│    │ created_at    │ TIMESTAMP          │ DEFAULT NOW()             │
│    │ INDEX: user_id_idx, type_idx, user_type_idx                       │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │ 1:N (One Category has Many Income/Expenses)
         ├──────────────────────┬────────────────────────────┐
         │                      │                            │
         ▼                      ▼                            ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│    INCOME TABLE      │ │   EXPENSES TABLE     │ │   BALANCES TABLE     │
├──────────────────────┤ ├──────────────────────┤ ├──────────────────────┤
│ PK │ id              │ │ PK │ id              │ │ PK │ id              │
│ FK │ user_id         │ │ FK │ user_id         │ │ FK │ user_id         │
│ FK │ category_id     │ │ FK │ category_id     │ │    │ amount          │
│    │ amount          │ │    │ amount          │ │    │ currency        │
│    │ description     │ │    │ description     │ │    │ date            │
│    │ date            │ │    │ date            │ │    │ created_at      │
│    │ created_at      │ │    │ created_at      │ └──────────────────────┘
│    │ updated_at      │ │    │ updated_at      │
└──────────────────────┘ └──────────────────────┘
         ▲                       ▲                      ▲
         │                       │                      │
         │ N:1 (FK Relationships)                       │
         └───────────────────────┴──────────────────────┘
                    Back to USERS (CASCADE)
```

## Relationship Details

### User → Categories (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `categories.user_id` → `users.id`
- **Delete Rule**: CASCADE (deleting a user deletes all their categories)
- **Usage**: Each user can create custom categories for organizing transactions

### User → Income (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `income.user_id` → `users.id`
- **Delete Rule**: CASCADE (deleting a user deletes all their income records)
- **Usage**: Each user tracks their own income sources

### User → Expenses (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `expenses.user_id` → `users.id`
- **Delete Rule**: CASCADE (deleting a user deletes all their expenses)
- **Usage**: Each user tracks their own expenses

### User → Balances (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `balances.user_id` → `users.id`
- **Delete Rule**: CASCADE (deleting a user deletes all their balance records)
- **Usage**: Track balance history over time for trend analysis

### Category → Income (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `income.category_id` → `categories.id`
- **Delete Rule**: RESTRICT (cannot delete category if income records exist)
- **Usage**: Categorize income by source (Salary, Freelance, etc.)
- **Constraint**: Category must be of type 'income'

### Category → Expenses (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `expenses.category_id` → `categories.id`
- **Delete Rule**: RESTRICT (cannot delete category if expense records exist)
- **Usage**: Categorize expenses (Rent, Groceries, Transportation, etc.)
- **Constraint**: Category must be of type 'expense'

## Data Flow Example

```
USER REGISTRATION
└─> Create User
    └─> Create Default Categories (Income & Expense)

ADDING INCOME
├─> User selects Income Category
├─> Enters amount, description, date
├─> Record saved to income table
└─> Optional: Update balance table

ADDING EXPENSE
├─> User selects Expense Category
├─> Enters amount, description, date
├─> Record saved to expenses table
└─> Optional: Update balance table

BALANCE TRACKING
├─> Periodic snapshots of account balance
├─> Supports multiple currencies
└─> Historical trend analysis

REPORTING
├─> Query income by date range
├─> Query expenses by category
├─> Calculate net income (income - expenses)
└─> Generate spending breakdown by category
```

## Index Strategy

### Primary Indexes
All tables have auto-incrementing primary keys for efficient record lookup.

### Foreign Key Indexes
All foreign key columns are indexed to optimize JOIN operations:
- `categories.user_id`
- `income.user_id`, `income.category_id`
- `expenses.user_id`, `expenses.category_id`
- `balances.user_id`

### Date Indexes
Date columns are indexed for efficient range queries:
- `income.date`
- `expenses.date`
- `balances.date`

### Composite Indexes
Composite indexes optimize common query patterns:
- `categories(user_id, type)` - Filter categories by user and type
- `income(user_id, date)` - User's income within date range
- `expenses(user_id, date)` - User's expenses within date range
- `balances(user_id, date)` - User's balance history

### Unique Indexes
- `users.email` - Ensures email uniqueness across the system

## Data Types Rationale

### DECIMAL(10,2) for Money
- **Precision**: 10 digits total, 2 after decimal
- **Range**: -99,999,999.99 to 99,999,999.99
- **Why**: Avoids floating-point arithmetic errors
- **Example**: Stores $1,234.56 exactly

### TIMESTAMP vs DATETIME
- **TIMESTAMP**: `created_at`, `updated_at` (automatic timezone handling)
- **DATETIME**: `date` (user-specified transaction dates, no timezone conversion)

### VARCHAR Lengths
- `email`: 255 (standard email length)
- `name`: 255 (accommodates long names)
- `category.name`: 100 (category names are typically short)
- `description`: 500 (detailed transaction descriptions)
- `currency`: 3 (ISO 4217 currency codes: USD, EUR, GBP, etc.)

### ENUM vs VARCHAR
- **ENUM**: Used for `category.type` (fixed set: 'income' or 'expense')
- **Benefits**: Type safety, storage efficiency, query optimization
- **Alternative**: VARCHAR with CHECK constraint or application validation

## Query Performance Tips

### Efficient Queries ✅
```typescript
// Filter by indexed user_id first
db.query.expenses.findMany({
  where: and(
    eq(expenses.userId, userId),      // Indexed
    gte(expenses.date, startDate),    // Indexed
  ),
});

// Use composite index
db.query.categories.findMany({
  where: and(
    eq(categories.userId, userId),    // Part of composite index
    eq(categories.type, 'expense'),   // Part of composite index
  ),
});
```

### Inefficient Queries ❌
```typescript
// Full table scan without userId filter
db.query.expenses.findMany({
  where: gte(expenses.date, startDate),
});

// No index on description
db.query.expenses.findMany({
  where: like(expenses.description, '%grocery%'),
});
```

## Scaling Considerations

### Current Capacity
- Supports millions of users
- Handles millions of transactions per user
- DECIMAL(10,2) supports amounts up to ~100 million

### Future Optimizations
1. **Partitioning**: Partition income/expenses tables by date for better performance
2. **Archiving**: Move old transactions to archive tables
3. **Read Replicas**: Separate read/write databases for heavy traffic
4. **Caching**: Cache frequent queries (user categories, recent balances)

### Storage Estimates
- User record: ~500 bytes
- Category record: ~200 bytes
- Transaction record: ~300 bytes
- Balance record: ~200 bytes

**Example**: 10,000 users, 100 transactions/user/month, 1 balance/user/month
- Users: 10,000 × 500 bytes = 5 MB
- Categories: 10,000 × 10 × 200 bytes = 20 MB
- Transactions/month: 10,000 × 100 × 300 bytes = 300 MB
- Balances/year: 10,000 × 12 × 200 bytes = 24 MB
- **Total/year**: ~3.6 GB (very manageable)

## Security Considerations

### Row-Level Security
Implement in application layer:
```typescript
// Always filter by authenticated user's ID
const userId = await getAuthenticatedUserId(event);
const expenses = await db.query.expenses.findMany({
  where: eq(expenses.userId, userId),
});
```

### Sensitive Data
- **Email**: Consider encryption at rest
- **Amounts**: Financial data should be protected
- **Descriptions**: May contain sensitive information

### Audit Trail
Consider adding audit tables for:
- User logins
- Data modifications
- Deletions

## Migration Path

### Version 1 (Current)
- Basic financial tracking
- Single currency per transaction
- Manual balance updates

### Version 2 (Planned)
- Multi-currency support with conversion
- Recurring transactions
- Budget tracking
- Automated balance calculations

### Version 3 (Future)
- Bill reminders
- Bank account integration
- Financial goals
- Spending predictions
