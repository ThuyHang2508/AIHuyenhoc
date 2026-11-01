// Thần số học Pythagoras theo quy ước phổ biến ở Việt Nam (David A. Phillips):
// Số chủ đạo = tổng mọi chữ số ngày sinh, rút gọn tới khi ≤ 11, giữ 22 và 33 (viết 22/4, 33/6).

const MAP: Record<string, number> = {};
"AJS BKT CLU DMV ENW FOX GPY HQZ IR".split(" ").forEach((g, i) => g.split("").forEach((ch) => (MAP[ch] = i + 1)));
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const digitSum = (n: number) => String(n).split("").reduce((a, d) => a + Number(d), 0);

/** Rút gọn về 1 chữ số, giữ số master 11/22/33. */
export function reduce(n: number, keepMaster = true): number {
  while (n > 9) {
    if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
    n = digitSum(n);
  }
  return n;
}

/** Số chủ đạo kiểu Phillips: dừng khi ≤ 11 (có số 10), giữ 22, 33. */
export function lifePath(d: number, m: number, y: number): number {
  let s = digitSum(d) + digitSum(m) + digitSum(y);
  while (s > 11 && s !== 22 && s !== 33) s = digitSum(s);
  return s;
}
export const lifePathLabel = (n: number) => (n === 22 ? "22/4" : n === 33 ? "33/6" : String(n));

export function nameNumbers(name: string) {
  const n = normalizeName(name);
  let all = 0, vowel = 0, cons = 0;
  const counts = Array(10).fill(0);
  const words: { word: string; sum: number; first: number }[] = [];
  const vowelLetters: string[] = [];
  for (const word of n.split(" ")) {
    let sum = 0;
    for (const ch of word) {
      const v = MAP[ch];
      if (!v) continue;
      sum += v;
      counts[v]++;
      // Tên tiếng Việt: Y luôn là nguyên âm (THUY, HUY, NGUYEN…)
      if (VOWELS.has(ch) || ch === "Y") { vowel += v; vowelLetters.push(ch); }
      else cons += v;
    }
    all += sum;
    if (word) words.push({ word, sum, first: MAP[word[0]] ?? 0 });
  }
  const max = Math.max(...counts.slice(1));
  return {
    expression: reduce(all),
    soulUrge: reduce(vowel),
    personality: reduce(cons),
    missing: counts.map((c, i) => (i > 0 && c === 0 ? i : 0)).filter(Boolean) as number[],
    hiddenPassion: max > 0 ? counts.map((c, i) => (i > 0 && c === max ? i : 0)).filter(Boolean) as number[] : [],
    letterCounts: counts,
    detail: { words, total: all, vowel, vowelLetters, cons },
  };
}

export interface NumerologyResult {
  name: string;
  day: number;
  month: number;
  year: number;
  lifePath: number;
  birthday: number;
  attitude: number;
  expression?: number;
  soulUrge?: number;
  personality?: number;
  maturity?: number;
  missingInName?: number[];
  hiddenPassion?: number[];
  /** Số cân bằng: tổng chữ cái đầu của mỗi từ trong tên — cách phản ứng khi gặp khủng hoảng. */
  balance?: number;
  /** Số tư duy lý trí: tên gọi (từ cuối) + ngày sinh — cách suy nghĩ, ra quyết định. */
  rationalThinking?: number;
  nameLetterCounts?: number[];
  nameDetail?: ReturnType<typeof nameNumbers>["detail"];
  personalYear: number;
  personalMonth: number;
  personalYearsSeries: { year: number; value: number }[];
  pinnacles: { value: number; from: number; to: number | null; age: number; year: number }[];
  challenges: number[];
  chart: number[]; // số lần xuất hiện của 1..9 trong ngày sinh (index 1..9)
  arrows: { key: string; name: string; present: boolean; meaning: string }[];
  compatible: { best: number[]; good: number[]; challenge: number[] };
}

