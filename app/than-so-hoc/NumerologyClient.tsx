"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import DateFields from "@/components/DateFields";
import ProfilePicker from "@/components/ProfilePicker";
import Icon from "@/components/Icon";
import { IMG } from "@/lib/images";
import { computeNumerology, lifePathLabel, NUMBER_MEANING, PERSONAL_YEAR_MEANING, type NumerologyResult } from "@/lib/numerology";

const GRID_LABELS: Record<number, string> = { 1: "Bản Ngã", 2: "Trực Giác", 3: "Trí Não", 4: "Thực Tế", 5: "Cảm Xúc", 6: "Sáng Tạo", 7: "Trải Nghiệm", 8: "Trí Tuệ", 9: "Lý Tưởng" };
const GRID_ORDER = [3, 6, 9, 2, 5, 8, 1, 4, 7];

function toContext(r: NumerologyResult, yearNow: number) {
  const ds = (n: number) => String(n).split("").map(Number);
  const reduceSteps = (n: number) => { const out = [n]; while (n > 9) { n = ds(n).reduce((a, b) => a + b, 0); out.push(n); } return out.join(" → "); };
  const dateDigits = `${r.day}${r.month}${r.year}`.split("").map(Number);
  const nd = r.nameDetail;
  const series = r.personalYearsSeries.filter((p) => p.year >= yearNow && p.year <= yearNow + 2);
  return [
    `Họ tên (không dấu dùng để tính): ${r.name ? r.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toUpperCase() : "(không nêu)"}; ngày sinh dương lịch ${r.day}/${String(r.month).padStart(2, "0")}/${r.year}.`,
    `Số chủ đạo: ${lifePathLabel(r.lifePath)} (cách tính: ${dateDigits.join("+")} = ${dateDigits.reduce((a, b) => a + b, 0)} → ${lifePathLabel(r.lifePath)}).`,
    `Số ngày sinh: ${r.birthday} (${reduceSteps(r.day)}).`,
    `Số thái độ: ${r.attitude} (ngày + tháng: ${[...ds(r.day), ...ds(r.month)].join("+")} = ${[...ds(r.day), ...ds(r.month)].reduce((a, b) => a + b, 0)} → ${r.attitude}).`,
    nd
      ? [
          `Số sứ mệnh: ${r.expression} (${nd.words.map((w) => `${w.word} ${w.sum}`).join(" + ")} = ${reduceSteps(nd.total)}).`,
          `Số linh hồn (nguyên âm ${nd.vowelLetters.join(", ")}; tên tiếng Việt coi Y là nguyên âm): ${r.soulUrge} (${reduceSteps(nd.vowel)}).`,
          `Số nhân cách (phụ âm): ${r.personality} (${reduceSteps(nd.cons)}).`,
          `Số trưởng thành: ${r.maturity} (chủ đạo + sứ mệnh).`,
          `Bài học nghiệp (số không có trong tên): ${r.missingInName?.join(", ") || "không có"}.`,
          `Đam mê tiềm ẩn (số xuất hiện nhiều nhất trong tên): ${r.hiddenPassion?.join(", ")}.`,
          `Số cân bằng: ${r.balance} (chữ cái đầu mỗi từ: ${nd.words.map((w) => `${w.word[0]}=${w.first}`).join(" + ")} = ${reduceSteps(nd.words.reduce((a, w) => a + w.first, 0))}).`,
          `Số tư duy lý trí: ${r.rationalThinking} (tên gọi ${nd.words[nd.words.length - 1]?.word} ${nd.words[nd.words.length - 1]?.sum} + ngày sinh ${r.day} = ${reduceSteps((nd.words[nd.words.length - 1]?.sum ?? 0) + r.day)}).`,
          `Số lần mỗi số xuất hiện trong tên: ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${n}:${r.nameLetterCounts?.[n] ?? 0}`).join(" ")}.`,
        ].join("\n")
      : "Không có họ tên nên chưa tính các chỉ số từ tên (sứ mệnh, linh hồn, nhân cách, trưởng thành, bài học nghiệp, đam mê tiềm ẩn).",
    `Năm cá nhân ${yearNow}: ${r.personalYear}; tháng cá nhân hiện tại: ${r.personalMonth}. Các năm tới: ${series.map((p) => `${p.year} = ${p.value}`).join(", ")}.`,
    `4 đỉnh cao (tuổi chạm đỉnh, năm): ${r.pinnacles.map((p, i) => `Đỉnh ${i + 1} = số ${p.value}, tuổi ${p.age}, năm ${p.year}`).join("; ")}.`,
    `4 thử thách: ${r.challenges.map((c, i) => `thử thách ${i + 1} = ${c}`).join(", ")} (thử thách 3 là thử thách chính).`,
    `Biểu đồ ngày sinh (bỏ số 0; số lần xuất hiện): ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${n}:${r.chart[n]}`).join(" ")}. Có mặt: ${[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => r.chart[n]).join(", ")}; thiếu: ${[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !r.chart[n]).join(", ")}.`,
    `Mũi tên / trục: ${r.arrows.map((a) => `${a.name} (${a.key.split("").join("-")} ${a.present ? "đầy" : "trống"})`).join(", ") || "không có"}.`,
  ].join("\n");
}

