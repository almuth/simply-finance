import { defineEventHandler, getHeader } from 'h3';
import { verifyToken } from '~/server/utils/security';

export default defineEventHandler((event) => {
  const authHeader = getHeader(event, 'Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded) {
      event.context.userId = decoded.userId;
      event.context.user = { id: decoded.userId };
    }
  }
});
