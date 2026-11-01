// Nơi sinh có sẵn tọa độ (trung tâm tỉnh lỵ / thành phố, sai số vài km — đủ cho bản đồ sao).
// Dùng tên 63 tỉnh thành cũ vì giấy khai sinh của hầu hết mọi người ghi theo tên cũ.

export interface Place {
  name: string;
  lat: number;
  lon: number;
  tz: number; // múi giờ chuẩn hiện tại
  vn?: boolean;
}

const VN: [string, number, number][] = [
  ["Hà Nội", 21.0285, 105.8542], ["TP. Hồ Chí Minh (Sài Gòn)", 10.7769, 106.7009], ["Hải Phòng", 20.8449, 106.6881], ["Đà Nẵng", 16.0544, 108.2022],
  ["Cần Thơ", 10.0452, 105.7469], ["Huế (Thừa Thiên Huế)", 16.4637, 107.5909], ["An Giang (Long Xuyên)", 10.3864, 105.4352], ["Bà Rịa – Vũng Tàu", 10.4114, 107.1362],
  ["Bắc Giang", 21.2731, 106.1946], ["Bắc Kạn", 22.1470, 105.8348], ["Bạc Liêu", 9.2940, 105.7216], ["Bắc Ninh", 21.1861, 106.0763],
  ["Bến Tre", 10.2415, 106.3759], ["Bình Định (Quy Nhơn)", 13.7820, 109.2194], ["Bình Dương (Thủ Dầu Một)", 10.9804, 106.6519], ["Bình Phước (Đồng Xoài)", 11.5349, 106.8832],
  ["Bình Thuận (Phan Thiết)", 10.9289, 108.1021], ["Cà Mau", 9.1769, 105.1524], ["Cao Bằng", 22.6657, 106.2580], ["Đắk Lắk (Buôn Ma Thuột)", 12.6667, 108.0500],
  ["Đắk Nông (Gia Nghĩa)", 12.0045, 107.6907], ["Điện Biên", 21.3860, 103.0230], ["Đồng Nai (Biên Hòa)", 10.9574, 106.8426], ["Đồng Tháp (Cao Lãnh)", 10.4602, 105.6329],
  ["Gia Lai (Pleiku)", 13.9833, 108.0000], ["Hà Giang", 22.8233, 104.9836], ["Hà Nam (Phủ Lý)", 20.5411, 105.9139], ["Hà Tĩnh", 18.3428, 105.9057],
  ["Hải Dương", 20.9373, 106.3146], ["Hậu Giang (Vị Thanh)", 9.7846, 105.4701], ["Hòa Bình", 20.8171, 105.3376], ["Hưng Yên", 20.6464, 106.0511],
  ["Khánh Hòa (Nha Trang)", 12.2388, 109.1967], ["Kiên Giang (Rạch Giá)", 10.0125, 105.0809], ["Kon Tum", 14.3498, 108.0005], ["Lai Châu", 22.3964, 103.4582],
  ["Lâm Đồng (Đà Lạt)", 11.9404, 108.4583], ["Lạng Sơn", 21.8537, 106.7610], ["Lào Cai", 22.4856, 103.9707], ["Long An (Tân An)", 10.5360, 106.4130],
  ["Nam Định", 20.4388, 106.1621], ["Nghệ An (Vinh)", 18.6796, 105.6813], ["Ninh Bình", 20.2506, 105.9745], ["Ninh Thuận (Phan Rang)", 11.5675, 108.9886],
  ["Phú Thọ (Việt Trì)", 21.3227, 105.4019], ["Phú Yên (Tuy Hòa)", 13.0882, 109.3149], ["Quảng Bình (Đồng Hới)", 17.4689, 106.6223], ["Quảng Nam (Tam Kỳ)", 15.5736, 108.4740],
  ["Quảng Ngãi", 15.1214, 108.8044], ["Quảng Ninh (Hạ Long)", 20.9712, 107.0448], ["Quảng Trị (Đông Hà)", 16.8163, 107.1003], ["Sóc Trăng", 9.6025, 105.9739],
  ["Sơn La", 21.3256, 103.9188], ["Tây Ninh", 11.3352, 106.1099], ["Thái Bình", 20.4463, 106.3366], ["Thái Nguyên", 21.5942, 105.8482],
  ["Thanh Hóa", 19.8075, 105.7764], ["Tiền Giang (Mỹ Tho)", 10.3600, 106.3600], ["Trà Vinh", 9.9347, 106.3456], ["Tuyên Quang", 21.8233, 105.2140],
  ["Vĩnh Long", 10.2537, 105.9722], ["Vĩnh Phúc (Vĩnh Yên)", 21.3089, 105.6049], ["Yên Bái", 21.7229, 104.9113],
];

