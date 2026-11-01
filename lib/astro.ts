// Bản đồ sao chiêm tinh phương Tây (hoàng đạo nhiệt đới, hệ nhà Placidus).
// Vị trí hành tinh tính bằng astronomy-engine (MIT) — https://github.com/cosinekitty/astronomy

import * as A from "astronomy-engine";

export const SIGNS = [
  { vi: "Bạch Dương", en: "Aries", glyph: "♈", element: "Lửa", mode: "Tiên phong", ruler: "Sao Hỏa" },
  { vi: "Kim Ngưu", en: "Taurus", glyph: "♉", element: "Đất", mode: "Cố định", ruler: "Sao Kim" },
  { vi: "Song Tử", en: "Gemini", glyph: "♊", element: "Khí", mode: "Linh hoạt", ruler: "Sao Thủy" },
  { vi: "Cự Giải", en: "Cancer", glyph: "♋", element: "Nước", mode: "Tiên phong", ruler: "Mặt Trăng" },
  { vi: "Sư Tử", en: "Leo", glyph: "♌", element: "Lửa", mode: "Cố định", ruler: "Mặt Trời" },
  { vi: "Xử Nữ", en: "Virgo", glyph: "♍", element: "Đất", mode: "Linh hoạt", ruler: "Sao Thủy" },
  { vi: "Thiên Bình", en: "Libra", glyph: "♎", element: "Khí", mode: "Tiên phong", ruler: "Sao Kim" },
  { vi: "Bọ Cạp", en: "Scorpio", glyph: "♏", element: "Nước", mode: "Cố định", ruler: "Sao Diêm Vương / Sao Hỏa" },
  { vi: "Nhân Mã", en: "Sagittarius", glyph: "♐", element: "Lửa", mode: "Linh hoạt", ruler: "Sao Mộc" },
  { vi: "Ma Kết", en: "Capricorn", glyph: "♑", element: "Đất", mode: "Tiên phong", ruler: "Sao Thổ" },
  { vi: "Bảo Bình", en: "Aquarius", glyph: "♒", element: "Khí", mode: "Cố định", ruler: "Sao Thiên Vương / Sao Thổ" },
  { vi: "Song Ngư", en: "Pisces", glyph: "♓", element: "Nước", mode: "Linh hoạt", ruler: "Sao Hải Vương / Sao Mộc" },
] as const;

export const HOUSE_MEANING = [
  "Bản thân, ngoại hình, cách bắt đầu",
  "Tiền bạc, tài sản, giá trị bản thân",
  "Giao tiếp, học tập, anh chị em, đi lại gần",
  "Gia đình, nhà cửa, cội nguồn",
  "Sáng tạo, niềm vui, tình yêu, con cái",
  "Công việc hằng ngày, sức khỏe, thói quen",
  "Hôn nhân, đối tác, quan hệ một-một",
  "Biến đổi, tài chính chung, chiều sâu tâm lý",
  "Học vấn cao, du lịch xa, niềm tin",
  "Sự nghiệp, danh tiếng, vị trí xã hội",
  "Bạn bè, cộng đồng, ước mơ",
  "Tiềm thức, nghỉ ngơi, đời sống tâm linh",
];

type BodyId = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto" | "node";

