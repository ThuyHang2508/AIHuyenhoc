// Luật chơi Ma Sói (chạy trên máy chủ, giữ kín vai của mọi người).
// Học theo luật của masoibot / kb2abot-game-masoi; code viết mới.

import { randomBytes, randomInt } from "node:crypto";

import { ROLES, MAX_PLAYERS, MIN_PLAYERS, setupFor, type Phase, type Role, type Team } from "./roles";
export { ROLES, MAX_PLAYERS, MIN_PLAYERS, setupFor };
export type { Phase, Role, Team };

export interface Player {
  id: string;
  token: string;
  name: string;
  bot?: boolean;
  alive: boolean;
  role?: Role;
  joinedAt: number;
}

export interface Msg {
  id: number;
  t: number;
  kind: "system" | "chat" | "wolf" | "private";
  text: string;
  from?: string; // id người gửi
  to?: string[]; // chỉ những người này thấy (undefined = mọi người)
}

export interface Room {
  code: string;
  hostId: string;
  createdAt: number;
  players: Player[];
  phase: Phase;
  day: number; // đêm/ngày thứ mấy
  deadline: number | null;
  settings: { discuss: number; reveal: boolean };
  night: { wolfVotes: Record<string, string>; seer?: string; guard?: string; cupid?: [string, string]; done: Record<string, true> };
  victim: string | null; // người bị sói cắn đêm nay (sau khi tính bảo vệ)
  witch: { save: boolean; kill: boolean; choiceSave: boolean; choiceKill: string | null; done: boolean };
  guardLast: string | null;
  lovers: [string, string] | null;
  seerNotes: { target: string; team: Team; day: number }[];
  votes: Record<string, string>; // người bỏ phiếu -> người bị chọn | "skip"
  hunter: { id: string; next: "day" | "night" } | null;
  winner: { team: "soi" | "dan" | "tinh"; text: string } | null;
  log: Msg[];
  seq: number;
}

const SECONDS = { night: 50, witch: 30, hunter: 30, vote: 45 };

// ---------- tiện ích ----------
const now = () => Date.now();
export const newId = () => randomBytes(6).toString("hex");
export const newToken = () => randomBytes(18).toString("hex");
export function newCode() {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => A[randomInt(A.length)]).join("");
}
const byId = (r: Room, id: string | null | undefined) => r.players.find((p) => p.id === id);
const alive = (r: Room) => r.players.filter((p) => p.alive);
const nameOf = (r: Room, id: string) => byId(r, id)?.name ?? "?";
const teamOf = (p: Player): Team => ROLES[p.role!].team;
const pick = <T,>(a: T[]): T | undefined => (a.length ? a[randomInt(a.length)] : undefined);

function say(r: Room, text: string, extra: Partial<Msg> = {}) {
  r.log.push({ id: ++r.seq, t: now(), kind: "system", text, ...extra });
  if (r.log.length > 200) r.log.splice(0, r.log.length - 200);
}
function tell(r: Room, to: string[], text: string) {
  say(r, text, { kind: "private", to });
}

export function newRoom(host: { name: string }): { room: Room; player: Player } {
  const player: Player = { id: newId(), token: newToken(), name: host.name, alive: true, joinedAt: now() };
  const room: Room = {
    code: newCode(),
    hostId: player.id,
    createdAt: now(),
    players: [player],
    phase: "lobby",
    day: 0,
    deadline: null,
    settings: { discuss: 150, reveal: true },
    night: { wolfVotes: {}, done: {} },
    victim: null,
    witch: { save: true, kill: true, choiceSave: false, choiceKill: null, done: false },
    guardLast: null,
    lovers: null,
    seerNotes: [],
    votes: {},
    hunter: null,
    winner: null,
    log: [],
    seq: 0,
  };
  say(room, `${host.name} đã tạo phòng.`);
  return { room, player };
}

