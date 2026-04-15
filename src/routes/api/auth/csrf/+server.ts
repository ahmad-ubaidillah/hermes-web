import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as auth from '$lib/server/auth';
import { generateCSRFToken } from '$lib/server/csrf';

export const GET: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get('session');
  
  if (!sessionId) {
    return json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const result = auth.verifySession(sessionId);
  
  if (!result.valid) {
    return json({ error: 'Invalid session' }, { status: 401 });
  }
  
  const csrfToken = generateCSRFToken(sessionId);
  return json({ csrfToken });
};