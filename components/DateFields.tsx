"use client";

export function range(a: number, b: number) {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

export default function DateFields({
  day, month, year, onChange, minYear = 1920, maxYear = new Date().getFullYear(), lunar = false,
}: {
  day: number; month: number; year: number;
  onChange: (v: { day: number; month: number; year: number }) => void;
  minYear?: number; maxYear?: number; lunar?: boolean;
}) {
  const days = lunar ? 30 : new Date(year, month, 0).getDate();
  return (
    <div className="grid grid-cols-[1fr_1.3fr_1.1fr] gap-2">
      <div>
        <label className="field-label">Ngày</label>
        <select className="field" value={day} onChange={(e) => onChange({ day: +e.target.value, month, year })}>
          {range(1, days).map((d) => <option key={d} value={d}>{String(d).padStart(2, "0")}</option>)}
        </select>
      </div>
      <div>
        <label className="field-label">Tháng</label>
        <select className="field" value={month} onChange={(e) => onChange({ day: Math.min(day, lunar ? 30 : new Date(year, +e.target.value, 0).getDate()), month: +e.target.value, year })}>
          {range(1, 12).map((m) => <option key={m} value={m}>Tháng {String(m).padStart(2, "0")}</option>)}
        </select>
      </div>
      <div>
        <label className="field-label">Năm</label>
        <select className="field" value={year} onChange={(e) => onChange({ day, month, year: +e.target.value })}>
          {range(minYear, maxYear).reverse().map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}
