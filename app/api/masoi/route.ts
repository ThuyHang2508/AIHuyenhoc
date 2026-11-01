// API phòng Ma Sói: mọi luật chơi chạy ở đây, trình duyệt chỉ nhận phần được phép thấy.
import { MAX_PLAYERS, act, addBot, advance, chat, newId, newRoom, newToken, resetToLobby, startGame, viewFor, type Action, type Room } from "@/lib/masoi/engine";
import { createRoom, hasRedis, loadRoom, withRoom } from "@/lib/masoi/store";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
const fail = (msg: string, status = 400) => json({ error: msg }, status);
const cleanName = (s: unknown) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);
const cleanCode = (s: unknown) => String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

function auth(r: Room, pid: unknown, token: unknown) {
  const p = r.players.find((x) => x.id === pid);
  if (!p || p.token !== token) throw new Error("Phiên chơi không hợp lệ, hãy vào lại phòng.");
  return p;
}

export async function POST(req: Request) {
  const rl = checkRateLimit(`masoi:${clientIp(req)}`, 900, 60_000);
  if (!rl.ok) return fail("Thao tác quá nhanh, thử lại sau.", 429);

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return fail("Yêu cầu không hợp lệ.");
  }
  const type = String(b.type ?? "");

  try {
    if (process.env.VERCEL && !hasRedis) return fail("Máy chủ chưa bật kho lưu phòng chơi (Upstash Redis). Liên hệ chủ web.", 503);
    if (type === "create") {
      const name = cleanName(b.name);
      if (!name) return fail("Hãy nhập tên của bạn.");
      for (let i = 0; i < 5; i++) {
        const { room, player } = newRoom({ name });
        if (await createRoom(room.code, room)) return json({ code: room.code, pid: player.id, token: player.token, persistent: hasRedis });
      }
      return fail("Không tạo được phòng, thử lại.", 500);
    }

    const code = cleanCode(b.code);
    if (!code) return fail("Thiếu mã phòng.");

    if (type === "join") {
      const name = cleanName(b.name);
      if (!name) return fail("Hãy nhập tên của bạn.");
      const out = await withRoom<Room, { pid: string; token: string }>(code, (r) => {
        if (r.phase !== "lobby") throw new Error("Ván đang diễn ra, chờ ván sau nhé.");
        if (r.players.length >= MAX_PLAYERS) throw new Error(`Phòng đã đủ ${MAX_PLAYERS} người.`);
        if (r.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) throw new Error("Tên này đã có người dùng trong phòng.");
        const p = { id: newId(), token: newToken(), name, alive: true, joinedAt: Date.now() };
        r.players.push(p);
        r.log.push({ id: ++r.seq, t: Date.now(), kind: "system", text: `${name} đã vào phòng.` });
        return { pid: p.id, token: p.token };
      });
      if (!out) return fail("Không tìm thấy phòng. Kiểm tra lại mã.", 404);
      return json({ code, ...out.result });
    }

    // các thao tác còn lại cần xác thực người chơi
    if (type === "state") {
      let room = await loadRoom<Room>(code);
      if (!room) return fail("Phòng không còn tồn tại.", 404);
      auth(room, b.pid, b.token);
      const before = room.phase + room.deadline + room.seq;
      const probe = structuredClone(room);
      advance(probe);
      if (probe.phase + probe.deadline + probe.seq !== before) {
        const out = await withRoom<Room, void>(code, (r) => advance(r));
        if (out) room = out.room;
      }
      return json(viewFor(room, String(b.pid)));
    }

    const out = await withRoom<Room, void>(code, (r) => {
      const me = auth(r, b.pid, b.token);
      const host = me.id === r.hostId;
      switch (type) {
        case "start":
          if (!host) throw new Error("Chỉ chủ phòng được bắt đầu.");
          if (r.phase !== "lobby") throw new Error("Ván đã bắt đầu.");
          startGame(r);
          break;
        case "addBot":
          if (!host || r.phase !== "lobby") throw new Error("Chỉ chủ phòng thêm được người máy khi chưa bắt đầu.");
          if (r.players.length >= MAX_PLAYERS) throw new Error("Phòng đã đủ người.");
          addBot(r);
          break;
        case "kick": {
          if (!host || r.phase !== "lobby") throw new Error("Chỉ chủ phòng mời ra được khi chưa bắt đầu.");
          const i = r.players.findIndex((p) => p.id === b.target && p.id !== r.hostId);
          if (i >= 0) r.players.splice(i, 1);
          break;
        }
        case "leave": {
          if (r.phase !== "lobby") throw new Error("Không rời phòng được khi ván đang chơi.");
          r.players = r.players.filter((p) => p.id !== me.id);
          if (me.id === r.hostId && r.players.length) r.hostId = (r.players.find((p) => !p.bot) ?? r.players[0]).id;
          break;
        }
        case "settings":
          if (!host || r.phase !== "lobby") throw new Error("Chỉ chủ phòng đổi được cài đặt.");
          r.settings = {
            discuss: Math.min(600, Math.max(30, Number((b.settings as Record<string, unknown>)?.discuss) || r.settings.discuss)),
            reveal: Boolean((b.settings as Record<string, unknown>)?.reveal ?? r.settings.reveal),
          };
          break;
        case "restart":
          if (!host || r.phase !== "end") throw new Error("Chỉ chủ phòng mở ván mới khi ván đã kết thúc.");
          resetToLobby(r);
          break;
        case "chat":
          chat(r, me.id, String(b.text ?? ""));
          break;
        case "act":
          act(r, me.id, b.action as Action);
          break;
        default:
          throw new Error("Thao tác không hợp lệ.");
      }
      advance(r);
    });
    if (!out) return fail("Phòng không còn tồn tại.", 404);
    return json(viewFor(out.room, String(b.pid)));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Có lỗi xảy ra.");
  }
}
