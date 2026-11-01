"use client";
import { useMemo, useState } from "react";
import AstroWheel from "@/components/AstroWheel";
import ChatPanel from "@/components/ChatPanel";
import DateFields, { range } from "@/components/DateFields";
import Icon from "@/components/Icon";
import ProfilePicker from "@/components/ProfilePicker";
import { HOUSE_MEANING, PLANETS, SIGNS, chartToText, computeChart, fmtDeg, signName, type AstroChart } from "@/lib/astro";
import { PLACES, suggestTz } from "@/lib/places";

const CUSTOM = "__custom";

export default function ChiemTinhClient() {
  const [name, setName] = useState("");
  const [date, setDate] = useState({ day: 15, month: 8, year: 1995 });
  const [time, setTime] = useState({ h: 8, m: 30 });
  const [timeKnown, setTimeKnown] = useState(true);
  const [placeName, setPlaceName] = useState(PLACES[0].name);
  const [custom, setCustom] = useState({ lat: "21.03", lon: "105.85" });
  const [tzOverride, setTzOverride] = useState<string | null>(null);
  const [chart, setChart] = useState<AstroChart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<string | undefined>();

  const place = PLACES.find((p) => p.name === placeName);
  const autoTz = place ? suggestTz(place, date.year, date.month, date.day) : 7;
  const tz = tzOverride !== null ? Number(tzOverride) : autoTz;
  const southWar = place?.vn && autoTz === 8;

  const run = () => {
    setError(null);
    const lat = place ? place.lat : Number(custom.lat), lon = place ? place.lon : Number(custom.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 66 || Math.abs(lon) > 180) return setError("Tọa độ chưa hợp lệ (vĩ độ trong khoảng −66 đến 66, kinh độ −180 đến 180).");
    if (!Number.isFinite(tz) || Math.abs(tz) > 14) return setError("Múi giờ chưa hợp lệ.");
    try {
      const c = computeChart({ name, ...date, hour: time.h, minute: time.m, tz, lat, lon, place: place?.name ?? `${lat}, ${lon}`, timeKnown });
      setChart(c);
      setSession(String(Date.now()));
      setTimeout(() => document.getElementById("ban-do")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tính được bản đồ sao.");
    }
  };

  const context = useMemo(() => (chart ? chartToText(chart) : ""), [chart]);
  const big3 = chart
    ? [
        { k: "Mặt Trời", g: "☉", sign: chart.planets[0].sign, house: chart.planets[0].house, d: "Bản ngã, mục tiêu sống" },
        { k: "Mặt Trăng", g: "☽", sign: chart.planets[1].sign, house: chart.planets[1].house, d: "Cảm xúc, nhu cầu bên trong" },
        ...(chart.asc !== null ? [{ k: "Cung Mọc", g: "ASC", sign: Math.floor(chart.asc / 30), house: 1, d: "Hình ảnh bạn thể hiện ra ngoài" }] : []),
      ]
    : [];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-5 py-8 md:px-6">
      <section>
        <span className="chip mb-3"><Icon name="public" className="text-[12px]" /> Hoàng đạo nhiệt đới · Hệ nhà Placidus</span>
        <h1 className="font-serif text-[40px] leading-[46px] text-primary md:text-headline-xl">
          Bản Đồ Sao <em className="text-primary-container">Chiêm Tinh</em> Cá Nhân
        </h1>
        <p className="mt-3 max-w-2xl text-on-surface-variant">Vị trí Mặt Trời, Mặt Trăng, Cung Mọc, 8 hành tinh, 12 nhà và các góc chiếu vào đúng khoảnh khắc bạn chào đời — tính bằng lịch thiên văn chính xác, AI luận giải riêng cho bạn.</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <section className="panel self-start">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-headline-sm text-primary"><Icon name="tune" className="text-primary-container" /> Thông Tin Ra Đời</h2>
          <ProfilePicker current={() => ({ name, ...date })} onPick={(p) => { setName(p.name); setDate({ day: p.day, month: p.month, year: p.year }); setTzOverride(null); }} />
          <div className="space-y-4">
            <div>
              <label className="field-label">Họ tên (tùy chọn)</label>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyễn Hoàng Minh" />
            </div>
            <DateFields {...date} onChange={(d) => { setDate(d); setTzOverride(null); }} minYear={1900} maxYear={2100} />
            <div>
              <label className="field-label">Giờ sinh (giờ đồng hồ lúc đó)</label>
              <div className="grid grid-cols-2 gap-3">
                <select className="field" disabled={!timeKnown} value={time.h} onChange={(e) => setTime({ ...time, h: +e.target.value })}>
                  {range(0, 23).map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")} giờ</option>)}
                </select>
                <select className="field" disabled={!timeKnown} value={time.m} onChange={(e) => setTime({ ...time, m: +e.target.value })}>
                  {range(0, 59).map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")} phút</option>)}
                </select>
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm text-on-surface-variant">
                <input type="checkbox" checked={!timeKnown} onChange={(e) => setTimeKnown(!e.target.checked)} className="accent-[#00ff87]" /> Tôi không biết giờ sinh
              </label>
              {!timeKnown && <p className="mt-1 text-xs text-muted">Sẽ tính lúc 12 giờ trưa và bỏ Cung Mọc, 12 nhà. Mặt Trăng có thể lệch vài độ.</p>}
            </div>
            <div>
              <label className="field-label">Nơi sinh</label>
              <select className="field" value={placeName} onChange={(e) => { setPlaceName(e.target.value); setTzOverride(null); }}>
                <optgroup label="Việt Nam">{PLACES.filter((p) => p.vn).map((p) => <option key={p.name}>{p.name}</option>)}</optgroup>
                <optgroup label="Nước ngoài">{PLACES.filter((p) => !p.vn).map((p) => <option key={p.name}>{p.name}</option>)}</optgroup>
                <option value={CUSTOM}>Nơi khác — tự nhập tọa độ…</option>
              </select>
              {!place && (
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <input className="field" inputMode="decimal" value={custom.lat} onChange={(e) => setCustom({ ...custom, lat: e.target.value })} placeholder="Vĩ độ, vd. 21.03" aria-label="Vĩ độ" />
                  <input className="field" inputMode="decimal" value={custom.lon} onChange={(e) => setCustom({ ...custom, lon: e.target.value })} placeholder="Kinh độ, vd. 105.85" aria-label="Kinh độ" />
                </div>
              )}
            </div>
            <div>
              <label className="field-label">Múi giờ (UTC)</label>
              <input className="field" type="number" step="0.5" value={tzOverride ?? String(autoTz)} onChange={(e) => setTzOverride(e.target.value)} />
              <p className="mt-1 text-xs text-muted">
                {southWar ? "Miền Nam Việt Nam dùng giờ UTC+8 từ 1960 đến 6/1975 — đã tự chọn +8." : place && !place.vn ? "Nếu lúc đó nơi sinh đang dùng giờ mùa hè, hãy cộng thêm 1." : "Tự điền theo nơi và năm sinh; có thể sửa nếu biết chắc."}
              </p>
            </div>
            <button className="btn-primary w-full" onClick={run}><Icon name="auto_awesome" className="text-[18px]" /> Lập bản đồ sao</button>
            {error && <p className="text-sm text-error">{error}</p>}
          </div>
        </section>

        <section id="ban-do" className="panel min-w-0 scroll-mt-24">
          {!chart ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <Icon name="public" className="text-[44px] text-primary-container" />
              <p className="mt-3 max-w-sm text-on-surface-variant">Nhập ngày, giờ và nơi sinh rồi bấm “Lập bản đồ sao” để xem vòng 12 cung hoàng đạo của bạn.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="mx-auto w-full max-w-[600px]"><AstroWheel chart={chart} /></div>
              <div className="space-y-4">
                {big3.map((b) => (
                  <div key={b.k} className="rounded-xl border border-emerald/20 bg-emerald/[0.04] p-4">
                    <div className="label-sm text-secondary">{b.k} · {b.d}</div>
                    <div className="mt-1 flex items-center gap-2 font-serif text-[24px] text-primary">
                      <span className="text-primary-container">{SIGNS[b.sign].glyph}{"︎"}</span> {SIGNS[b.sign].vi}
                    </div>
                    <div className="text-xs text-muted">{SIGNS[b.sign].element} · {SIGNS[b.sign].mode}{b.house && b.k !== "Cung Mọc" ? ` · nhà ${b.house}` : ""}</div>
                  </div>
                ))}
                {chart.asc === null && <p className="text-xs text-muted">Không có giờ sinh nên chưa xác định được Cung Mọc và 12 nhà.</p>}
                <Balance title="Nguyên tố" data={chart.elements} />
                <Balance title="Tính chất" data={chart.modes} />
              </div>
            </div>
          )}
        </section>
      </div>

      {chart && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="panel overflow-x-auto">
              <h3 className="mb-3 font-serif text-headline-sm text-primary">Vị Trí Các Hành Tinh</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-secondary"><th className="py-2 font-semibold">Hành tinh</th><th className="font-semibold">Cung</th><th className="font-semibold">Độ</th>{chart.cusps && <th className="font-semibold">Nhà</th>}</tr></thead>
                <tbody>
                  {chart.planets.map((p) => (
                    <tr key={p.id} className="border-t border-white/[0.06]" title={PLANETS.find((x) => x.id === p.id)?.meaning}>
                      <td className="py-2 text-on-surface"><span className="mr-2 inline-block w-5 text-center text-primary-container">{p.glyph}{"︎"}</span>{p.vi}</td>
                      <td>{SIGNS[p.sign].glyph}{"︎"} {SIGNS[p.sign].vi}</td>
                      <td className="text-on-surface-variant">{fmtDeg(p.lon)}{p.retro && p.id !== "node" ? <span className="ml-1 text-error-soft" title="Nghịch hành">℞</span> : ""}</td>
                      {chart.cusps && <td className="text-primary-container">{p.house}</td>}
                    </tr>
                  ))}
                  {chart.asc !== null && (
                    <>
                      <tr className="border-t border-white/[0.06]"><td className="py-2 font-semibold text-primary-container">Cung Mọc (ASC)</td><td>{signName(chart.asc)}</td><td className="text-on-surface-variant">{fmtDeg(chart.asc)}</td><td>1</td></tr>
                      <tr className="border-t border-white/[0.06]"><td className="py-2 font-semibold text-primary-container">Thiên Đỉnh (MC)</td><td>{signName(chart.mc!)}</td><td className="text-on-surface-variant">{fmtDeg(chart.mc!)}</td><td>10</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </section>
            <section className="panel overflow-x-auto">
              <h3 className="mb-3 font-serif text-headline-sm text-primary">Góc Chiếu Chính</h3>
              <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
                {chart.aspects.slice(0, 24).map((a, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={`w-5 text-center ${a.type.tone === "hard" ? "text-error-soft" : a.type.tone === "soft" ? "text-sky-300" : "text-amber-300"}`}>{a.type.glyph}</span>
                    <span className="text-on-surface">{a.a} <span className="text-muted">{a.type.vi}</span> {a.b}</span>
                    <span className="ml-auto text-xs text-muted">{a.orb.toFixed(1)}°</span>
                  </li>
                ))}
              </ul>
              {chart.cusps && (
                <>
                  <h3 className="mb-2 mt-6 font-serif text-[20px] text-primary">12 Nhà ({chart.houseSystem})</h3>
                  <ul className="grid gap-1 text-xs sm:grid-cols-2">
                    {chart.cusps.map((c, i) => (
                      <li key={i} title={HOUSE_MEANING[i]}><span className="text-primary-container">Nhà {i + 1}</span> · {signName(c)} {fmtDeg(c)} <span className="text-muted">— {HOUSE_MEANING[i]}</span></li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>

          <ChatPanel
            agent="astro"
            context={context}
            title="Luận Giải Bản Đồ Sao"
            sessionKey={session}
            autoPrompt="Hãy luận giải bản đồ sao của tôi theo đúng bố cục đã quy định."
            suggestions={["Bản đồ sao nói gì về sự nghiệp của tôi?", "Tôi hợp với người thuộc cung nào?", "Sao Thổ của tôi cho thấy bài học gì?"]}
            placeholder="Hỏi thêm về bản đồ sao của bạn…"
          />
        </>
      )}
    </div>
  );
}

function Balance({ title, data }: { title: string; data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  return (
    <div>
      <div className="label-sm mb-1.5 text-muted">{title}</div>
      <div className="space-y-1">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-xs">
            <span className="w-20 text-on-surface-variant">{k}</span>
            <div className="h-1.5 flex-1 rounded-full bg-white/[0.06]"><div className="h-1.5 rounded-full bg-primary-container" style={{ width: `${(v / total) * 100}%` }} /></div>
            <span className="w-4 text-right text-muted">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
