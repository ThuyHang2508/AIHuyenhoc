"use client";
// Lựa chọn AI + API key của người dùng, lưu trong trình duyệt (localStorage) của chính họ.
import { useEffect, useState } from "react";
import { PROVIDERS, isProvider, type ProviderId } from "./ai-providers";

export interface AiSettings {
  provider: ProviderId;
  models: Record<ProviderId, string>;
  keys: Partial<Record<ProviderId, string>>;
}

const STORAGE = "aether-ai-settings";
const EVENT = "aether-ai-settings-change";
export const OPEN_SETTINGS_EVENT = "aether-open-ai-settings";

export const DEFAULT_SETTINGS: AiSettings = {
  provider: "gemini",
  models: { claude: PROVIDERS.claude.defaultModel, openai: PROVIDERS.openai.defaultModel, gemini: PROVIDERS.gemini.defaultModel },
  keys: {},
};

export function loadSettings(): AiSettings {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE) || "null");
    if (!raw) return DEFAULT_SETTINGS;
    return {
      provider: isProvider(raw.provider) ? raw.provider : DEFAULT_SETTINGS.provider,
      models: { ...DEFAULT_SETTINGS.models, ...(raw.models ?? {}) },
      keys: { ...(raw.keys ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AiSettings) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(s));
  } catch {
    /* trình duyệt chặn lưu trữ: vẫn dùng được trong phiên này */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: s }));
}

export function useAiSettings() {
  const [s, setS] = useState<AiSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    setS(loadSettings());
    const on = (e: Event) => setS((e as CustomEvent<AiSettings>).detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return s;
}

/** Hãng nào đã có key trên máy chủ (người dùng không cần tự nhập). */
let serverCache: Promise<Partial<Record<ProviderId, boolean>>> | null = null;
export function useServerKeys() {
  const [s, setS] = useState<Partial<Record<ProviderId, boolean>>>({});
  useEffect(() => {
    serverCache ??= fetch("/api/chat").then((r) => r.json()).then((j) => j.server ?? {}).catch(() => ({}));
    serverCache.then(setS);
  }, []);
  return s;
}

export const openAiSettings = () => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));

/** Phần gửi kèm mỗi yêu cầu /api/chat */
export function requestAuth(s: AiSettings = loadSettings()) {
  return { provider: s.provider, model: s.models[s.provider], apiKey: s.keys[s.provider] || undefined };
}