const WORLD: Place[] = [
  { name: "Bangkok (Thái Lan)", lat: 13.7563, lon: 100.5018, tz: 7 },
  { name: "Viêng Chăn (Lào)", lat: 17.9757, lon: 102.6331, tz: 7 },
  { name: "Phnôm Pênh (Campuchia)", lat: 11.5564, lon: 104.9282, tz: 7 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, tz: 8 },
  { name: "Kuala Lumpur (Malaysia)", lat: 3.139, lon: 101.6869, tz: 8 },
  { name: "Bắc Kinh (Trung Quốc)", lat: 39.9042, lon: 116.4074, tz: 8 },
  { name: "Đài Bắc (Đài Loan)", lat: 25.033, lon: 121.5654, tz: 8 },
  { name: "Seoul (Hàn Quốc)", lat: 37.5665, lon: 126.978, tz: 9 },
  { name: "Tokyo (Nhật Bản)", lat: 35.6762, lon: 139.6503, tz: 9 },
  { name: "Sydney (Úc)", lat: -33.8688, lon: 151.2093, tz: 10 },
  { name: "Melbourne (Úc)", lat: -37.8136, lon: 144.9631, tz: 10 },
  { name: "Paris (Pháp)", lat: 48.8566, lon: 2.3522, tz: 1 },
  { name: "Berlin (Đức)", lat: 52.52, lon: 13.405, tz: 1 },
  { name: "Praha (Séc)", lat: 50.0755, lon: 14.4378, tz: 1 },
  { name: "Warszawa (Ba Lan)", lat: 52.2297, lon: 21.0122, tz: 1 },
  { name: "Moskva (Nga)", lat: 55.7558, lon: 37.6173, tz: 3 },
  { name: "London (Anh)", lat: 51.5074, lon: -0.1278, tz: 0 },
  { name: "New York (Mỹ)", lat: 40.7128, lon: -74.006, tz: -5 },
  { name: "Houston (Mỹ)", lat: 29.7604, lon: -95.3698, tz: -6 },
  { name: "Los Angeles (Mỹ)", lat: 34.0522, lon: -118.2437, tz: -8 },
  { name: "San Jose (Mỹ)", lat: 37.3382, lon: -121.8863, tz: -8 },
  { name: "Toronto (Canada)", lat: 43.6532, lon: -79.3832, tz: -5 },
];

export const PLACES: Place[] = [...VN.map(([name, lat, lon]) => ({ name, lat, lon, tz: 7, vn: true })), ...WORLD];

/**
 * Múi giờ đề xuất cho người sinh ở Việt Nam: miền Nam (dưới vĩ tuyến 17) dùng UTC+8
 * từ 01/01/1960 đến 12/06/1975; còn lại UTC+7. Nơi ở nước ngoài trả về múi giờ chuẩn
 * (người dùng cần tự cộng giờ mùa hè nếu có).
 */
export function suggestTz(p: Place, y: number, m: number, d: number): number {
  if (!p.vn) return p.tz;
  const v = y * 10000 + m * 100 + d;
  if (p.lat < 17 && v >= 19600101 && v <= 19750612) return 8;
  return 7;
}
