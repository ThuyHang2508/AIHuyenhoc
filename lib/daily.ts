import { solarToLunar, canChiDay, canChiYear, CHI } from "./lunar";
import { DECK } from "./tarot";

// Số giả ngẫu nhiên ổn định theo ngày (để mọi người thấy cùng "năng lượng hôm nay").
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const MESSAGES = [
  "Mọi sự cân trở chỉ là màn sương dẫn đường đến cảnh giới tĩnh lặng. Hãy lắng nghe trực giác hôm nay.",
  "Gieo một hạt nhỏ hôm nay, mùa sau sẽ thành cánh đồng. Bắt đầu việc bạn còn trì hoãn.",
  "Nước chảy đá mòn — sự kiên nhẫn là phép màu bền bỉ nhất.",
  "Một lời tử tế hôm nay sẽ mở ra một cánh cửa bạn chưa nhìn thấy.",
  "Buông bớt điều không còn phục vụ bạn, khoảng trống sẽ đón điều mới.",
  "Ánh trăng không vội vàng mà vẫn tròn đầy. Hãy cho bản thân thời gian.",
  "Năng lượng hôm nay thuận cho việc học hỏi và trò chuyện sâu.",
];
const COLORS = ["Xanh ngọc bích", "Trắng ánh trăng", "Vàng hổ phách", "Tím thạch anh", "Xanh lục bảo", "Bạc tinh tú", "Đỏ son"];

export function getDaily(date = new Date()) {
  const d = date.getDate(), m = date.getMonth() + 1, y = date.getFullYear();
  const l = solarToLunar(d, m, y);
  const rnd = seeded(y * 10000 + m * 100 + d);
  const pct = () => 60 + Math.floor(rnd() * 38);
  const card = DECK[Math.floor(rnd() * 22)];
  const luckyChi = CHI[Math.floor(rnd() * 12)];
  return {
    solar: `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`,
    lunar: `${l.day}/${l.month}${l.leap ? " nhuận" : ""} năm ${canChiYear(l.year)}`,
    canChiNgay: canChiDay(l.jd),
    taiLoc: pct(),
    tinhDuyen: pct(),
    suNghiep: pct(),
    message: MESSAGES[Math.floor(rnd() * MESSAGES.length)],
    color: COLORS[Math.floor(rnd() * COLORS.length)],
    numbers: [1 + Math.floor(rnd() * 9), 1 + Math.floor(rnd() * 9)],
    card,
    luckyChi,
    moonPhase: l.day <= 3 ? "Trăng non" : l.day <= 10 ? "Trăng lưỡi liềm đầu tháng" : l.day <= 13 ? "Trăng thượng huyền" : l.day <= 17 ? "Trăng tròn" : l.day <= 24 ? "Trăng hạ huyền" : "Trăng tàn",
  };
}
