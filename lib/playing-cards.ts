// Bộ bài Tây 52 lá và ý nghĩa theo lối bói bài Tây phổ biến ở Việt Nam.
// Cơ: tình cảm, gia đình · Rô: tiền bạc, tin tức · Chuồn (Nhép): công việc, bạn bè, may mắn · Bích: thử thách, cảnh báo.
// Các lá "xấu" được diễn đạt theo hướng cảnh báo để phòng, không phán bệnh tật hay tai họa.

export type PlayingSuit = "co" | "ro" | "chuon" | "bich";

export interface PlayingCard {
  id: string; // vd. "co-1"
  suit: PlayingSuit;
  rank: number; // 1 = Át … 11 = J, 12 = Q, 13 = K
  vi: string; // "Át Cơ"
  meaning: string;
}

export const SUIT_INFO: Record<PlayingSuit, { vi: string; symbol: string; red: boolean; theme: string }> = {
  co: { vi: "Cơ", symbol: "♥", red: true, theme: "tình cảm, gia đình, niềm vui" },
  ro: { vi: "Rô", symbol: "♦", red: true, theme: "tiền bạc, giấy tờ, tin tức" },
  chuon: { vi: "Chuồn", symbol: "♣", red: false, theme: "công việc, bạn bè, may mắn" },
  bich: { vi: "Bích", symbol: "♠", red: false, theme: "thử thách, điều cần cẩn trọng" },
};

