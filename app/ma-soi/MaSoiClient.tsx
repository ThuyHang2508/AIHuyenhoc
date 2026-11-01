"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { MAX_PLAYERS, MIN_PLAYERS, ROLES, setupFor, type Role } from "@/lib/masoi/roles";
import type { RoomView } from "@/lib/masoi/engine";

type Session = { code: string; pid: string; token: string };
const KEY = "masoi-session";

async function api(body: Record<string, unknown>) {
  const res = await fetch("/api/masoi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await res.json().catch(() => ({ error: "Mất kết nối máy chủ." }));
  if (!res.ok) throw Object.assign(new Error(j.error || `Lỗi ${res.status}`), { status: res.status });
  return j;
}

export default function MaSoiClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(location.search).get("phong")?.toUpperCase() ?? "";
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null") as Session | null;
      if (s && (!code || s.code === code)) setSession(s);
    } catch { /* bỏ qua */ }
    setReady(true);
  }, []);

  const enter = (s: Session) => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* bỏ qua */ }
    history.replaceState(null, "", `/ma-soi?phong=${s.code}`);
    setSession(s);
  };
  const exit = () => {
    try { localStorage.removeItem(KEY); } catch { /* bỏ qua */ }
    history.replaceState(null, "", "/ma-soi");
    setSession(null);
  };

  if (!ready) return null;
  return (
    <div className="ritual-bg relative -mt-20 min-h-screen overflow-hidden pt-20">
      <div className="ritual-stars" />
      <div className="relative mx-auto max-w-[1200px] px-4 py-6 md:px-6 md:py-10">
        {session ? <Room session={session} onExit={exit} /> : <Entry onEnter={enter} />}
      </div>
    </div>
  );
}

