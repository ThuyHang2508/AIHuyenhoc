"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import DateFields, { range } from "@/components/DateFields";
import ProfilePicker from "@/components/ProfilePicker";
import Icon from "@/components/Icon";
import { GIO, lunarToSolar } from "@/lib/lunar";
import { chartToText, lapLaSo, type Palace, type Star, type TuViChart } from "@/lib/tuvi";
import { BRIGHT_LABEL, CHINH_TINH, CUNG_Y_NGHIA } from "@/lib/tuvi-content";
import { starNote, TRANG_SINH_Y_NGHIA } from "@/lib/tuvi-stars";

// Vị trí 12 cung trên lưới 4×4 (chi 1 = Tý … 12 = Hợi)
const GRID: Record<number, [number, number]> = {
  6: [1, 1], 7: [1, 2], 8: [1, 3], 9: [1, 4],
  5: [2, 1], 10: [2, 4],
  4: [3, 1], 11: [3, 4],
  3: [4, 1], 2: [4, 2], 1: [4, 3], 12: [4, 4],
};

const starColor = (s: Star) => {
  if (s.kind === "chinh") return s.brightness === "H" ? "text-error-soft" : "text-primary-container";
  if (s.kind === "hoa") return s.name === "Hóa Kỵ" ? "text-error-soft" : "text-amber-300";
  if (s.kind === "cat") return "text-emerald-mist";
  if (s.kind === "dao") return "text-pink-300";
  if (s.kind === "sat") return "text-error-soft/80";
  return "text-muted";
};
/** Dời cung n bước theo chiều thuận (chi 1..12). */
const dich = (chi: number, n: number) => ((chi - 1 + n) % 12) + 1;
type Role = "sel" | "xung" | "hop" | null;
/** Tam phương tứ chính của cung đang chọn: cung xung chiếu (đối diện) và 2 cung tam hợp. */
function tamPhuong(chi: number | null) {
  const roles: Record<number, Role> = {};
  if (!chi) return roles;
  roles[chi] = "sel";
  roles[dich(chi, 6)] = "xung";
  roles[dich(chi, 4)] = "hop";
  roles[dich(chi, 8)] = "hop";
  return roles;
}
const center = (chi: number) => { const [r, c] = GRID[chi]; return `${c - 0.5},${r - 0.5}`; };

type Tip = { x: number; top: number; bottom: number; title: string; body: string };
type TipFn = (e: React.MouseEvent, title: string, body: string) => void;

function starTip(s: Star): [string, string] {
  const m = CHINH_TINH[s.name];
  const bright = s.brightness ? ` · ${BRIGHT_LABEL[s.brightness]}` : "";
  if (m) return [`${s.name} · ${m.hanh}${bright}`, `${m.tuongTrung}. ${s.brightness === "H" ? m.xau : m.tot}`];
  return [`${s.name}${bright}`, starNote(s.name) ?? ""];
}

// Font chữ nhúng vào ảnh xuất (chỉ bộ chữ Latin + tiếng Việt, bỏ font biểu tượng cho nhẹ).
const FONT_CSS_URL =
  "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap";
let fontCssCache: Promise<string> | null = null;
function exportFontCss() {
  fontCssCache ??= (async () => {
    try {
      const css = await (await fetch(FONT_CSS_URL)).text();
      const blocks = css.split(/(?=\/\*\s*[\w-]+\s*\*\/\s*@font-face)/).filter((b) => /\/\*\s*(latin|vietnamese)\s*\*\//.test(b));
      const out = await Promise.all(
        blocks.map(async (b) => {
          const url = b.match(/url\((https:[^)]+)\)/)?.[1];
          if (!url) return "";
          const blob = await (await fetch(url)).blob();
          const data = await new Promise<string>((r) => { const fr = new FileReader(); fr.onload = () => r(String(fr.result)); fr.readAsDataURL(blob); });
          return b.replace(url, data);
        }),
      );
      return out.join("\n");
    } catch {
      return "";
    }
  })();
  return fontCssCache;
}

