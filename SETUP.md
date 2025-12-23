# Setup Guide - Finance Tracker with Drizzle ORM

This guide will walk you through setting up the Finance Tracker application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **MySQL** v8 or higher ([Download](https://dev.mysql.com/downloads/mysql/))
- **npm** or **yarn** package manager (comes with Node.js)
- A code editor (VS Code recommended)

## Step 1: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install:
- Nuxt.js 3 (Vue framework)
- Drizzle ORM (database toolkit)
- mysql2 (MySQL driver)
- TypeScript and supporting tools

## Step 2: MySQL Database Setup

### Option A: Local MySQL Installation

1. **Start MySQL server**:
   ```bash
   # macOS (with Homebrew)
   brew services start mysql
   
   # Linux (systemd)
   sudo systemctl start mysql
   
   # Windows
   # Start MySQL service from Services panel
   ```

2. **Create database**:
   ```bash
   mysql -u root -p
   ```
   
   Then run:
   ```sql
   CREATE DATABASE finance_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'financeuser'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON finance_tracker.* TO 'financeuser'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Option B: Docker MySQL

```bash
docker run -d \
  --name mysql-finance \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=finance_tracker \
  -e MYSQL_USER=financeuser \
  -e MYSQL_PASSWORD=your_secure_password \
  -p 3306:3306 \
  mysql:8
```

### Option C: Cloud MySQL (PlanetScale, AWS RDS, etc.)

Follow your cloud provider's instructions to create a MySQL database instance.

## Step 3: Environment Configuration

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your database credentials:
   ```env
   DATABASE_URL=mysql://financeuser:your_secure_password@localhost:3306/finance_tracker
   ```

   **Connection String Format:**
   ```
   mysql://[username]:[password]@[host]:[port]/[database]
   ```

   **Examples:**
   - Local: `mysql://root:password@localhost:3306/finance_tracker`
   - Docker: `mysql://financeuser:password@localhost:3306/finance_tracker`
   - Remote: `mysql://user:pass@db.example.com:3306/finance_tracker`

## Step 4: Generate Database Schema

Generate migration files from the schema definitions:

```bash
npm run db:generate
```

This command:
- Reads `server/db/schema.ts`
- Generates SQL migration files in `server/db/migrations/`
- Creates SQL statements for all tables, indexes, and relationships

**Expected output:**
```
✓ Generated migration files successfully
📁 Migrations saved to: ./server/db/migrations/
```

## Step 5: Apply Migrations

Run the migrations to create tables in your database:

```bash
npm run db:migrate
```

This command:
- Connects to your MySQL database
- Executes all pending migrations
- Creates all tables with proper structure

**Expected output:**
```
🔄 Running migrations...
✅ Migrations completed successfully
```

**Verify the tables were created:**
```bash
mysql -u financeuser -p finance_tracker -e "SHOW TABLES;"
```

You should see:
```
+---------------------------+
| Tables_in_finance_tracker |
+---------------------------+
| balances                  |
| categories                |
| expenses                  |
| income                    |
| users                     |
+---------------------------+
```

## Step 6: (Optional) Seed Sample Data

Populate the database with sample data for testing:

```bash
npm run db:seed
```

This creates:
- 2 sample users
- Multiple income/expense categories
- Sample transactions
- Balance records

**Expected output:**
```
🌱 Seeding database...
Creating users...
Creating categories...
Creating income records...
Creating expense records...
Creating balance records...
✅ Database seeded successfully!
```

## Step 7: Start Development Server

Start the Nuxt.js development server:

```bash
npm run dev
```

**Expected output:**
```
Nuxt 3.x.x with Nitro 2.x.x

  > Local:    http://localhost:3000/
  > Network:  use --host to expose

✔ Nuxt DevTools is enabled
```

Open your browser and navigate to: **http://localhost:3000**

## Step 8: (Optional) Explore with Drizzle Studio

Drizzle Studio provides a visual interface to explore and edit your database:

```bash
npm run db:studio
```

This opens a web interface (usually at `http://localhost:4983`) where you can:
- Browse all tables and records
- Edit data directly
- Run queries
- View relationships

## Project Structure Overview

```
finance-tracker/
├── .env                        # Environment variables (create from .env.example)
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore rules
├── README.md                   # Project overview
├── DATABASE.md                 # Database documentation
├── SCHEMA_DIAGRAM.md           # Visual schema representation
├── SETUP.md                    # This file
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── nuxt.config.ts              # Nuxt.js configuration
├── drizzle.config.ts           # Drizzle Kit configuration
├── app.vue                     # Root Vue component
│
├── pages/                      # Nuxt pages (file-based routing)
│   └── index.vue               # Home page
│
└── server/                     # Server-side code
    ├── api/                    # API endpoints
    │   ├── users/
    │   │   └── index.get.ts    # GET /api/users
    │   └── transactions/
    │       └── summary.get.ts  # GET /api/transactions/summary
    │
    └── db/                     # Database layer
        ├── schema.ts           # Table definitions
        ├── index.ts            # Database connection
        ├── queries.ts          # Query helpers
        ├── migrate.ts          # Migration runner
        ├── seed.ts             # Seed script
        └── migrations/         # Generated SQL migrations
```

## Common Issues and Solutions

### Issue: "DATABASE_URL is not defined"

**Solution:** Ensure `.env` file exists and contains `DATABASE_URL`:
```bash
# Check if .env file exists
ls -la .env

# If not, copy from example
cp .env.example .env

# Edit with your credentials
nano .env  # or use your preferred editor
```

### Issue: "Can't connect to MySQL server"

**Solutions:**
1. Verify MySQL is running:
   ```bash
   # Check MySQL status
   mysql --version
   sudo systemctl status mysql  # Linux
   brew services list | grep mysql  # macOS
   ```

2. Test connection manually:
   ```bash
   mysql -h localhost -u financeuser -p
   ```

3. Check firewall settings (MySQL uses port 3306)

4. Verify credentials in `.env` match database user

### Issue: "Access denied for user"

**Solution:** Check username and password in `DATABASE_URL`:
```bash
# Test credentials
mysql -u financeuser -p
# If this fails, recreate user in MySQL:
# mysql -u root -p
# > DROP USER 'financeuser'@'localhost';
# > CREATE USER 'financeuser'@'localhost' IDENTIFIED BY 'newpassword';
# > GRANT ALL PRIVILEGES ON finance_tracker.* TO 'financeuser'@'localhost';
```

### Issue: Migration fails with "Table already exists"

**Solution:** Reset migrations:
```bash
# Drop all tables (WARNING: deletes all data)
mysql -u financeuser -p finance_tracker -e "
DROP TABLE IF EXISTS balances;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS income;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
"

# Run migrations again
npm run db:migrate
```

### Issue: "Port 3000 already in use"

**Solution:** Use a different port:
```bash
PORT=3001 npm run dev
```

Or kill the process using port 3000:
```bash
# Find process
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)
```

## Testing the API

### Test User Endpoint

```bash
curl http://localhost:3000/api/users
```

**Expected response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "categories": [...],
      "balances": [...]
    }
  ]
}
```

### Test Transaction Summary

```bash
curl "http://localhost:3000/api/transactions/summary?userId=1&startDate=2024-01-01&endDate=2024-12-31"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "period": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-12-31T23:59:59.999Z"
    },
    "summary": {
      "totalIncome": 11500.00,
      "totalExpenses": 3111.25,
      "netAmount": 8388.75
    }
  }
}
```

## Next Steps

### Development Workflow

1. **Make schema changes** in `server/db/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Review SQL** in `server/db/migrations/`
4. **Apply migration**: `npm run db:migrate`
5. **Test changes** with Drizzle Studio: `npm run db:studio`

