/**
 * Simple in-memory fixed-window rate limiter. Good enough for a single-process
 * demo deployment. For multi-instance production use a shared store (Redis).
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  b.count += 1;
  if (b.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { allowed: true, remaining: limit - b.count, retryAfterSec: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

export function _clearAllRateLimits() {
  buckets.clear();
}
