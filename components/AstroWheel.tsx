import { PLANETS, SIGNS, fmtDeg, type AstroChart } from "@/lib/astro";

// Vòng bản đồ sao: Cung Mọc nằm bên trái, hoàng đạo chạy ngược chiều kim đồng hồ.
const C = 300;
const R_OUT = 292, R_SIGN = 250, R_HOUSE = 218, R_PLANET = 186, R_IN = 140;
const ELEMENT_FILL: Record<string, string> = { "Lửa": "rgba(255,120,90,0.10)", "Đất": "rgba(214,180,110,0.10)", "Khí": "rgba(150,200,255,0.08)", "Nước": "rgba(90,170,255,0.10)" };
const ELEMENT_INK: Record<string, string> = { "Lửa": "#ff9b84", "Đất": "#e2c48a", "Khí": "#b9dcff", "Nước": "#7fc0ff" };
const TEXT = "︎"; // buộc ký hiệu hiển thị dạng chữ, không thành emoji
const norm = (x: number) => ((x % 360) + 360) % 360;

export default function AstroWheel({ chart }: { chart: AstroChart }) {
  const rot = chart.asc ?? 0;
  const pt = (lon: number, r: number) => {
    const a = ((180 + lon - rot) * Math.PI) / 180;
    return [C + r * Math.cos(a), C - r * Math.sin(a)] as const;
  };
  const arc = (l1: number, l2: number, r1: number, r2: number) => {
    const [x1, y1] = pt(l1, r1), [x2, y2] = pt(l2, r1), [x3, y3] = pt(l2, r2), [x4, y4] = pt(l1, r2);
    return `M${x1},${y1} A${r1},${r1} 0 0 0 ${x2},${y2} L${x3},${y3} A${r2},${r2} 0 0 1 ${x4},${y4} Z`;
  };

  // Dãn các hành tinh quá sát nhau để ký hiệu không chồng lên nhau
  const placed = chart.planets.map((p) => ({ p, at: p.lon })).sort((a, b) => a.p.lon - b.p.lon);
  const GAP = 8;
  for (let pass = 0; pass < 6; pass++)
    for (let i = 0; i < placed.length; i++) {
      const a = placed[i], b = placed[(i + 1) % placed.length];
      const d = norm(b.at - a.at);
      if (d < GAP) { a.at = norm(a.at - (GAP - d) / 2); b.at = norm(b.at + (GAP - d) / 2); }
    }
  const pos = Object.fromEntries(chart.planets.map((p) => [p.vi, p.lon]));
  if (chart.asc !== null) { pos["Cung Mọc"] = chart.asc; pos["Thiên Đỉnh"] = chart.mc!; }

  return (
    <svg viewBox="-34 -34 668 668" className="h-auto w-full" role="img" aria-label="Vòng bản đồ sao">
      <circle cx={C} cy={C} r={R_OUT} fill="#0b1214" stroke="rgba(0,255,135,0.35)" />
      {SIGNS.map((s, i) => {
        const [gx, gy] = pt(i * 30 + 15, (R_OUT + R_SIGN) / 2);
        return (
          <g key={s.en}>
            <path d={arc(i * 30, i * 30 + 30, R_OUT, R_SIGN)} fill={ELEMENT_FILL[s.element]} stroke="rgba(255,255,255,0.10)">
              <title>{`${s.vi} (${s.en}) · ${s.element} · ${s.mode} · chủ tinh ${s.ruler}`}</title>
            </path>
            <text x={gx} y={gy} fill={ELEMENT_INK[s.element]} fontSize="22" textAnchor="middle" dominantBaseline="central">{s.glyph + TEXT}</text>
          </g>
        );
      })}
      {Array.from({ length: 72 }, (_, i) => {
        const [x1, y1] = pt(i * 5, R_SIGN), [x2, y2] = pt(i * 5, R_SIGN - (i % 6 === 0 ? 10 : 5));
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.25)" />;
      })}
      <circle cx={C} cy={C} r={R_SIGN} fill="none" stroke="rgba(0,255,135,0.30)" />
      <circle cx={C} cy={C} r={R_HOUSE} fill="none" stroke="rgba(255,255,255,0.08)" />
      <circle cx={C} cy={C} r={R_IN} fill="rgba(0,255,135,0.025)" stroke="rgba(0,255,135,0.25)" />

      {chart.cusps?.map((c, i) => {
        const angle = i === 0 || i === 9;
        const [x1, y1] = pt(c, R_IN), [x2, y2] = pt(c, angle ? R_OUT + 4 : R_SIGN);
        const next = chart.cusps![(i + 1) % 12];
        const [nx, ny] = pt(c + norm(next - c) / 2, (R_HOUSE + R_IN) / 2 + 26);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={angle ? "#00ff87" : "rgba(255,255,255,0.22)"} strokeWidth={angle ? 2 : 1} />
            <text x={nx} y={ny} fill="rgba(255,255,255,0.35)" fontSize="11" textAnchor="middle" dominantBaseline="central">{i + 1}</text>
          </g>
        );
      })}
      {chart.asc !== null && (
        <>
          <text {...xy(pt(chart.asc, R_OUT + 20))} fill="#00ff87" fontSize="13" fontWeight={700} textAnchor="middle" dominantBaseline="central">ASC</text>
          <text {...xy(pt(chart.mc!, R_OUT + 20))} fill="#00ff87" fontSize="13" fontWeight={700} textAnchor="middle" dominantBaseline="central">MC</text>
        </>
      )}

      {chart.aspects.filter((a) => a.type.id !== "conj" && pos[a.a] !== undefined && pos[a.b] !== undefined).map((a, i) => {
        const [x1, y1] = pt(pos[a.a], R_IN), [x2, y2] = pt(pos[a.b], R_IN);
        const color = a.type.tone === "hard" ? "rgba(255,110,110,0.65)" : "rgba(80,200,255,0.6)";
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={a.orb < 2 ? 1.6 : 1} strokeDasharray={a.type.id === "sext" ? "4 3" : undefined}>
            <title>{`${a.a} ${a.type.vi} ${a.b} (sai số ${a.orb.toFixed(1)}°)`}</title>
          </line>
        );
      })}

      {placed.map(({ p, at }) => {
        const [tx1, ty1] = pt(p.lon, R_HOUSE), [tx2, ty2] = pt(p.lon, R_HOUSE - 8);
        const [gx, gy] = pt(at, R_PLANET);
        const [dx, dy] = pt(at, R_PLANET - 26);
        const [ix, iy] = pt(p.lon, R_IN);
        const info = PLANETS.find((x) => x.id === p.id)!;
        return (
          <g key={p.id}>
            <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#e8fff3" strokeWidth={1.5} />
            <circle cx={ix} cy={iy} r={2} fill="#e8fff3" />
            <text x={gx} y={gy} fill={p.id === "sun" || p.id === "moon" ? "#ffd166" : "#e8fff3"} fontSize="21" textAnchor="middle" dominantBaseline="central">
              {p.glyph + TEXT}
              <title>{`${p.vi} ${fmtDeg(p.lon)} ${SIGNS[p.sign].vi}${p.house ? ` · nhà ${p.house}` : ""}${p.retro && p.id !== "node" ? " · nghịch hành" : ""} — ${info.meaning}`}</title>
            </text>
            <text x={dx} y={dy} fill="rgba(255,255,255,0.55)" fontSize="9.5" textAnchor="middle" dominantBaseline="central">
              {Math.floor(p.deg)}°{p.retro && p.id !== "node" ? "℞" : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const xy = ([x, y]: readonly [number, number]) => ({ x, y });
