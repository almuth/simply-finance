import { defineEventHandler, readBody, createError } from 'h3';
import { getDb } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, generateToken } from '~/server/utils/security';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body || !body.email || !body.password || !body.name) {
    throw createError({
      statusCode: 400,
      message: 'Email, password, and name are required'
    });
  }
  
  const { email, password, name } = body;
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
     throw createError({ statusCode: 400, message: 'Invalid email format' });
  }

  // Password strength check
  if (password.length < 6) {
    throw createError({ statusCode: 400, message: 'Password must be at least 6 characters' });
  }

  const db = await getDb();
  
  // Check if user exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    throw createError({ statusCode: 409, message: 'User already exists' });
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  try {
    const result = await db.insert(users).values({
      email,
      name,
      password: hashedPassword
    });
    
    const userId = result[0].insertId;
    const token = generateToken(userId);
    
    return {
      success: true,
      data: {
        token,
        user: {
          id: userId,
          email,
          name
        }
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw createError({ statusCode: 500, message: 'Failed to register user' });
  }
});
