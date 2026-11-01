// Bộ 78 lá Tarot hệ Rider–Waite–Smith, ý nghĩa rút gọn bằng tiếng Việt.

export type Suit = "major" | "wands" | "cups" | "swords" | "pentacles";

export interface TarotCard {
  id: string;
  name: string; // tên tiếng Anh
  vi: string; // tên tiếng Việt
  suit: Suit;
  number: number; // 0..21 cho Ẩn Chính, 1..14 cho Ẩn Phụ (11 Page … 14 King)
  upright: string;
  reversed: string;
  element: string;
  glyph: string;
}

const MAJOR: [string, string, string, string, string, string][] = [
  ["The Fool", "Gã Khờ", "Khởi đầu mới, tự do, tin vào hành trình", "Liều lĩnh, thiếu chuẩn bị", "Khí", "✧"],
  ["The Magician", "Nhà Ảo Thuật", "Ý chí, kỹ năng, biến ý tưởng thành hiện thực", "Thao túng, lãng phí tài năng", "Khí", "∞"],
  ["The High Priestess", "Nữ Tư Tế", "Trực giác, bí ẩn, lắng nghe tiềm thức", "Phớt lờ trực giác, điều bị che giấu", "Nước", "☾"],
  ["The Empress", "Nữ Hoàng", "Sung túc, nuôi dưỡng, sáng tạo", "Phụ thuộc, trì trệ sáng tạo", "Đất", "♀"],
  ["The Emperor", "Hoàng Đế", "Trật tự, quyền lực, kỷ luật", "Độc đoán, cứng nhắc", "Lửa", "♈"],
  ["The Hierophant", "Giáo Hoàng", "Truyền thống, người dẫn dắt, niềm tin", "Phá lệ, nổi loạn", "Đất", "♉"],
  ["The Lovers", "Tình Nhân", "Tình yêu, hòa hợp, một lựa chọn quan trọng", "Mất cân bằng, lựa chọn sai", "Khí", "♊"],
  ["The Chariot", "Cỗ Xe", "Quyết tâm, chiến thắng, làm chủ", "Mất kiểm soát, lạc hướng", "Nước", "♋"],
  ["Strength", "Sức Mạnh", "Dũng khí, nhẫn nại, sức mạnh mềm mỏng", "Tự ti, mất kiểm chế", "Lửa", "♌"],
  ["The Hermit", "Ẩn Sĩ", "Chiêm nghiệm, tìm câu trả lời bên trong", "Cô lập, trốn tránh", "Đất", "♍"],
  ["Wheel of Fortune", "Vòng Quay May Mắn", "Bước ngoặt, chu kỳ, vận may", "Vận xấu, chống lại thay đổi", "Lửa", "☸"],
  ["Justice", "Công Lý", "Công bằng, nhân quả, sự thật", "Bất công, né trách nhiệm", "Khí", "♎"],
  ["The Hanged Man", "Người Treo Ngược", "Tạm dừng, nhìn từ góc khác, buông bỏ", "Trì hoãn vô ích", "Nước", "♆"],
  ["Death", "Cái Chết", "Kết thúc để chuyển hóa, sang trang mới", "Sợ thay đổi, níu kéo", "Nước", "♏"],
  ["Temperance", "Tiết Chế", "Cân bằng, điều hòa, kiên nhẫn", "Thái quá, mất cân bằng", "Lửa", "♐"],
  ["The Devil", "Ác Quỷ", "Ràng buộc, cám dỗ, chấp trước vật chất", "Giải thoát, cắt đứt xiềng xích", "Đất", "♑"],
  ["The Tower", "Tòa Tháp", "Biến cố đột ngột, sụp đổ cái cũ", "Tránh được biến cố, sợ thay đổi", "Lửa", "♂"],
  ["The Star", "Ngôi Sao", "Hy vọng, chữa lành, cảm hứng", "Mất niềm tin, nản lòng", "Khí", "★"],
  ["The Moon", "Mặt Trăng", "Mơ hồ, ảo tưởng, lo âu tiềm ẩn", "Sự thật lộ diện, vượt qua sợ hãi", "Nước", "☽"],
  ["The Sun", "Mặt Trời", "Thành công, niềm vui, rõ ràng", "Niềm vui bị trì hoãn", "Lửa", "☀"],
  ["Judgement", "Phán Xét", "Thức tỉnh, đánh giá lại, tái sinh", "Tự trách, không chịu nhìn lại", "Lửa", "♇"],
  ["The World", "Thế Giới", "Hoàn thành, trọn vẹn, viên mãn", "Dở dang, thiếu một bước cuối", "Đất", "◎"],
];

