import { GameCards } from "@/components/home/GameCards";

export const metadata = {
  title: "Board Game Online — Chơi cùng bạn bè",
  description: "Sảnh board game online: Ma Sói nhiều người chơi, mỗi người một điện thoại, web làm quản trò. Tạo phòng và mời bạn bè chỉ trong vài giây.",
};

export default function Page() {
  return (
    <div className="ritual-bg relative -mt-20 min-h-screen overflow-hidden pt-20">
      <div className="ritual-stars" />
      <div className="relative mx-auto max-w-[1200px] px-5 py-10 md:px-6 md:py-14">
        <p className="font-label text-[12px] font-semibold uppercase tracking-[0.25em] text-[#dcb56f]">Board game</p>
        <h1 className="mt-2 font-serif text-[40px] leading-[46px] text-[#f3d9a4] md:text-[56px] md:leading-[62px]">Chơi cùng bạn bè</h1>
        <p className="mt-3 max-w-2xl text-on-surface-variant">Không cần bộ bài hay người quản trò — tạo phòng, gửi mã cho cả nhóm và chơi ngay trên điện thoại, dù ngồi chung một bàn hay mỗi người một nơi.</p>
        <div className="mt-10"><GameCards /></div>
      </div>
    </div>
  );
}
