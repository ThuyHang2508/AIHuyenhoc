// Nội dung luận giải cơ bản (dùng khi chưa có AI hoặc để hiển thị nhanh).

export const CHINH_TINH: Record<string, { hanh: string; tuongTrung: string; tot: string; xau: string }> = {
  "Tử Vi": { hanh: "Âm Thổ", tuongTrung: "Đế tinh, quyền uy", tot: "Có khí chất lãnh đạo, đàng hoàng, được quý nhân nâng đỡ.", xau: "Dễ kiêu hãnh, thích được tâng bốc." },
  "Thiên Cơ": { hanh: "Âm Mộc", tuongTrung: "Mưu sĩ, trí tuệ", tot: "Nhanh nhạy, giỏi lập kế hoạch, hợp kỹ thuật và tư vấn.", xau: "Hay lo nghĩ, dễ thay đổi." },
  "Thái Dương": { hanh: "Dương Hỏa", tuongTrung: "Mặt trời, cha, nam giới", tot: "Nhiệt tình, hào phóng, dễ có danh tiếng.", xau: "Phô trương; kém khi hãm địa (sinh ban đêm)." },
  "Vũ Khúc": { hanh: "Âm Kim", tuongTrung: "Tài tinh", tot: "Quyết đoán, giỏi tài chính, làm giàu bằng thực lực.", xau: "Cứng rắn, dễ cô độc." },
  "Thiên Đồng": { hanh: "Dương Thủy", tuongTrung: "Phúc tinh", tot: "Hiền hòa, dễ gần, biết hưởng thụ, hậu vận an nhàn.", xau: "Thiếu ý chí phấn đấu." },
  "Liêm Trinh": { hanh: "Âm Hỏa", tuongTrung: "Tù tinh, đào hoa thứ", tot: "Kỷ luật, chính trực, hợp chính trị, pháp luật.", xau: "Nóng nảy, dễ vướng thị phi." },
  "Thiên Phủ": { hanh: "Dương Thổ", tuongTrung: "Kho tàng", tot: "Ổn định, biết giữ của, đôn hậu.", xau: "Bảo thủ, ngại mạo hiểm." },
  "Thái Âm": { hanh: "Âm Thủy", tuongTrung: "Mặt trăng, mẹ, nữ giới", tot: "Dịu dàng, tinh tế, có lộc điền sản.", xau: "Đa sầu; kém khi sinh ban ngày." },
  "Tham Lang": { hanh: "Dương Mộc", tuongTrung: "Đào hoa chính", tot: "Đa tài, giỏi giao tế, có năng khiếu nghệ thuật.", xau: "Ham vui, nhiều ham muốn." },
  "Cự Môn": { hanh: "Âm Thủy", tuongTrung: "Ám tinh, khẩu tài", tot: "Giỏi ăn nói, hợp luật, giảng dạy, bán hàng.", xau: "Dễ thị phi, đa nghi." },
  "Thiên Tướng": { hanh: "Dương Thủy", tuongTrung: "Ấn tinh", tot: "Trọng nghĩa, hay giúp người, có uy tín.", xau: "Dễ phụ thuộc người khác." },
  "Thiên Lương": { hanh: "Dương Thổ", tuongTrung: "Ấm tinh, thọ tinh", tot: "Che chở, đạo đức, hợp y, giáo dục.", xau: "Hay giáo điều." },
  "Thất Sát": { hanh: "Âm Kim", tuongTrung: "Tướng tinh", tot: "Dũng cảm, độc lập, dám khai phá.", xau: "Nóng vội, đời nhiều thăng trầm." },
  "Phá Quân": { hanh: "Âm Thủy", tuongTrung: "Hao tinh, phá cũ xây mới", tot: "Dám đổi mới, dám làm điều lớn.", xau: "Bất ổn, dễ hao tán." },
};

export const CUNG_Y_NGHIA: Record<string, string> = {
  "Mệnh": "Tính cách, tướng mạo, tổng quan cả đời",
  "Phụ Mẫu": "Cha mẹ, cấp trên, giấy tờ",
  "Phúc Đức": "Phúc đức dòng họ, đời sống tinh thần",
  "Điền Trạch": "Nhà cửa, bất động sản",
  "Quan Lộc": "Sự nghiệp, công danh",
  "Nô Bộc": "Bạn bè, đồng nghiệp, cấp dưới",
  "Thiên Di": "Ra ngoài, di chuyển, quan hệ xã hội",
  "Tật Ách": "Sức khỏe, tai ương",
  "Tài Bạch": "Tiền bạc, cách kiếm và giữ tiền",
  "Tử Tức": "Con cái, học trò",
  "Phu Thê": "Hôn nhân, người phối ngẫu",
  "Huynh Đệ": "Anh chị em, bạn thân",
};

export const BRIGHT_LABEL: Record<string, string> = { M: "Miếu", V: "Vượng", "Đ": "Đắc", B: "Bình", H: "Hãm" };