// ---------- bắt đầu ----------
export function startGame(r: Room) {
  if (r.players.length < MIN_PLAYERS) throw new Error(`Cần ít nhất ${MIN_PLAYERS} người.`);
  const roles = setupFor(r.players.length);
  for (let i = roles.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  r.players.forEach((p, i) => { p.role = roles[i]; p.alive = true; });
  Object.assign(r, { day: 0, victim: null, guardLast: null, lovers: null, seerNotes: [], votes: {}, hunter: null, winner: null });
  r.witch = { save: true, kill: true, choiceSave: false, choiceKill: null, done: false };
  const count = (role: Role) => roles.filter((x) => x === role).length;
  say(r, `Ván mới bắt đầu với ${r.players.length} người: ${(Object.keys(ROLES) as Role[]).filter(count).map((k) => `${count(k)} ${ROLES[k].name}`).join(", ")}.`);
  const wolves = r.players.filter((p) => p.role === "soi");
  if (wolves.length > 1) tell(r, wolves.map((w) => w.id), `Bầy sói gồm: ${wolves.map((w) => w.name).join(", ")}.`);
  beginNight(r);
}

function beginNight(r: Room) {
  r.day += 1;
  r.phase = "night";
  r.deadline = now() + SECONDS.night * 1000;
  r.night = { wolfVotes: {}, done: {} };
  r.victim = null;
  r.witch = { ...r.witch, choiceSave: false, choiceKill: null, done: false };
  say(r, `🌙 Đêm ${r.day}. Trời tối rồi, cả làng đi ngủ. Ai có chức năng hãy thức dậy hành động.`);
  botsNight(r);
}

// ---------- ai cần hành động ----------
export function nightActors(r: Room): Player[] {
  return alive(r).filter((p) => p.role === "soi" || p.role === "tientri" || p.role === "baove" || (p.role === "cupid" && r.day === 1));
}
function nightDone(r: Room) {
  return nightActors(r).every((p) => r.night.done[p.id]);
}

// ---------- hành động ----------
export type Action =
  | { type: "wolf"; target: string }
  | { type: "seer"; target: string }
  | { type: "guard"; target: string }
  | { type: "cupid"; a: string; b: string }
  | { type: "witch"; save: boolean; kill: string | null }
  | { type: "hunter"; target: string | null }
  | { type: "vote"; target: string }
  | { type: "skipDiscuss" };

export function act(r: Room, pid: string, a: Action) {
  const me = byId(r, pid);
  if (!me) throw new Error("Bạn không ở trong phòng này.");
  const target = (id: string | null | undefined, opts: { notSelf?: boolean; notWolf?: boolean } = {}) => {
    const t = byId(r, id);
    if (!t || !t.alive) throw new Error("Người được chọn không hợp lệ.");
    if (opts.notSelf && t.id === pid) throw new Error("Không thể chọn chính mình.");
    if (opts.notWolf && t.role === "soi") throw new Error("Sói không cắn đồng bọn.");
    return t;
  };

  if (a.type === "skipDiscuss") {
    if (r.phase !== "day" || pid !== r.hostId) throw new Error("Chỉ chủ phòng được chuyển sang bỏ phiếu.");
    beginVote(r);
    return;
  }
  if (a.type === "hunter") {
    if (r.phase !== "hunter" || r.hunter?.id !== pid) throw new Error("Chưa tới lượt bắn.");
    shoot(r, a.target ? target(a.target, { notSelf: true }).id : null);
    return;
  }
  if (!me.alive) throw new Error("Bạn đã chết, chỉ có thể xem.");

  if (a.type === "vote") {
    if (r.phase !== "vote") throw new Error("Chưa tới lúc bỏ phiếu.");
    r.votes[pid] = a.target === "skip" ? "skip" : target(a.target).id;
    say(r, `${me.name} đã bỏ phiếu.`);
    return;
  }
  if (a.type === "witch") {
    if (r.phase !== "witch" || me.role !== "phuthuy") throw new Error("Chưa tới lượt Phù thủy.");
    if (a.save && (!r.witch.save || !r.victim)) throw new Error("Không thể dùng bình cứu.");
    if (a.kill && !r.witch.kill) throw new Error("Bạn đã dùng bình độc rồi.");
    r.witch.choiceSave = !!a.save;
    r.witch.choiceKill = a.kill ? target(a.kill).id : null;
    r.witch.done = true;
    return;
  }

  if (r.phase !== "night") throw new Error("Chỉ hành động được vào ban đêm.");
  if (a.type === "wolf") {
    if (me.role !== "soi") throw new Error("Bạn không phải Sói.");
    const t = target(a.target, { notWolf: true });
    r.night.wolfVotes[pid] = t.id;
    r.night.done[pid] = true;
    const wolves = alive(r).filter((p) => p.role === "soi").map((p) => p.id);
    say(r, `${me.name} muốn cắn ${t.name}.`, { kind: "wolf", to: wolves, from: pid });
  } else if (a.type === "seer") {
    if (me.role !== "tientri" || r.night.done[pid]) throw new Error("Bạn đã soi đêm nay rồi.");
    const t = target(a.target, { notSelf: true });
    r.night.seer = t.id;
    r.night.done[pid] = true;
    const team = teamOf(t);
    r.seerNotes.push({ target: t.id, team, day: r.day });
    tell(r, [pid], `🔮 ${t.name} thuộc phe ${team === "soi" ? "SÓI" : "DÂN"}.`);
  } else if (a.type === "guard") {
    if (me.role !== "baove") throw new Error("Bạn không phải Bảo vệ.");
    const t = target(a.target);
    if (t.id === r.guardLast) throw new Error("Không được bảo vệ cùng một người hai đêm liền.");
    r.night.guard = t.id;
    r.night.done[pid] = true;
  } else if (a.type === "cupid") {
    if (me.role !== "cupid" || r.day !== 1 || r.night.done[pid]) throw new Error("Thần tình yêu chỉ ghép đôi đêm đầu.");
    const x = target(a.a), y = target(a.b);
    if (x.id === y.id) throw new Error("Hãy chọn hai người khác nhau.");
    r.night.cupid = [x.id, y.id];
    r.lovers = [x.id, y.id];
    r.night.done[pid] = true;
    tell(r, [x.id, y.id], `💘 Thần tình yêu đã ghép đôi ${x.name} & ${y.name}. Nếu một người chết, người kia chết theo.`);
    tell(r, [pid], `💘 Đã ghép đôi ${x.name} và ${y.name}.`);
  }
}

// ---------- tiến trình (gọi sau mỗi yêu cầu) ----------
export function advance(r: Room) {
  for (let guard = 0; guard < 10; guard++) {
    const late = r.deadline !== null && now() >= r.deadline;
    if (r.phase === "night" && (late || nightDone(r))) endNight(r);
    else if (r.phase === "witch" && (late || (r.witch.done && !alive(r).find((p) => p.role === "phuthuy")?.bot))) dawn(r);
    else if (r.phase === "hunter" && late) shoot(r, null);
    else if (r.phase === "day" && late) beginVote(r);
    else if (r.phase === "vote" && (late || alive(r).every((p) => r.votes[p.id]))) endVote(r);
    else return;
  }
}

function endNight(r: Room) {
  // sói người máy bỏ theo lựa chọn của sói người (nếu có)
  const humanVotes = Object.entries(r.night.wolfVotes).filter(([w]) => !byId(r, w)?.bot).map(([, t]) => t);
  if (humanVotes.length) {
    const lead = humanVotes.sort((x, y) => humanVotes.filter((v) => v === y).length - humanVotes.filter((v) => v === x).length)[0];
    alive(r).filter((p) => p.bot && p.role === "soi").forEach((b) => (r.night.wolfVotes[b.id] = lead));
  }
  // sói: người được nhiều phiếu nhất (hòa thì không cắn ai)
  const tally: Record<string, number> = {};
  Object.values(r.night.wolfVotes).forEach((t) => (tally[t] = (tally[t] ?? 0) + 1));
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  let victim = top.length && (top.length === 1 || top[0][1] > top[1][1]) ? top[0][0] : null;
  if (victim && byId(r, victim)?.alive === false) victim = null;
  if (victim && victim === r.night.guard) victim = null; // bảo vệ chặn được sói cắn
  r.guardLast = r.night.guard ?? null;
  r.victim = victim;
  // Ván có Phù thủy thì đêm nào cũng gọi Phù thủy (kể cả khi đã chết / hết bình) để không lộ thông tin.
  if (!r.players.some((p) => p.role === "phuthuy")) return dawn(r);
  const witch = alive(r).find((p) => p.role === "phuthuy");
  const active = !!witch && (r.witch.save || r.witch.kill);
  r.phase = "witch";
  r.witch.done = false;
  r.deadline = now() + (active && !witch!.bot ? SECONDS.witch : 6 + randomInt(6)) * 1000;
  say(r, "🧪 Phù thủy thức dậy…");
  if (active) {
    tell(r, [witch!.id], victim ? `🧪 Đêm nay ${nameOf(r, victim)} bị sói cắn.${r.witch.save ? " Bạn có muốn cứu không?" : ""}` : "🧪 Đêm nay không ai bị cắn.");
    if (witch!.bot) botWitch(r, witch!);
  }
}

function dawn(r: Room) {
  const dead: string[] = [];
  if (r.victim && !(r.witch.choiceSave && r.witch.save)) dead.push(r.victim);
  if (r.witch.choiceSave && r.victim) r.witch.save = false;
  if (r.witch.choiceKill && r.witch.kill) {
    dead.push(r.witch.choiceKill);
    r.witch.kill = false;
  }
  const died = kill(r, dead);
  say(r, died.length ? `☀️ Trời sáng rồi! Đêm qua ${died.map((id) => announce(r, id)).join(", ")} đã chết.` : "☀️ Trời sáng rồi! Một đêm bình yên, không ai chết cả.");
  afterDeaths(r, died, "day");
}

function beginDay(r: Room) {
  r.phase = "day";
  r.deadline = now() + r.settings.discuss * 1000;
  r.votes = {};
  say(r, `💬 Ngày ${r.day}. Cả làng thảo luận xem ai là sói.`);
}

function beginVote(r: Room) {
  r.phase = "vote";
  r.deadline = now() + SECONDS.vote * 1000;
  r.votes = {};
  say(r, "🗳️ Bỏ phiếu treo cổ! Mỗi người chọn một người hoặc bỏ qua.");
  alive(r).filter((p) => p.bot).forEach((b) => {
    const t = pick(alive(r).filter((p) => p.id !== b.id && !(b.role === "soi" && p.role === "soi")));
    r.votes[b.id] = randomInt(4) === 0 || !t ? "skip" : t.id;
  });
}

function endVote(r: Room) {
  const tally: Record<string, number> = {};
  Object.values(r.votes).forEach((t) => (tally[t] = (tally[t] ?? 0) + 1));
  const lines = Object.entries(tally)
    .filter(([t]) => t !== "skip")
    .sort((a, b) => b[1] - a[1])
    .map(([t, n]) => `${nameOf(r, t)}: ${n}`);
  const top = Object.entries(tally).filter(([t]) => t !== "skip").sort((a, b) => b[1] - a[1]);
  const skip = tally.skip ?? 0;
  const lynched = top.length && (top.length === 1 || top[0][1] > top[1][1]) && top[0][1] > skip ? top[0][0] : null;
  say(r, `Kết quả: ${lines.join(" · ") || "không ai bị chọn"}${skip ? ` · bỏ qua: ${skip}` : ""}.`);
  if (!lynched) {
    say(r, "Không đủ phiếu, hôm nay không ai bị treo cổ.");
    afterDeaths(r, [], "night");
    return;
  }
  const died = kill(r, [lynched]);
  say(r, `⚖️ ${announce(r, lynched)} bị dân làng treo cổ.${died.length > 1 ? ` ${died.slice(1).map((id) => announce(r, id)).join(", ")} chết theo.` : ""}`);
  afterDeaths(r, died, "night");
}

/** Giết danh sách người, kéo theo người yêu. Trả về những người vừa chết (theo thứ tự). */
function kill(r: Room, ids: string[]): string[] {
  const died: string[] = [];
  const queue = [...ids];
  while (queue.length) {
    const p = byId(r, queue.shift());
    if (!p || !p.alive) continue;
    p.alive = false;
    died.push(p.id);
    if (r.lovers?.includes(p.id)) {
      const other = r.lovers.find((x) => x !== p.id)!;
      if (byId(r, other)?.alive) queue.push(other);
    }
  }
  return died;
}

function announce(r: Room, id: string) {
  const p = byId(r, id)!;
  return r.settings.reveal ? `${p.name} (${ROLES[p.role!].icon} ${ROLES[p.role!].name})` : p.name;
}

function afterDeaths(r: Room, died: string[], next: "day" | "night") {
  if (r.lovers && died.length) {
    const [a, b] = r.lovers;
    if (died.includes(a) && died.includes(b)) say(r, `💔 ${nameOf(r, a)} và ${nameOf(r, b)} là một đôi, đã cùng ra đi.`);
  }
  if (checkWin(r)) return;
  const hunter = died.map((id) => byId(r, id)!).find((p) => p.role === "thosan");
  if (hunter) {
    r.phase = "hunter";
    r.hunter = { id: hunter.id, next };
    r.deadline = now() + SECONDS.hunter * 1000;
    say(r, `🏹 ${hunter.name} là Thợ săn! Trước khi gục xuống, thợ săn được bắn một người.`);
    if (hunter.bot) shoot(r, pick(alive(r))?.id ?? null);
    return;
  }
  if (next === "day") beginDay(r);
  else beginNight(r);
}

function shoot(r: Room, target: string | null) {
  const next = r.hunter?.next ?? "day";
  const hunterName = nameOf(r, r.hunter?.id ?? "");
  r.hunter = null;
  if (!target) {
    say(r, `${hunterName} không bắn ai.`);
    afterDeaths(r, [], next);
    return;
  }
  const died = kill(r, [target]);
  say(r, `🏹 ${hunterName} bắn chết ${died.map((id) => announce(r, id)).join(", ")}.`);
  afterDeaths(r, died, next);
}

function checkWin(r: Room): boolean {
  const live = alive(r);
  const wolves = live.filter((p) => p.role === "soi").length;
  let w: Room["winner"] = null;
  if (r.lovers && live.length === 2 && r.lovers.every((id) => byId(r, id)?.alive)) {
    const [a, b] = r.lovers.map((id) => byId(r, id)!);
    if (teamOf(a) !== teamOf(b)) w = { team: "tinh", text: `💘 Đôi tình nhân ${a.name} & ${b.name} chiến thắng!` };
  }
  if (!w && wolves === 0) w = { team: "dan", text: "🎉 Dân làng chiến thắng! Không còn con sói nào." };
  if (!w && wolves >= live.length - wolves) w = { team: "soi", text: "🐺 Phe Sói chiến thắng! Sói đã áp đảo dân làng." };
  if (!w) return false;
  r.winner = w;
  r.phase = "end";
  r.deadline = null;
  say(r, w.text);
  say(r, `Vai của mọi người: ${r.players.map((p) => `${p.name} – ${ROLES[p.role!].name}`).join(" · ")}.`);
  return true;
}

// ---------- người máy ----------
function botsNight(r: Room) {
  const live = alive(r);
  for (const b of live.filter((p) => p.bot)) {
    if (b.role === "soi") {
      const humanWolfTarget = Object.values(r.night.wolfVotes)[0];
      const t = humanWolfTarget ?? pick(live.filter((p) => p.role !== "soi"))?.id;
      if (t) { r.night.wolfVotes[b.id] = t; r.night.done[b.id] = true; }
    } else if (b.role === "tientri") {
      const t = pick(live.filter((p) => p.id !== b.id));
      if (t) { r.night.seer = t.id; r.night.done[b.id] = true; }
    } else if (b.role === "baove") {
      const t = pick(live.filter((p) => p.id !== r.guardLast));
      if (t) { r.night.guard = t.id; r.night.done[b.id] = true; }
    } else if (b.role === "cupid" && r.day === 1) {
      const a = pick(live), c = pick(live.filter((p) => p.id !== a?.id));
      if (a && c) {
        r.lovers = [a.id, c.id];
        r.night.done[b.id] = true;
        tell(r, [a.id, c.id], `💘 ${a.name} & ${c.name} đã thành một đôi. Nếu một người chết, người kia chết theo.`);
      }
    }
  }
}
function botWitch(r: Room, w: Player) {
  r.witch.choiceSave = !!r.victim && r.witch.save && randomInt(2) === 0;
  r.witch.choiceKill = null;
  r.witch.done = true;
  void w;
}

export function addBot(r: Room) {
  const names = ["Mèo Mun", "Cú Đêm", "Cáo Nhỏ", "Thỏ Ngọc", "Gấu Trúc", "Sóc Nâu", "Hươu Sao", "Chồn Bạc", "Nhím Con", "Rùa Già"];
  const used = new Set(r.players.map((p) => p.name));
  const name = names.find((n) => !used.has(`🤖 ${n}`)) ?? `Máy ${r.players.length}`;
  r.players.push({ id: newId(), token: newToken(), name: `🤖 ${name}`, bot: true, alive: true, joinedAt: now() });
}

// ---------- dữ liệu gửi cho từng người (giấu vai người khác) ----------
export function viewFor(r: Room, pid: string) {
  const me = byId(r, pid);
  const ended = r.phase === "end";
  const myTeamWolf = me?.role === "soi";
  const showRole = (p: Player) => ended || p.id === pid || (myTeamWolf && p.role === "soi") || (!p.alive && r.settings.reveal);
  const wolfIds = new Set(r.players.filter((p) => p.role === "soi" && p.alive).map((p) => p.id));
  const logs = r.log.filter((m) => !m.to || m.to.includes(pid) || (ended && m.kind === "wolf")).slice(-120);
  const actors = r.phase === "night" ? nightActors(r) : [];
  const live = alive(r);

  let need: string | null = null;
  if (me && r.phase === "night" && me.alive && actors.some((a) => a.id === pid) && !(me.role !== "soi" && r.night.done[pid])) need = me.role!;
  if (me && r.phase === "witch" && me.alive && me.role === "phuthuy" && !r.witch.done) need = "phuthuy";
  if (me && r.phase === "hunter" && r.hunter?.id === pid) need = "thosan";
  if (me && r.phase === "vote" && me.alive && !r.votes[pid]) need = "vote";

  return {
    code: r.code,
    phase: r.phase,
    day: r.day,
    deadline: r.deadline,
    serverNow: now(),
    hostId: r.hostId,
    settings: r.settings,
    winner: r.winner,
    me: me
      ? {
          id: me.id,
          name: me.name,
          alive: me.alive,
          role: me.role ?? null,
          lover: r.lovers?.includes(me.id) ? nameOf(r, r.lovers.find((x) => x !== me.id)!) : null,
          potions: me.role === "phuthuy" ? { save: r.witch.save, kill: r.witch.kill } : null,
          victim: me.role === "phuthuy" && r.phase === "witch" && r.victim ? { id: r.victim, name: nameOf(r, r.victim) } : null,
          guardLast: me.role === "baove" ? r.guardLast : null,
          seerNotes: me.role === "tientri" ? r.seerNotes.map((n) => ({ ...n, name: nameOf(r, n.target) })) : [],
          wolfVotes: myTeamWolf && r.phase === "night" ? Object.entries(r.night.wolfVotes).map(([w, t]) => ({ wolf: nameOf(r, w), target: nameOf(r, t), targetId: t })) : [],
          acted: !!r.night.done[pid],
          voted: r.votes[pid] ?? null,
        }
      : null,
    need,
    players: r.players.map((p) => ({
      id: p.id,
      name: p.name,
      bot: !!p.bot,
      alive: p.alive,
      host: p.id === r.hostId,
      role: showRole(p) && p.role ? p.role : null,
      wolfMate: myTeamWolf && wolfIds.has(p.id) && p.id !== pid,
      lover: !!(me && r.lovers?.includes(me.id) && r.lovers.includes(p.id) && p.id !== pid) || (ended && !!r.lovers?.includes(p.id)),
      voted: r.phase === "vote" ? !!r.votes[p.id] : false,
    })),
    votes:
      r.phase === "vote"
        ? Object.entries(r.votes).map(([v, t]) => ({ voter: nameOf(r, v), target: t === "skip" ? "Bỏ qua" : nameOf(r, t) }))
        : [],
    waiting: r.phase === "night" ? actors.filter((a) => !r.night.done[a.id]).length : r.phase === "vote" ? live.filter((p) => !r.votes[p.id]).length : 0,
    log: logs.map((m) => ({ id: m.id, kind: m.kind, text: m.text, from: m.from ? nameOf(r, m.from) : undefined, t: m.t })),
  };
}
export type RoomView = ReturnType<typeof viewFor>;

export function chat(r: Room, pid: string, text: string) {
  const me = byId(r, pid);
  if (!me) throw new Error("Bạn không ở trong phòng.");
  const clean = text.replace(/\s+/g, " ").trim().slice(0, 300);
  if (!clean) return;
  if (r.phase === "night" || r.phase === "witch") {
    if (me.role !== "soi" || !me.alive) throw new Error("Ban đêm chỉ bầy sói được nói chuyện với nhau.");
    const wolves = alive(r).filter((p) => p.role === "soi").map((p) => p.id);
    r.log.push({ id: ++r.seq, t: now(), kind: "wolf", text: clean, from: pid, to: wolves });
  } else {
    if (!me.alive && r.phase !== "end" && r.phase !== "lobby") throw new Error("Người đã chết không được nói chuyện.");
    r.log.push({ id: ++r.seq, t: now(), kind: "chat", text: clean, from: pid });
  }
}

export function resetToLobby(r: Room) {
  r.phase = "lobby";
  r.day = 0;
  r.deadline = null;
  r.winner = null;
  r.lovers = null;
  r.players.forEach((p) => { p.alive = true; p.role = undefined; });
  say(r, "Chủ phòng đã mở ván mới. Chờ mọi người sẵn sàng…");
}
