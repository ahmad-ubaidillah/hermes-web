import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as auth from '$lib/server/auth';
import { checkRateLimit } from '$lib/server/rate-limit';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  const clientIp = getClientAddress();
  const rateResult = checkRateLimit(`login:${clientIp}`);
  
  if (!rateResult.allowed) {
    return json({ 
      error: 'Too many login attempts. Please try again later.',
      retryAfter: Math.ceil((rateResult.resetAt - Date.now()) / 1000)
    }, { 
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)) }
    });
  }
  
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return json({ error: 'Username and password required' }, { status: 400 });
    }
    
    const result = auth.verifyUser(username, password);
    
    if (!result.valid) {
      return json({ error: result.error }, { status: 401 });
    }
    
    const sessionId = auth.createSession(result.user.id);
    
    cookies.set('session', sessionId, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7
    });
    
    return json({ 
      success: true, 
      user: { username: result.user.username, role: result.user.role } 
    });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get('session');
  if (sessionId) {
    auth.deleteSession(sessionId);
  }
  cookies.delete('session', { path: '/' });
  return json({ success: true });
};