// Engine lập lá số Tử Vi Đẩu Số.
// Port có chỉnh sửa từ thư viện mã nguồn mở lasotuvi (doanguyen, MIT) — https://github.com/doanguyen/lasotuvi
// Quy ước nội bộ: cung đánh số Tý = 1 … Hợi = 12; can Giáp = 1 … Quý = 10; giờ Tý = 1 … Hợi = 12.
// Đã thay bảng Thiên Khôi/Thiên Việt bằng khẩu quyết phổ biến ở VN:
// "Giáp Mậu Canh ngưu dương, Ất Kỷ thử hầu hương, Bính Đinh trư kê vị, Nhâm Quý thố xà tàng, Lục Tân phùng mã hổ".

import { solarToLunar, lunarToSolar, CAN, CHI, jdFromDate } from "./lunar";

export type StarKind = "chinh" | "cat" | "sat" | "hoa" | "dao" | "phu";
export type Brightness = "M" | "V" | "Đ" | "B" | "H";

export interface Star {
  name: string;
  kind: StarKind;
  brightness?: Brightness;
}

export interface Palace {
  chi: number; // 1..12
  chiName: string;
  hanh: string;
  can: string;
  name: string; // cung chức năng: Mệnh, Phụ Mẫu…
  isThan: boolean;
  stars: Star[];
  trangSinh: string;
  daiHanStart: number;
  tieuHanChi: string;
  tuan: boolean;
  triet: boolean;
  isCurrentDaiHan: boolean;
  isCurrentTieuHan: boolean;
}

export interface TuViInput {
  name: string;
  gender: "nam" | "nu";
  day: number;
  month: number;
  year: number;
  calendar: "duong" | "am";
  leapMonth?: boolean;
  hour: number; // 1..12 (Tý..Hợi)
  viewYear: number;
}

export interface TuViChart {
  input: TuViInput;
  solar: { day: number; month: number; year: number };
  lunar: { day: number; month: number; year: number; leap: boolean };
  canChiNam: string;
  canChiThang: string;
  canChiNgay: string;
  canChiGio: string;
  amDuong: string; // Dương Nam / Âm Nữ…
  banMenh: string; // nạp âm
  hanhMenh: string;
  cuc: string;
  cucSo: number;
  quanHeMenhCuc: string;
  amDuongMenh: string;
  menhChu: string;
  thanChu: string;
  menhChi: number;
  thanChi: number;
  thanCu: string; // cung chức năng mà Thân đóng
  palaces: Palace[]; // index 0 = Tý … 11 = Hợi
  tuoiMu: number;
  luuNien: { canChi: string; tuHoa: { loc: string; quyen: string; khoa: string; ky: string } };
}

// ---------- tiện ích ----------
const dich = (start: number, ...steps: number[]) => {
  let v = start;
  for (const s of steps) v += s;
  const r = ((v % 12) + 12) % 12;
  return r === 0 ? 12 : r;
};
const khoangCach = (c1: number, c2: number, chieu: number) => (chieu === 1 ? (c1 - c2 + 12) % 12 : (c2 - c1 + 12) % 12);

const CHI_NAMES = ["", ...CHI];
const CAN_NAMES = ["", ...CAN];
const HANH_CUNG = ["", "Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Hỏa", "Hỏa", "Thổ", "Kim", "Kim", "Thổ", "Thủy"];
const CAN_AM_DUONG = [0, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1];
const LOC_TON = [0, 3, 4, 6, 7, 6, 7, 9, 10, 12, 1];
const KHOI = [0, 2, 1, 12, 12, 2, 1, 2, 7, 4, 4];
const MENH_CHU = ["", "Tham Lang", "Cự Môn", "Lộc Tồn", "Văn Khúc", "Liêm Trinh", "Vũ Khúc", "Phá Quân", "Vũ Khúc", "Liêm Trinh", "Văn Khúc", "Lộc Tồn", "Cự Môn"];
const THAN_CHU = ["", "Linh Tinh", "Thiên Tướng", "Thiên Lương", "Thiên Đồng", "Văn Xương", "Thiên Cơ", "Hỏa Tinh", "Thiên Tướng", "Thiên Lương", "Thiên Đồng", "Văn Xương", "Thiên Cơ"];

