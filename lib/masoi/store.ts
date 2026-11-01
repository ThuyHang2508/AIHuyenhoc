// Kho lưu phòng board game (Ma Sói, Thật hay Uống…) — chỉ chạy trên máy chủ.
// Trên Vercel: Upstash Redis qua REST (biến KV_REST_API_URL/KV_REST_API_TOKEN hoặc UPSTASH_REDIS_REST_URL/_TOKEN).
// Khi chạy trên máy mà chưa cấu hình: dùng bộ nhớ tạm của tiến trình (đủ để test với một máy chủ dev).

const URL = process.env.KV_REST_API_URL || process.env.STORAGE_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.STORAGE_KV_REST_API_URL || "";
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.STORAGE_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.STORAGE_KV_REST_API_TOKEN || "";
export const hasRedis = !!(URL && TOKEN);

const TTL = 60 * 60 * 6; // phòng tự xóa sau 6 giờ không hoạt động

async function redis(cmd: (string | number)[]): Promise<unknown> {
  const res = await fetch(URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  const j = (await res.json()) as { result?: unknown; error?: string };
  if (j.error) throw new Error(j.error);
  return j.result;
}

const g = globalThis as typeof globalThis & { __masoiMem?: Map<string, { v: string; exp: number }> };
const mem = (g.__masoiMem ??= new Map());

async function get(key: string): Promise<string | null> {
  if (hasRedis) return (await redis(["GET", key])) as string | null;
  const e = mem.get(key);
  if (!e || e.exp < Date.now()) return null;
  return e.v;
}
async function set(key: string, v: string, ttl = TTL) {
  if (hasRedis) return void (await redis(["SET", key, v, "EX", ttl]));
  mem.set(key, { v, exp: Date.now() + ttl * 1000 });
}
async function setNx(key: string, v: string, ms: number): Promise<boolean> {
  if (hasRedis) return (await redis(["SET", key, v, "NX", "PX", ms])) === "OK";
  const e = mem.get(key);
  if (e && e.exp > Date.now()) return false;
  mem.set(key, { v, exp: Date.now() + ms });
  return true;
}
async function del(key: string) {
  if (hasRedis) return void (await redis(["DEL", key]));
  mem.delete(key);
}

export async function loadRoom<T>(code: string, ns = "masoi"): Promise<T | null> {
  const raw = await get(`${ns}:room:${code}`);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function createRoom<T>(code: string, room: T, ns = "masoi"): Promise<boolean> {
  return setNx(`${ns}:room:${code}`, JSON.stringify(room), TTL * 1000);
}

/** Đọc – sửa – ghi một phòng có khóa, để nhiều người bấm cùng lúc không ghi đè nhau. */
export async function withRoom<T, R>(code: string, fn: (room: T) => R | Promise<R>, ns = "masoi"): Promise<{ room: T; result: R } | null> {
  const lockKey = `${ns}:lock:${code}`;
  const me = Math.random().toString(36).slice(2);
  const deadline = Date.now() + 4000;
  while (!(await setNx(lockKey, me, 4000))) {
    if (Date.now() > deadline) throw new Error("Phòng đang bận, thử lại sau giây lát.");
    await new Promise((r) => setTimeout(r, 60 + Math.random() * 60));
  }
  try {
    const room = await loadRoom<T>(code, ns);
    if (!room) return null;
    const result = await fn(room);
    await set(`${ns}:room:${code}`, JSON.stringify(room));
    return { room, result };
  } finally {
    await del(lockKey);
  }
}