const ARROWS: { key: string; digits: number[]; full: [string, string]; empty: [string, string] }[] = [
  { key: "123", digits: [1, 2, 3], full: ["Mũi tên Kế hoạch", "Ngăn nắp, giỏi lên kế hoạch và tổ chức."], empty: ["Mũi tên trống Kế hoạch", "Dễ thiếu kế hoạch dài hạn."] },
  { key: "456", digits: [4, 5, 6], full: ["Mũi tên Ý chí", "Ý chí mạnh, kiên trì theo đuổi mục tiêu."], empty: ["Mũi tên Uất giận", "Dễ thất vọng, tích tụ bực bội khi mọi việc không như ý."] },
  { key: "789", digits: [7, 8, 9], full: ["Mũi tên Hoạt động", "Năng động, thích hành động và trải nghiệm thực tế."], empty: ["Mũi tên Thụ động", "Dễ chờ đợi, cần chủ động hơn."] },
  { key: "147", digits: [1, 4, 7], full: ["Mũi tên Thực tế", "Khéo tay, thực tế, giỏi biến ý tưởng thành việc làm."], empty: ["Mũi tên Thiếu trật tự", "Khó sắp xếp đời sống vật chất."] },
  { key: "258", digits: [2, 5, 8], full: ["Mũi tên Cân bằng cảm xúc", "Cảm xúc ổn định, đồng cảm tốt."], empty: ["Mũi tên Nhạy cảm", "Dễ tổn thương, cần học cách bộc lộ cảm xúc."] },
  { key: "369", digits: [3, 6, 9], full: ["Mũi tên Trí tuệ", "Trí nhớ tốt, tư duy sắc bén."], empty: ["Mũi tên Trí nhớ ngắn hạn", "Cần rèn trí nhớ và sự tập trung."] },
  { key: "159", digits: [1, 5, 9], full: ["Mũi tên Quyết tâm", "Kiên định, đã làm là làm tới cùng."], empty: ["Mũi tên Trì hoãn", "Dễ chần chừ, cần đặt hạn chót rõ ràng."] },
  { key: "357", digits: [3, 5, 7], full: ["Mũi tên Tâm linh", "Trực giác tốt, quan tâm đời sống tinh thần."], empty: ["Mũi tên Hoài nghi", "Cần bằng chứng mới tin, đôi khi quá cẩn trọng."] },
];

const COMPAT: Record<number, { best: number[]; good: number[]; challenge: number[] }> = {
  1: { best: [3, 5], good: [1, 9], challenge: [4, 6] },
  2: { best: [4, 8], good: [2, 6], challenge: [5, 7] },
  3: { best: [1, 5], good: [3, 9], challenge: [4, 8] },
  4: { best: [2, 8], good: [4, 6], challenge: [1, 3] },
  5: { best: [1, 3], good: [5, 7], challenge: [2, 4] },
  6: { best: [3, 9], good: [2, 8], challenge: [1, 5] },
  7: { best: [4, 9], good: [1, 5], challenge: [2, 6] },
  8: { best: [2, 4], good: [6, 8], challenge: [1, 5] },
  9: { best: [3, 6], good: [1, 9], challenge: [4, 8] },
};

export function computeNumerology(name: string, d: number, m: number, y: number, currentYear: number, currentMonth: number): NumerologyResult {
  const lp = lifePath(d, m, y);
  const lpSingle = reduce(lp, false);
  const rd = reduce(d, false), rm = reduce(m, false), ry = reduce(digitSum(y), false);

  const personalYearOf = (yy: number) => reduce(rd + rm + reduce(digitSum(yy), false), false);
  const py = personalYearOf(currentYear);
  const pm = reduce(py + currentMonth, false);

  const p1 = reduce(rm + rd), p2 = reduce(rd + ry), p3 = reduce(p1 + p2), p4 = reduce(rm + ry);
  const end1 = 36 - lpSingle;
  const pinnacles = [
    { value: p1, from: 0, to: end1 },
    { value: p2, from: end1 + 1, to: end1 + 9 },
    { value: p3, from: end1 + 10, to: end1 + 18 },
    { value: p4, from: end1 + 19, to: null },
  ].map((p, i) => ({ ...p, age: end1 + 9 * i, year: y + end1 + 9 * i })); // tuổi/năm chạm đỉnh
  const c1 = Math.abs(rm - rd), c2 = Math.abs(rd - ry), c3 = Math.abs(c1 - c2), c4 = Math.abs(rm - ry);

  const chart = Array(10).fill(0);
  `${d}${m}${y}`.split("").forEach((ch) => { const v = Number(ch); if (v > 0) chart[v]++; });
  const arrows = ARROWS.flatMap((a) => {
    if (a.digits.every((x) => chart[x] > 0)) return [{ key: a.key, name: a.full[0], present: true, meaning: a.full[1] }];
    if (a.digits.every((x) => chart[x] === 0)) return [{ key: a.key, name: a.empty[0], present: false, meaning: a.empty[1] }];
    return [];
  });

  const res: NumerologyResult = {
    name, day: d, month: m, year: y,
    lifePath: lp,
    birthday: reduce(d),
    attitude: reduce(digitSum(d) + digitSum(m), false),
    personalYear: py,
    personalMonth: pm,
    personalYearsSeries: Array.from({ length: 9 }, (_, i) => ({ year: currentYear - 2 + i, value: personalYearOf(currentYear - 2 + i) })),
    pinnacles,
    challenges: [c1, c2, c3, c4],
    chart,
    arrows,
    compatible: COMPAT[lpSingle] ?? COMPAT[9],
  };
  if (name.trim()) {
    const nn = nameNumbers(name);
    res.expression = nn.expression;
    res.soulUrge = nn.soulUrge;
    res.personality = nn.personality;
    res.maturity = reduce(lpSingle + reduce(nn.expression, false));
    res.missingInName = nn.missing;
    res.hiddenPassion = nn.hiddenPassion;
    res.balance = reduce(nn.detail.words.reduce((a, w) => a + w.first, 0), false);
    const given = nn.detail.words[nn.detail.words.length - 1];
    if (given) res.rationalThinking = reduce(given.sum + d, false);
    res.nameLetterCounts = nn.letterCounts;
    res.nameDetail = nn.detail;
  }
  return res;
}