// Nạp âm 60 hoa giáp: index = (6*can - 5*chi) mod 60 (0-indexed), mỗi cặp dùng chung một nạp âm.
const NAP_AM: [string, string][] = [
  ["Hải Trung Kim", "Kim"], ["Lư Trung Hỏa", "Hỏa"], ["Đại Lâm Mộc", "Mộc"], ["Lộ Bàng Thổ", "Thổ"], ["Kiếm Phong Kim", "Kim"],
  ["Sơn Đầu Hỏa", "Hỏa"], ["Giản Hạ Thủy", "Thủy"], ["Thành Đầu Thổ", "Thổ"], ["Bạch Lạp Kim", "Kim"], ["Dương Liễu Mộc", "Mộc"],
  ["Tuyền Trung Thủy", "Thủy"], ["Ốc Thượng Thổ", "Thổ"], ["Tích Lịch Hỏa", "Hỏa"], ["Tùng Bách Mộc", "Mộc"], ["Trường Lưu Thủy", "Thủy"],
  ["Sa Trung Kim", "Kim"], ["Sơn Hạ Hỏa", "Hỏa"], ["Bình Địa Mộc", "Mộc"], ["Bích Thượng Thổ", "Thổ"], ["Kim Bạch Kim", "Kim"],
  ["Phú Đăng Hỏa", "Hỏa"], ["Thiên Hà Thủy", "Thủy"], ["Đại Trạch Thổ", "Thổ"], ["Thoa Xuyến Kim", "Kim"], ["Tang Đố Mộc", "Mộc"],
  ["Đại Khê Thủy", "Thủy"], ["Sa Trung Thổ", "Thổ"], ["Thiên Thượng Hỏa", "Hỏa"], ["Thạch Lựu Mộc", "Mộc"], ["Đại Hải Thủy", "Thủy"],
];
/** can 1..10, chi 1..12 */
export function napAm(can: number, chi: number): { name: string; hanh: string } {
  const i = (((6 * (can - 1) - 5 * (chi - 1)) % 60) + 60) % 60;
  const [name, hanh] = NAP_AM[Math.floor(i / 2)];
  return { name, hanh };
}
const CUC: Record<string, [number, string]> = {
  Thủy: [2, "Thủy Nhị Cục"], Mộc: [3, "Mộc Tam Cục"], Kim: [4, "Kim Tứ Cục"], Thổ: [5, "Thổ Ngũ Cục"], Hỏa: [6, "Hỏa Lục Cục"],
};
// Ngũ hành sinh: Mộc→Hỏa→Thổ→Kim→Thủy→Mộc
const SINH: Record<string, string> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
const KHAC: Record<string, string> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };
function quanHe(menh: string, cuc: string) {
  if (menh === cuc) return "Cục hòa Bản Mệnh";
  if (SINH[cuc] === menh) return "Cục sinh Bản Mệnh (tốt)";
  if (SINH[menh] === cuc) return "Bản Mệnh sinh Cục";
  if (KHAC[menh] === cuc) return "Bản Mệnh khắc Cục";
  return "Cục khắc Bản Mệnh (kém)";
}

/** can của một cung theo Ngũ hổ độn */
function canCung(canNam: number, chi: number) {
  const canDan = ((canNam * 2 + 1) % 10) || 10; // Giáp→Bính(3)
  const c = (((canDan - 1 + ((chi - 3 + 12) % 12)) % 10) + 10) % 10;
  return c + 1;
}

function timTuVi(cuc: number, ngay: number) {
  let cungDan = 3;
  let c = cuc;
  while (c < ngay) {
    c += cuc;
    cungDan += 1;
  }
  let lech = c - ngay;
  if (lech % 2 === 1) lech = -lech;
  return dich(cungDan, lech);
}

