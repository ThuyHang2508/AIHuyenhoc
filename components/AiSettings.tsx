"use client";
import { useEffect, useState } from "react";
import Icon from "./Icon";
import { PROVIDERS, type ProviderId } from "@/lib/ai-providers";
import { DEFAULT_SETTINGS, OPEN_SETTINGS_EVENT, loadSettings, requestAuth, saveSettings, useAiSettings, useServerKeys, type AiSettings } from "@/lib/ai-settings";

const IDS = Object.keys(PROVIDERS) as ProviderId[];

/** Nút trên header: hiện AI đang dùng, bấm để mở hộp cài đặt. */
export function AiSettingsButton({ compact = false }: { compact?: boolean }) {
  const s = useAiSettings();
  const server = useServerKeys();
  const hasKey = !!s.keys[s.provider] || Object.values(server).some(Boolean);
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
      className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-abyss px-3 py-2 font-label text-label-md text-on-surface-variant transition hover:border-emerald/50 hover:text-primary-container"
      title="Chọn AI và nhập API key"
    >
      <Icon name="tune" className="text-[18px]" />
      {!compact && <span>AI: {PROVIDERS[s.provider].label}</span>}
      <span className={`h-2 w-2 rounded-full ${hasKey ? "bg-primary-container" : "bg-amber-400"}`} />
    </button>
  );
}

/** Hộp cài đặt, gắn một lần trong layout; mở bằng sự kiện OPEN_SETTINGS_EVENT. */
export default function AiSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AiSettings>(DEFAULT_SETTINGS);
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const server = useServerKeys();

  useEffect(() => {
    const on = () => {
      setDraft(loadSettings());
      setStatus(null);
      setShow(false);
      setOpen(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, on);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  if (!open) return null;
  const p = draft.provider;
  const keyCount = (draft.keys[p] ?? "").split(/[\s,]+/).filter(Boolean).length;
  const info = PROVIDERS[p];
  const set = (patch: Partial<AiSettings>) => { setDraft((d) => ({ ...d, ...patch })); setStatus(null); };

  const test = async () => {
    setTesting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...requestAuth(draft), test: true }),
      });
      const t = await res.text();
      setStatus(res.ok ? { ok: true, msg: `Kết nối ${info.label} thành công.` } : { ok: false, msg: t || `Lỗi ${res.status}` });
    } catch {
      setStatus({ ok: false, msg: "Không gọi được máy chủ." });
    } finally {
      setTesting(false);
    }
  };

  const save = () => {
    saveSettings({ ...draft, keys: Object.fromEntries(Object.entries(draft.keys).map(([k, v]) => [k, (v ?? "").trim()]).filter(([, v]) => v)) });
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-[8vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Cài đặt AI" className="glass w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-headline-sm text-primary"><Icon name="tune" className="text-primary-container" /> Cài đặt AI luận giải</h2>
          <button aria-label="Đóng" onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-primary-container"><Icon name="close" /></button>
        </div>

        <div className="field-label">1. Chọn AI</div>
        <div className="grid grid-cols-3 gap-2">
          {IDS.map((id) => (
            <button key={id} onClick={() => set({ provider: id })}
              className={`rounded-xl border p-3 text-left transition ${p === id ? "border-emerald bg-emerald/10 shadow-float" : "border-white/[0.07] bg-glass/60 hover:border-emerald/40"}`}>
              <div className="font-serif text-[18px] text-primary">{PROVIDERS[id].label}</div>
              <div className="text-[11px] text-muted">{PROVIDERS[id].company}</div>
              <div className={`mt-1 text-[11px] ${draft.keys[id] || server[id] ? "text-primary-container" : "text-amber-300/80"}`}>{draft.keys[id] ? "● Key của bạn" : server[id] ? "● Máy chủ có key" : "○ Chưa có key"}</div>
            </button>
          ))}
        </div>

        <label className="field-label mt-5 block">2. API key {info.label}</label>
        <div className="flex gap-2">
          <textarea
            className="field min-h-[96px] flex-1 resize-y font-mono text-sm leading-6"
            style={show ? undefined : ({ WebkitTextSecurity: "disc" } as React.CSSProperties)}
            rows={4}
            autoComplete="off"
            spellCheck={false}
            placeholder={`${info.keyHint}\n${info.keyHint}\n(mỗi dòng một key)`}
            value={draft.keys[p] ?? ""}
            onChange={(e) => set({ keys: { ...draft.keys, [p]: e.target.value } })}
          />
          <button className="btn-ghost px-3" onClick={() => setShow((v) => !v)} aria-label={show ? "Ẩn key" : "Hiện key"}>
            <Icon name={show ? "visibility_off" : "visibility"} className="text-[18px]" />
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted">
          {server[p] && <span className="text-primary-container">Máy chủ đã có sẵn key {info.label}, có thể để trống ô này. </span>}Dán được nhiều key, <b>mỗi dòng một key</b>: web tự xoay vòng và tự chuyển key khi một key hết hạn mức. {keyCount > 1 && <span className="text-primary-container">Đang có {keyCount} key. </span>}Lấy key tại <a href={info.keyUrl} target="_blank" rel="noreferrer" className="text-primary-container underline">{info.keyUrl.replace("https://", "")}</a>. Key chỉ lưu trong trình duyệt này.
        </p>

        <label className="field-label mt-5 block">3. Model</label>
        <input className="field font-mono text-sm" list={`models-${p}`} value={draft.models[p]} onChange={(e) => set({ models: { ...draft.models, [p]: e.target.value.trim() } })} />
        <datalist id={`models-${p}`}>{info.models.map((m) => <option key={m} value={m} />)}</datalist>
        <p className="mt-1.5 text-xs text-muted">Để mặc định nếu không chắc. Có thể gõ tên model mới hơn của {info.company}.</p>

        {status && (
          <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${status.ok ? "border-emerald/40 bg-emerald/10 text-primary-container" : "border-error/30 bg-error/10 text-error"}`}>
            <Icon name={status.ok ? "check_circle" : "error"} className="mr-1 align-middle text-[16px]" /> {status.msg}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button className="btn-ghost" disabled={testing || (!draft.keys[p]?.trim() && !server[p])} onClick={test}>
            <Icon name="bolt" className="text-[16px]" /> {testing ? "Đang kiểm tra…" : "Kiểm tra key"}
          </button>
          <button className="btn-neon" onClick={save}><Icon name="save" className="text-[16px]" /> Lưu &amp; dùng {info.label}</button>
        </div>
      </div>
    </div>
  );
}