const SUITS: { suit: Exclude<Suit, "major">; en: string; vi: string; element: string; glyph: string; cards: [string, string][] }[] = [
  {
    suit: "wands", en: "Wands", vi: "Gậy", element: "Lửa", glyph: "🜂",
    cards: [
      ["Cảm hứng mới, khởi đầu dự án", "Trì hoãn, thiếu động lực"],
      ["Lên kế hoạch, tầm nhìn xa", "Sợ bước ra vùng an toàn"],
      ["Mở rộng, chờ đợi kết quả", "Trở ngại, chậm trễ"],
      ["Ăn mừng, ổn định, mái ấm", "Bất ổn trong gia đình"],
      ["Cạnh tranh, xung đột ý kiến", "Tránh né mâu thuẫn"],
      ["Chiến thắng, được công nhận", "Kiêu ngạo, thiếu ghi nhận"],
      ["Giữ vững lập trường", "Kiệt sức, bỏ cuộc"],
      ["Tin tức nhanh, tiến triển", "Chậm trễ, mất đà"],
      ["Kiên cường, gần đích", "Mệt mỏi, phòng thủ quá mức"],
      ["Gánh nặng, trách nhiệm lớn", "Buông bớt gánh nặng"],
      ["Tin vui, nhiệt huyết khám phá", "Thiếu định hướng"],
      ["Hành động nhanh, phiêu lưu", "Bốc đồng, nóng vội"],
      ["Tự tin, quyến rũ, quyết đoán", "Ghen tị, thiếu tự tin"],
      ["Lãnh đạo, tầm nhìn, dẫn dắt", "Độc đoán, kỳ vọng quá cao"],
    ],
  },
  {
    suit: "cups", en: "Cups", vi: "Cốc", element: "Nước", glyph: "🜄",
    cards: [
      ["Tình cảm mới, cảm xúc dâng trào", "Kìm nén cảm xúc"],
      ["Đôi lứa, kết nối, hòa hợp", "Mất cân bằng trong quan hệ"],
      ["Tình bạn, ăn mừng, hội ngộ", "Tiệc tùng quá đà, người thứ ba"],
      ["Chán nản, bỏ lỡ cơ hội", "Nhận ra cơ hội mới"],
      ["Mất mát, tiếc nuối", "Chấp nhận, bước tiếp"],
      ["Hoài niệm, ký ức đẹp", "Mắc kẹt trong quá khứ"],
      ["Nhiều lựa chọn, ảo tưởng", "Tỉnh ngộ, chọn được hướng đi"],
      ["Rời bỏ để tìm điều sâu sắc hơn", "Sợ rời đi, níu kéo"],
      ["Điều ước thành, mãn nguyện", "Tự mãn, thỏa mãn hời hợt"],
      ["Hạnh phúc gia đình viên mãn", "Bất hòa trong gia đình"],
      ["Tin nhắn tình cảm, trực giác", "Cảm xúc non nớt"],
      ["Lời mời lãng mạn, theo đuổi", "Hứa hẹn suông"],
      ["Thấu cảm, dịu dàng, chữa lành", "Cảm xúc bất ổn"],
      ["Điềm tĩnh, bao dung, chín chắn", "Thao túng cảm xúc"],
    ],
  },
  {
    suit: "swords", en: "Swords", vi: "Kiếm", element: "Khí", glyph: "🜁",
    cards: [
      ["Sáng suốt, sự thật, đột phá", "Rối trí, hiểu lầm"],
      ["Bế tắc, khó lựa chọn", "Thông tin mới giúp quyết định"],
      ["Đau lòng, tổn thương", "Hồi phục, tha thứ"],
      ["Nghỉ ngơi, hồi phục", "Kiệt sức, cần dừng lại"],
      ["Xung đột, thắng mà mất", "Hòa giải, bỏ qua"],
      ["Rời xa khó khăn, chuyển tiếp", "Mắc kẹt, chưa thể đi"],
      ["Mưu mẹo, che giấu", "Sự thật lộ ra"],
      ["Tự giới hạn, cảm giác bị trói", "Giải thoát khỏi lối nghĩ cũ"],
      ["Lo âu, mất ngủ", "Nhẹ nhõm dần"],
      ["Kết thúc đau đớn, chạm đáy", "Hồi sinh sau khủng hoảng"],
      ["Tò mò, quan sát, tin tức", "Nói nhiều làm ít"],
      ["Quyết liệt, thẳng thắn", "Hấp tấp, gây tổn thương"],
      ["Độc lập, sắc sảo, rõ ràng", "Lạnh lùng, cay nghiệt"],
      ["Lý trí, công minh, quyền uy", "Lạm quyền, cứng nhắc"],
    ],
  },
  {
    suit: "pentacles", en: "Pentacles", vi: "Tiền", element: "Đất", glyph: "🜃",
    cards: [
      ["Cơ hội tài chính mới", "Bỏ lỡ cơ hội, chi tiêu kém"],
      ["Cân bằng nhiều việc", "Quá tải, mất cân bằng"],
      ["Làm việc nhóm, tay nghề", "Thiếu phối hợp"],
      ["Giữ của, an toàn", "Keo kiệt hoặc mất kiểm soát chi tiêu"],
      ["Khó khăn tài chính, cô đơn", "Phục hồi, nhận được giúp đỡ"],
      ["Cho và nhận, hào phóng", "Nợ nần, cho đi không cân bằng"],
      ["Kiên nhẫn chờ thu hoạch", "Sốt ruột, đầu tư sai chỗ"],
      ["Chăm chỉ, trau dồi kỹ năng", "Làm việc thiếu tâm huyết"],
      ["Độc lập tài chính, tận hưởng", "Phụ thuộc, tiêu xài quá tay"],
      ["Sung túc lâu dài, gia sản", "Tranh chấp tài sản"],
      ["Cơ hội học tập, tin tốt về tiền", "Thiếu tập trung"],
      ["Bền bỉ, đáng tin, chậm mà chắc", "Trì trệ, bảo thủ"],
      ["Chăm lo, thực tế, đủ đầy", "Lo âu về tiền bạc"],
      ["Thành đạt, vững vàng tài chính", "Tham vọng vật chất"],
    ],
  },
];

