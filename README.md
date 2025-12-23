# Nuxt Finance Tracker - Database Schema

A comprehensive financial tracking system built with Nuxt.js and Drizzle ORM with MySQL.

## Features

- 📊 Track income and expenses
- 🏷️ Categorize transactions
- 💰 Monitor account balances
- 👥 Multi-user support
- 🔐 Proper data relationships and constraints
- 📈 Optimized with indexes for performance

## Database Schema

### Tables

#### Users
Stores user account information.
- `id` - Primary key (auto-increment)
- `email` - Unique email address (indexed)
- `name` - User's full name
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

#### Categories
Categorizes income and expense transactions.
- `id` - Primary key (auto-increment)
- `name` - Category name (e.g., "Salary", "Groceries")
- `type` - Enum: 'income' or 'expense'
- `userId` - Foreign key to users (indexed)
- `createdAt` - Category creation timestamp

#### Income
Tracks all income transactions.
- `id` - Primary key (auto-increment)
- `userId` - Foreign key to users (indexed)
- `categoryId` - Foreign key to categories (indexed)
- `amount` - Decimal(10,2) for precise monetary values
- `description` - Optional transaction description
- `date` - Transaction date (indexed)
- `createdAt` - Record creation timestamp
- `updatedAt` - Last update timestamp

#### Expenses
Tracks all expense transactions.
- `id` - Primary key (auto-increment)
- `userId` - Foreign key to users (indexed)
- `categoryId` - Foreign key to categories (indexed)
- `amount` - Decimal(10,2) for precise monetary values
- `description` - Optional transaction description
- `date` - Transaction date (indexed)
- `createdAt` - Record creation timestamp
- `updatedAt` - Last update timestamp

#### Balances
Tracks account balances over time.
- `id` - Primary key (auto-increment)
- `userId` - Foreign key to users (indexed)
- `amount` - Decimal(10,2) for precise balance values
- `currency` - 3-letter currency code (default: USD)
- `date` - Balance snapshot date (indexed)
- `createdAt` - Record creation timestamp

### Relationships

- **Users** → has many → Categories, Income, Expenses, Balances
- **Categories** → belongs to → User
- **Categories** → has many → Income, Expenses
- **Income** → belongs to → User, Category
- **Expenses** → belongs to → User, Category
- **Balances** → belongs to → User

### Indexes

Optimized queries with composite indexes:
- `users`: email
- `categories`: userId, type, (userId + type)
- `income`: userId, date, categoryId, (userId + date)
- `expenses`: userId, date, categoryId, (userId + date)
- `balances`: userId, date, currency, (userId + date)

## Setup

### Prerequisites

- Node.js 18+ 
- MySQL 8+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and configure your database:
```bash
cp .env.example .env
```

4. Update `.env` with your MySQL credentials:
```env
DATABASE_URL=mysql://user:password@localhost:3306/finance_tracker
```

### Database Setup

1. Generate migration files:
```bash
npm run db:generate
```

2. Run migrations:
```bash
npm run db:migrate
```

3. (Optional) Open Drizzle Studio to view your database:
```bash
npm run db:studio
```

## Development

Start the development server:
```bash
npm run dev
```

## Database Scripts

- `npm run db:generate` - Generate migration files from schema
- `npm run db:push` - Push schema changes directly to database (dev only)
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio GUI

## Project Structure

```
.
├── server/
│   └── db/
│       ├── index.ts           # Database connection
│       ├── schema.ts          # Database schema definitions
│       ├── migrate.ts         # Migration runner
│       └── migrations/        # Generated migration files
├── drizzle.config.ts          # Drizzle Kit configuration
├── nuxt.config.ts             # Nuxt configuration
├── package.json
└── .env.example               # Environment variables template
```

## Technology Stack

- **Framework**: Nuxt.js 3
- **ORM**: Drizzle ORM
- **Database**: MySQL 8+
- **Language**: TypeScript

## Best Practices

1. **Decimal Types**: All monetary amounts use `DECIMAL(10,2)` for precision
2. **Indexes**: Frequently queried fields are indexed for performance
3. **Foreign Keys**: Proper cascading rules (CASCADE for user deletion, RESTRICT for categories)
4. **Timestamps**: All tables include creation timestamps; transactional tables include update timestamps
5. **Type Safety**: Full TypeScript types exported from schema

## License

MIT
