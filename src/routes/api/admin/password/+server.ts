import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as auth from '$lib/server/auth';
import * as db from '$lib/server/db';
import { createHash, randomBytes } from 'crypto';

const ALLOWED_ACTIONS = ['login', 'change_password'] as const;
type AllowedAction = typeof ALLOWED_ACTIONS[number];

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (!action || !ALLOWED_ACTIONS.includes(action)) {
      return json({ error: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(', ')}` }, { status: 400 });
    }
    
    if (action === 'login') {
      const { username, password } = body;
      
      if (!username || !password) {
        return json({ error: 'Username and password required' }, { status: 400 });
      }
      
      const result = auth.verifyUser(username, password);
      
      if (!result.valid) {
        db.createActivityLog(null, 'login_failed', `User: ${username}`, getClientAddress());
        return json({ error: result.error }, { status: 401 });
      }
      
      const sessionId = auth.createSession(result.user.id);
      db.createActivityLog(result.user.id, 'login', `User: ${username}`, getClientAddress());
      
      return json({ 
        success: true, 
        user: { username: result.user.username, role: result.user.role },
        sessionId
      });
    }
    
    if (action === 'change_password') {
      const { newPassword, userId } = body;
      
      if (!newPassword) {
        return json({ error: 'New password required' }, { status: 400 });
      }
      
      const salt = randomBytes(32).toString('hex');
      const hash = createHash('sha256').update(newPassword + salt).digest('hex');
      const fullHash = hash + ':' + salt;
      
      db.updatePassword(userId, fullHash);
      db.createActivityLog(userId, 'password_changed', 'Password changed', getClientAddress());
      
      return json({ success: true });
    }
    
    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};