// So sánh engine với lasotuvi (dữ liệu tham chiếu tạo bởi Python). Chỉ dùng khi phát triển.
import { readFileSync } from "fs";
import { lapLaSo } from "../lib/tuvi";
const ref = JSON.parse(readFileSync(process.argv[2], "utf8"));
const norm = (s: string) => s.toLowerCase().normalize("NFC").replace("quan phủ", "quan phù");
const IGNORE = new Set(["thiên khôi", "thiên việt"]);
const TS = new Set(["tràng sinh","mộc dục","quan đới","lâm quan","đế vượng","suy","bệnh","tử","mộ","tuyệt","thai","dưỡng"]);
let bad = 0; const diffCount: Record<string, number> = {};
for (const r of ref) {
  const c = lapLaSo({ name: "", gender: r.g === 1 ? "nam" : "nu", day: r.d, month: r.m, year: r.y, calendar: "duong", hour: r.h, viewYear: 2026 });
  for (let k = 1; k <= 12; k++) {
    const rc = r.cungs[k]; const p = c.palaces[k - 1];
    const mine = new Set([...p.stars.map((s) => norm(s.name)), norm(p.trangSinh)]);
    const theirs = new Set((rc.stars as string[]).map(norm));
    for (const s of theirs) if (!mine.has(s) && !IGNORE.has(s)) diffCount["missing " + s] = (diffCount["missing " + s] || 0) + 1;
    for (const s of mine) if (!theirs.has(s) && !IGNORE.has(s)) diffCount["extra " + s] = (diffCount["extra " + s] || 0) + 1;
    if (norm(rc.chu) !== norm(p.name)) diffCount["cungChu"] = (diffCount["cungChu"] || 0) + 1;
    if (rc.dh !== p.daiHanStart) diffCount["daiHan"] = (diffCount["daiHan"] || 0) + 1;
    if (rc.th !== p.tieuHanChi) diffCount["tieuHan"] = (diffCount["tieuHan"] || 0) + 1;
    if (rc.than !== p.isThan) diffCount["than"] = (diffCount["than"] || 0) + 1;
    if (rc.tuan !== p.tuan) diffCount["tuan"] = (diffCount["tuan"] || 0) + 1;
    if (rc.triet !== p.triet) diffCount["triet"] = (diffCount["triet"] || 0) + 1;
  }
}
console.log(ref.length, "charts", diffCount);
