import { randomBytes } from 'crypto';

const csrfTokens = new Map<string, { token: string; expiresAt: number }>();

const CSRF_TTL = 60 * 60 * 1000;

export function generateCSRFToken(sessionId: string): string {
  const token = randomBytes(32).toString('hex');
  csrfTokens.set(sessionId, { token, expiresAt: Date.now() + CSRF_TTL });
  return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const entry = csrfTokens.get(sessionId);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    csrfTokens.delete(sessionId);
    return false;
  }
  return entry.token === token;
}

export function cleanupCSRFTokens() {
  const now = Date.now();
  for (const [key, entry] of csrfTokens) {
    if (now > entry.expiresAt) {
      csrfTokens.delete(key);
    }
  }
}

setInterval(cleanupCSRFTokens, 5 * 60 * 1000);