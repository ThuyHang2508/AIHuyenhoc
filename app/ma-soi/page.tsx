import MaSoiClient from "./MaSoiClient";
export const metadata = {
  title: "Ma Sói Online — Chơi cùng bạn bè, mỗi người một máy",
  description: "Tạo phòng Ma Sói, gửi mã cho bạn bè và chơi ngay trên điện thoại: Sói, Tiên tri, Bảo vệ, Phù thủy, Thợ săn, Thần tình yêu. Có người máy để chơi khi thiếu người.",
};
export default function Page() {
  return <MaSoiClient />;
}