export default function NumerologyClient() {
  const now = new Date();
  const [name, setName] = useState("");
  const [date, setDate] = useState({ day: 16, month: 7, year: 1995 });
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [session, setSession] = useState<string | undefined>(undefined);

  const run = () => {
    const r = computeNumerology(name, date.day, date.month, date.year, now.getFullYear(), now.getMonth() + 1);
    setResult(r);
    setSession(`${name}|${date.day}/${date.month}/${date.year}|${Date.now()}`);
    setTimeout(() => document.getElementById("ket-qua")?.scrollIntoView({ behavior: "smooth" }), 50);
  };
  const context = useMemo(() => (result ? toContext(result, now.getFullYear()) : ""), [result]); // eslint-disable-line react-hooks/exhaustive-deps
  const lp = result ? NUMBER_MEANING[result.lifePath] : null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-5 py-8 md:px-6">
      {/* Persona header */}
      <section className="glass flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.maya} alt="" className="h-16 w-16 rounded-xl border border-emerald/30 object-cover" />
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-abyss bg-primary-container" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-[28px] text-primary">Nhà Hiền Triết Pythagoras AI</h1>
              <span className="chip">Thần số học</span>
            </div>
            <p className="text-sm text-on-surface-variant">Trợ lý luận giải sóng rung năng lượng thần số và tần số thiên mệnh học.</p>
            <p className="mt-1 text-xs text-primary-container">● Đang trực tuyến · Hệ Pythagoras (quy ước David A. Phillips)</p>
          </div>
        </div>
      </section>

      {/* Input */}
      <section className="panel">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-serif text-headline-sm text-primary">
            <Icon name="apps" className="text-primary-container" /> Khai Mở Năng Lượng Rung Động Số Học
          </h2>
          <span className="label-sm text-secondary">Hệ thống Pythagoras</span>
        </div>
        <ProfilePicker
          current={() => ({ name, ...date })}
          onPick={(p) => { setName(p.name); setDate({ day: p.day, month: p.month, year: p.year }); }}
        />
        <div className="grid items-end gap-4 lg:grid-cols-[1.2fr_1.4fr_auto]">
          <div>
            <label className="field-label">Họ và tên đầy đủ (theo khai sinh) — tùy chọn</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyễn Hoàng Minh" />
          </div>
          <div>
            <DateFields {...date} onChange={setDate} />
          </div>
          <button className="btn-neon h-[46px]" onClick={run}>
            <Icon name="auto_fix_high" className="text-[18px]" /> Khai mở vận số
          </button>
        </div>
      </section>

      {result && lp && (
        <div id="ket-qua" className="space-y-6">
          {/* 4 core numbers */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CoreCard label="Chỉ số chủ đạo" tag="Cốt lõi" n={lifePathLabel(result.lifePath)} title={lp.title} text={lp.strength} highlight />
            {result.expression !== undefined ? (
              <CoreCard label="Chỉ số sứ mệnh" tag="Biểu hiện" n={String(result.expression)} title={NUMBER_MEANING[result.expression]?.title} text={NUMBER_MEANING[result.expression]?.strength} />
            ) : (
              <CoreCard label="Chỉ số sứ mệnh" tag="Cần họ tên" n="–" title="Chưa có tên" text="Nhập họ tên đầy đủ để tính số sứ mệnh, linh hồn và nhân cách." />
            )}
            {result.soulUrge !== undefined ? (
              <CoreCard label="Chỉ số linh hồn" tag="Nội tâm" n={String(result.soulUrge)} title={NUMBER_MEANING[result.soulUrge]?.title} text={NUMBER_MEANING[result.soulUrge]?.strength} />
            ) : (
              <CoreCard label="Chỉ số ngày sinh" tag="Năng lực" n={String(result.birthday)} title={NUMBER_MEANING[result.birthday]?.title} text={NUMBER_MEANING[result.birthday]?.strength} />
            )}
            <CoreCard label={`Năm cá nhân ${now.getFullYear()}`} tag="Vận thế hiện tại" n={String(result.personalYear)} title={`Chu kỳ ${result.personalYear}/9`} text={PERSONAL_YEAR_MEANING[result.personalYear]} />
          </section>
          <Link href={`/than-so-hoc/so-chu-dao-${result.lifePath}`} className="flex items-center justify-between rounded-xl border border-emerald/25 bg-emerald/[0.05] px-5 py-3 text-sm text-emerald-mist transition hover:border-primary-container">
            <span><Icon name="menu_book" className="mr-2 align-middle text-[18px] text-primary-container" />Đọc bài viết đầy đủ về số chủ đạo {lifePathLabel(result.lifePath)}</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </Link>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="space-y-6">
              {/* Birth chart */}
              <section className="panel">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-serif text-headline-sm text-primary"><Icon name="tag" className="text-primary-container" /> Biểu Đồ Ngày Sinh</h3>
                  <span className="label-sm text-muted">Ma trận 3×3</span>
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/[0.05] bg-abyss p-2">
                  {GRID_ORDER.map((n) => {
                    const c = result.chart[n];
                    return (
                      <div key={n} className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-center ${c ? "border-emerald/30 bg-emerald/[0.08]" : "border-white/[0.04] bg-glass/50"}`}>
                        <span className={`label-sm ${c ? "text-secondary" : "text-muted"}`}>{GRID_LABELS[n]} ({n})</span>
                        <span className={`mt-1 font-serif text-[28px] ${c ? "text-primary-container" : "text-outline-variant"}`}>{c ? String(n).repeat(c) : "–"}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 divide-y divide-white/[0.05]">
                  {result.arrows.length === 0 && <p className="py-2 text-sm text-muted">Không có mũi tên đặc biệt — các năng lượng phân bổ khá đều.</p>}
                  {result.arrows.map((a) => (
                    <div key={a.key} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                      <div>
                        <div className="flex items-center gap-1.5 text-primary">
                          <Icon name={a.present ? "trending_up" : "hourglass_empty"} className={`text-[16px] ${a.present ? "text-primary-container" : "text-error-soft"}`} />
                          {a.name} ({a.key.split("").join("-")})
                        </div>
                        <div className="mt-0.5 text-xs text-muted">{a.meaning}</div>
                      </div>
                      <span className={`label-sm shrink-0 ${a.present ? "text-primary-container" : "text-error-soft"}`}>{a.present ? "Hiện hữu" : "Cần rèn luyện"}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Personal year wave */}
              <section className="panel">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-serif text-headline-sm text-primary">Chu Kỳ Năm Cá Nhân</h3>
                  <span className="label-sm text-secondary">Năm {now.getFullYear()} · số {result.personalYear}</span>
                </div>
                <p className="mb-3 text-xs text-muted">Chu kỳ 9 năm: 1 là khởi đầu, 9 là hoàn tất.</p>
                <Wave series={result.personalYearsSeries} current={now.getFullYear()} />
              </section>

              {/* Other indices */}
              <section className="panel">
                <h3 className="mb-3 font-serif text-headline-sm text-primary">Các Chỉ Số Khác</h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <Stat k="Số ngày sinh" v={result.birthday} />
                  <Stat k="Số thái độ" v={result.attitude} />
                  {result.personality !== undefined && <Stat k="Số nhân cách" v={result.personality} />}
                  {result.maturity !== undefined && <Stat k="Số trưởng thành" v={result.maturity} />}
                  <Stat k={`Tháng cá nhân (T${now.getMonth() + 1})`} v={result.personalMonth} />
                  {result.missingInName && <Stat k="Bài học nghiệp" v={result.missingInName.join(", ") || "Không"} />}
                  {result.hiddenPassion && <Stat k="Đam mê tiềm ẩn" v={result.hiddenPassion.join(", ")} />}
                  {result.balance !== undefined && <Stat k="Số cân bằng" v={result.balance} />}
                  {result.rationalThinking !== undefined && <Stat k="Số tư duy lý trí" v={result.rationalThinking} />}
                </dl>
                <div className="mt-4">
                  <div className="label-sm mb-2 text-muted">4 đỉnh cao cuộc đời</div>
                  <div className="grid grid-cols-4 gap-2">
                    {result.pinnacles.map((p, i) => (
                      <div key={i} className="rounded-lg border border-white/[0.05] bg-glass/60 p-2 text-center">
                        <div className="font-serif text-[24px] text-primary-container">{p.value}</div>
                        <div className="text-[11px] text-muted">Tuổi {p.age} · {p.year}</div>
                      </div>
                    ))}
                  </div>
                  <div className="label-sm mb-2 mt-4 text-muted">4 thử thách</div>
                  <div className="flex gap-2">{result.challenges.map((c, i) => <span key={i} className="chip">{c}</span>)}</div>
                </div>
              </section>
            </div>

            <ChatPanel
              agent="numerology"
              context={context}
              title="Kênh Luận Giải Chuyên Sâu"
              sessionKey={session}
              autoPrompt={`Hãy chào ${result.name || "tôi"} và luận giải bản đồ thần số học của tôi theo đúng bố cục đã quy định, kể cả năm cá nhân ${now.getFullYear()}.`}
              suggestions={[`Năm ${now.getFullYear()} tôi có nên đổi việc không?`, `Người có số chủ đạo nào hợp với tôi trong tình cảm?`, "Làm sao phát huy các mũi tên trống của tôi?"]}
              placeholder="Hỏi Pythagoras AI về sự nghiệp, tình duyên, chu kỳ vận số…"
              className="lg:sticky lg:top-24 lg:self-start"
            />
          </div>

          {/* Compatibility */}
          <section className="panel">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-serif text-headline-sm text-primary"><Icon name="sync_alt" className="text-primary-container" /> Độ Hợp Tần Số Rung Động Của Bạn (Số {result.lifePath > 9 ? lifePathLabel(result.lifePath) : result.lifePath})</h3>
              <span className="label-sm text-secondary">Tương thích nhân duyên &amp; đối tác</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Compat nums={result.compatible.best} t="Tương hợp tuyệt đối" d="Thấu cảm trí thức và đồng điệu tâm hồn." strong />
              <Compat nums={result.compatible.good} t="Hợp tác phát triển" d="Bù trừ điểm mù, thúc đẩy nhau tiến lên." />
              <Compat nums={result.compatible.challenge} t="Cần sự kiên nhẫn" d="Khác biệt góc nhìn, cần lắng nghe nhiều hơn." />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function CoreCard({ label, tag, n, title, text, highlight }: { label: string; tag: string; n: string; title?: string; text?: string; highlight?: boolean }) {
  return (
    <div className={`panel flex flex-col ${highlight ? "border-emerald/40 bg-emerald/[0.06] shadow-float" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="label-sm text-secondary">{label}</span>
        <span className="chip">{tag}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-serif text-[52px] leading-none text-primary-container">{n}</span>
        <span className="font-serif text-[22px] text-primary">{title}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">{text}</p>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: number | string }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-glass/60 px-3 py-2">
      <dt className="label-sm text-muted">{k}</dt>
      <dd className="mt-0.5 font-serif text-[22px] text-primary">{v}</dd>
    </div>
  );
}

function Compat({ nums, t, d, strong }: { nums: number[]; t: string; d: string; strong?: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.05] bg-glass/60 p-4">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg font-serif text-[22px] ${strong ? "bg-emerald/20 text-primary-container" : "bg-surface-container-high text-primary"}`}>{nums.join(", ")}</div>
      <div>
        <div className="font-label text-label-lg text-primary">{t}</div>
        <div className="text-sm text-muted">{d}</div>
      </div>
    </div>
  );
}

function Wave({ series, current }: { series: { year: number; value: number }[]; current: number }) {
  const W = 360, H = 130, pad = 18;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (series.length - 1);
  const y = (v: number) => H - pad - ((v - 1) / 8) * (H - pad * 2);
  const pts = series.map((s, i) => [x(i), y(s.value)] as const);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full" role="img" aria-label="Chu kỳ năm cá nhân">
      <defs>
        <linearGradient id="wv" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#00ff87" stopOpacity="0.25" />
          <stop offset="1" stopColor="#00ff87" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`} fill="url(#wv)" />
      <path d={d} fill="none" stroke="#00ff87" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 6px rgba(0,255,135,.5))" }} />
      {series.map((s, i) => (
        <g key={s.year}>
          <circle cx={x(i)} cy={y(s.value)} r={s.year === current ? 5.5 : 3} fill={s.year === current ? "#00ff87" : "#0F1416"} stroke="#00ff87" strokeWidth="1.5" />
          <text x={x(i)} y={y(s.value) - 9} textAnchor="middle" fontSize="10" fill="#b9cbb9">{s.value}</text>
          <text x={x(i)} y={H + 16} textAnchor="middle" fontSize="9.5" fill={s.year === current ? "#00ff87" : "#94A3B8"} fontWeight={s.year === current ? 700 : 400}>{s.year}</text>
        </g>
      ))}
    </svg>
  );
}
