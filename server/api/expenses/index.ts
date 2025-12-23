import { defineEventHandler, getQuery, readBody, setResponseStatus, getHeader } from 'h3';
import { getDb } from '~/server/db';
import { expenses } from '~/server/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const method = event.method;
  
  // Extract userId from context (populated by auth middleware)
  const userId = event.context.userId;

  if (!userId) {
    setResponseStatus(event, 401);
    return {
      success: false,
      error: 'Unauthorized'
    };
  }

  const db = await getDb();

  if (method === 'GET') {
    const query = getQuery(event);
    const startDate = query.startDate ? new Date(query.startDate as string) : undefined;
    const endDate = query.endDate ? new Date(query.endDate as string) : undefined;
    const categoryId = query.categoryId ? Number(query.categoryId) : undefined;
    
    const limit = query.limit ? Math.min(Number(query.limit), 100) : 50;
    const offset = query.offset ? Number(query.offset) : 0;

    const conditions = [eq(expenses.userId, userId)];
    
    if (startDate && !isNaN(startDate.getTime())) {
      conditions.push(gte(expenses.date, startDate));
    }
    if (endDate && !isNaN(endDate.getTime())) {
      conditions.push(lte(expenses.date, endDate));
    }
    if (categoryId) {
      conditions.push(eq(expenses.categoryId, categoryId));
    }

    try {
      const records = await db.select()
        .from(expenses)
        .where(and(...conditions))
        .orderBy(desc(expenses.date))
        .limit(limit)
        .offset(offset);

      const data = records.map(record => ({
        ...record,
        amount: Number(record.amount)
      }));

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching expenses records:', error);
      setResponseStatus(event, 500);
      return {
        success: false,
        error: 'Failed to fetch expenses records'
      };
    }
  }

  if (method === 'POST') {
    const body = await readBody(event);
    
    // Validate request body
    if (!body) {
      setResponseStatus(event, 400);
      return { success: false, error: 'Request body is required' };
    }

    const { categoryId, amount, description, date } = body;

    // Validation
    if (!categoryId) {
      setResponseStatus(event, 400);
      return { success: false, error: 'categoryId is required' };
    }
    
    if (amount === undefined || amount === null || amount === '') {
      setResponseStatus(event, 400);
      return { success: false, error: 'amount is required' };
    }
    
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setResponseStatus(event, 400);
      return { success: false, error: 'amount must be a positive number' };
    }

    if (!date) {
      setResponseStatus(event, 400);
      return { success: false, error: 'date is required' };
    }

    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) {
      setResponseStatus(event, 400);
      return { success: false, error: 'Invalid date format (ISO 8601 expected)' };
    }

    try {
      const result = await db.insert(expenses).values({
        userId,
        categoryId: Number(categoryId),
        amount: String(numAmount),
        description: description || null,
        date: transactionDate,
      });

      const insertId = result[0].insertId;
      
      const newRecord = await db.select()
        .from(expenses)
        .where(eq(expenses.id, insertId))
        .limit(1);

      if (!newRecord.length) {
         throw new Error('Failed to retrieve created record');
      }

      setResponseStatus(event, 201);
      return {
        success: true,
        data: {
            ...newRecord[0],
            amount: Number(newRecord[0].amount)
        }
      };
    } catch (error: any) {
      console.error('Error creating expense record:', error);
      
      // Handle FK constraint (category not found)
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || (error.message && error.message.includes('foreign key constraint fails'))) {
           setResponseStatus(event, 400);
           return { success: false, error: 'Invalid categoryId: Category does not exist' };
      }
      
      setResponseStatus(event, 500);
      return {
        success: false,
        error: 'Failed to create expense record'
      };
    }
  }
});
