<template>
  <div style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, -apple-system, sans-serif;">
    <h1 style="color: #2c3e50; margin-bottom: 1rem;">💰 Finance Tracker</h1>
    <p style="color: #7f8c8d; margin-bottom: 2rem;">
      Database schema successfully configured with Drizzle ORM and MySQL
    </p>

    <div style="background: #ecf0f1; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
      <h2 style="color: #2c3e50; font-size: 1.25rem; margin-bottom: 1rem;">📊 Database Schema</h2>
      <ul style="line-height: 1.8; color: #34495e;">
        <li><strong>Users:</strong> Store user account information</li>
        <li><strong>Categories:</strong> Organize income and expenses</li>
        <li><strong>Income:</strong> Track all income sources</li>
        <li><strong>Expenses:</strong> Track all expenses</li>
        <li><strong>Balances:</strong> Monitor account balances over time</li>
      </ul>
    </div>

    <div style="background: #e8f5e9; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
      <h2 style="color: #2c3e50; font-size: 1.25rem; margin-bottom: 1rem;">🚀 Quick Start</h2>
      <ol style="line-height: 2; color: #34495e;">
        <li>Copy <code style="background: #fff; padding: 0.2rem 0.5rem; border-radius: 4px;">.env.example</code> to <code style="background: #fff; padding: 0.2rem 0.5rem; border-radius: 4px;">.env</code></li>
        <li>Configure your MySQL database connection</li>
        <li>Run <code style="background: #fff; padding: 0.2rem 0.5rem; border-radius: 4px;">npm install</code></li>
        <li>Generate migrations: <code style="background: #fff; padding: 0.2rem 0.5rem; border-radius: 4px;">npm run db:generate</code></li>
        <li>Run migrations: <code style="background: #fff; padding: 0.2rem 0.5rem; border-radius: 4px;">npm run db:migrate</code></li>
        <li>(Optional) Seed database: <code style="background: #fff; padding: 0.2rem 0.5rem; border-radius: 4px;">npm run db:seed</code></li>
      </ol>
    </div>

    <div style="background: #fff3e0; padding: 1.5rem; border-radius: 8px;">
      <h2 style="color: #2c3e50; font-size: 1.25rem; margin-bottom: 1rem;">📚 Available Resources</h2>
      <ul style="line-height: 1.8; color: #34495e;">
        <li><strong>README.md:</strong> Project overview and setup instructions</li>
        <li><strong>DATABASE.md:</strong> Comprehensive schema documentation</li>
        <li><strong>Example API endpoints:</strong> /api/users, /api/transactions/summary</li>
        <li><strong>Query helpers:</strong> server/db/queries.ts</li>
        <li><strong>Drizzle Studio:</strong> Run <code style="background: #fff; padding: 0.2rem 0.5rem; border-radius: 4px;">npm run db:studio</code> for a visual database explorer</li>
      </ul>
    </div>

    <div style="margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-left: 4px solid #3498db; border-radius: 4px;">
      <p style="color: #2c3e50; margin: 0;">
        <strong>💡 Tip:</strong> Check out the schema definitions in 
        <code style="background: #fff; padding: 0.2rem 0.5rem; border-radius: 4px;">server/db/schema.ts</code>
        to see all table relationships and types.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Finance Tracker - Drizzle ORM + MySQL',
  meta: [
    {
      name: 'description',
      content: 'Comprehensive financial tracking system with Nuxt.js and Drizzle ORM',
    },
  ],
});
</script>