const RANK = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
const RANK_VI = ["Át", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Tiểu Đồng", "Hiệp Sĩ", "Hoàng Hậu", "Vua"];
export const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

export const DECK: TarotCard[] = [
  ...MAJOR.map(([name, vi, up, rev, element, glyph], i) => ({ id: `major-${i}`, name, vi, suit: "major" as Suit, number: i, upright: up, reversed: rev, element, glyph })),
  ...SUITS.flatMap((s) =>
    s.cards.map(([up, rev], i) => ({
      id: `${s.suit}-${i + 1}`,
      name: `${RANK[i]} of ${s.en}`,
      vi: `${RANK_VI[i]} ${s.vi}`,
      suit: s.suit,
      number: i + 1,
      upright: up,
      reversed: rev,
      element: s.element,
      glyph: s.glyph,
    })),
  ),
];

/** Ảnh Rider–Waite–Smith gốc (1909, phạm vi công cộng, nguồn Wikimedia Commons) trong public/img/tarot/. */
export const cardImage = (card: TarotCard) => `/img/tarot/${card.id}.jpg`;

export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
}

/** Xáo bài Fisher–Yates bằng crypto.getRandomValues */
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  const rnd = (n: number) => {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] % n;
    }
    return Math.floor(Math.random() * n);
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const coin = () => {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const b = new Uint8Array(1);
    crypto.getRandomValues(b);
    return b[0] < 128;
  }
  return Math.random() < 0.5;
};

export const TOPICS = [
  { id: "tinh-duyen", label: "Tình Duyên & Mối Quan Hệ", icon: "favorite" },
  { id: "su-nghiep", label: "Sự Nghiệp & Công Việc", icon: "work" },
  { id: "tai-chinh", label: "Tài Chính & Tiền Bạc", icon: "payments" },
  { id: "nang-luong", label: "Năng Lượng Tuần Mới", icon: "auto_awesome" },
  { id: "co-khong", label: "Câu Hỏi Có / Không", icon: "help" },
] as const;