function timHoaLinh(chiNam: number, gio: number, gioiTinh: number, amDuongNam: number): [number, number] {
  let h: number, l: number;
  if ([3, 7, 11].includes(chiNam)) [h, l] = [2, 4];
  else if ([1, 5, 9].includes(chiNam)) [h, l] = [3, 11];
  else if ([6, 10, 2].includes(chiNam)) [h, l] = [4, 11];
  else [h, l] = [10, 11];
  if (gioiTinh * amDuongNam === 1) return [dich(h - 1, gio), dich(l + 1, -gio)];
  return [dich(h + 1, -gio), dich(l - 1, gio)];
}

// Độ sáng (index 1..12 theo Tý..Hợi). Nguồn: lasotuvi / cụ Thiên Lương.
const DAC_TINH: Record<string, (Brightness | null)[]> = {
  "Tử Vi": [null, "B", "Đ", "M", "B", "V", "M", "M", "Đ", "M", "B", "V", "B"],
  "Liêm Trinh": [null, "V", "Đ", "V", "H", "M", "H", "V", "Đ", "V", "H", "M", "H"],
  "Thiên Đồng": [null, "V", "H", "M", "Đ", "H", "Đ", "H", "H", "M", "H", "H", "Đ"],
  "Vũ Khúc": [null, "V", "M", "V", "Đ", "M", "H", "V", "M", "V", "Đ", "M", "H"],
  "Thái Dương": [null, "H", "Đ", "V", "V", "V", "M", "M", "Đ", "H", "H", "H", "H"],
  "Thiên Cơ": [null, "Đ", "Đ", "H", "M", "M", "V", "Đ", "Đ", "V", "M", "M", "H"],
  "Thiên Phủ": [null, "M", "B", "M", "B", "V", "Đ", "M", "Đ", "M", "B", "V", "Đ"],
  "Thái Âm": [null, "V", "Đ", "H", "H", "H", "H", "H", "Đ", "V", "M", "M", "M"],
  "Tham Lang": [null, "H", "M", "Đ", "H", "V", "H", "H", "M", "Đ", "H", "V", "H"],
  "Cự Môn": [null, "V", "H", "V", "M", "H", "H", "V", "H", "Đ", "M", "H", "Đ"],
  "Thiên Tướng": [null, "V", "Đ", "M", "H", "V", "Đ", "V", "Đ", "M", "H", "V", "Đ"],
  "Thiên Lương": [null, "V", "Đ", "V", "V", "M", "H", "M", "Đ", "V", "H", "M", "H"],
  "Thất Sát": [null, "M", "Đ", "M", "H", "H", "V", "M", "Đ", "M", "H", "H", "V"],
  "Phá Quân": [null, "M", "V", "H", "H", "Đ", "H", "M", "V", "H", "H", "Đ", "H"],
  "Đà La": [null, "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H"],
  "Kình Dương": [null, "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H"],
  "Linh Tinh": [null, "H", "H", "Đ", "Đ", "Đ", "Đ", "Đ", "H", "H", "H", "H", "H"],
  "Hỏa Tinh": [null, "H", "H", "Đ", "Đ", "Đ", "Đ", "Đ", "H", "H", "H", "H", "H"],
  "Văn Xương": [null, "H", "Đ", "H", "Đ", "H", "Đ", "H", "Đ", "H", "H", "Đ", "Đ"],
  "Văn Khúc": [null, "H", "Đ", "H", "Đ", "H", "Đ", "H", "Đ", "H", "H", "Đ", "Đ"],
  "Địa Không": [null, "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ"],
  "Địa Kiếp": [null, "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ"],
};

