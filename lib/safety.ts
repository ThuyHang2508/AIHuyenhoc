// Phát hiện tin nhắn có dấu hiệu khủng hoảng để AI ưu tiên an toàn của người dùng.
// Chỉ dùng cụm từ không nhập nhằng (vd. không dùng "tu tu" không dấu vì trùng "từ từ").
const CRISIS = new RegExp(
  [
    "tự tử", "tự sát", "muốn chết", "không muốn sống", "chán sống", "tự hại", "tự làm đau", "rạch tay", "cắt tay", "kết liễu",
    "bạo hành", "bị đánh đập", "xâm hại", "hiếp dâm", "quấy rối tình dục",
    "tu sat", "muon chet", "khong muon song", "chan song", "rach tay", "bao hanh", "xam hai",
  ].join("|"),
  "i",
);

export const isCrisis = (text: string) => CRISIS.test(text.normalize("NFC").toLowerCase());

export const CRISIS_RULE = `QUAN TRỌNG — người dùng có thể đang gặp khủng hoảng hoặc nguy hiểm. Ưu tiên tuyệt đối sự an toàn của họ:
- Mở đầu bằng vài câu ân cần, ghi nhận cảm xúc, không phán xét. Không luận giải theo hướng định mệnh, không nói gì khiến họ thấy bế tắc hơn.
- Nói rõ họ không phải một mình và nên liên hệ ngay người thân tin cậy hoặc chuyên gia. Tại Việt Nam: gọi 115 (cấp cứu) hoặc 113 (công an) nếu đang gặp nguy hiểm; 111 (Tổng đài quốc gia bảo vệ trẻ em) nếu là trẻ em hoặc liên quan trẻ em; Đường dây nóng Ngày Mai 096 306 1414 để được lắng nghe, hỗ trợ tâm lý.
- Sau đó chỉ trả lời ngắn, nhẹ nhàng, hướng về điều giúp họ an toàn và kết nối với người khác.`;