### Create API Endpoints

Example: Create expense endpoint

```typescript
// server/api/expenses/index.post.ts
import { getDb } from '~/server/db';
import { expenses } from '~/server/db/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const db = await getDb();
  
  const result = await db.insert(expenses).values({
    userId: body.userId,
    categoryId: body.categoryId,
    amount: body.amount,
    description: body.description,
    date: new Date(body.date),
  });
  
  return { success: true, id: result[0].insertId };
});
```

### Add Frontend Pages

Example: Expenses page

```vue
<!-- pages/expenses.vue -->
<template>
  <div>
    <h1>Expenses</h1>
    <div v-for="expense in expenses" :key="expense.id">
      {{ expense.description }}: ${{ expense.amount }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: expenses } = await useFetch('/api/expenses');
</script>
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Update production `DATABASE_URL` in hosting environment
- [ ] Run `npm run build` to verify build succeeds
- [ ] Test all API endpoints
- [ ] Set up database backups
- [ ] Configure SSL for database connection
- [ ] Review security settings (CORS, rate limiting)
- [ ] Set up monitoring and logging

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Additional Resources

- **Nuxt.js Documentation**: https://nuxt.com/docs
- **Drizzle ORM Documentation**: https://orm.drizzle.team/
- **MySQL Documentation**: https://dev.mysql.com/doc/
- **Drizzle Discord Community**: https://discord.gg/drizzle

## Support

For issues or questions:
1. Check this setup guide
2. Review `DATABASE.md` for schema details
3. Check `README.md` for project overview
4. Review example code in `server/api/`
5. Consult Drizzle ORM documentation

## Success!

If you've followed all steps, you should now have:
- ✅ MySQL database configured
- ✅ All tables created with proper schema
- ✅ Sample data loaded (if seeded)
- ✅ Development server running
- ✅ Working API endpoints

**Happy coding! 🚀**