const KIND: Record<string, StarKind> = {};
const reg = (k: StarKind, ...names: string[]) => names.forEach((n) => (KIND[n] = k));
reg("chinh", "Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh", "Thiên Phủ", "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương", "Thất Sát", "Phá Quân");
reg("cat", "Tả Phù", "Hữu Bật", "Văn Xương", "Văn Khúc", "Thiên Khôi", "Thiên Việt", "Lộc Tồn", "Thiên Mã", "Ân Quang", "Thiên Quý", "Long Trì", "Phượng Các", "Tam Thai", "Bát Tọa", "Thiên Quan", "Thiên Phúc", "Thiên Đức", "Nguyệt Đức", "Phúc Đức", "Long Đức", "Giải Thần", "Thiên Giải", "Địa Giải", "Quốc Ấn", "Đường Phù", "Thai Phụ", "Phong Cáo", "Văn Tinh", "Thanh Long", "Hỷ Thần", "Thiên Tài", "Thiên Thọ", "Thiên Trù", "Bác Sĩ", "Lực Sĩ", "Tấu Thư", "Tướng Quân", "Thiên Y", "Đẩu Quân");
reg("sat", "Kình Dương", "Đà La", "Hỏa Tinh", "Linh Tinh", "Địa Không", "Địa Kiếp", "Thiên Hình", "Kiếp Sát", "Thiên Không", "Đại Hao", "Tiểu Hao", "Tang Môn", "Bạch Hổ", "Thiên Khốc", "Thiên Hư", "Cô Thần", "Quả Tú", "Phá Toái", "Thiên La", "Địa Võng", "Thiên Thương", "Thiên Sứ", "Lưu Hà", "Phi Liêm", "Bệnh Phù", "Quan Phù", "Tuế Phá", "Điếu Khách", "Trực Phù", "Tử Phù", "Phục Binh", "Thái Tuế", "Thiếu Dương", "Thiếu Âm");
reg("hoa", "Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ");
reg("dao", "Đào Hoa", "Hồng Loan", "Thiên Hỷ", "Thiên Riêu", "Hoa Cái");

const TU_HOA: [string, string, string, string][] = [
  ["", "", "", ""],
  ["Liêm Trinh", "Phá Quân", "Vũ Khúc", "Thái Dương"],
  ["Thiên Cơ", "Thiên Lương", "Tử Vi", "Thái Âm"],
  ["Thiên Đồng", "Thiên Cơ", "Văn Xương", "Liêm Trinh"],
  ["Thái Âm", "Thiên Đồng", "Thiên Cơ", "Cự Môn"],
  ["Tham Lang", "Thái Âm", "Hữu Bật", "Thiên Cơ"],
  ["Vũ Khúc", "Tham Lang", "Thiên Lương", "Văn Khúc"],
  ["Thái Dương", "Vũ Khúc", "Thiên Đồng", "Thái Âm"],
  ["Cự Môn", "Thái Dương", "Văn Khúc", "Văn Xương"],
  ["Thiên Lương", "Tử Vi", "Thiên Phủ", "Vũ Khúc"],
  ["Phá Quân", "Cự Môn", "Thái Âm", "Tham Lang"],
];

const TRANG_SINH = ["Tràng Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy", "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"];
const CUNG_CHUC_NANG = ["Mệnh", "Phụ Mẫu", "Phúc Đức", "Điền Trạch", "Quan Lộc", "Nô Bộc", "Thiên Di", "Tật Ách", "Tài Bạch", "Tử Tức", "Phu Thê", "Huynh Đệ"];