const IMPORTANT_SAT = new Set(["Kình Dương", "Đà La", "Hỏa Tinh", "Linh Tinh", "Địa Không", "Địa Kiếp", "Thiên Hình", "Kiếp Sát"]);
const IMPORTANT_CAT = new Set(["Tả Phù", "Hữu Bật", "Văn Xương", "Văn Khúc", "Thiên Khôi", "Thiên Việt", "Lộc Tồn", "Thiên Mã", "Long Trì", "Phượng Các", "Ân Quang", "Thiên Quý", "Thiên Quan", "Thiên Phúc", "Thanh Long"]);

export default function TuViClient() {
  const now = new Date();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"nam" | "nu">("nam");
  const [calendar, setCalendar] = useState<"duong" | "am">("duong");
  const [leap, setLeap] = useState(false);
  const [date, setDate] = useState({ day: 15, month: 8, year: 1995 });
  const [hour, setHour] = useState(5);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [chart, setChart] = useState<TuViChart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [tab, setTab] = useState<"tong-quan" | "van-han" | "hoi-dap">("tong-quan");
  const [session, setSession] = useState<string | undefined>();
  const [showAll, setShowAll] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);
  const [exporting, setExporting] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const onTip: TipFn = (e, title, body) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTip({ x: r.left + r.width / 2, top: r.top, bottom: r.bottom, title, body });
  };
  useEffect(() => {
    if (!tip) return;
    const hide = () => setTip(null);
    window.addEventListener("scroll", hide, true);
    return () => window.removeEventListener("scroll", hide, true);
  }, [tip]);

  const exportImage = async () => {
    if (!chart || !boardRef.current) return;
    setExporting(true);
    setTip(null);
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const { toPng } = await import("html-to-image");
      const url = await toPng(boardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#0F1416",
        fontEmbedCSS: await exportFontCss(),
        filter: (n) => !(n instanceof HTMLElement && n.classList.contains("ms")),
      });
      const a = document.createElement("a");
      const who = (chart.input.name || "la-so").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").replace(/[^\w]+/g, "-");
      a.href = url;
      a.download = `tu-vi-${who}-${chart.solar.day}-${chart.solar.month}-${chart.solar.year}.png`;
      a.click();
    } catch (e) {
      console.error(e);
      setError("Không tạo được ảnh lá số, vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  };

  const run = () => {
    try {
      setError(null);
      const c = lapLaSo({ name, gender, day: date.day, month: date.month, year: date.year, calendar, leapMonth: leap, hour, viewYear });
      setChart(c);
      setSelected(c.menhChi);
      setTab("tong-quan");
      setSession(String(Date.now()));
      setTimeout(() => document.getElementById("thien-ban")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lập được lá số.");
    }
  };

  const context = useMemo(() => (chart ? chartToText(chart) : ""), [chart]);
  const sel = chart && selected ? chart.palaces[selected - 1] : null;
  const roles = useMemo(() => tamPhuong(selected), [selected]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-6">
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="chip mb-3"><Icon name="verified" className="text-[12px]" /> Tử Vi Đẩu Số · Âm lịch Việt Nam (UTC+7)</span>
          <h1 className="font-serif text-[40px] leading-[46px] text-primary md:text-headline-xl">
            Luận Giải <em className="text-primary-container">Lá Số Tử Vi</em> Trực Tuyến
          </h1>
          <p className="mt-3 max-w-2xl text-on-surface-variant">An đủ 12 cung, 14 chính tinh, hơn 90 phụ tinh, Tứ Hóa, Tuần – Triệt, đại hạn và tiểu hạn. AI đọc đúng lá số của bạn để bình giải.</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-glass px-4 py-3">
          <Icon name="schedule" className="text-[22px] text-primary-container" />
          <div>
            <div className="label-sm text-muted">Năm xem vận hạn</div>
            <div className="font-label text-label-lg text-primary">{viewYear}</div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        {/* LEFT: input + summary */}
        <div className="space-y-6">
          <section className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-serif text-headline-sm text-primary"><Icon name="tune" className="text-primary-container" /> Dữ Liệu Khởi Mệnh</h2>
              <span className="label-sm text-secondary">Âm Dương Lịch Pháp</span>
            </div>
            <ProfilePicker
              current={() => {
                const solar = calendar === "am" ? lunarToSolar(date.day, date.month, date.year, leap) : [date.day, date.month, date.year];
                return solar ? { name, gender, day: solar[0], month: solar[1], year: solar[2], hour } : null;
              }}
              onPick={(p) => {
                setName(p.name);
                setCalendar("duong");
                setLeap(false);
                setDate({ day: p.day, month: p.month, year: p.year });
                if (p.gender) setGender(p.gender);
                if (p.hour) setHour(p.hour);
              }}
            />
            <div className="space-y-4">
              <div>
                <label className="field-label">Họ và tên mệnh chủ</label>
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyễn Hoàng Minh" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Giới tính</label>
                  <div className="seg">
                    <button data-on={gender === "nam"} onClick={() => setGender("nam")}>Nam</button>
                    <button data-on={gender === "nu"} onClick={() => setGender("nu")}>Nữ</button>
                  </div>
                </div>
                <div>
                  <label className="field-label">Hệ lịch sinh</label>
                  <div className="seg">
                    <button data-on={calendar === "duong"} onClick={() => setCalendar("duong")}>Dương</button>
                    <button data-on={calendar === "am"} onClick={() => setCalendar("am")}>Âm</button>
                  </div>
                </div>
              </div>
              <DateFields {...date} onChange={setDate} lunar={calendar === "am"} minYear={1900} maxYear={2100} />
              {calendar === "am" && (
                <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input type="checkbox" checked={leap} onChange={(e) => setLeap(e.target.checked)} className="accent-[#00ff87]" /> Tháng nhuận
                </label>
              )}
              <div className="grid grid-cols-[1.4fr_1fr] gap-3">
                <div>
                  <label className="field-label">Giờ sinh (12 canh)</label>
                  <select className="field" value={hour} onChange={(e) => setHour(+e.target.value)}>
                    {GIO.map((g, i) => <option key={g.chi} value={i + 1}>{g.chi} ({g.range})</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Năm xem hạn</label>
                  <select className="field" value={viewYear} onChange={(e) => setViewYear(+e.target.value)}>
                    {range(now.getFullYear() - 5, now.getFullYear() + 5).map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn-primary w-full" onClick={run}><Icon name="auto_fix_high" className="text-[18px]" /> Lập lá số &amp; luận giải Tử Vi AI</button>
              {error && <p className="text-sm text-error">{error}</p>}
              <p className="text-[11px] text-muted">Sinh sau 23h tính là giờ Tý của ngày hôm sau. Tháng nhuận: ngày 1–15 tính theo tháng trước, 16 trở đi tính theo tháng sau.</p>
            </div>
          </section>

          {chart && (
            <section className="panel animate-fadeUp">
              <div className="mb-4 flex items-center justify-between">
                <span className="label flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary-container" /> Cốt cách bản mệnh</span>
                <span className="font-label text-label-md text-primary-container">{chart.canChiNam} · {chart.amDuong}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Mini k="Bản mệnh" v={chart.banMenh} s={chart.hanhMenh} />
                <Mini k="Cục số" v={chart.cuc} s={chart.quanHeMenhCuc} />
                <Mini k="Thân cư" v={chart.thanCu} s="Hậu vận" />
              </div>
              <dl className="mt-4 space-y-2 rounded-xl border border-white/[0.05] bg-glass/60 p-4 text-sm">
                <Row k="Âm lịch" v={`${chart.lunar.day}/${chart.lunar.month}${chart.lunar.leap ? " nhuận" : ""}/${chart.lunar.year}`} />
                <Row k="Dương lịch" v={`${chart.solar.day}/${chart.solar.month}/${chart.solar.year}`} />
                <Row k="Tứ trụ" v={`${chart.canChiNam} · ${chart.canChiThang} · ${chart.canChiNgay} · ${chart.canChiGio}`} />
                <Row k="Âm dương" v={chart.amDuongMenh} />
                <Row k="Mệnh chủ / Thân chủ" v={`${chart.menhChu} / ${chart.thanChu}`} />
                <Row k={`Lưu niên ${chart.input.viewYear}`} v={`${chart.luuNien.canChi} · tuổi mụ ${chart.tuoiMu}`} />
              </dl>
            </section>
          )}
        </div>

        {/* RIGHT: chart */}
        <div className="min-w-0 space-y-6">
          <section id="thien-ban" className="panel scroll-mt-24">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-serif text-headline-sm text-primary"><Icon name="grid_view" className="text-primary-container" /> Thiên Bàn 12 Cung Vị</h2>
              {chart && (
                <div className="flex flex-wrap gap-2">
                  <button className={`btn-ghost px-3 py-2 text-xs ${showAll ? "border-emerald text-primary-container" : ""}`} onClick={() => setShowAll((v) => !v)}>
                    <Icon name={showAll ? "visibility_off" : "visibility"} className="text-[16px]" /> {showAll ? "Chỉ sao chính" : "Hiện đủ sao"}
                  </button>
                  <button className="btn-ghost px-3 py-2 text-xs" disabled={exporting} onClick={exportImage}>
                    <Icon name="download" className="text-[16px]" /> {exporting ? "Đang tạo ảnh…" : "Tải ảnh lá số"}
                  </button>
                </div>
              )}
            </div>
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 font-label text-label-sm uppercase">
              <span className="text-primary-container">● Chính tinh</span>
              <span className="text-amber-300">● Tứ Hóa</span>
              <span className="text-emerald-mist">● Cát tinh</span>
              <span className="text-pink-300">● Đào hoa</span>
              <span className="text-error-soft">● Sát tinh / Hãm</span>
              {chart && <span className="normal-case tracking-normal text-muted">Bấm một cung để xem tam phương tứ chính · rê chuột vào sao để xem ý nghĩa</span>}
            </div>
            {!chart ? (
              <EmptyBoard />
            ) : (
              <div className="-mx-2 overflow-x-auto px-2 pb-2">
                <p className="mb-2 text-[11px] text-muted sm:hidden">Vuốt ngang để xem đủ 12 cung →</p>
                <div ref={boardRef} className={`min-w-[760px] ${exporting ? "w-[1100px] bg-abyss p-5" : ""}`}>
                  {exporting && <ExportHeader chart={chart} />}
                  <div className="grid grid-cols-4 grid-rows-4 gap-1.5">
                    {chart.palaces.map((p) => (
                      <PalaceCell key={p.chi} p={p} role={exporting ? null : roles[p.chi] ?? null} showAll={showAll || exporting} onClick={() => setSelected(p.chi)} onTip={onTip} onTipEnd={() => setTip(null)} />
                    ))}
                    <div className="relative col-start-2 col-end-4 row-start-2 row-end-4 overflow-hidden rounded-xl border border-emerald/20 bg-gradient-to-br from-emerald/[0.07] to-transparent">
                      {/* Đường tam hợp và xung chiếu vẽ trong Thiên Bàn (toạ độ lưới 4×4, ô giữa là [1..3]) */}
                      {selected && !exporting && (
                        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-60" viewBox="1 1 2 2" preserveAspectRatio="none" aria-hidden>
                          <polygon points={`${center(selected)} ${center(dich(selected, 4))} ${center(dich(selected, 8))}`} fill="rgba(0,255,135,0.04)" stroke="rgba(0,255,135,0.6)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeDasharray="5 4" />
                          <line x1={center(selected).split(",")[0]} y1={center(selected).split(",")[1]} x2={center(dich(selected, 6)).split(",")[0]} y2={center(dich(selected, 6)).split(",")[1]} stroke="rgba(252,211,77,0.75)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeDasharray="5 4" />
                        </svg>
                      )}
                      <div className="relative flex h-full flex-col justify-between p-5">
                        {exporting ? <ExportCenter chart={chart} /> : sel && <CenterInfo chart={chart} p={sel} />}
                      </div>
                    </div>
                  </div>
                  {exporting && <p className="mt-3 text-center text-[11px] text-muted">Lập bởi AetherAI · nội dung mang tính tham khảo</p>}
                </div>
              </div>
            )}
          </section>

          {chart && (
            <section className="glass overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
                <h2 className="flex items-center gap-2 font-serif text-headline-sm text-primary"><Icon name="psychology" className="text-primary-container" /> Tử Vi AI Luận Giải Chi Tiết</h2>
              </div>
              <div className="m-5 grid grid-cols-3 gap-1 rounded-lg border border-white/[0.06] bg-abyss p-1">
                {([["tong-quan", "Tổng quan bản thể"], ["van-han", `Vận hạn ${chart.input.viewYear} (${chart.luuNien.canChi})`], ["hoi-dap", "Hỏi đáp mệnh cục"]] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)} className={`rounded-md px-2 py-2.5 font-label text-label-md transition ${tab === id ? "bg-primary-container text-[#003919]" : "text-on-surface-variant hover:text-primary"}`}>{label}</button>
                ))}
              </div>
              <div className="px-5 pb-5">
                <div className={tab === "tong-quan" ? "" : "hidden"}>
                  <ChatPanel agent="tuvi" context={context} title="Tổng Quan Bản Thể" sessionKey={session}
                    autoPrompt="Hãy luận giải tổng quan lá số của tôi theo các mục: tính cách & bản lĩnh (cung Mệnh, Thân và tam phương tứ chính), công danh & sự nghiệp, tiền tài, tình duyên & gia đạo. Nêu cách cục nổi bật nếu có. Viết cô đọng."
                    suggestions={["Cung Quan Lộc của tôi hợp ngành nghề gì?", "Tình duyên của tôi đến sớm hay muộn?", "Điểm yếu lớn nhất trong lá số là gì?"]} />
                </div>
                <div className={tab === "van-han" ? "" : "hidden"}>
                  {tab === "van-han" || session ? (
                    <ChatPanel agent="tuvi" context={context} title={`Vận Hạn Năm ${chart.input.viewYear}`} sessionKey={tab === "van-han" ? `vh-${session}` : undefined}
                      autoPrompt={`Hãy luận giải vận hạn năm ${chart.input.viewYear} (${chart.luuNien.canChi}) của tôi dựa trên đại hạn hiện tại, tiểu hạn và lưu Tứ Hóa: công việc, tài chính, tình cảm, những tháng nên chủ động và điều cần lưu ý. Viết cô đọng, khoảng 300–400 từ.`}
                      suggestions={["Năm nay có nên đầu tư hay mua nhà?", "Tháng nào thuận lợi nhất trong năm?", "Đại vận 10 năm này của tôi thế nào?"]} />
                  ) : null}
                </div>
                <div className={tab === "hoi-dap" ? "" : "hidden"}>
                  <ChatPanel agent="tuvi" context={context} title="Hỏi Đáp Mệnh Cục" sessionKey={`hd-${session}`}
                    suggestions={sel ? [`Cung ${sel.name} của tôi có gì đặc biệt?`, "Lá số của tôi có cách cục gì?", "Tôi hợp làm chủ hay làm công?"] : []} />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {tip && <TipBox tip={tip} />}

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { i: "balance", t: "Cân bằng âm dương ngũ hành", d: "Âm lịch tính theo thuật toán Hồ Ngọc Đức, múi giờ Việt Nam, xử lý cả tháng nhuận." },
          { i: "account_tree", t: "An sao theo cổ pháp", d: "Bảng an sao đối chiếu với thư viện mã nguồn mở lasotuvi và khẩu quyết phổ biến tại Việt Nam." },
          { i: "shield", t: "Bảo mật lá số mệnh chủ", d: "Lá số được tính ngay trên trình duyệt; chỉ phần tóm tắt được gửi tới AI khi bạn yêu cầu luận giải." },
        ].map((x) => (
          <div key={x.t} className="panel flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald/10"><Icon name={x.i} className="text-primary-container" /></div>
            <div>
              <h3 className="font-label text-label-lg text-primary">{x.t}</h3>
              <p className="mt-1 text-sm text-on-surface-variant">{x.d}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function PalaceCell({ p, role, showAll, onClick, onTip, onTipEnd }: { p: Palace; role: Role; showAll: boolean; onClick: () => void; onTip: TipFn; onTipEnd: () => void }) {
  const [row, col] = GRID[p.chi];
  const chinh = p.stars.filter((s) => s.kind === "chinh");
  const hoa = p.stars.filter((s) => s.kind === "hoa");
  const others = p.stars.filter((s) =>
    showAll ? s.kind !== "chinh" && s.kind !== "hoa" : (s.kind === "cat" && IMPORTANT_CAT.has(s.name)) || (s.kind === "sat" && IMPORTANT_SAT.has(s.name)) || s.kind === "dao",
  );
  const isMenh = p.name === "Mệnh";
  const star = (s: Star) => {
    const [t, b] = starTip(s);
    return { onMouseEnter: (e: React.MouseEvent) => onTip(e, t, b), onMouseLeave: onTipEnd };
  };
  const ring =
    role === "sel" ? "border-primary-container bg-emerald/[0.10] shadow-glow"
    : role === "xung" ? "border-amber-300/60 bg-amber-300/[0.05]"
    : role === "hop" ? "border-emerald/60 bg-emerald/[0.05]"
    : isMenh ? "border-emerald/40 bg-emerald/[0.04]" : "border-white/[0.06] bg-glass/70 hover:border-emerald/30";
  return (
    <button
      onClick={onClick}
      style={{ gridRow: row, gridColumn: col }}
      className={`relative flex min-h-[168px] flex-col rounded-xl border p-2.5 text-left transition ${ring}`}
    >
      {role && role !== "sel" && (
        <span className={`absolute -top-2 right-2 rounded px-1.5 font-label text-[9px] font-semibold uppercase ${role === "xung" ? "bg-amber-300 text-black" : "bg-primary-container text-[#003919]"}`}>
          {role === "xung" ? "Xung chiếu" : "Tam hợp"}
        </span>
      )}
      <div
        className="flex items-start justify-between gap-1"
        onMouseEnter={(e) => onTip(e, `Cung ${p.name} · ${p.can} ${p.chiName}`, `${CUNG_Y_NGHIA[p.name]}. Cung ${p.chi % 2 ? "dương" : "âm"}, hành ${p.hanh}. Đại hạn ${p.daiHanStart}–${p.daiHanStart + 9} tuổi; tiểu hạn năm ${p.tieuHanChi}.`)}
        onMouseLeave={onTipEnd}
      >
        <span className={`font-label text-[11px] font-semibold uppercase tracking-wider ${isMenh ? "text-primary-container" : "text-secondary"}`}>{p.name}</span>
        <span className="text-[11px] text-muted">{p.can} {p.chiName}</span>
      </div>
      {(p.isThan || p.tuan || p.triet || p.isCurrentDaiHan || p.isCurrentTieuHan) && (
        <div className="mt-1 flex flex-wrap gap-1">
          {p.isThan && <Badge c="bg-primary-container text-[#003919]">Thân</Badge>}
          {p.tuan && <Badge c="bg-surface-container-highest text-on-surface">Tuần</Badge>}
          {p.triet && <Badge c="bg-surface-container-highest text-on-surface">Triệt</Badge>}
          {p.isCurrentDaiHan && <Badge c="border border-amber-300/40 text-amber-300">Đại vận</Badge>}
          {p.isCurrentTieuHan && <Badge c="border border-sky-300/40 text-sky-300">Tiểu hạn</Badge>}
        </div>
      )}
      <div className="mt-1.5 space-y-0.5">
        {chinh.length ? (
          chinh.map((s) => (
            <div key={s.name} className={`w-fit font-label text-[13px] font-semibold ${starColor(s)}`} {...star(s)}>
              {s.name}{s.brightness && <span className="ml-1 text-[10px] font-normal opacity-80">({s.brightness})</span>}
            </div>
          ))
        ) : (
          <div className="font-label text-[12px] italic text-muted">Vô Chính Diệu</div>
        )}
        {hoa.length > 0 && (
          <div className="text-[11px] text-amber-300">
            {hoa.map((s, i) => <span key={s.name} {...star(s)}>{s.name}{i < hoa.length - 1 ? ", " : ""}</span>)}
          </div>
        )}
        <div className="text-[11px] leading-[15px]">
          {others.map((s, i) => (
            <span key={s.name} className={starColor(s)} {...star(s)}>{s.name}{s.brightness && showAll ? ` (${s.brightness})` : ""}{i < others.length - 1 ? ", " : ""}</span>
          ))}
        </div>
      </div>
      <div className="mt-auto flex items-end justify-between pt-2 text-[11px]">
        <span className="text-muted" onMouseEnter={(e) => onTip(e, `Vòng Tràng Sinh: ${p.trangSinh}`, TRANG_SINH_Y_NGHIA[p.trangSinh] ?? "")} onMouseLeave={onTipEnd}>{p.trangSinh}</span>
        <span className="font-label text-primary-container" onMouseEnter={(e) => onTip(e, "Đại hạn", `Cung này cai quản vận 10 năm từ ${p.daiHanStart} đến ${p.daiHanStart + 9} tuổi (tuổi âm).`)} onMouseLeave={onTipEnd}>{p.daiHanStart}–{p.daiHanStart + 9}</span>
      </div>
    </button>
  );
}

function CenterInfo({ chart, p }: { chart: TuViChart; p: Palace }) {
  const chinh = p.stars.filter((s) => s.kind === "chinh");
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <div className="label-sm text-secondary">Trọng tâm bản số</div>
          <div className="font-serif text-[28px] leading-9 text-primary">Cung {p.name} ({p.chiName})</div>
          <div className="text-xs text-muted">{CUNG_Y_NGHIA[p.name]} · Hành {p.hanh} · Đại hạn {p.daiHanStart}–{p.daiHanStart + 9} · Tiểu hạn năm {p.tieuHanChi}</div>
        </div>
        <Icon name="radio_button_checked" className="text-[22px] text-primary-container" />
      </div>
      <div className="my-3 space-y-2">
        {chinh.length === 0 && <p className="text-sm text-on-surface-variant">Cung Vô Chính Diệu — mượn chính tinh cung đối diện để luận, chịu ảnh hưởng mạnh của phụ tinh trong cung.</p>}
        {chinh.map((s) => {
          const m = CHINH_TINH[s.name];
          return (
            <div key={s.name} className="rounded-lg border border-white/[0.05] bg-abyss/70 p-3">
              <div className="label-sm text-primary-container">{s.name} · {m.hanh} · {s.brightness ? BRIGHT_LABEL[s.brightness] : ""}</div>
              <p className="mt-1 text-sm text-on-surface">{m.tuongTrung}. {s.brightness === "H" ? m.xau : m.tot}</p>
            </div>
          );
        })}
        <div className="rounded-lg border border-white/[0.05] bg-abyss/50 p-3 text-xs leading-5">
          <div className="label-sm mb-1 text-secondary">Tam phương tứ chính</div>
          {[[6, "Xung chiếu", "text-amber-300"], [4, "Tam hợp", "text-primary-container"], [8, "Tam hợp", "text-primary-container"]].map(([n, label, c]) => {
            const q = chart.palaces[dich(p.chi, n as number) - 1];
            const cs = q.stars.filter((s) => s.kind === "chinh").map((s) => s.name).join(", ") || "Vô chính diệu";
            return (
              <div key={n as number}><span className={c as string}>{label as string}:</span> <span className="text-on-surface">{q.name} ({q.chiName})</span> <span className="text-muted">· {cs}</span></div>
            );
          })}
        </div>
        <div className="text-xs leading-5 text-on-surface-variant">
          <span className="text-muted">Các sao khác: </span>
          {p.stars.filter((s) => s.kind !== "chinh").map((s) => s.name).join(", ")}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-3 text-xs">
        <span className="text-muted">{chart.canChiNam} · {chart.cuc} · {chart.banMenh}</span>
        <span className="font-label text-primary-container">Lưu niên {chart.input.viewYear}: tiểu hạn tại {chart.palaces.find((x) => x.isCurrentTieuHan)?.name}</span>
      </div>
    </>
  );
}

function TipBox({ tip }: { tip: Tip }) {
  const below = tip.top < 140;
  const x = Math.min(Math.max(tip.x, 150), (typeof window !== "undefined" ? window.innerWidth : 1200) - 150);
  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[90] w-max max-w-[280px] rounded-lg border border-emerald/30 bg-[#0b1412]/95 px-3 py-2 text-left shadow-float backdrop-blur"
      style={{ left: x, top: below ? tip.bottom + 8 : tip.top - 8, transform: `translate(-50%, ${below ? "0" : "-100%"})` }}
    >
      <div className="font-label text-[12px] font-semibold text-primary-container">{tip.title}</div>
      {tip.body && <div className="mt-0.5 text-[12px] leading-[17px] text-on-surface">{tip.body}</div>}
    </div>
  );
}

function ExportHeader({ chart }: { chart: TuViChart }) {
  return (
    <div className="mb-4 flex items-end justify-between border-b border-emerald/20 pb-3">
      <div>
        <div className="label-sm text-secondary">Lá số Tử Vi</div>
        <div className="font-serif text-[30px] leading-9 text-primary">{chart.input.name || "Mệnh chủ"}</div>
      </div>
      <div className="text-right text-[13px] leading-5 text-on-surface-variant">
        <div>{chart.input.gender === "nam" ? "Nam" : "Nữ"} · Dương lịch {chart.solar.day}/{chart.solar.month}/{chart.solar.year} · giờ {chart.canChiGio}</div>
        <div>Âm lịch {chart.lunar.day}/{chart.lunar.month}{chart.lunar.leap ? " nhuận" : ""}/{chart.lunar.year} · {chart.canChiNam}</div>
      </div>
    </div>
  );
}

function ExportCenter({ chart }: { chart: TuViChart }) {
  const rows: [string, string][] = [
    ["Tứ trụ", `${chart.canChiNam} · ${chart.canChiThang} · ${chart.canChiNgay} · ${chart.canChiGio}`],
    ["Âm dương", `${chart.amDuong} · ${chart.amDuongMenh}`],
    ["Bản mệnh", `${chart.banMenh} (${chart.hanhMenh})`],
    ["Cục", `${chart.cuc} · ${chart.quanHeMenhCuc}`],
    ["Thân cư", chart.thanCu],
    ["Mệnh chủ / Thân chủ", `${chart.menhChu} / ${chart.thanChu}`],
    [`Lưu niên ${chart.input.viewYear}`, `${chart.luuNien.canChi} · tuổi mụ ${chart.tuoiMu}`],
  ];
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mb-3 text-center font-serif text-[26px] text-primary">Thiên Bàn</div>
      <dl className="space-y-1.5 text-[13px]">
        {rows.map(([k, v]) => <Row key={k} k={k} v={v} />)}
      </dl>
    </div>
  );
}

function EmptyBoard() {
  return (
    <div className="grid min-h-[420px] grid-cols-4 grid-rows-4 gap-1.5 opacity-60">
      {Object.entries(GRID).map(([chi, [r, c]]) => (
        <div key={chi} style={{ gridRow: r, gridColumn: c }} className="rounded-xl border border-dashed border-white/10 bg-glass/40" />
      ))}
      <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center rounded-xl border border-emerald/15 text-center">
        <Icon name="grid_on" className="text-[36px] text-primary-container" />
        <p className="mt-2 max-w-xs text-sm text-on-surface-variant">Nhập ngày giờ sinh bên trái rồi bấm “Lập lá số” để an sao lên Thiên bàn.</p>
      </div>
    </div>
  );
}

const Badge = ({ c, children }: { c: string; children: React.ReactNode }) => <span className={`rounded px-1.5 py-0.5 font-label text-[9px] font-semibold uppercase ${c}`}>{children}</span>;
const Mini = ({ k, v, s }: { k: string; v: string; s: string }) => (
  <div className="rounded-lg border border-white/[0.05] bg-glass/60 p-3">
    <div className="label-sm text-muted">{k}</div>
    <div className="mt-1 font-label text-[14px] font-semibold leading-5 text-primary">{v}</div>
    <div className="mt-0.5 text-[11px] text-emerald-mist">{s}</div>
  </div>
);
const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-3"><dt className="text-muted">{k}</dt><dd className="text-right text-emerald-mist">{v}</dd></div>
);
