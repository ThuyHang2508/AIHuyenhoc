// Gọi Claude / ChatGPT / Gemini qua REST, trả về luồng văn bản (chỉ chạy trên server).
import type { ProviderId } from "./ai-providers";

type Msg = { role: "user" | "assistant"; content: string };

export class LlmError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

async function* sse(res: Response): AsyncGenerator<unknown> {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        yield JSON.parse(data);
      } catch {
        /* bỏ qua dòng hỏng */
      }
    }
  }
}

async function fail(res: Response, label: string, model: string): Promise<never> {
  const body = await res.text().catch(() => "");
  let detail = "";
  try {
    const j = JSON.parse(body);
    detail = j?.error?.message || j?.[0]?.error?.message || "";
  } catch {
    detail = body.slice(0, 200);
  }
  console.error(`[llm] ${label} ${res.status}: ${detail}`);
  if (res.status === 401 || res.status === 403 || /api key/i.test(detail))
    throw new LlmError(`API key ${label} không hợp lệ hoặc chưa được cấp quyền. Kiểm tra lại key trong Cài đặt AI.`, 401);
  if (res.status === 404) throw new LlmError(`${label} không có model "${model}". Đổi tên model trong Cài đặt AI.`, 400);
  if (res.status === 429) throw new LlmError(`${label} báo hết hạn mức hoặc gửi quá nhiều yêu cầu. Kiểm tra số dư/hạn mức tài khoản rồi thử lại.`, 429);
  throw new LlmError(`${label} trả lỗi ${res.status}${detail ? `: ${detail}` : ""}`);
}

export async function* streamLLM(opts: {
  provider: ProviderId;
  model: string;
  apiKey: string;
  system: string;
  messages: Msg[];
  maxTokens: number;
}): AsyncGenerator<string> {
  const { provider, model, apiKey, system, messages, maxTokens } = opts;

  if (provider === "claude") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages, stream: true }),
    });
    if (!res.ok) await fail(res, "Claude", model);
    for await (const ev of sse(res) as AsyncGenerator<any>) {
      if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") yield ev.delta.text;
      if (ev.type === "error") throw new LlmError(`Claude: ${ev.error?.message ?? "lỗi không rõ"}`);
    }
    return;
  }

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      // max_completion_tokens tính cả phần "suy nghĩ" của model GPT-5 nên để rộng
      body: JSON.stringify({ model, stream: true, max_completion_tokens: maxTokens * 2, messages: [{ role: "system", content: system }, ...messages] }),
    });
    if (!res.ok) await fail(res, "ChatGPT", model);
    for await (const ev of sse(res) as AsyncGenerator<any>) {
      const t = ev.choices?.[0]?.delta?.content;
      if (t) yield t;
    }
    return;
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      // Flash 2.5: tắt phần "suy nghĩ" để chữ hiện ra ngay; model khác giữ mặc định (maxOutputTokens tính cả phần suy nghĩ)
      generationConfig: /2\.5-flash/.test(model)
        ? { maxOutputTokens: maxTokens, temperature: 0.8, thinkingConfig: { thinkingBudget: 0 } }
        : { maxOutputTokens: maxTokens * 2, temperature: 0.8 },
    }),
  });
  if (!res.ok) await fail(res, "Gemini", model);
  for await (const ev of sse(res) as AsyncGenerator<any>) {
    for (const p of ev.candidates?.[0]?.content?.parts ?? []) if (p.text && !p.thought) yield p.text;
  }
}
