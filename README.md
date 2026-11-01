# AetherAI — Website Tử Vi, Thần Số Học, Tarot

Website Next.js dựng theo thiết kế Stitch "Ethereal Oracle AI": nền tối, xanh neon ngọc lục bảo, font EB Garamond / Plus Jakarta Sans / Space Grotesk.

## Có gì trong bản này

| Trang | Đường dẫn | Tính năng |
| --- | --- | --- |
| Trang chủ | `/` | Hero hỏi AI, 6 môn phái (3 đã chạy, 3 "sắp ra mắt"), năng lượng hôm nay theo âm lịch, trợ lý AI, CTA |
| Thần Số Học | `/than-so-hoc` | Số chủ đạo, sứ mệnh, linh hồn, nhân cách, ngày sinh, thái độ, trưởng thành, năm/tháng cá nhân, 4 đỉnh cao, 4 thử thách, biểu đồ ngày sinh + mũi tên, chu kỳ 9 năm, độ hợp số, chat AI |
| Trải Bài Tarot | `/tarot` | 4 chủ đề, 4 kiểu trải (1, 3, 5, 10 lá), xáo bài bằng `crypto`, tự bốc từ quạt bài, lá xuôi/ngược, chat AI luận giải |
| Lá Số Tử Vi | `/tu-vi` | Lập lá số đầy đủ: âm lịch VN, 12 cung, 14 chính tinh + hơn 90 phụ tinh, độ sáng, Tứ Hóa, Tuần/Triệt, Tràng Sinh, đại/tiểu hạn, lưu niên; 3 tab AI (tổng quan, vận hạn năm, hỏi đáp) |
| Hỏi đáp | `/hoi-dap` | Chat AI tổng hợp (ô tìm kiếm trên header dẫn vào đây) |
| Điều khoản | `/dieu-khoan` | Miễn trừ trách nhiệm |

Phần tính toán chạy hoàn toàn trên trình duyệt. AI chỉ nhận bản tóm tắt dữ liệu đã tính sẵn, nên không "bịa" vị trí sao hay con số.

## Chạy thử trên máy

Cần Node.js 18.18 trở lên.

```bash
npm install
cp .env.example .env.local     # rồi điền ANTHROPIC_API_KEY
npm run dev                    # mở http://localhost:3000
```

Chưa có API key mà muốn xem giao diện chat: đặt `AI_MOCK=1` trong `.env.local`, AI sẽ trả lời bằng đoạn văn mẫu.

Kiểm thử engine (âm lịch, thần số, lá số, bộ bài): `npm test`.

## Cấu hình AI (Claude, ChatGPT, Gemini)

- Trên web, bấm nút **Cài đặt AI** ở thanh đầu trang: chọn Claude, ChatGPT hoặc Gemini, dán API key của hãng đó, bấm **Kiểm tra key** rồi **Lưu & dùng**. Key lưu trong trình duyệt của người dùng và được gửi kèm mỗi câu hỏi tới máy chủ của web để chuyển tiếp sang hãng AI.
- Lấy key: Claude tại https://console.anthropic.com/settings/keys, ChatGPT tại https://platform.openai.com/api-keys, Gemini tại https://aistudio.google.com/app/apikey.
- Muốn máy chủ có sẵn key cho mọi người: đặt `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` trong `.env.local`. Key người dùng nhập được ưu tiên hơn.
- Lời dặn cho AI (persona, bố cục bài luận, quy tắc an toàn) nằm ở `lib/agents.ts`. Phần gọi từng hãng ở `lib/llm.ts`, danh sách hãng và model mặc định ở `lib/ai-providers.ts`.
- API route: `app/api/chat/route.ts` (streaming). Trước khi mở công khai nên thêm giới hạn lượt hỏi theo IP hoặc tài khoản để kiểm soát chi phí.

## Deploy

Dễ nhất là Vercel: đẩy thư mục lên GitHub → Import vào Vercel → thêm biến môi trường `ANTHROPIC_API_KEY` → Deploy.

## Ảnh

Ảnh logo, 4 trợ lý và 3 lá Tarot (Magician, Star, Sun) đang lấy trực tiếp từ link ảnh Stitch trong `lib/images.ts`. Link Stitch có thể hết hạn, nên tải các ảnh đó về thư mục `public/img/` và sửa đường dẫn trong `lib/images.ts` thành `/img/ten-anh.jpg`. Các lá Tarot còn lại hiển thị bằng khung thiết kế CSS; muốn dùng ảnh riêng thì thêm vào bảng `ART` trong `components/TarotCardView.tsx`.

## Cấu trúc thư mục

```
app/                 các trang (App Router) + api/chat
components/          Header, Footer, ChatPanel, Markdown, TarotCardView, DateFields…
lib/lunar.ts         âm lịch Việt Nam (thuật toán Hồ Ngọc Đức, UTC+7) + can chi
lib/tuvi.ts          engine an sao Tử Vi (port từ lasotuvi, MIT)
lib/tuvi-content.ts  ý nghĩa 14 chính tinh, 12 cung
lib/numerology.ts    thần số học Pythagoras (quy ước Phillips)
lib/tarot.ts         78 lá, kiểu trải, chủ đề
lib/agents.ts        persona + quy tắc cho AI
scripts/             kiểm thử
```

## Quy ước đã chọn (có thể đổi)

- Tử Vi: Thiên Khôi/Việt theo khẩu quyết "Giáp Mậu Canh ngưu dương…"; Tứ Hóa năm Canh = Khoa Thiên Đồng, Kỵ Thái Âm; năm Nhâm = Khoa Thiên Phủ; tháng nhuận: ngày 1–15 tính tháng trước, từ 16 tính tháng sau; Hỏa/Linh năm Tỵ Dậu Sửu khởi Mão/Tuất.
- Engine đã được đối chiếu 300 lá số ngẫu nhiên với thư viện lasotuvi: khớp hoàn toàn, trừ các điểm cố ý khác ở trên và thứ tự Thai/Dưỡng.
- Thần số học: Số chủ đạo dừng ở ≤ 11 (có số 10), giữ 22/4 và 33/6.

## Còn thiếu / gợi ý làm tiếp

- Đăng nhập, lưu hồ sơ, giới hạn lượt hỏi AI, gói trả phí.
- Ảnh 78 lá Tarot riêng.
- Trang SEO: ý nghĩa từng lá, từng số, từng sao; lịch âm, ngày tốt, tuổi hợp.
- Chiêm tinh, Bát Tự, Kinh Dịch (đang để "sắp ra mắt").