/* ---------------- Vào phòng ---------------- */
function Entry({ onEnter }: { onEnter: (s: Session) => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const c = new URLSearchParams(location.search).get("phong");
    if (c) setCode(c.toUpperCase());
    try { setName(localStorage.getItem("masoi-name") || ""); } catch { /* bỏ qua */ }
  }, []);

  const go = async (type: "create" | "join") => {
    setErr(null);
    if (!name.trim()) return setErr("Hãy nhập tên của bạn.");
    if (type === "join" && code.trim().length < 4) return setErr("Hãy nhập mã phòng.");
    setBusy(true);
    try {
      try { localStorage.setItem("masoi-name", name.trim()); } catch { /* bỏ qua */ }
      const j = await api({ type, name, code });
      onEnter({ code: j.code, pid: j.pid, token: j.token });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_460px]">
      <div>
        <p className="font-label text-[12px] font-semibold uppercase tracking-[0.25em] text-[#dcb56f]"><Link href="/board-game" className="hover:underline">← Board game</Link> · Ma Sói online</p>
        <h1 className="mt-2 font-serif text-[40px] leading-[46px] text-[#f3d9a4] md:text-[56px] md:leading-[62px]">Đêm nay, ai là Sói?</h1>
        <p className="mt-4 max-w-xl text-on-surface-variant">Tạo phòng, gửi mã cho bạn bè và chơi ngay — mỗi người một điện thoại, vai được giữ kín, web làm quản trò: gọi từng vai dậy ban đêm, tính ai chết, đếm phiếu và báo phe thắng.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {(Object.keys(ROLES) as Role[]).map((r) => (
            <div key={r} className="flex gap-3 rounded-2xl border border-[#dcb56f]/15 bg-black/30 p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#dcb56f]/40 bg-[#151b36] text-[22px]">{ROLES[r].icon}</span>
              <div>
                <div className="font-serif text-[18px] text-[#f3d9a4]">{ROLES[r].name} <span className={`ml-1 text-[11px] uppercase tracking-wider ${ROLES[r].team === "soi" ? "text-[#ff8f8f]" : "text-[#8fd6ff]"}`}>phe {ROLES[r].team === "soi" ? "Sói" : "Dân"}</span></div>
                <p className="text-[13px] leading-5 text-on-surface-variant">{ROLES[r].desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-[#dcb56f]/25 bg-black/40 p-6 backdrop-blur lg:sticky lg:top-28">
        <label className="font-serif text-[20px] text-[#f3d9a4]" htmlFor="ms-name">Tên của bạn</label>
        <input id="ms-name" maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Hằng"
          className="mt-2 w-full rounded-xl border border-[#dcb56f]/25 bg-black/30 px-4 py-3 text-on-surface outline-none focus:border-[#dcb56f]/70" />
        <button disabled={busy} onClick={() => go("create")} className="btn-gold mt-5 w-full justify-center disabled:opacity-60"><Icon name="add_circle" className="text-[20px]" /> Tạo phòng mới</button>
        <div className="my-5 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-white/10" />hoặc vào phòng của bạn bè<span className="h-px flex-1 bg-white/10" /></div>
        <div className="flex gap-2">
          <input maxLength={6} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="MÃ PHÒNG" aria-label="Mã phòng"
            className="w-full rounded-xl border border-[#dcb56f]/25 bg-black/30 px-4 py-3 text-center font-label text-[18px] tracking-[0.3em] text-[#f3d9a4] outline-none focus:border-[#dcb56f]/70" />
          <button disabled={busy} onClick={() => go("join")} className="shrink-0 rounded-xl border border-[#dcb56f]/50 px-5 text-[#f3d9a4] transition hover:bg-[#dcb56f]/10 disabled:opacity-60">Vào</button>
        </div>
        {err && <p className="mt-3 text-sm text-error">{err}</p>}
        <p className="mt-5 text-xs leading-5 text-muted">Cần {MIN_PLAYERS}–{MAX_PLAYERS} người. Thiếu người thì chủ phòng thêm người máy 🤖 để chơi thử.</p>
      </div>
    </div>
  );
}

/* ---------------- Trong phòng ---------------- */
function Room({ session, onExit }: { session: Session; onExit: () => void }) {
  const [v, setV] = useState<RoomView | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [, force] = useState(0);
  const busy = useRef(false);

  const call = useCallback(async (body: Record<string, unknown>) => {
    try {
      const j = await api({ ...session, ...body });
      setV(j);
      setOffset(j.serverNow - Date.now());
      setErr(null);
      return true;
    } catch (e) {
      const s = (e as { status?: number }).status;
      if (s === 404) { setErr("Phòng không còn tồn tại."); }
      else setErr((e as Error).message);
      return false;
    }
  }, [session]);

  // hỏi trạng thái phòng 1,5 giây/lần
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      if (stop) return;
      if (!busy.current && document.visibilityState === "visible") {
        busy.current = true;
        await call({ type: "state" });
        busy.current = false;
      }
      setTimeout(tick, 1500);
    };
    tick();
    const t = setInterval(() => force((x) => x + 1), 500);
    return () => { stop = true; clearInterval(t); };
  }, [call]);

  if (!v) {
    return (
      <div className="py-24 text-center text-on-surface-variant">
        {err ? (<><p className="text-error">{err}</p><button className="btn-gold mt-6" onClick={onExit}>Về sảnh</button></>) : "Đang vào phòng…"}
      </div>
    );
  }

  const left = v.deadline ? Math.max(0, Math.ceil((v.deadline - (Date.now() + offset)) / 1000)) : null;
  const night = v.phase === "night" || v.phase === "witch";
  return (
    <div className="space-y-5">
      <TopBar v={v} left={left} onExit={onExit} onLeave={async () => { if (v.phase === "lobby") await call({ type: "leave" }); onExit(); }} />
      {err && <p className="rounded-xl border border-error/30 bg-error/10 px-4 py-2 text-sm text-error">{err}</p>}
      <div className={`grid gap-5 ${v.phase === "lobby" ? "" : "lg:grid-cols-[minmax(0,1fr)_380px]"}`}>
        <div className="space-y-5">
          {v.phase === "lobby" ? <Lobby v={v} call={call} /> : (
            <>
              {v.phase === "end" && <EndBanner v={v} call={call} />}
              {v.me?.role && <RoleCard v={v} />}
              <ActionPanel v={v} call={call} night={night} />
              <PlayerGrid v={v} />
            </>
          )}
        </div>
        {v.phase !== "lobby" && <LogPanel v={v} call={call} />}
      </div>
    </div>
  );
}

const PHASE_LABEL: Record<string, string> = { lobby: "Phòng chờ", night: "Ban đêm", witch: "Ban đêm", hunter: "Thợ săn", day: "Thảo luận", vote: "Bỏ phiếu", end: "Kết thúc" };

function TopBar({ v, left, onExit, onLeave }: { v: RoomView; left: number | null; onExit: () => void; onLeave: () => void }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${location.origin}/ma-soi?phong=${v.code}` : "";
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "Vào phòng Ma Sói", text: `Vào chơi Ma Sói với mình, mã phòng ${v.code}`, url: link });
      else { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch { /* người dùng hủy */ }
  };
  const night = v.phase === "night" || v.phase === "witch";
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#dcb56f]/20 bg-black/40 px-4 py-3 backdrop-blur">
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted">Mã phòng</div>
        <div className="font-label text-[24px] font-bold tracking-[0.25em] text-[#f3d9a4]">{v.code}</div>
      </div>
      <button onClick={share} className="flex items-center gap-1 rounded-full border border-[#dcb56f]/40 px-3 py-1.5 text-sm text-[#f3d9a4] hover:bg-[#dcb56f]/10">
        <Icon name={copied ? "check" : "share"} className="text-[16px]" /> {copied ? "Đã chép link" : "Mời bạn bè"}
      </button>
      <div className="ml-auto flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-sm ${night ? "bg-[#2a3170] text-[#c9d2ff]" : v.phase === "end" ? "bg-[#dcb56f]/20 text-[#f3d9a4]" : "bg-[#5a3e12] text-[#ffe2a8]"}`}>
          {night ? "🌙" : v.phase === "end" ? "🏁" : v.phase === "lobby" ? "⏳" : "☀️"} {PHASE_LABEL[v.phase]}{v.day ? ` · ${night ? "Đêm" : "Ngày"} ${v.day}` : ""}
        </span>
        {left !== null && <span className={`min-w-[56px] rounded-full border px-3 py-1 text-center font-label text-sm ${left <= 10 ? "border-error/50 text-error" : "border-white/15 text-on-surface"}`}>{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</span>}
        <button onClick={v.phase === "lobby" ? onLeave : onExit} className="rounded-full border border-white/10 p-2 text-muted hover:text-on-surface" title={v.phase === "lobby" ? "Rời phòng" : "Thoát (vẫn giữ chỗ, vào lại bằng mã)"} aria-label="Rời phòng">
          <Icon name="logout" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}

function Lobby({ v, call }: { v: RoomView; call: (b: Record<string, unknown>) => Promise<boolean> }) {
  const isHost = v.me?.id === v.hostId;
  const n = v.players.length;
  const setup = n >= MIN_PLAYERS ? setupFor(n) : [];
  const counts = setup.reduce<Record<string, number>>((a, r) => ((a[r] = (a[r] ?? 0) + 1), a), {});
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-3xl border border-[#dcb56f]/20 bg-black/35 p-5">
        <h2 className="font-serif text-[26px] text-[#f3d9a4]">Người chơi ({n}/{MAX_PLAYERS})</h2>
        <p className="text-sm text-muted">Gửi mã phòng <b className="text-[#f3d9a4]">{v.code}</b> hoặc bấm “Mời bạn bè” để mọi người vào.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {v.players.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
              <Avatar name={p.name} />
              <span className="flex-1 truncate text-on-surface">{p.name}{p.id === v.me?.id && <span className="text-muted"> (bạn)</span>}</span>
              {p.host && <span className="rounded-full bg-[#dcb56f]/20 px-2 py-0.5 text-[11px] text-[#f3d9a4]">Chủ phòng</span>}
              {isHost && !p.host && <button onClick={() => call({ type: "kick", target: p.id })} className="text-muted hover:text-error" aria-label={`Mời ${p.name} ra`}><Icon name="close" className="text-[16px]" /></button>}
            </li>
          ))}
        </ul>
        {isHost && n < MAX_PLAYERS && (
          <button onClick={() => call({ type: "addBot" })} className="mt-3 flex items-center gap-1 rounded-full border border-white/15 px-4 py-2 text-sm text-on-surface-variant hover:border-[#dcb56f]/50">
            <Icon name="smart_toy" className="text-[18px]" /> Thêm người máy
          </button>
        )}
      </section>
      <section className="space-y-4 rounded-3xl border border-[#dcb56f]/20 bg-black/35 p-5">
        <h2 className="font-serif text-[22px] text-[#f3d9a4]">Bộ vai</h2>
        {setup.length ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(counts).map(([r, c]) => (
              <span key={r} className="rounded-full border border-white/10 px-3 py-1 text-sm">{ROLES[r as Role].icon} {ROLES[r as Role].name}{c > 1 ? ` ×${c}` : ""}</span>
            ))}
          </div>
        ) : <p className="text-sm text-muted">Cần ít nhất {MIN_PLAYERS} người để chia vai.</p>}
        <div className="space-y-3 border-t border-white/10 pt-4 text-sm">
          <label className="flex items-center justify-between gap-3">
            <span className="text-on-surface-variant">Thời gian thảo luận</span>
            <select disabled={!isHost} value={v.settings.discuss} onChange={(e) => call({ type: "settings", settings: { ...v.settings, discuss: +e.target.value } })}
              className="rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-on-surface disabled:opacity-60">
              {[60, 90, 120, 150, 180, 240, 300].map((s) => <option key={s} value={s}>{s / 60} phút</option>)}
            </select>
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-on-surface-variant">Lật vai khi chết</span>
            <input type="checkbox" disabled={!isHost} checked={v.settings.reveal} onChange={(e) => call({ type: "settings", settings: { ...v.settings, reveal: e.target.checked } })} className="h-4 w-4 accent-[#dcb56f]" />
          </label>
        </div>
        {isHost ? (
          <button disabled={n < MIN_PLAYERS} onClick={() => call({ type: "start" })} className="btn-gold w-full justify-center disabled:opacity-50">🌙 Bắt đầu ván</button>
        ) : <p className="text-center text-sm text-muted">Chờ chủ phòng bắt đầu…</p>}
      </section>
    </div>
  );
}

