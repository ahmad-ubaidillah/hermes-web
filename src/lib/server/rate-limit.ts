interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;
const LOGIN_MAX_REQUESTS = 10;

export function checkRateLimit(identifier: string, maxRequests: number = MAX_REQUESTS): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimits.get(identifier);
  const limit = identifier.startsWith('login:') ? LOGIN_MAX_REQUESTS : maxRequests;
  
  if (!entry || entry.resetAt < now) {
    rateLimits.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: limit - 1, resetAt: now + WINDOW_MS };
  }
  
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  
  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, entry] of rateLimits) {
    if (entry.resetAt < now) {
      rateLimits.delete(key);
    }
  }
}

setInterval(cleanupRateLimits, 5 * 60 * 1000);