import { getDb } from '~/server/db';

/**
 * GET /api/users
 * Example endpoint to fetch all users
 */
export default defineEventHandler(async (event) => {
  try {
    const db = await getDb();
    const allUsers = await db.query.users.findMany({
      with: {
        categories: true,
        balances: {
          orderBy: (balances, { desc }) => [desc(balances.date)],
          limit: 1,
        },
      },
    });

    return {
      success: true,
      data: allUsers,
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      error: 'Failed to fetch users',
    };
  }
});
