import { getDb } from '~/server/db';
import { setResponseStatus } from 'h3';

/**
 * GET /api/users
 * Example endpoint to fetch all users
 */
export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  if (!userId) {
    setResponseStatus(event, 401);
    return {
      success: false,
      error: 'Unauthorized'
    };
  }

  try {
    const db = await getDb();
    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
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
    setResponseStatus(event, 500);
    return {
      success: false,
      error: 'Failed to fetch users',
    };
  }
});