function RoleCard({ v }: { v: RoomView }) {
  const [hidden, setHidden] = useState(false);
  const role = v.me!.role as Role;
  const info = ROLES[role];
  return (
    <section className={`flex items-center gap-4 rounded-3xl border p-4 ${info.team === "soi" ? "border-[#ff8f8f]/30 bg-[#3a0f16]/50" : "border-[#8fd6ff]/25 bg-[#0f2140]/50"}`}>
      <button onClick={() => setHidden((h) => !h)} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#dcb56f]/40 bg-[#151b36] text-[34px]" aria-label={hidden ? "Hiện vai" : "Che vai"}>
        {hidden ? "🂠" : info.icon}
      </button>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted">Vai của bạn {!v.me!.alive && "· đã chết"}</div>
        {hidden ? <div className="font-serif text-[22px] text-muted">Đã che — chạm để xem</div> : (
          <>
            <div className="font-serif text-[24px] text-[#f3d9a4]">{info.name} <span className={`text-[12px] uppercase tracking-wider ${info.team === "soi" ? "text-[#ff8f8f]" : "text-[#8fd6ff]"}`}>phe {info.team === "soi" ? "Sói" : "Dân"}</span></div>
            <p className="text-[13px] text-on-surface-variant">{info.desc}</p>
            {v.me!.lover && <p className="mt-1 text-[13px] text-pink-300">💘 Người yêu của bạn: <b>{v.me!.lover}</b></p>}
            {v.me!.potions && <p className="mt-1 text-[13px] text-on-surface-variant">Bình cứu: {v.me!.potions.save ? "còn" : "đã dùng"} · Bình độc: {v.me!.potions.kill ? "còn" : "đã dùng"}</p>}
          </>
        )}
      </div>
    </section>
  );
}

