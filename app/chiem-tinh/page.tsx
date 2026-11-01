import ChiemTinhClient from "./ChiemTinhClient";
export const metadata = {
  title: "Bản Đồ Sao Chiêm Tinh AI — Mặt Trời, Mặt Trăng, Cung Mọc",
  description: "Lập bản đồ sao cá nhân miễn phí: vị trí 10 hành tinh, Cung Mọc, 12 nhà Placidus và góc chiếu theo ngày giờ nơi sinh; AI luận giải chi tiết bằng tiếng Việt.",
};
export default function Page() {
  return <ChiemTinhClient />;
}