export const PLANETS: { id: BodyId; vi: string; glyph: string; body?: A.Body; meaning: string }[] = [
  { id: "sun", vi: "Mặt Trời", glyph: "☉", body: A.Body.Sun, meaning: "Bản ngã, mục tiêu sống, sức sống" },
  { id: "moon", vi: "Mặt Trăng", glyph: "☽", body: A.Body.Moon, meaning: "Cảm xúc, nhu cầu an toàn, phản ứng tự nhiên" },
  { id: "mercury", vi: "Sao Thủy", glyph: "☿", body: A.Body.Mercury, meaning: "Tư duy, giao tiếp, học hỏi" },
  { id: "venus", vi: "Sao Kim", glyph: "♀", body: A.Body.Venus, meaning: "Tình yêu, thẩm mỹ, giá trị, tiền bạc" },
  { id: "mars", vi: "Sao Hỏa", glyph: "♂", body: A.Body.Mars, meaning: "Hành động, ý chí, đam mê, cạnh tranh" },
  { id: "jupiter", vi: "Sao Mộc", glyph: "♃", body: A.Body.Jupiter, meaning: "Mở rộng, may mắn, niềm tin, triết lý" },
  { id: "saturn", vi: "Sao Thổ", glyph: "♄", body: A.Body.Saturn, meaning: "Kỷ luật, trách nhiệm, giới hạn, bài học" },
  { id: "uranus", vi: "Sao Thiên Vương", glyph: "♅", body: A.Body.Uranus, meaning: "Đổi mới, tự do, bất ngờ" },
  { id: "neptune", vi: "Sao Hải Vương", glyph: "♆", body: A.Body.Neptune, meaning: "Mơ mộng, trực giác, tâm linh" },
  { id: "pluto", vi: "Sao Diêm Vương", glyph: "♇", body: A.Body.Pluto, meaning: "Chuyển hóa, quyền lực, tái sinh" },
  { id: "node", vi: "Bắc Giao Điểm", glyph: "☊", meaning: "Hướng phát triển của đời này" },
];

export const ASPECTS = [
  { id: "conj", vi: "Hội tụ", glyph: "☌", angle: 0, orb: 8, tone: "neutral" },
  { id: "sext", vi: "Lục hợp", glyph: "⚹", angle: 60, orb: 5, tone: "soft" },
  { id: "sq", vi: "Vuông góc", glyph: "□", angle: 90, orb: 7, tone: "hard" },
  { id: "tri", vi: "Tam hợp", glyph: "△", angle: 120, orb: 7, tone: "soft" },
  { id: "opp", vi: "Đối đỉnh", glyph: "☍", angle: 180, orb: 8, tone: "hard" },
] as const;

export interface AstroInput {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number; // giờ địa phương 0–23
  minute: number;
  tz: number; // múi giờ, vd. 7 = UTC+7
  lat: number;
  lon: number;
  place: string;
  timeKnown: boolean;
}

export interface PlanetPos {
  id: BodyId;
  vi: string;
  glyph: string;
  lon: number; // kinh độ hoàng đạo 0–360
  sign: number; // 0–11
  deg: number; // độ trong cung 0–30
  retro: boolean;
  house: number | null; // 1–12
}

export interface Aspect {
  a: string;
  b: string;
  type: (typeof ASPECTS)[number];
  orb: number;
}

export interface AstroChart {
  input: AstroInput;
  utc: Date;
  planets: PlanetPos[];
  asc: number | null;
  mc: number | null;
  cusps: number[] | null; // 12 đỉnh nhà
  houseSystem: "Placidus" | "Equal" | null;
  aspects: Aspect[];
  elements: Record<string, number>;
  modes: Record<string, number>;
}

const RAD = Math.PI / 180;
const norm = (x: number) => ((x % 360) + 360) % 360;
const sind = (x: number) => Math.sin(x * RAD);
const cosd = (x: number) => Math.cos(x * RAD);
const tand = (x: number) => Math.tan(x * RAD);
const atan2d = (y: number, x: number) => Math.atan2(y, x) / RAD;

function bodyLon(id: BodyId, body: A.Body | undefined, t: A.AstroTime): number {
  if (id === "sun") return A.SunPosition(t).elon;
  if (id === "moon") return A.EclipticGeoMoon(t).lon;
  if (id === "node") {
    // Giao điểm trung bình của quỹ đạo Mặt Trăng (Meeus 47.7)
    const T = t.tt / 36525;
    return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + (T * T * T) / 467441 - (T * T * T * T) / 60616000);
  }
  return A.Ecliptic(A.GeoVector(body!, t, true)).elon;
}

/** Điểm trên hoàng đạo có xích kinh RA (độ). */
const lonFromRa = (ra: number, eps: number) => norm(atan2d(sind(ra), cosd(ra) * cosd(eps)));