const PROMPT: Record<string, string> = {
  soi: "🐺 Sói ơi dậy đi! Đêm nay muốn cắn ai?",
  tientri: "🔮 Tiên tri ơi, đêm nay muốn soi ai?",
  baove: "🛡️ Bảo vệ ơi, đêm nay bảo vệ ai?",
  cupid: "💘 Thần tình yêu, hãy chọn 2 người để ghép đôi.",
  phuthuy: "🧪 Phù thủy thức dậy.",
  thosan: "🏹 Thợ săn, bạn muốn bắn ai trước khi gục xuống?",
  vote: "🗳️ Bạn muốn treo cổ ai?",
};

function ActionPanel({ v, call, night }: { v: RoomView; call: (b: Record<string, unknown>) => Promise<boolean>; night: boolean }) {
  const [sel, setSel] = useState<string[]>([]);
  const [poison, setPoison] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const need = v.need;
  useEffect(() => { setSel([]); setPoison(null); }, [need, v.phase, v.day]);
  const send = async (action: Record<string, unknown>) => { setBusy(true); await call({ type: "act", action }); setBusy(false); };

  const me = v.me!;
  const living = v.players.filter((p) => p.alive);
  const choices = useMemo(() => {
    if (need === "soi") return living.filter((p) => !p.wolfMate && p.id !== me.id);
    if (need === "tientri" || need === "thosan") return living.filter((p) => p.id !== me.id);
    if (need === "baove") return living.filter((p) => p.id !== me.guardLast);
    if (need === "cupid" || need === "vote" || need === "phuthuy") return living;
    return [];
  }, [need, living, me.id, me.guardLast]);
  const multi = need === "cupid" ? 2 : 1;
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : multi === 1 ? [id] : [...s, id].slice(-multi)));

  const box = `rounded-3xl border p-5 ${night ? "border-[#7f8cff]/25 bg-[#0d1236]/70" : "border-[#dcb56f]/25 bg-[#2a1d08]/40"}`;

  if (v.phase === "end") return null;
  if (!need) {
    let text = "Hãy chờ…";
    if (!me.alive) text = "Bạn đã chết. Bạn vẫn xem được diễn biến nhưng không được nói chuyện.";
    else if (v.phase === "night" || v.phase === "witch") text = me.acted ? "Bạn đã hành động. Nhắm mắt chờ trời sáng…" : "Trời tối rồi, nhắm mắt ngủ thôi. Các vai đặc biệt đang thức dậy…";
    else if (v.phase === "day") text = "Cả làng thảo luận: ai đang nói dối? Hãy dùng khung trò chuyện bên cạnh.";
    else if (v.phase === "vote") text = `Bạn đã bỏ phiếu. Còn ${v.waiting} người chưa bỏ phiếu…`;
    else if (v.phase === "hunter") text = "Thợ săn đang ngắm bắn…";
    return (
      <section className={box}>
        <p className="font-serif text-[22px] text-[#f3d9a4]">{text}</p>
        {v.phase === "night" && v.waiting > 0 && <p className="mt-1 text-sm text-muted">Đang chờ các vai hành động…</p>}
        {v.phase === "day" && v.me?.id === v.hostId && (
          <button onClick={() => call({ type: "act", action: { type: "skipDiscuss" } })} className="btn-gold mt-4">Bỏ phiếu ngay</button>
        )}
        {me.seerNotes.length > 0 && <SeerNotes v={v} />}
        {v.votes.length > 0 && <VoteList v={v} />}
      </section>
    );
  }

  return (
    <section className={box}>
      <p className="font-serif text-[24px] text-[#f3d9a4]">{PROMPT[need]}</p>
      {need === "soi" && me.wolfVotes.length > 0 && (
        <p className="mt-1 text-sm text-[#ffb3b3]">Bầy sói: {me.wolfVotes.map((w) => `${w.wolf} → ${w.target}`).join(" · ")}</p>
      )}
      {need === "baove" && me.guardLast && <p className="mt-1 text-sm text-muted">Không được bảo vệ lại người đêm qua.</p>}
      {need === "phuthuy" && (
        <div className="mt-3 space-y-3">
          {me.victim ? (
            <p className="text-on-surface">Đêm nay <b className="text-[#ffb3b3]">{me.victim.name}</b> bị sói cắn.</p>
          ) : <p className="text-on-surface">Đêm nay không ai bị cắn.</p>}
          <div className="flex flex-wrap gap-2">
            {me.victim && me.potions?.save && (
              <button disabled={busy} onClick={() => send({ type: "witch", save: true, kill: poison })} className="btn-gold">💚 Cứu {me.victim.name}{poison ? " + dùng độc" : ""}</button>
            )}
            <button disabled={busy} onClick={() => send({ type: "witch", save: false, kill: poison })} className="rounded-full border border-white/20 px-5 py-2.5 text-on-surface hover:border-[#dcb56f]/60">
              {poison ? `☠️ Đầu độc ${v.players.find((p) => p.id === poison)?.name}` : "Không làm gì"}
            </button>
          </div>
          {me.potions?.kill && <p className="text-sm text-muted">Muốn dùng bình độc? Chọn một người bên dưới (chọn lại để bỏ).</p>}
        </div>
      )}

      {(need !== "phuthuy" || me.potions?.kill) && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {choices.map((p) => {
            const on = need === "phuthuy" ? poison === p.id : sel.includes(p.id);
            return (
              <button key={p.id} disabled={busy} onClick={() => (need === "phuthuy" ? setPoison((x) => (x === p.id ? null : p.id)) : toggle(p.id))}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${on ? "border-[#dcb56f] bg-[#dcb56f]/15" : "border-white/10 hover:border-[#dcb56f]/40"}`}>
                <Avatar name={p.name} small />
                <span className="truncate text-sm">{p.name}{p.id === me.id ? " (bạn)" : ""}</span>
              </button>
            );
          })}
        </div>
      )}

      {need !== "phuthuy" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button disabled={busy || sel.length !== multi} onClick={() => {
            if (need === "cupid") send({ type: "cupid", a: sel[0], b: sel[1] });
            else if (need === "soi") send({ type: "wolf", target: sel[0] });
            else if (need === "tientri") send({ type: "seer", target: sel[0] });
            else if (need === "baove") send({ type: "guard", target: sel[0] });
            else if (need === "thosan") send({ type: "hunter", target: sel[0] });
            else if (need === "vote") send({ type: "vote", target: sel[0] });
          }} className="btn-gold disabled:opacity-50">Xác nhận</button>
          {need === "vote" && <button disabled={busy} onClick={() => send({ type: "vote", target: "skip" })} className="rounded-full border border-white/20 px-5 py-2.5 hover:border-[#dcb56f]/60">Bỏ qua</button>}
          {need === "thosan" && <button disabled={busy} onClick={() => send({ type: "hunter", target: null })} className="rounded-full border border-white/20 px-5 py-2.5 hover:border-[#dcb56f]/60">Không bắn</button>}
        </div>
      )}
      {me.seerNotes.length > 0 && <SeerNotes v={v} />}
      {v.votes.length > 0 && <VoteList v={v} />}
    </section>
  );
}

function SeerNotes({ v }: { v: RoomView }) {
  return (
    <div className="mt-4 border-t border-white/10 pt-3 text-sm">
      <div className="mb-1 text-muted">Sổ tay Tiên tri</div>
      {v.me!.seerNotes.map((n, i) => (
        <div key={i}>Đêm {n.day}: <b>{n.name}</b> — <span className={n.team === "soi" ? "text-[#ff8f8f]" : "text-[#8fd6ff]"}>phe {n.team === "soi" ? "Sói" : "Dân"}</span></div>
      ))}
    </div>
  );
}

function VoteList({ v }: { v: RoomView }) {
  return (
    <div className="mt-4 border-t border-white/10 pt-3 text-sm">
      <div className="mb-1 text-muted">Phiếu đã bỏ ({v.votes.length})</div>
      <div className="flex flex-wrap gap-1.5">
        {v.votes.map((x, i) => <span key={i} className="rounded-full bg-white/5 px-2.5 py-1">{x.voter} → {x.target}</span>)}
      </div>
    </div>
  );
}

function PlayerGrid({ v }: { v: RoomView }) {
  return (
    <section className="rounded-3xl border border-white/[0.07] bg-black/30 p-4">
      <h3 className="mb-3 font-serif text-[20px] text-[#f3d9a4]">Dân làng ({v.players.filter((p) => p.alive).length}/{v.players.length} còn sống)</h3>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {v.players.map((p) => (
          <li key={p.id} className={`relative flex flex-col items-center rounded-2xl border px-2 py-3 text-center ${p.alive ? "border-white/10 bg-white/[0.03]" : "border-white/5 opacity-45 grayscale"}`}>
            <Avatar name={p.name} />
            <span className="mt-1.5 w-full truncate text-[13px]">{p.name}</span>
            <span className="text-[11px] text-muted">
              {p.role ? `${ROLES[p.role as Role].icon} ${ROLES[p.role as Role].name}` : p.alive ? "?" : "💀"}
            </span>
            {p.wolfMate && <span className="absolute left-1.5 top-1.5 text-[12px]" title="Đồng bọn sói">🐺</span>}
            {p.lover && <span className="absolute right-1.5 top-1.5 text-[12px]" title="Người yêu">💘</span>}
            {p.voted && <span className="absolute right-1.5 top-1.5 text-[11px] text-[#dcb56f]">✓</span>}
            {!p.alive && <span className="absolute inset-x-0 top-1/3 text-[22px]">✖</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function LogPanel({ v, call }: { v: RoomView; call: (b: Record<string, unknown>) => Promise<boolean> }) {
  const [text, setText] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const last = v.log[v.log.length - 1]?.id;
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" }); }, [last]);
  const night = v.phase === "night" || v.phase === "witch";
  const canChat = v.me && (v.phase === "end" || (v.me.alive && (!night || v.me.role === "soi")));
  return (
    <section className="flex h-[560px] flex-col rounded-3xl border border-white/[0.07] bg-black/35 lg:sticky lg:top-28">
      <div className="border-b border-white/10 px-4 py-3 font-serif text-[18px] text-[#f3d9a4]">Quản trò & trò chuyện</div>
      <div ref={box} className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-[14px]">
        {v.log.map((m) => (
          <div key={m.id} className={
            m.kind === "system" ? "text-[#f3d9a4]/90" :
            m.kind === "private" ? "rounded-lg border border-[#8fd6ff]/25 bg-[#8fd6ff]/[0.06] px-2.5 py-1.5 text-[#cfeeff]" :
            m.kind === "wolf" ? "rounded-lg border border-[#ff8f8f]/25 bg-[#ff8f8f]/[0.06] px-2.5 py-1.5 text-[#ffd0d0]" : "text-on-surface"}>
            {m.kind === "chat" && <b className="text-[#dcb56f]">{m.from}: </b>}
            {m.kind === "wolf" && m.from && <b>🐺 {m.from}: </b>}
            {m.kind === "private" && <span className="mr-1 text-[11px] uppercase tracking-wider text-[#8fd6ff]">Riêng bạn ·</span>}
            {m.text}
          </div>
        ))}
      </div>
      <form className="flex gap-2 border-t border-white/10 p-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { call({ type: "chat", text }); setText(""); } }}>
        <input value={text} onChange={(e) => setText(e.target.value)} disabled={!canChat} maxLength={300}
          placeholder={canChat ? (night ? "Nói chuyện riêng với bầy sói…" : "Nhắn cho cả làng…") : !v.me?.alive ? "Người đã chết không được nói" : "Ban đêm, cả làng im lặng…"}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-[#dcb56f]/60 disabled:opacity-50" />
        <button disabled={!canChat || !text.trim()} className="rounded-xl bg-[#dcb56f] px-3 text-[#1a1408] disabled:opacity-40" aria-label="Gửi"><Icon name="send" className="text-[18px]" /></button>
      </form>
    </section>
  );
}

function EndBanner({ v, call }: { v: RoomView; call: (b: Record<string, unknown>) => Promise<boolean> }) {
  return (
    <section className="rounded-3xl border border-[#dcb56f]/40 bg-[#dcb56f]/[0.08] p-6 text-center">
      <p className="font-label text-[12px] uppercase tracking-[0.25em] text-[#dcb56f]">Ván đấu kết thúc</p>
      <h2 className="mt-2 font-serif text-[34px] text-[#f3d9a4]">{v.winner?.text}</h2>
      {v.me?.id === v.hostId ? <button onClick={() => call({ type: "restart" })} className="btn-gold mt-5">Chơi ván mới</button> : <p className="mt-3 text-sm text-muted">Chờ chủ phòng mở ván mới…</p>}
    </section>
  );
}

function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  const clean = name.replace(/^🤖\s*/, "");
  let h = 0;
  for (const c of clean) h = (h * 31 + c.charCodeAt(0)) % 360;
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${small ? "h-7 w-7 text-[12px]" : "h-10 w-10 text-[15px]"}`}
      style={{ background: `linear-gradient(135deg,hsl(${h} 55% 45%),hsl(${(h + 40) % 360} 55% 30%))` }}>
      {name.startsWith("🤖") ? "🤖" : clean.slice(0, 1).toUpperCase()}
    </span>
  );
}