export function lapLaSo(input: TuViInput): TuViChart {
  // 1. Ngày âm / dương
  let lunar: { day: number; month: number; year: number; leap: boolean };
  let solar: { day: number; month: number; year: number };
  if (input.calendar === "duong") {
    const l = solarToLunar(input.day, input.month, input.year);
    lunar = { day: l.day, month: l.month, year: l.year, leap: l.leap };
    solar = { day: input.day, month: input.month, year: input.year };
  } else {
    lunar = { day: input.day, month: input.month, year: input.year, leap: !!input.leapMonth };
    const s = lunarToSolar(input.day, input.month, input.year, !!input.leapMonth);
    if (!s) throw new Error("Tháng nhuận không hợp lệ cho năm này.");
    solar = { day: s[0], month: s[1], year: s[2] };
  }

  const nn = lunar.day;
  // Tháng nhuận: nửa đầu (1–15) tính theo tháng trước, nửa sau tính theo tháng sau.
  let tt = lunar.month;
  if (lunar.leap && nn > 15) tt = (tt % 12) + 1;
  const gio = input.hour;
  const gioiTinh = input.gender === "nam" ? 1 : -1;
  const canNam = ((lunar.year + 6) % 10) + 1;
  const chiNam = ((lunar.year + 8) % 12) + 1;
  const amDuongNam = CAN_AM_DUONG[canNam];
  const chieu = gioiTinh * amDuongNam; // 1: Dương Nam / Âm Nữ → thuận

  // 2. Cung Mệnh, Thân, 12 cung
  const menh = dich(3, tt - 1, -gio + 1);
  const than = dich(3, tt - 1, gio - 1);
  const palaces: Palace[] = [];
  for (let c = 1; c <= 12; c++) {
    palaces.push({
      chi: c, chiName: CHI_NAMES[c], hanh: HANH_CUNG[c], can: CAN_NAMES[canCung(canNam, c)],
      name: CUNG_CHUC_NANG[(c - menh + 12) % 12], isThan: c === than, stars: [], trangSinh: "",
      daiHanStart: 0, tieuHanChi: "", tuan: false, triet: false, isCurrentDaiHan: false, isCurrentTieuHan: false,
    });
  }
  const P = (c: number) => palaces[c - 1];
  const add = (c: number, ...names: string[]) => {
    for (const n of names) {
      const b = DAC_TINH[n]?.[c] ?? undefined;
      P(c).stars.push({ name: n, kind: KIND[n] ?? "phu", brightness: b ?? undefined });
    }
  };

  // 3. Cục
  const canMenh = canCung(canNam, menh);
  const hanhCuc = napAm(canMenh, menh).hanh;
  const [cucSo, cucTen] = CUC[hanhCuc];
  const banMenh = napAm(canNam, chiNam);

  // 4. Đại hạn, tiểu hạn
  for (const p of palaces) p.daiHanStart = cucSo + khoangCach(p.chi, menh, chieu) * 10;
  const khoiHan = dich(11, -3 * (chiNam - 1));
  const tyNam1 = dich(khoiHan, -gioiTinh * (chiNam - 1));
  for (const p of palaces) p.tieuHanChi = CHI_NAMES[khoangCach(p.chi, tyNam1, gioiTinh) + 1];

  // 5. Chòm Tử Vi
  const tuVi = timTuVi(cucSo, nn);
  const pos: Record<string, number> = {};
  const put = (name: string, c: number) => { pos[name] = c; add(c, name); };
  put("Tử Vi", tuVi);
  put("Liêm Trinh", dich(tuVi, 4));
  put("Thiên Đồng", dich(tuVi, 7));
  put("Vũ Khúc", dich(tuVi, 8));
  put("Thái Dương", dich(tuVi, 9));
  put("Thiên Cơ", dich(tuVi, 11));
  // Chòm Thiên Phủ
  const phu = dich(3, 3 - tuVi);
  put("Thiên Phủ", phu);
  put("Thái Âm", dich(phu, 1));
  put("Tham Lang", dich(phu, 2));
  put("Cự Môn", dich(phu, 3));
  put("Thiên Tướng", dich(phu, 4));
  put("Thiên Lương", dich(phu, 5));
  put("Thất Sát", dich(phu, 6));
  put("Phá Quân", dich(phu, 10));

  // 6. Vòng Lộc Tồn – Bác Sĩ
  const locTon = LOC_TON[canNam];
  put("Lộc Tồn", locTon);
  ["Bác Sĩ", "Lực Sĩ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư", "Phi Liêm", "Hỷ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ"].forEach(
    (n, i) => add(dich(locTon, i * chieu), n),
  );
  put("Kình Dương", dich(locTon, 1));
  put("Đà La", dich(locTon, -1));

  // 7. Vòng Thái Tuế
  ["Thái Tuế", "Thiếu Dương", "Tang Môn", "Thiếu Âm", "Quan Phù", "Tử Phù", "Tuế Phá", "Long Đức", "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù"].forEach(
    (n, i) => add(dich(chiNam, i), n),
  );
  add(dich(chiNam, 1), "Thiên Không");
  add(dich(chiNam, 5), "Nguyệt Đức");
  add(dich(chiNam, 9), "Thiên Đức");

  // 8. Vòng Tràng Sinh
  const ts = cucSo === 6 ? 3 : cucSo === 4 ? 6 : cucSo === 3 ? 12 : 9;
  TRANG_SINH.forEach((n, i) => (P(dich(ts, i * chieu)).trangSinh = n));

  // 9. Sao theo giờ, tháng, năm
  const diaKiep = dich(11, gio);
  put("Địa Kiếp", diaKiep);
  put("Địa Không", dich(12, 12 - diaKiep));
  const [hoaTinh, linhTinh] = timHoaLinh(chiNam, gio, gioiTinh, amDuongNam);
  put("Hỏa Tinh", hoaTinh);
  put("Linh Tinh", linhTinh);
  const longTri = dich(5, chiNam - 1);
  put("Long Trì", longTri);
  const phuongCac = dich(2, 2 - longTri);
  put("Phượng Các", phuongCac);
  add(phuongCac, "Giải Thần");
  const taPhu = dich(5, tt - 1);
  put("Tả Phù", taPhu);
  put("Hữu Bật", dich(2, 2 - taPhu));
  const vanKhuc = dich(5, gio - 1);
  put("Văn Khúc", vanKhuc);
  const vanXuong = dich(2, 2 - vanKhuc);
  put("Văn Xương", vanXuong);
  const tamThai = dich(5, tt + nn - 2);
  put("Tam Thai", tamThai);
  put("Bát Tọa", dich(2, 2 - tamThai));
  const anQuang = dich(vanXuong, nn - 2);
  put("Ân Quang", anQuang);
  put("Thiên Quý", dich(2, 2 - anQuang));
  const khoi = KHOI[canNam];
  put("Thiên Khôi", khoi);
  put("Thiên Việt", dich(5, 5 - khoi));
  put("Thiên Hư", dich(7, chiNam - 1));
  put("Thiên Khốc", dich(7, -chiNam + 1));
  put("Thiên Tài", dich(menh, chiNam - 1));
  put("Thiên Thọ", dich(than, chiNam - 1));
  const hongLoan = dich(4, -chiNam + 1);
  put("Hồng Loan", hongLoan);
  put("Thiên Hỷ", dich(hongLoan, 6));
  const THIEN_QUAN = [0, 8, 5, 6, 3, 4, 10, 12, 10, 11, 7];
  const THIEN_PHUC = [0, 10, 9, 1, 12, 4, 3, 7, 6, 7, 6];
  put("Thiên Quan", THIEN_QUAN[canNam]);
  put("Thiên Phúc", THIEN_PHUC[canNam]);
  const thienHinh = dich(10, tt - 1);
  put("Thiên Hình", thienHinh);
  put("Thiên Riêu", dich(thienHinh, 4));
  add(dich(thienHinh, 4), "Thiên Y");
  const coThan = [12, 1, 2].includes(chiNam) ? 3 : [3, 4, 5].includes(chiNam) ? 6 : [6, 7, 8].includes(chiNam) ? 9 : 12;
  put("Cô Thần", coThan);
  put("Quả Tú", dich(coThan, -4));
  const vanTinh = dich(pos["Kình Dương"], 2);
  put("Văn Tinh", vanTinh);
  const duongPhu = dich(vanTinh, 2);
  put("Đường Phù", duongPhu);
  put("Quốc Ấn", dich(duongPhu, 3));
  put("Thai Phụ", dich(vanKhuc, 2));
  put("Phong Cáo", dich(vanKhuc, -2));
  put("Thiên Giải", dich(9, 2 * tt - 2));
  put("Địa Giải", dich(taPhu, 3));
  put("Thiên La", 5);
  put("Địa Võng", 11);
  put("Thiên Thương", dich(menh, 5));
  put("Thiên Sứ", dich(menh, 7));
  const MA = [0, 3, 12, 9, 6];
  const thienMa = MA[chiNam % 4 === 0 ? 4 : chiNam % 4] ;
  put("Thiên Mã", thienMa === undefined ? 6 : thienMa);
  const thienMaPos = pos["Thiên Mã"];
  put("Hoa Cái", dich(thienMaPos, 2));
  const kiepSat = dich(thienMaPos, 3);
  put("Kiếp Sát", kiepSat);
  put("Đào Hoa", dich(kiepSat, 4));
  const pt = chiNam % 3;
  put("Phá Toái", pt === 0 ? 6 : pt === 1 ? 10 : 2);
  put("Đẩu Quân", dich(chiNam, -tt + gio));
  const LUU_HA = [0, 10, 11, 8, 5, 6, 7, 9, 4, 12, 3];
  const THIEN_TRU = [0, 6, 7, 1, 6, 7, 9, 3, 7, 10, 11];
  put("Lưu Hà", LUU_HA[canNam]);
  put("Thiên Trù", THIEN_TRU[canNam]);

  // 10. Tứ Hóa
  const [loc, quyen, khoa, ky] = TU_HOA[canNam];
  add(pos[loc], "Hóa Lộc");
  add(pos[quyen], "Hóa Quyền");
  add(pos[khoa], "Hóa Khoa");
  add(pos[ky], "Hóa Kỵ");

  // 11. Tuần, Triệt
  const ketThucTuan = dich(chiNam, 10 - canNam);
  const tuan1 = dich(ketThucTuan, 1);
  P(tuan1).tuan = true;
  P(dich(tuan1, 1)).tuan = true;
  const TRIET: Record<number, [number, number]> = { 1: [9, 10], 6: [9, 10], 2: [7, 8], 7: [7, 8], 3: [5, 6], 8: [5, 6], 4: [3, 4], 9: [3, 4], 5: [1, 2], 10: [1, 2] };
  for (const c of TRIET[canNam]) P(c).triet = true;

  // Thứ tự: chính tinh trước, rồi Hóa, cát, đào hoa, sát, phụ
  const ORDER: StarKind[] = ["chinh", "hoa", "cat", "dao", "sat", "phu"];
  for (const p of palaces) p.stars.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));

  // 12. Vận hạn năm xem
  const tuoiMu = input.viewYear - lunar.year + 1;
  for (const p of palaces) p.isCurrentDaiHan = tuoiMu >= p.daiHanStart && tuoiMu < p.daiHanStart + 10;
  const chiXem = ((input.viewYear + 8) % 12) + 1;
  for (const p of palaces) p.isCurrentTieuHan = p.tieuHanChi === CHI_NAMES[chiXem];
  const canXem = ((input.viewYear + 6) % 10) + 1;
  const lth = TU_HOA[canXem];

  // Can chi tháng, ngày, giờ
  const canThang = ((lunar.year * 12 + tt + 3) % 10) + 1;
  const jd = jdFromDate(solar.day, solar.month, solar.year);
  const canNgay = ((jd + 9) % 10) + 1;
  const chiNgay = ((jd + 1) % 12) + 1;
  let canGio = (((jd - 1) * 2) % 10 + gio) % 10;
  if (canGio === 0) canGio = 10;

  const cungMenhAmDuong = menh % 2 === 1 ? 1 : -1;

  return {
    input,
    solar,
    lunar,
    canChiNam: `${CAN_NAMES[canNam]} ${CHI_NAMES[chiNam]}`,
    canChiThang: `${CAN_NAMES[canThang]} ${CHI_NAMES[((tt + 1) % 12) + 1]}`,
    canChiNgay: `${CAN_NAMES[canNgay]} ${CHI_NAMES[chiNgay]}`,
    canChiGio: `${CAN_NAMES[canGio]} ${CHI_NAMES[gio]}`,
    amDuong: `${amDuongNam === 1 ? "Dương" : "Âm"} ${gioiTinh === 1 ? "Nam" : "Nữ"}`,
    banMenh: banMenh.name,
    hanhMenh: banMenh.hanh,
    cuc: cucTen,
    cucSo,
    quanHeMenhCuc: quanHe(banMenh.hanh, hanhCuc),
    amDuongMenh: cungMenhAmDuong * gioiTinh === 1 ? "Âm dương thuận lý" : "Âm dương nghịch lý",
    menhChu: MENH_CHU[chiNam],
    thanChu: THAN_CHU[chiNam],
    menhChi: menh,
    thanChi: than,
    thanCu: P(than).name,
    palaces,
    tuoiMu,
    luuNien: {
      canChi: `${CAN_NAMES[canXem]} ${CHI_NAMES[chiXem]}`,
      tuHoa: { loc: lth[0], quyen: lth[1], khoa: lth[2], ky: lth[3] },
    },
  };
}

