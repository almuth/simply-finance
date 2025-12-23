import { defineEventHandler, readBody, createError } from 'h3';
import { getDb } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { comparePassword, generateToken } from '~/server/utils/security';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body || !body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required'
    });
  }
  
  const { email, password } = body;
  
  const db = await getDb();
  
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (existingUser.length === 0) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' });
  }
  
  const user = existingUser[0];
  
  const isPasswordValid = await comparePassword(password, user.password);
  
  if (!isPasswordValid) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' });
  }
  
  const token = generateToken(user.id);
  
  return {
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }
  };
});
