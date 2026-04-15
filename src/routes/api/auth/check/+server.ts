import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as auth from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get('session');
  
  if (!sessionId) {
    return json({ authenticated: false });
  }
  
  const result = auth.verifySession(sessionId);
  
  if (!result.valid) {
    return json({ authenticated: false });
  }
  
  return json({ authenticated: true, user: result.user });
};