# Quick Reference Card

## 🚀 Get Started in 5 Minutes

```bash
# 1. Install dependencies
npm install

# 2. Configure database
cp .env.example .env
# Edit .env with: DATABASE_URL=mysql://user:pass@localhost:3306/finance_tracker

# 3. Setup database
npm run db:generate
npm run db:migrate

# 4. (Optional) Add sample data
npm run db:seed

# 5. Start development
npm run dev
# Visit http://localhost:3000
```

---

## 📊 Database Schema

```
┌─────────┐     ┌────────────┐     ┌────────┐
│  USERS  │────→│ CATEGORIES │────→│ INCOME │
│         │     │            │     └────────┘
│ id      │     │ id         │     
│ email   │     │ name       │     ┌──────────┐
│ name    │     │ type       │────→│ EXPENSES │
└─────────┘     │ userId     │     └──────────┘
    │           └────────────┘     
    │                              ┌──────────┐
    └─────────────────────────────→│ BALANCES │
                                   └──────────┘
```

**5 Tables:** users, categories, income, expenses, balances  
**All Money Fields:** DECIMAL(10,2)  
**Timestamps:** Created/Updated on all tables

---

## 💻 Common Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build
```

### Database
```bash
npm run db:generate  # Create migration from schema
npm run db:push      # Push schema directly (dev)
npm run db:migrate   # Run migrations
npm run db:seed      # Add sample data
npm run db:studio    # Open visual DB tool
```

---

## 📝 Quick Schema Reference

### Users
```typescript
id, email (unique), name, createdAt, updatedAt
```

### Categories
```typescript
id, name, type ('income'|'expense'), userId (FK), createdAt
```

### Income
```typescript
id, userId (FK), categoryId (FK), amount (DECIMAL), 
description, date, createdAt, updatedAt
```

### Expenses
```typescript
id, userId (FK), categoryId (FK), amount (DECIMAL),
description, date, createdAt, updatedAt
```

### Balances
```typescript
id, userId (FK), amount (DECIMAL), currency,
date, createdAt
```

---

## 🔗 Relationships

- **User** → has many → Categories, Income, Expenses, Balances
- **Category** → has many → Income, Expenses
- **Delete User** → cascades to all related data
- **Delete Category** → blocked if transactions exist

---

## 📂 File Locations

```
server/db/schema.ts     # Table definitions
server/db/queries.ts    # Helper functions
server/db/index.ts      # DB connection
server/api/             # API endpoints
drizzle.config.ts       # Drizzle config
.env                    # Your credentials
```

---

## 🔍 Example Queries

### Get User's Expenses
```typescript
const db = await getDb();
const expenses = await db.query.expenses.findMany({
  where: eq(expenses.userId, userId),
  with: { category: true },
  orderBy: desc(expenses.date),
});
```

### Monthly Summary
```typescript
const queries = new DatabaseQueries(db);
const summary = await queries.getTransactionSummary(
  userId,
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
// Returns: { income: {...}, expenses: {...}, net: number }
```

### Create Transaction
```typescript
await db.insert(expenses).values({
  userId: 1,
  categoryId: 5,
  amount: '49.99',
  description: 'Groceries',
  date: new Date(),
});
```

---

## 🌐 API Endpoints

```bash
GET /api/users
# Returns all users with relations

GET /api/transactions/summary?userId=1&startDate=2024-01-01&endDate=2024-12-31
# Returns income/expense summary
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `SETUP.md` | Setup instructions |
| `DATABASE.md` | Schema documentation |
| `QUERY_EXAMPLES.md` | Query patterns |
| `SCHEMA_DIAGRAM.md` | Visual diagrams |
| `CHECKLIST.md` | Implementation status |

---

## 🎯 Common Tasks

### Add New Table Field
1. Edit `server/db/schema.ts`
2. Run `npm run db:generate`
3. Review migration in `server/db/migrations/`
4. Run `npm run db:migrate`

### Create API Endpoint
```typescript
// server/api/income/index.get.ts
export default defineEventHandler(async (event) => {
  const db = await getDb();
  // Your query here
  return { success: true, data: results };
});
```

### Query with Relations
```typescript
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    income: { limit: 10 },
    expenses: { limit: 10 },
  },
});
```

---

## ⚡ Performance Tips

```typescript
// ✅ GOOD - Filter by indexed userId first
where: and(
  eq(expenses.userId, userId),    // Indexed
  gte(expenses.date, startDate)   // Indexed
)

// ✅ GOOD - Use pagination
limit: 20,
offset: (page - 1) * 20

// ✅ GOOD - Select specific columns
.select({ id: expenses.id, amount: expenses.amount })
```

---

## 🔒 Security

```typescript
// Always filter by authenticated user's ID
const userId = await getAuthenticatedUserId(event);

const expenses = await db.query.expenses.findMany({
  where: eq(expenses.userId, userId),  // Critical!
});
```

---

## 🐛 Troubleshooting

### Connection Failed
```bash
# Check MySQL is running
mysql --version

# Test connection
mysql -h localhost -u root -p

# Verify DATABASE_URL in .env
cat .env
```

### Migration Failed
```bash
# Check MySQL permissions
mysql -u root -p -e "SHOW GRANTS FOR 'youruser'@'localhost';"

# Reset if needed (⚠️ deletes data)
mysql -u root -p yourdatabase -e "DROP TABLE IF EXISTS users, categories, income, expenses, balances;"
npm run db:migrate
```

---

## 📞 Need Help?

1. Check `SETUP.md` for detailed setup
2. See `QUERY_EXAMPLES.md` for 50+ examples
3. Read `DATABASE.md` for schema details
4. Review `server/api/` for working examples

---

**Quick Links:**
- Drizzle Docs: https://orm.drizzle.team/
- Nuxt Docs: https://nuxt.com/docs
- MySQL Docs: https://dev.mysql.com/doc/

---

✅ **You're Ready to Build!**
