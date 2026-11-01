// Giới hạn số lượt hỏi AI theo IP, lưu trong bộ nhớ máy chủ (đủ chặn spam cơ bản khi chạy một máy chủ).

type Bucket = { count: number; reset: number };
const g = globalThis as typeof globalThis & { __aetherRate?: Map<string, Bucket> };
const store = (g.__aetherRate ??= new Map());

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (store.size > 5000) store.forEach((b, k) => b.reset < now && store.delete(k));
  let b = store.get(key);
  if (!b || b.reset < now) store.set(key, (b = { count: 0, reset: now + windowMs }));
  b.count++;
  return { ok: b.count <= limit, retryAfter: Math.ceil((b.reset - now) / 1000) };
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}
