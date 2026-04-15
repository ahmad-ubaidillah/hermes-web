import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/check', '/api/vps', '/api/hermes/doctor'];
  const isPublicPath = publicPaths.some(path => event.url.pathname.startsWith(path));
  
  if (isPublicPath) {
    return resolve(event);
  }
  
  if (event.url.pathname.startsWith('/api/') && !publicPaths.includes(event.url.pathname)) {
    const sessionId = event.cookies.get('session');
    
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = auth.verifySession(sessionId);
    
    if (!result.valid) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  return resolve(event);
};