export const NUMBER_MEANING: Record<number, { title: string; keyword: string; strength: string; caution: string }> = {
  1: { title: "Tiên Phong", keyword: "Khởi xướng", strength: "Độc lập, quyết đoán, có tố chất lãnh đạo và dám đi trước.", caution: "Dễ cái tôi cao, khó lắng nghe." },
  2: { title: "Kết Nối", keyword: "Hợp tác", strength: "Tinh tế, trực giác tốt, giỏi lắng nghe và hòa giải.", caution: "Nhạy cảm, dễ thiếu tự tin." },
  3: { title: "Sáng Tạo", keyword: "Biểu đạt", strength: "Hoạt ngôn, hài hước, trí nhớ và óc tưởng tượng phong phú.", caution: "Dễ phân tán, hay phán xét." },
  4: { title: "Kiến Tạo", keyword: "Nền tảng", strength: "Thực tế, chăm chỉ, ngăn nắp, đáng tin cậy.", caution: "Có thể cứng nhắc, ngại thay đổi." },
  5: { title: "Tự Do", keyword: "Trải nghiệm", strength: "Yêu tự do, linh hoạt, cảm xúc mạnh, thích khám phá.", caution: "Thiếu kiên định, dễ chán." },
  6: { title: "Yêu Thương", keyword: "Trách nhiệm", strength: "Quan tâm gia đình, có trách nhiệm, giàu sáng tạo.", caution: "Hay lo lắng, ôm đồm việc người khác." },
  7: { title: "Trí Thức · Huyền Tri", keyword: "Học hỏi", strength: "Học qua trải nghiệm, sâu sắc, độc lập trong tư duy.", caution: "Bài học thường đến qua mất mát; dễ khép mình." },
  8: { title: "Tài Khí · Quyền Lực", keyword: "Độc lập", strength: "Giỏi tài chính, kinh doanh, tự chủ và bản lĩnh.", caution: "Khó bộc lộ cảm xúc, dễ quá coi trọng vật chất." },
  9: { title: "Đại Nhân Ái", keyword: "Lý tưởng", strength: "Nhân ái, có lý tưởng, sống vì cộng đồng.", caution: "Tự tạo áp lực, hay ôm trách nhiệm." },
  10: { title: "Linh Hoạt", keyword: "Thích ứng", strength: "Thích ứng nhanh, tự tin, dễ hòa nhập mọi môi trường.", caution: "Thăng trầm, cần giữ sự ổn định." },
  11: { title: "Bậc Thầy Trực Giác", keyword: "Truyền cảm hứng", strength: "Trực giác mạnh, khả năng truyền cảm hứng và dẫn dắt tinh thần.", caution: "Căng thẳng thần kinh, dễ lý tưởng hóa." },
  22: { title: "Kiến Trúc Sư Bậc Thầy", keyword: "Hiện thực hóa", strength: "Biến tầm nhìn lớn thành hiện thực bằng sự kiên trì.", caution: "Áp lực cầu toàn rất lớn." },
  33: { title: "Người Thầy Chữa Lành", keyword: "Phụng sự", strength: "Yêu thương vô điều kiện, có khả năng chữa lành và dạy dỗ.", caution: "Dễ hy sinh quá mức bản thân." },
};

export const PERSONAL_YEAR_MEANING: Record<number, string> = {
  1: "Năm khởi đầu chu kỳ 9 năm mới: gieo hạt, bắt đầu dự án, dám thay đổi.",
  2: "Năm của kiên nhẫn và hợp tác: vun đắp quan hệ, chờ hạt nảy mầm.",
  3: "Năm sáng tạo và giao tiếp: mở rộng mối quan hệ, thể hiện bản thân.",
  4: "Năm xây nền móng: làm việc chăm chỉ, kỷ luật, sắp xếp lại tài chính.",
  5: "Năm thay đổi và tự do: dịch chuyển, cơ hội bất ngờ, cần linh hoạt.",
  6: "Năm của gia đình và trách nhiệm: chăm sóc tổ ấm, cam kết tình cảm.",
  7: "Năm chiêm nghiệm: học hỏi, nghỉ ngơi, nhìn lại bản thân.",
  8: "Năm thu hoạch về tài chính và sự nghiệp: tốt cho đầu tư, thăng tiến.",
  9: "Năm hoàn tất chu kỳ: buông bỏ điều cũ, dọn đường cho khởi đầu mới.",
};