function placidus(ramc: number, lat: number, eps: number): number[] | null {
  const cusp = (k: number, above: boolean) => {
    // k = 1/3 hoặc 2/3 cung bán nhật (trên chân trời) / bán dạ (dưới chân trời)
    let ra = above ? ramc + 90 * k : ramc + 180 - 90 * k;
    for (let i = 0; i < 30; i++) {
      const lon = lonFromRa(ra, eps);
      const dec = Math.asin(sind(eps) * sind(lon)) / RAD;
      const x = -tand(lat) * tand(dec);
      if (Math.abs(x) > 1) return null;
      const dsa = Math.acos(x) / RAD;
      const next = above ? ramc + dsa * k : ramc + 180 - (180 - dsa) * k;
      if (Math.abs(norm(next - ra + 180) - 180) < 1e-7) return lonFromRa(next, eps);
      ra = next;
    }
    return lonFromRa(ra, eps);
  };
  const c11 = cusp(1 / 3, true), c12 = cusp(2 / 3, true), c2 = cusp(2 / 3, false), c3 = cusp(1 / 3, false);
  if ([c11, c12, c2, c3].some((x) => x === null)) return null;
  return [c11!, c12!, c2!, c3!];
}

const signOf = (lon: number) => Math.floor(norm(lon) / 30);

export function houseOf(lon: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const a = cusps[i], b = cusps[(i + 1) % 12];
    if (norm(lon - a) < norm(b - a)) return i + 1;
  }
  return 12;
}

export function computeChart(input: AstroInput): AstroChart {
  const { year, month, day, hour, minute, tz, lat, lon, timeKnown } = input;
  const h = timeKnown ? hour : 12;
  const m = timeKnown ? minute : 0;
  const utc = new Date(Date.UTC(year, month - 1, day, h, m) - tz * 3600_000);
  const t = A.MakeTime(utc);

  let asc: number | null = null, mc: number | null = null, cusps: number[] | null = null;
  let houseSystem: AstroChart["houseSystem"] = null;
  if (timeKnown) {
    const eps = A.e_tilt(t).tobl;
    const ramc = norm(A.SiderealTime(t) * 15 + lon);
    mc = norm(atan2d(sind(ramc), cosd(ramc) * cosd(eps)));
    asc = norm(atan2d(cosd(ramc), -(sind(ramc) * cosd(eps) + tand(lat) * sind(eps))));
    const p = placidus(ramc, lat, eps);
    if (p) {
      const [c11, c12, c2, c3] = p;
      // nhà 4–9 đối xứng với nhà 10–3
      cusps = [asc, c2, c3, norm(mc + 180), norm(c11 + 180), norm(c12 + 180), norm(asc + 180), norm(c2 + 180), norm(c3 + 180), mc, c11, c12];
      houseSystem = "Placidus";
    } else {
      cusps = Array.from({ length: 12 }, (_, i) => norm(asc! + 30 * i));
      houseSystem = "Equal";
    }
  }

  const planets: PlanetPos[] = PLANETS.map((p) => {
    const L = bodyLon(p.id, p.body, t);
    let retro = false;
    if (p.id !== "sun" && p.id !== "moon" && p.id !== "node") {
      const before = bodyLon(p.id, p.body, A.MakeTime(new Date(utc.getTime() - 43_200_000)));
      const after = bodyLon(p.id, p.body, A.MakeTime(new Date(utc.getTime() + 43_200_000)));
      retro = norm(after - before + 180) - 180 < 0;
    }
    return { id: p.id, vi: p.vi, glyph: p.glyph, lon: L, sign: signOf(L), deg: L % 30, retro: p.id === "node" ? true : retro, house: cusps ? houseOf(L, cusps) : null };
  });

  // Góc chiếu giữa các hành tinh (+ ASC, MC nếu biết giờ sinh); Mặt Trời / Mặt Trăng được nới thêm 2°.
  const points = [
    ...planets.filter((p) => p.id !== "node" && (timeKnown || p.id !== "moon")).map((p) => ({ name: p.vi, lon: p.lon, lum: p.id === "sun" || p.id === "moon" })),
    ...(asc !== null ? [{ name: "Cung Mọc", lon: asc, lum: false }, { name: "Thiên Đỉnh", lon: mc!, lum: false }] : []),
  ];
  const aspects: Aspect[] = [];
  for (let i = 0; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++) {
      if (points[i].name === "Cung Mọc" && points[j].name === "Thiên Đỉnh") continue;
      const d = Math.abs(norm(points[i].lon - points[j].lon + 180) - 180);
      for (const type of ASPECTS) {
        const orb = Math.abs(d - type.angle);
        if (orb <= type.orb + (points[i].lum || points[j].lum ? 2 : 0)) aspects.push({ a: points[i].name, b: points[j].name, type, orb });
      }
    }
  aspects.sort((x, y) => x.orb - y.orb);

  const elements: Record<string, number> = { "Lửa": 0, "Đất": 0, "Khí": 0, "Nước": 0 };
  const modes: Record<string, number> = { "Tiên phong": 0, "Cố định": 0, "Linh hoạt": 0 };
  planets.filter((p) => p.id !== "node" && p.id !== "uranus" && p.id !== "neptune" && p.id !== "pluto").forEach((p) => {
    const w = p.id === "sun" || p.id === "moon" ? 2 : 1;
    elements[SIGNS[p.sign].element] += w;
    modes[SIGNS[p.sign].mode] += w;
  });
  if (asc !== null) { elements[SIGNS[signOf(asc)].element] += 2; modes[SIGNS[signOf(asc)].mode] += 2; }

  return { input, utc, planets, asc, mc, cusps, houseSystem, aspects, elements, modes };
}

