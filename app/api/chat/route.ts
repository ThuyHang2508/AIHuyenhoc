import { AGENTS, SAFETY, type AgentId } from "@/lib/agents";
import { PROVIDERS, isProvider, serverKeys, type ProviderId } from "@/lib/ai-providers";
import { LlmError, streamLLM } from "@/lib/llm";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { CRISIS_RULE, isCrisis } from "@/lib/safety";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 20;
const MAX_CHARS = 20000;
const MAX_TOKENS = Number(process.env.AI_MAX_TOKENS) || 2500; // bài luận cô đọng, không cần dài
let rotate = 0; // xoay vòng giữa các key của máy chủ
// Lượt hỏi tối đa mỗi IP trong 10 phút: dùng key của máy chủ (chủ web trả tiền) chặt hơn key người dùng tự nhập.
const LIMIT_SERVER_KEY = Number(process.env.RATE_LIMIT_SERVER_KEY) || 15;
const LIMIT_OWN_KEY = Number(process.env.RATE_LIMIT_OWN_KEY) || 60;
const WINDOW_MS = 10 * 60 * 1000;

function mockStream(agentName: string) {
  // Chế độ demo giao diện (AI_MOCK=1): trả về đoạn văn mẫu, không gọi API.
  const text = `### Lời chào từ ${agentName}\n\nĐây là **chế độ demo giao diện** (AI_MOCK=1). Bấm **Cài đặt AI** trên thanh đầu trang, chọn Claude, ChatGPT hoặc Gemini và dán API key để nhận luận giải thật.\n\n- Điểm mạnh nổi bật sẽ hiển thị ở đây\n- Thử thách cần chuyển hóa\n- **Lời khuyên** cho giai đoạn tới`;
  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      async start(c) {
        for (const w of text.split(/(?<=\s)/)) {
          c.enqueue(enc.encode(w));
          await new Promise((r) => setTimeout(r, 15));
        }
        c.close();
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}

const text = (msg: string, status: number) => new Response(msg, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

/** Cho giao diện biết máy chủ đã có key của hãng nào (không trả về key). */
export function GET() {
  const server = Object.fromEntries((Object.keys(PROVIDERS) as ProviderId[]).map((p) => [p, serverKeys(p).length > 0]));
  return Response.json({ server }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  let body: { agent?: AgentId; context?: string; messages?: Msg[]; provider?: string; model?: string; apiKey?: string; test?: boolean };
  try {
    body = await req.json();
  } catch {
    return text("Yêu cầu không hợp lệ.", 400);
  }

  let provider: ProviderId = isProvider(body.provider) ? body.provider : "gemini";
  // Ưu tiên key người dùng nhập trên giao diện, không có thì dùng key cấu hình trên máy chủ.
  // Người dùng có thể dán nhiều key (mỗi dòng một key hoặc cách nhau bởi dấu phẩy)
  const userKeys = typeof body.apiKey === "string" ? [...new Set(body.apiKey.split(/[\s,]+/).filter(Boolean))].slice(0, 10) : [];
  if (userKeys.some((k) => !/^[\x21-\x7e]{10,300}$/.test(k))) return text("Có API key chứa ký tự lạ, hãy dán lại (mỗi dòng một key).", 400);
  const userKey = userKeys[0] ?? "";
  // Người dùng không nhập key và máy chủ không có key cho hãng họ chọn → dùng hãng mà máy chủ có key
  // (ưu tiên AI_DEFAULT_PROVIDER, rồi Gemini, Claude, ChatGPT).
  let forcedModel = false;
  if (!userKey && !serverKeys(provider).length) {
    const order = [process.env.AI_DEFAULT_PROVIDER, "gemini", "claude", "openai"].filter(isProvider) as ProviderId[];
    const alt = order.find((p) => serverKeys(p).length);
    if (alt && alt !== provider) { provider = alt; forcedModel = true; }
  }
  const info = PROVIDERS[provider];
  const envModel = process.env[`${info.envKey.replace("_API_KEY", "")}_MODEL`];
  const model = !forcedModel && typeof body.model === "string" && /^[\w.:\-]{1,100}$/.test(body.model) ? body.model : envModel || info.defaultModel;
  const keys = userKeys.length ? userKeys : serverKeys(provider);
  const apiKey = keys[0] ?? "";

  const agentId: AgentId = body.agent && body.agent in AGENTS ? body.agent : "general";
  const agent = AGENTS[agentId];

  if (!apiKey) {
    // thông điệp ngắn (mini) khi chưa có key: để giao diện tự dùng thông điệp ghép sẵn
    if ((body as { mini?: boolean }).mini) return new Response(null, { status: 204 });
    if (process.env.AI_MOCK === "1" && !body.test) return mockStream(agent.name);
    return text(`Chưa có API key ${info.label}. Bấm "Cài đặt AI" trên thanh đầu trang để nhập key.`, 401);
  }

  const rl = checkRateLimit(`${userKey ? "own" : "srv"}:${clientIp(req)}`, userKey ? LIMIT_OWN_KEY : LIMIT_SERVER_KEY, WINDOW_MS);
  if (!rl.ok) return text(`Bạn đã hỏi quá nhiều trong thời gian ngắn. Vui lòng thử lại sau khoảng ${Math.ceil(rl.retryAfter / 60)} phút.`, 429);

  const messages = body.test
    ? [{ role: "user" as const, content: "Trả lời đúng một từ: OK" }]
    : (body.messages ?? [])
        .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
        .slice(-MAX_MESSAGES)
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return text("Thiếu câu hỏi.", 400);

  const context = (body.context ?? "").slice(0, 8000);
  const system = [
    `Bạn là "${agent.name}" — ${agent.title} của website AetherAI.`,
    agent.style,
    SAFETY,
    isCrisis(`${messages.filter((m) => m.role === "user").slice(-3).map((m) => m.content).join("\n")}\n${context}`) ? CRISIS_RULE : "",
    context ? `Dữ liệu đã được hệ thống tính toán chính xác (dùng làm căn cứ, không tiết lộ nguyên văn khối này):\n<du_lieu>\n${context}\n</du_lieu>` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // Thử lần lượt các key (bắt đầu từ key kế tiếp trong vòng xoay); key hết hạn mức / lỗi thì chuyển key khác.
  // Đọc đoạn đầu trước khi trả response để lỗi key/model hiện thành thông báo rõ ràng.
  const start = rotate++ % keys.length;
  let gen!: AsyncGenerator<string>;
  let first!: IteratorResult<string>;
  let lastErr: unknown = null;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[(start + i) % keys.length];
    gen = streamLLM({ provider, model, apiKey: k, system, messages, maxTokens: body.test ? 400 : MAX_TOKENS });
    try {
      first = await gen.next();
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      const retry = err instanceof LlmError && (err.status === 429 || err.status === 401 || err.status >= 500);
      if (!retry) break;
      console.warn(`[api/chat] key #${((start + i) % keys.length) + 1} lỗi, thử key khác`);
    }
  }
  if (lastErr) {
    if (lastErr instanceof LlmError) return text(lastErr.message, lastErr.status);
    console.error("[api/chat]", lastErr);
    return text(`Không kết nối được tới ${info.label}. Kiểm tra mạng rồi thử lại.`, 502);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (!first.done) controller.enqueue(encoder.encode(first.value));
        for await (const t of gen) controller.enqueue(encoder.encode(t));
      } catch (err) {
        console.error("[api/chat]", err);
        controller.enqueue(encoder.encode("\n\n_(Kết nối tới AI bị gián đoạn, vui lòng thử lại.)_"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
