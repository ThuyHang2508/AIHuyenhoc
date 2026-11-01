// Phân tích tổng thể một trải bài bằng quy tắc (để AI chỉ diễn giải, không tự tính).
import { YES_NO } from "./tarot-yesno";
import type { DrawnCard } from "./tarot";

const ELEMENTS = ["Lửa", "Nước", "Khí", "Đất"] as const;
export const ELEMENT_MEANING: Record<string, string> = {
  "Lửa": "hành động, đam mê, ý chí",
  "Nước": "cảm xúc, trực giác, các mối quan hệ",
  "Khí": "suy nghĩ, giao tiếp, quyết định",
  "Đất": "tiền bạc, công việc, điều thực tế",
};
const NUMBER_MEANING: Record<number, string> = {
  1: "khởi đầu mới", 2: "lựa chọn, cân bằng", 3: "phát triển, hợp tác", 4: "ổn định, củng cố", 5: "xáo trộn, thử thách",
  6: "hòa hợp, cho và nhận", 7: "đánh giá lại, kiên nhẫn", 8: "chuyển động, nỗ lực", 9: "gần hoàn tất", 10: "kết thúc một chu kỳ",
  11: "tin tức, học hỏi (Tiểu Đồng)", 12: "hành động, di chuyển (Hiệp Sĩ)", 13: "nuôi dưỡng, thấu hiểu (Hoàng Hậu)", 14: "làm chủ, trách nhiệm (Vua)",
};

/** Tương tác nguyên tố theo hệ Golden Dawn: cùng nguyên tố +2, thân thiện +1, đối nghịch −2, còn lại 0. */
function dignity(a: string, b: string): number {
  if (a === b) return 2;
  const pair = [a, b].sort().join("-");
  if (pair === "Khí-Lửa" || pair === "Nước-Đất") return 1;
  if (pair === "Lửa-Nước" || pair === "Khí-Đất") return -2;
  return 0;
}

export interface SpreadAnalysis {
  total: number;
  majors: number;
  courts: number;
  reversed: number;
  elements: Record<string, number>;
  dominant: string[];
  missing: string[];
  repeats: { number: number; count: number; meaning: string }[];
  neighbours: { index: number; score: number; label: "được tiếp sức" | "bị kìm hãm" | "trung tính" }[];
  yesNo: { score: number; verdict: "Có" | "Không" | "Chưa rõ"; votes: string[] } | null;
}

export function analyseSpread(drawn: DrawnCard[], opts: { yesNo: boolean }): SpreadAnalysis {
  const elements: Record<string, number> = Object.fromEntries(ELEMENTS.map((e) => [e, 0]));
  drawn.forEach((d) => (elements[d.card.element] = (elements[d.card.element] ?? 0) + 1));
  const max = Math.max(...Object.values(elements));
  const dominant = drawn.length >= 3 && max >= 2 ? ELEMENTS.filter((e) => elements[e] === max) : [];
  const missing = drawn.length >= 5 ? ELEMENTS.filter((e) => elements[e] === 0) : [];

  const nums: Record<number, number> = {};
  drawn.filter((d) => d.card.suit !== "major").forEach((d) => (nums[d.card.number] = (nums[d.card.number] ?? 0) + 1));
  const repeats = Object.entries(nums)
    .filter(([, c]) => c >= 2)
    .map(([n, c]) => ({ number: +n, count: c, meaning: NUMBER_MEANING[+n] }));

  // Lá đứng cạnh nhau nâng đỡ hay kìm hãm nhau
  const neighbours = drawn.length < 2 ? [] : drawn.map((d, i) => {
    const near = [drawn[i - 1], drawn[i + 1]].filter(Boolean) as DrawnCard[];
    const score = near.reduce((s, n) => s + dignity(d.card.element, n.card.element), 0);
    return { index: i, score, label: score > 0 ? ("được tiếp sức" as const) : score < 0 ? ("bị kìm hãm" as const) : ("trung tính" as const) };
  });

  let yesNo: SpreadAnalysis["yesNo"] = null;
  if (opts.yesNo) {
    // có +1, không −1, còn tùy 0; lá Ẩn Chính và lá đầu tiên (vị trí trả lời) tính gấp đôi
    let score = 0;
    const votes = drawn.map((d, i) => {
      const v = (YES_NO[d.card.id] ?? "mm")[d.reversed ? 1 : 0];
      const w = (d.card.suit === "major" ? 2 : 1) * (i === 0 ? 2 : 1);
      score += (v === "y" ? 1 : v === "n" ? -1 : 0) * w;
      return v === "y" ? "Có" : v === "n" ? "Không" : "Còn tùy";
    });
    yesNo = { score, verdict: score >= 2 ? "Có" : score <= -2 ? "Không" : "Chưa rõ", votes };
  }

  return {
    total: drawn.length,
    majors: drawn.filter((d) => d.card.suit === "major").length,
    courts: drawn.filter((d) => d.card.suit !== "major" && d.card.number >= 11).length,
    reversed: drawn.filter((d) => d.reversed).length,
    elements,
    dominant,
    missing,
    repeats,
    neighbours,
    yesNo,
  };
}

/** Đoạn văn tóm tắt phân tích, gửi kèm dữ liệu cho AI. */
export function analysisToText(a: SpreadAnalysis, positions: readonly string[], drawn: DrawnCard[]): string {
  const lines = [
    "Phân tích tổng thể (hệ thống đã tính sẵn):",
    `- ${a.majors}/${a.total} lá Ẩn Chính${a.majors / a.total >= 0.5 ? " → nhiều lá Ẩn Chính: đây là giai đoạn mang tính bước ngoặt, bài học lớn" : a.majors === 0 ? " → toàn Ẩn Phụ: chuyện nằm trong tầm tay, xoay chuyển được bằng hành động hằng ngày" : ""}.`,
    `- ${a.reversed}/${a.total} lá ngược${a.reversed / a.total >= 0.5 ? " → năng lượng đang bị chặn hoặc hướng vào bên trong nhiều" : ""}.`,
    `- Nguyên tố: ${Object.entries(a.elements).map(([k, v]) => `${k} ${v}`).join(", ")}${a.dominant.length ? `; trội: ${a.dominant.map((e) => `${e} (${ELEMENT_MEANING[e]})`).join(", ")}` : ""}${a.missing.length ? `; thiếu: ${a.missing.map((e) => `${e} (${ELEMENT_MEANING[e]})`).join(", ")}` : ""}.`,
  ];
  if (a.courts) lines.push(`- ${a.courts} lá hoàng gia (có thể là người thật trong câu chuyện hoặc một khía cạnh tính cách của người hỏi).`);
  a.repeats.forEach((r) => lines.push(`- Số ${r.number} xuất hiện ${r.count} lần → chủ đề "${r.meaning}" được nhấn mạnh.`));
  if (a.neighbours.length) lines.push(`- Tương tác với lá bên cạnh (Golden Dawn): ${a.neighbours.map((n) => `${positions[n.index]} – ${drawn[n.index].card.vi}: ${n.label}`).join("; ")}.`);
  if (a.yesNo) lines.push(`- Câu hỏi Có/Không: từng lá nghiêng về ${a.yesNo.votes.map((v, i) => `${positions[i]} ${v}`).join(", ")}; tổng điểm ${a.yesNo.score} → kết luận của hệ thống: ${a.yesNo.verdict.toUpperCase()}. Hãy giải thích kết luận này, không tự đổi kết luận.`);
  return lines.join("\n");
}
