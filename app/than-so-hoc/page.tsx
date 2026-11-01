import ArticleList from "@/components/ArticleList";
import NumerologyClient from "./NumerologyClient";
export const metadata = { title: "Thần Số Học AI — Luận giải số mệnh", description: "Tính số chủ đạo, sứ mệnh, linh hồn, năm cá nhân, biểu đồ ngày sinh và mũi tên theo Pythagoras; AI luận giải riêng cho bạn." };
export default function Page() {
  return (
    <>
      <NumerologyClient />
      <ArticleList section="than-so-hoc" title="Ý nghĩa các con số chủ đạo" />
    </>
  );
}
