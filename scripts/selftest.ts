// Kiểm thử nhanh: npm test
import assert from "node:assert/strict";
import { solarToLunar, lunarToSolar, canChiYear } from "../lib/lunar";
import { lifePath, computeNumerology, nameNumbers } from "../lib/numerology";
import { lapLaSo } from "../lib/tuvi";
import { DECK } from "../lib/tarot";

// Âm lịch
const tet2026 = solarToLunar(17, 2, 2026);
assert.deepEqual([tet2026.day, tet2026.month, tet2026.year], [1, 1, 2026]);
assert.equal(canChiYear(2026), "Bính Ngọ");
const tet1985 = solarToLunar(21, 1, 1985); // Tết 1985 VN sớm hơn TQ 1 ngày
assert.deepEqual([tet1985.day, tet1985.month], [1, 1]);
assert.deepEqual(lunarToSolar(1, 1, 2026, false), [17, 2, 2026]);
// Thần số học
assert.equal(lifePath(10, 2, 1990), 22);
assert.equal(lifePath(16, 7, 1995), 11);
assert.equal(computeNumerology("", 16, 7, 1995, 2026, 10).chart[9], 2);
assert.ok(nameNumbers("Nguyễn Văn An").expression > 0);
// Tử vi
const c = lapLaSo({ name: "", gender: "nam", day: 15, month: 8, year: 1995, calendar: "duong", hour: 5, viewYear: 2026 });
assert.equal(c.canChiNam, "Ất Hợi");
assert.equal(c.palaces.filter((p) => p.stars.some((s) => s.kind === "chinh")).length >= 8, true);
assert.equal(c.palaces.flatMap((p) => p.stars).filter((s) => s.kind === "chinh").length, 14);
// Tarot
assert.equal(DECK.length, 78);
assert.equal(new Set(DECK.map((d) => d.id)).size, 78);
console.log("✓ Tất cả kiểm thử đều đạt");