type Spread = { id: string; name: string; group: string; topics: string[]; positions: readonly string[]; hints: readonly string[] };
const sp = (id: string, name: string, group: string, topics: string[], pos: [string, string][]): Spread => ({ id, name, group, topics, positions: pos.map((p) => p[0]), hints: pos.map((p) => p[1]) });

/** Kiểu trải bài; hints = câu hỏi mà mỗi vị trí trả lời (gửi cho AI). */
export const SPREADS: Spread[] = [
  sp("1", "Thông Điệp Một Lá", "Chung", ["nang-luong", "co-khong"], [["Thông điệp", "Thông điệp chính vũ trụ muốn gửi cho bạn lúc này"]]),
  sp("3", "Ba Lá Cổ Điển", "Chung", ["tinh-duyen", "su-nghiep", "tai-chinh", "nang-luong"], [["Quá khứ", "Điều đã qua đang ảnh hưởng tới chuyện này"], ["Hiện tại", "Năng lượng đang chi phối lúc này"], ["Tương lai", "Hướng sự việc có khả năng diễn ra nếu giữ nguyên hướng đi"]]),
  sp("co-khong-3", "Có / Không", "Chung", ["co-khong"], [["Câu trả lời", "Câu trả lời nghiêng về đâu"], ["Vì sao", "Lý do đằng sau câu trả lời"], ["Điều cần lưu ý", "Điều bạn nên chú ý để kết quả tốt hơn"]]),
  sp("5", "Ngã Rẽ (Chọn A hay B)", "Chung", ["su-nghiep", "tai-chinh"], [["Hiện trạng", "Bạn đang đứng ở đâu"], ["Lựa chọn A", "Điều xảy ra nếu chọn hướng A"], ["Lựa chọn B", "Điều xảy ra nếu chọn hướng B"], ["Điều cần biết", "Yếu tố bạn đang bỏ sót"], ["Lời khuyên", "Cách chọn phù hợp với bạn nhất"]]),
  sp("nguoi-ay", "Người Ấy Nghĩ Gì Về Tôi", "Tình cảm", ["tinh-duyen"], [["Cách người ấy nhìn bạn", "Ấn tượng của người ấy về bạn"], ["Cảm xúc thật", "Người ấy thực sự cảm thấy gì"], ["Điều người ấy lo ngại", "Rào cản trong lòng người ấy"], ["Điều người ấy mong đợi", "Người ấy muốn gì ở mối quan hệ"], ["Hành động sắp tới", "Người ấy có khả năng làm gì tiếp theo"]]),
  sp("quay-lai", "Có Quay Lại Được Không", "Tình cảm", ["tinh-duyen"], [["Bạn lúc này", "Trạng thái cảm xúc của bạn"], ["Người ấy lúc này", "Trạng thái của người ấy"], ["Người ấy còn quan tâm?", "Tình cảm còn lại của người ấy dành cho bạn"], ["Trở ngại", "Điều đang ngăn hai người"], ["Cơ hội hàn gắn", "Khả năng nối lại và điều kiện để xảy ra"], ["Lời khuyên", "Điều tốt nhất bạn nên làm"]]),
  sp("map-mo", "Mối Quan Hệ Mập Mờ", "Tình cảm", ["tinh-duyen"], [["Bản chất mối quan hệ", "Đây thực sự là gì"], ["Lòng bạn", "Bạn thật sự muốn gì"], ["Lòng người ấy", "Người ấy thật sự muốn gì"], ["Trở ngại", "Vì sao chưa rõ ràng"], ["Hướng đi", "Mối quan hệ có xu hướng đi về đâu"]]),
  sp("dinh-menh", "Người Định Mệnh", "Tình cảm", ["tinh-duyen"], [["Bạn hiện tại", "Bạn đã sẵn sàng cho tình yêu chưa"], ["Thời điểm", "Dấu hiệu về thời điểm gặp gỡ"], ["Người ấy là người thế nào", "Tính cách của người phù hợp"], ["Cách gặp nhau", "Hoàn cảnh hai người có thể gặp"], ["Mối quan hệ phát triển", "Mối quan hệ sẽ tiến triển ra sao"], ["Lời khuyên", "Điều bạn nên làm để mở lòng"]]),
  sp("tien-3", "Tiền Vào · Tiền Ra · Lời Khuyên", "Công việc & tiền bạc", ["tai-chinh"], [["Tiền vào", "Nguồn thu và cơ hội kiếm tiền gần đây"], ["Tiền ra", "Khoản chi hoặc thói quen đang làm hao hụt"], ["Lời khuyên", "Việc nên làm để tài chính vững hơn"]]),
  sp("su-nghiep-6", "Sự Nghiệp Toàn Cảnh", "Công việc & tiền bạc", ["su-nghiep"], [["Vai trò hiện tại", "Bạn đang ở đâu trong công việc"], ["Điểm mạnh", "Lợi thế bạn đang có"], ["Cơ hội", "Cơ hội đang mở ra"], ["Trở ngại", "Điều cản bước bạn"], ["Lời khuyên", "Việc nên làm tiếp theo"], ["Kết quả", "Kết quả có khả năng đạt được"]]),
  sp("tien-bac-5", "Dòng Tiền 5 Lá", "Công việc & tiền bạc", ["tai-chinh"], [["Hiện trạng tài chính", "Tình hình tiền bạc lúc này"], ["Nguồn thu", "Tiền đang và sẽ đến từ đâu"], ["Chi tiêu", "Tiền đang đi đâu, chỗ cần siết lại"], ["Cơ hội", "Cơ hội tăng thu nhập hoặc tích lũy"], ["Xu hướng", "Xu hướng tài chính sắp tới"]]),
  sp("bong-toi", "Bóng Tối Bên Trong", "Nội tâm", ["nang-luong"], [["Bóng tối", "Phần bạn đang né tránh trong mình"], ["Gốc rễ", "Nó bắt nguồn từ đâu"], ["Cách nó lộ diện", "Nó đang thể hiện ra đời sống thế nào"], ["Cách hòa giải", "Làm sao chấp nhận và chuyển hóa"], ["Món quà ẩn giấu", "Sức mạnh có được khi vượt qua"]]),
  sp("10", "Thập Tự Celtic", "Chung", ["su-nghiep"], [["Hiện trạng", "Trung tâm của vấn đề"], ["Thử thách", "Điều cắt ngang, cản trở"], ["Gốc rễ", "Nền tảng sâu xa"], ["Quá khứ gần", "Điều vừa qua"], ["Mục tiêu", "Điều bạn hướng tới hoặc ý thức được"], ["Tương lai gần", "Điều sắp đến"], ["Bản thân", "Thái độ của bạn"], ["Môi trường", "Người xung quanh và hoàn cảnh"], ["Hy vọng & lo sợ", "Điều bạn mong và điều bạn sợ"], ["Kết quả", "Kết quả có khả năng xảy ra"]]),
  sp("12-thang", "Vòng 12 Tháng", "Nội tâm", ["nang-luong"], [["Chủ đề cả năm", "Bài học và năng lượng chính của năm"], ...Array.from({ length: 12 }, (_, i) => [`Tháng ${i + 1}`, `Năng lượng nổi bật của tháng ${i + 1}`] as [string, string])]),
];

/** Kiểu trải theo chủ đề, theo thứ tự hiển thị; kiểu đầu tiên được chọn sẵn. */
export const TOPIC_SPREADS: Record<string, string[]> = {
  "tinh-duyen": ["3", "nguoi-ay", "quay-lai", "map-mo", "dinh-menh"],
  "su-nghiep": ["3", "5", "su-nghiep-6", "10"],
  "tai-chinh": ["tien-3", "tien-bac-5", "5", "3"],
  "nang-luong": ["3", "1", "bong-toi", "12-thang"],
  "co-khong": ["co-khong-3", "1"],
};

export const suitLabel = (s: Suit) => ({ major: "Ẩn Chính", wands: "Bộ Gậy", cups: "Bộ Cốc", swords: "Bộ Kiếm", pentacles: "Bộ Tiền" })[s];
