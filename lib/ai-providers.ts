// Danh sách nhà cung cấp AI người dùng có thể chọn (dùng chung client + server).

export type ProviderId = "claude" | "openai" | "gemini";

export const PROVIDERS: Record<
  ProviderId,
  { label: string; company: string; defaultModel: string; models: string[]; keyUrl: string; keyHint: string; envKey: string }
> = {
  claude: {
    label: "Claude",
    company: "Anthropic",
    defaultModel: "claude-sonnet-5-5",
    models: ["claude-sonnet-5-5", "claude-opus-5-5", "claude-haiku-5-5"],
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyHint: "sk-ant-…",
    envKey: "ANTHROPIC_API_KEY",
  },
  openai: {
    label: "ChatGPT",
    company: "OpenAI",
    defaultModel: "gpt-5",
    models: ["gpt-5", "gpt-5-mini"],
    keyUrl: "https://platform.openai.com/api-keys",
    keyHint: "sk-…",
    envKey: "OPENAI_API_KEY",
  },
  gemini: {
    label: "Gemini",
    company: "Google",
    defaultModel: "gemini-2.5-flash",
    models: ["gemini-2.5-flash", "gemini-2.5-pro"],
    keyUrl: "https://aistudio.google.com/app/apikey",
    keyHint: "AIza…",
    envKey: "GEMINI_API_KEY",
  },
};

/** Key cấu hình trên máy chủ cho một hãng: hỗ trợ nhiều key cách nhau bởi dấu phẩy (vd. GEMINI_API_KEYS=k1,k2,k3). */
export function serverKeys(p: ProviderId): string[] {
  const env = PROVIDERS[p].envKey;
  return [process.env[env + "S"], process.env[env]]
    .filter(Boolean)
    .join(",")
    .split(/[,\s]+/)
    .map((k) => k.trim())
    .filter((k, i, a) => k && a.indexOf(k) === i);
}

export const isProvider = (p: unknown): p is ProviderId => typeof p === "string" && p in PROVIDERS;
