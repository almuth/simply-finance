import { defineEventHandler, readBody, setResponseStatus, getHeader, getRouterParam } from 'h3';
import { getDb } from '~/server/db';
import { expenses } from '~/server/db/schema';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const method = event.method;
  const idParam = getRouterParam(event, 'id');
  const id = idParam ? Number(idParam) : null;
  
  if (!id || isNaN(id)) {
      setResponseStatus(event, 400);
      return { success: false, error: 'Invalid ID' };
  }

  // Extract userId
  const userId = event.context.userId || event.context.user?.id || (getHeader(event, 'x-user-id') ? Number(getHeader(event, 'x-user-id')) : 0);

  if (!userId) {
    setResponseStatus(event, 401);
    return {
      success: false,
      error: 'User not authenticated'
    };
  }

  const db = await getDb();

  // Check if record exists and belongs to user
  const existingRecord = await db.select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .limit(1);

  if (!existingRecord.length) {
    setResponseStatus(event, 404);
    return { success: false, error: 'Expense record not found' };
  }

  if (method === 'DELETE') {
    try {
        await db.delete(expenses)
          .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
        
        return {
            success: true,
            data: { id }
        };
    } catch (error) {
        console.error('Error deleting expense record:', error);
        setResponseStatus(event, 500);
        return { success: false, error: 'Failed to delete expense record' };
    }
  }

  if (method === 'PUT') {
    const body = await readBody(event);
     if (!body) {
      setResponseStatus(event, 400);
      return { success: false, error: 'Request body is required' };
    }

    const updateData: any = {};
    
    if (body.categoryId !== undefined) updateData.categoryId = Number(body.categoryId);
    if (body.amount !== undefined) {
         const numAmount = Number(body.amount);
         if (isNaN(numAmount) || numAmount <= 0) {
            setResponseStatus(event, 400);
            return { success: false, error: 'amount must be a positive number' };
         }
         updateData.amount = String(numAmount);
    }
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date) {
        const d = new Date(body.date);
        if (isNaN(d.getTime())) {
            setResponseStatus(event, 400);
            return { success: false, error: 'Invalid date format' };
        }
        updateData.date = d;
    }

    if (Object.keys(updateData).length === 0) {
        return {
            success: true,
            data: {
                ...existingRecord[0],
                amount: Number(existingRecord[0].amount)
            }
        };
    }
    
    try {
        await db.update(expenses)
            .set(updateData)
            .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
        
        const updatedRecord = await db.select()
            .from(expenses)
            .where(eq(expenses.id, id))
            .limit(1);
            
        return {
            success: true,
            data: {
                ...updatedRecord[0],
                amount: Number(updatedRecord[0].amount)
            }
        };

    } catch (error: any) {
        console.error('Error updating expense record:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || (error.message && error.message.includes('foreign key constraint fails'))) {
           setResponseStatus(event, 400);
           return { success: false, error: 'Invalid categoryId: Category does not exist' };
        }
        setResponseStatus(event, 500);
        return { success: false, error: 'Failed to update expense record' };
    }
  }
});
