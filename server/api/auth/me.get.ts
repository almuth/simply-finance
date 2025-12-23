import { defineEventHandler, createError } from 'h3';
import { getDb } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }
  
  const db = await getDb();
  
  const userRecord = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (userRecord.length === 0) {
    throw createError({ statusCode: 404, message: 'User not found' });
  }
  
  const user = userRecord[0];
  
  return {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  };
});