/** Tóm tắt lá số thành văn bản ngắn để gửi cho AI. */
export function chartToText(c: TuViChart): string {
  const lines = [
    `Họ tên: ${c.input.name || "(không nêu)"}; ${c.amDuong}; sinh ${c.solar.day}/${c.solar.month}/${c.solar.year} dương lịch = ${c.lunar.day}/${c.lunar.month}${c.lunar.leap ? " (nhuận)" : ""}/${c.lunar.year} âm lịch, giờ ${c.canChiGio}.`,
    `Năm ${c.canChiNam}, tháng ${c.canChiThang}, ngày ${c.canChiNgay}. Bản mệnh: ${c.banMenh} (${c.hanhMenh}). Cục: ${c.cuc}. ${c.quanHeMenhCuc}. ${c.amDuongMenh}.`,
    `Mệnh chủ: ${c.menhChu}; Thân chủ: ${c.thanChu}; Thân cư ${c.thanCu}.`,
    `Năm xem ${c.input.viewYear} (${c.luuNien.canChi}), tuổi mụ ${c.tuoiMu}. Lưu Tứ Hóa: Lộc ${c.luuNien.tuHoa.loc}, Quyền ${c.luuNien.tuHoa.quyen}, Khoa ${c.luuNien.tuHoa.khoa}, Kỵ ${c.luuNien.tuHoa.ky}.`,
    "12 cung (cung chức năng – địa chi – sao [độ sáng]):",
  ];
  const start = c.menhChi - 1;
  for (let i = 0; i < 12; i++) {
    const p = c.palaces[(start + i) % 12];
    const stars = p.stars.filter((s) => s.kind !== "phu").map((s) => s.name + (s.brightness ? ` (${s.brightness})` : "")).join(", ");
    const flags = [p.isThan ? "Thân" : "", p.tuan ? "Tuần" : "", p.triet ? "Triệt" : "", p.isCurrentDaiHan ? "ĐẠI HẠN HIỆN TẠI" : "", p.isCurrentTieuHan ? "TIỂU HẠN NĂM XEM" : ""].filter(Boolean).join(", ");
    lines.push(`- ${p.name} tại ${p.chiName} (${p.hanh}), đại hạn ${p.daiHanStart}–${p.daiHanStart + 9}, ${p.trangSinh}${flags ? ` [${flags}]` : ""}: ${stars || "Vô chính diệu"}`);
  }
  return lines.join("\n");
}