export const fmtDeg = (lon: number) => {
  const d = norm(lon) % 30;
  const deg = Math.floor(d);
  const min = Math.floor((d - deg) * 60);
  return `${deg}°${String(min).padStart(2, "0")}′`;
};
export const signName = (lon: number) => SIGNS[signOf(lon)].vi;

/** Tóm tắt dạng văn bản gửi cho AI. */
export function chartToText(c: AstroChart): string {
  const i = c.input;
  const lines = [
    `Tên: ${i.name || "(không nêu)"}; sinh ${i.day}/${i.month}/${i.year}${i.timeKnown ? ` lúc ${String(i.hour).padStart(2, "0")}:${String(i.minute).padStart(2, "0")}` : " (không rõ giờ sinh — bỏ qua Cung Mọc, các nhà; vị trí Mặt Trăng có thể lệch tới ±6°)"} tại ${i.place} (vĩ độ ${i.lat.toFixed(2)}, kinh độ ${i.lon.toFixed(2)}, UTC${i.tz >= 0 ? "+" : ""}${i.tz}).`,
    `Hệ hoàng đạo nhiệt đới${c.houseSystem ? `, hệ nhà ${c.houseSystem}` : ""}.`,
  ];
  if (c.asc !== null) lines.push(`Cung Mọc (ASC): ${signName(c.asc)} ${fmtDeg(c.asc)}. Thiên Đỉnh (MC): ${signName(c.mc!)} ${fmtDeg(c.mc!)}.`);
  lines.push("Vị trí các hành tinh:");
  c.planets.forEach((p) => lines.push(`- ${p.vi}: ${SIGNS[p.sign].vi} ${fmtDeg(p.lon)}${p.house ? `, nhà ${p.house}` : ""}${p.retro && p.id !== "node" ? ", nghịch hành" : ""}`));
  if (c.cusps) lines.push(`Đỉnh 12 nhà: ${c.cusps.map((x, k) => `nhà ${k + 1} ${signName(x)} ${fmtDeg(x)}`).join("; ")}.`);
  lines.push(`Góc chiếu chính (sai số): ${c.aspects.slice(0, 25).map((a) => `${a.a} ${a.type.vi} ${a.b} (${a.orb.toFixed(1)}°)`).join("; ") || "không có"}.`);
  lines.push(`Cân bằng nguyên tố: ${Object.entries(c.elements).map(([k, v]) => `${k} ${v}`).join(", ")}. Tính chất: ${Object.entries(c.modes).map(([k, v]) => `${k} ${v}`).join(", ")}.`);
  return lines.join("\n");
}
