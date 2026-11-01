// Vai và bộ vai Ma Sói — dùng chung cho máy chủ và giao diện.

export type Role = "soi" | "dan" | "tientri" | "baove" | "phuthuy" | "thosan" | "cupid";
export type Team = "soi" | "dan";
export type Phase = "lobby" | "night" | "witch" | "hunter" | "day" | "vote" | "end";

export const ROLES: Record<Role, { name: string; team: Team; icon: string; desc: string }> = {
  soi: { name: "Ma Sói", team: "soi", icon: "🐺", desc: "Mỗi đêm cùng bầy sói chọn một người để cắn. Thắng khi số sói bằng hoặc nhiều hơn dân." },
  dan: { name: "Dân làng", team: "dan", icon: "🧑‍🌾", desc: "Không có chức năng ban đêm. Ban ngày lắng nghe, suy luận và bỏ phiếu treo cổ sói." },
  tientri: { name: "Tiên tri", team: "dan", icon: "🔮", desc: "Mỗi đêm soi một người để biết người đó thuộc phe Sói hay phe Dân." },
  baove: { name: "Bảo vệ", team: "dan", icon: "🛡️", desc: "Mỗi đêm bảo vệ một người khỏi sói cắn (được bảo vệ chính mình). Không được bảo vệ cùng một người hai đêm liền." },
  phuthuy: { name: "Phù thủy", team: "dan", icon: "🧪", desc: "Có 1 bình cứu và 1 bình độc, mỗi bình dùng một lần trong cả ván. Biết ai bị sói cắn để quyết định cứu." },
  thosan: { name: "Thợ săn", team: "dan", icon: "🏹", desc: "Khi chết (bị cắn, bị độc hay bị treo) được bắn chết ngay một người." },
  cupid: { name: "Thần tình yêu", team: "dan", icon: "💘", desc: "Đêm đầu tiên ghép đôi hai người. Một người chết thì người kia chết theo vì đau buồn." },
};

/** Bộ vai theo số người chơi (thêm Dân cho đủ). */
const SETUPS: Record<number, Role[]> = {
  4: ["soi", "tientri", "baove", "dan"],
  5: ["soi", "tientri", "baove", "dan", "dan"],
  6: ["soi", "tientri", "baove", "thosan", "dan", "dan"],
  7: ["soi", "soi", "tientri", "baove", "thosan", "dan", "dan"],
  8: ["soi", "soi", "tientri", "baove", "phuthuy", "thosan", "dan", "dan"],
  9: ["soi", "soi", "tientri", "baove", "phuthuy", "thosan", "dan", "dan", "dan"],
  10: ["soi", "soi", "soi", "tientri", "baove", "phuthuy", "thosan", "cupid", "dan", "dan"],
  11: ["soi", "soi", "soi", "tientri", "baove", "phuthuy", "thosan", "cupid", "dan", "dan", "dan"],
  12: ["soi", "soi", "soi", "tientri", "baove", "phuthuy", "thosan", "cupid", "dan", "dan", "dan", "dan"],
};
export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 16;
export function setupFor(n: number): Role[] {
  if (SETUPS[n]) return [...SETUPS[n]];
  const base = [...SETUPS[12]];
  if (n >= 13) base.push("soi");
  while (base.length < n) base.push("dan");
  return base.slice(0, n);
}
