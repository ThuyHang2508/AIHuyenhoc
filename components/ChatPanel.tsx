"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import Markdown from "./Markdown";
import type { AgentId } from "@/lib/agents";
import { AGENTS } from "@/lib/agents";
import { PROVIDERS } from "@/lib/ai-providers";
import { openAiSettings, requestAuth, useAiSettings } from "@/lib/ai-settings";

export type ChatMsg = { role: "user" | "assistant"; content: string; hidden?: boolean };

interface Props {
  agent: AgentId;
  context: string;
  title?: string;
  suggestions?: string[];
  /** Câu hỏi mở đầu tự gửi khi context thay đổi (vd. "Hãy luận giải tổng quan lá số"). */
  autoPrompt?: string;
  /** khóa để reset hội thoại khi người dùng lập lá số mới */
  sessionKey?: string;
  className?: string;
  placeholder?: string;
  initialQuestion?: string;
}

export async function streamChat(agent: AgentId, context: string, messages: ChatMsg[], onText: (t: string) => void) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent, context, messages, ...requestAuth() }),
  });
  if (!res.ok || !res.body) {
    const msg = await res.text().catch(() => "");
    throw Object.assign(new Error(msg || `Lỗi ${res.status}`), { needKey: res.status === 401 });
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let acc = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    acc += dec.decode(value, { stream: true });
    onText(acc);
  }
  return acc;
}

export default function ChatPanel({ agent, context, title, suggestions = [], autoPrompt, sessionKey, className = "", placeholder, initialQuestion }: Props) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ msg: string; needKey: boolean; retry: () => void } | null>(null);
  const ai = useAiSettings();
  const scroller = useRef<HTMLDivElement>(null);
  const started = useRef<string | undefined>(undefined);
  const persona = AGENTS[agent];

  const send = async (text: string, history: ChatMsg[] = msgs, hidden = false) => {
    if (!text.trim() || busy) return;
    setError(null);
    const userMsg: ChatMsg = { role: "user", content: text.trim(), hidden };
    const next = [...history, userMsg];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      await streamChat(agent, context, next.map(({ role, content }) => ({ role, content })), (t) =>
        setMsgs((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: "assistant", content: t };
          return copy;
        }),
      );
    } catch (e) {
      setError({
        msg: e instanceof Error ? e.message : "Không kết nối được AI.",
        needKey: !!(e as { needKey?: boolean })?.needKey,
        retry: () => send(text, history, hidden),
      });
      setMsgs(history);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (sessionKey === undefined || started.current === sessionKey) return;
    started.current = sessionKey;
    setMsgs([]);
    if (autoPrompt) send(autoPrompt, [], true);
    else if (initialQuestion) send(initialQuestion, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const visible = msgs.filter((m) => !m.hidden);

  return (
    <section className={`glass flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
        <div className="flex items-center gap-2">
          <Icon name="all_inclusive" className="text-[20px] text-primary-container" />
          <h3 className="font-serif text-[20px] text-primary">{title ?? "Đối Thoại Với Oracle"}</h3>
          <button className="chip hover:border-primary-container" title="Đổi AI" onClick={openAiSettings}>{PROVIDERS[ai.provider].label}</button>
        </div>
        {visible.length > 0 && (
          <button className="text-on-surface-variant hover:text-primary-container" title="Làm mới hội thoại" onClick={() => { setMsgs([]); started.current = undefined; }}>
            <Icon name="refresh" className="text-[18px]" />
          </button>
        )}
      </div>

      <div ref={scroller} className="flex-1 space-y-5 overflow-y-auto px-5 py-5" style={{ maxHeight: 640, minHeight: 220 }}>
        {visible.length === 0 && !busy && (
          <p className="text-sm text-muted">
            {persona.name} đang chờ câu hỏi của bạn. Hãy hỏi về sự nghiệp, tình duyên, tài chính hay bất kỳ điều gì bạn đang băn khoăn.
          </p>
        )}
        {visible.map((m, i) =>
          m.role === "assistant" ? (
            <div key={i} className="flex gap-3 animate-fadeUp">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald/30 bg-emerald/10">
                <Icon name="psychology_alt" className="text-[18px] text-primary-container" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="label-sm text-secondary">{persona.name}</span>
                  {busy && i === visible.length - 1 && <span className="label-sm text-primary-container">Đang luận giải…</span>}
                </div>
                {m.content ? <Markdown text={m.content} /> : <TypingDots />}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end animate-fadeUp">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-white/[0.06] bg-surface-container-high px-4 py-3 text-sm">
                <div className="label-sm mb-1 text-right text-muted">Bạn</div>
                {m.content}
              </div>
            </div>
          ),
        )}
        {error && (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            <Icon name="error" className="mr-1 align-middle text-[16px]" />
            {error.msg}
            <div className="mt-2 flex gap-2">
              {error.needKey || /key|model/i.test(error.msg) ? (
                <button className="btn-ghost px-3 py-1.5 text-xs" onClick={openAiSettings}><Icon name="tune" className="text-[14px]" /> Mở Cài đặt AI</button>
              ) : null}
              <button className="btn-ghost px-3 py-1.5 text-xs" disabled={busy} onClick={error.retry}><Icon name="refresh" className="text-[14px]" /> Thử lại</button>
            </div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="border-t border-white/[0.04] px-5 pt-3">
          <div className="label-sm mb-2 text-muted">
            <Icon name="bolt" className="mr-1 align-middle text-[14px] text-primary-container" />
            Gợi ý câu hỏi
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} disabled={busy} onClick={() => send(s)} className="rounded-full border border-emerald/20 bg-emerald/5 px-3 py-1.5 text-left text-xs text-emerald-mist transition hover:border-primary-container disabled:opacity-50">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="m-4 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-abyss px-3 py-2 focus-within:border-emerald"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
          setInput("");
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder ?? `Hỏi ${persona.name} về sự nghiệp, tình duyên…`}
          className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-slate-500"
        />
        <button disabled={busy || !input.trim()} className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container text-[#003919] disabled:opacity-40" aria-label="Gửi">
          <Icon name="send" className="text-[18px]" />
        </button>
      </form>
      <p className="-mt-2 mb-3 text-center text-[11px] text-muted">Thông tin AI trả lời chỉ mang tính chất tham khảo.</p>
    </section>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 py-2">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-container" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
}