export const RANK_LABEL = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RANK_VI = ["", "Át", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const MEANINGS: Record<PlayingSuit, string[]> = {
  co: [
    "Nhà cửa, tổ ấm; tin vui về tình cảm hoặc gia đình",
    "Tình cảm đôi lứa hòa hợp, một mối quan hệ đang thuận",
    "Lưỡng lự trong tình cảm, cần nói rõ lòng mình",
    "Thay đổi, đi xa hoặc chuyển chỗ; tình cảm cần thời gian",
    "Ghen tuông, so bì; nên tránh thị phi quanh chuyện tình",
    "Một lời đề nghị bất ngờ, người lạ đến với thiện ý",
    "Lời hứa dễ không thành, đừng đặt kỳ vọng quá sớm",
    "Gặp gỡ, tiệc tùng, quà tặng; niềm vui bên bạn bè",
    "Lá ước: điều mong muốn có khả năng thành hiện thực",
    "Hạnh phúc trọn vẹn, may mắn trong gia đình",
    "Một người bạn trẻ thân thiết, chân thành",
    "Người phụ nữ dịu dàng, tốt bụng, giàu tình cảm",
    "Người đàn ông tốt bụng, nhiệt tình giúp đỡ",
  ],
  ro: [
    "Thư từ, giấy tờ, tin tức quan trọng sắp đến",
    "Một mối quan hệ gặp ngăn trở, cần kiên nhẫn vun đắp",
    "Tranh chấp, giấy tờ pháp lý; nên đọc kỹ trước khi ký",
    "Thay đổi tốt về tài sản, có thể là của thừa hưởng",
    "Làm ăn thuận lợi, thịnh vượng, nhà cửa êm ấm",
    "Rạn nứt nhỏ trong quan hệ, cần một lời hàn gắn",
    "Hao hụt nhỏ, tránh cờ bạc và đầu tư may rủi",
    "Một chuyến đi; tình cảm đến muộn nhưng bền",
    "Tin bất ngờ về tiền bạc, cơ hội kiếm thêm",
    "Tiền bạc dồi dào, thay đổi lớn về tài chính",
    "Người thiếu tin cậy hoặc tin tức chưa chắc chắn",
    "Người phụ nữ hay nói, dễ gây chuyện thị phi",
    "Người đàn ông có quyền, quyết đoán, nóng tính",
  ],
  chuon: [
    "Tiền tài, danh tiếng; may mắn lớn trong công việc",
    "Gặp trở ngại, có người phản đối kế hoạch của bạn",
    "Mối quan hệ hợp tác mới; có thể là chuyện cưới hỏi",
    "Cẩn thận lời hứa của người khác, tránh bị lừa",
    "Kết bạn mới, mối quan hệ có lợi cho công việc",
    "Thành công nhờ được giúp đỡ, việc làm ăn khởi sắc",
    "Thịnh vượng, nhưng coi chừng rắc rối từ người khác giới",
    "Lòng tham, vay mượn; cân nhắc kỹ trước khi đầu tư",
    "Bất đồng với bạn bè vì cố chấp, nên nhường một bước",
    "Khoản tiền bất ngờ hoặc chuyến đi xa có lợi",
    "Người bạn đáng tin, hào phóng, sẵn lòng giúp",
    "Người phụ nữ tự tin, có năng lực, hay giúp đỡ",
    "Người đàn ông trung thực, rộng rãi, đáng tin",
  ],
  bich: [
    "Bước ngoặt lớn; một chuyện khép lại để chuyện mới bắt đầu",
    "Chia tay hoặc một quyết định khó phải đưa ra",
    "Đau lòng, chia cắt; có người thứ ba xen vào",
    "Mệt mỏi, kiệt sức; cần nghỉ ngơi và sắp xếp lại",
    "Nóng giận gây trở ngại, nhưng vượt qua được",
    "Tình hình cải thiện dần, khó khăn đang lùi lại",
    "Mất mát nhỏ, lời khuyên nên thận trọng",
    "Rắc rối, kế hoạch bị cản; đừng hành động vội",
    "Giai đoạn lo âu, căng thẳng; giữ bình tĩnh là chìa khóa",
    "Áp lực, cảm giác bị bó buộc; tin chưa vui",
    "Người thiếu trách nhiệm hoặc có ý không tốt",
    "Người phụ nữ nghiêm khắc, cô đơn, khó gần",
    "Người đàn ông tham vọng, quyền lực, khó đoán",
  ],
};

export const PLAYING_DECK: PlayingCard[] = (Object.keys(MEANINGS) as PlayingSuit[]).flatMap((suit) =>
  MEANINGS[suit].map((meaning, i) => ({ id: `${suit}-${i + 1}`, suit, rank: i + 1, vi: `${RANK_VI[i + 1]} ${SUIT_INFO[suit].vi}`, meaning })),
);

export const BT_TOPICS = [
  { id: "chung", label: "Tổng quan" },
  { id: "tinh-cam", label: "Tình yêu" },
  { id: "cong-viec", label: "Công việc" },
  { id: "tien-bac", label: "Tài chính" },
] as const;

/** Câu hỏi gợi ý theo chủ đề (bấm để điền vào ô hỏi). */
export const BT_SUGGEST: Record<string, string[]> = {
  chung: ["Thời gian tới của tôi có gì đáng chú ý?", "Tôi đang bỏ lỡ điều gì?", "Tuần này tôi nên tập trung vào đâu?"],
  "tinh-cam": ["Người ấy có thật lòng với tôi không?", "Mối quan hệ này sẽ đi về đâu?", "Khi nào tôi gặp được người phù hợp?"],
  "cong-viec": ["Công việc hiện tại của tôi sắp tới có khởi sắc không?", "Tôi có nên chuyển việc không?", "Dự án này có thuận lợi không?"],
  "tien-bac": ["Tháng này chuyện tiền bạc của tôi ra sao?", "Có nên đầu tư khoản này không?", "Làm sao để giữ tiền tốt hơn?"],
};

export const BT_SPREADS = [
  { id: "1", name: "Một lá hôm nay", positions: ["Thông điệp"], hints: ["Điều quan trọng nhất cho bạn lúc này"] },
  { id: "3", name: "Ba lá", positions: ["Điều đang tạo đà", "Điều đang diễn ra", "Nước đi kế tiếp"], hints: ["Điều từ trước đang đẩy sự việc tới hiện tại", "Tình hình thật sự lúc này", "Bước nên đi hoặc điều sắp mở ra"] },
] as const;
