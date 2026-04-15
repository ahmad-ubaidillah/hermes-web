import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { checkRateLimit } from '$lib/server/rate-limit';
import { existsSync } from 'fs';
import { join } from 'path';

const STATIC_DIR = join(process.cwd(), 'static');
if (!existsSync(STATIC_DIR)) {
  console.warn(`Static directory not found at ${STATIC_DIR}. Some assets may not load correctly.`);
}

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/check',
  '/api/vps/stream',
];

const PUBLIC_API_PREFIXES = [
  '/api/vps',
  '/api/hermes/doctor',
  '/api/hermes/install',
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))) return true;
  if (pathname.startsWith('/api/auth/')) return true;
  return false;
}

export const handle: Handle = async ({ event, resolve }) => {
  if (isPublicPath(event.url.pathname)) {
    return resolve(event);
  }
  
  const sessionId = event.cookies.get('session');
  
  if (!sessionId) {
    if (event.url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(null, {
      status: 302,
      headers: { Location: '/login' }
    });
  }
  
  const result = auth.verifySession(sessionId);
  
  if (!result.valid) {
    if (event.url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(null, {
      status: 302,
      headers: { Location: '/login' }
    });
  }
  
  event.locals.user = result.user;
  return resolve(event);
};

function isCSRFExempt(pathname: string): boolean {
  return pathname === '/api/auth/login' || pathname === '/api/auth/check';
}