"use client";
// Dòng "Dịch vụ nổi bật": thẻ ngang có linh vật, vuốt/kéo ngang, có nút mũi tên trên máy tính.
import Link from "next/link";
import { useRef, useState } from "react";
import Icon from "@/components/Icon";
import { CatTarot, FoxCards, OwlNumbers, RabbitGlobe, SageScroll, StarSpirit } from "@/components/home/Mascots";

const SERVICES = [
  { Art: CatTarot, photo: "/img/mascots/tarot.png", title: "Người ấy nghĩ gì về bạn?", desc: "Trải bài Tarot tình duyên, đọc lòng người ấy qua 5 lá.", tag: "Được yêu thích", href: "/tarot?chu-de=tinh-duyen&trai=nguoi-ay" },
  { Art: FoxCards, photo: "/img/mascots/bai-tay.png", title: "Bói Bài Tây 52 lá", desc: "Cơ, Rô, Chuồn, Bích — xem nhanh chuyện tình, tiền, việc.", tag: "Mới", href: "/bai-tay" },
  { Art: SageScroll, photo: "/img/mascots/tu-vi.png", title: "Vận hạn năm nay", desc: "Lập lá số Tử Vi, xem đại vận, tiểu hạn và tháng nên chủ động.", tag: "Tử Vi", href: "/tu-vi" },
  { Art: OwlNumbers, photo: "/img/mascots/than-so.png", title: "Giải mã con số đời bạn", desc: "Số chủ đạo, sứ mệnh, linh hồn và năm cá nhân từ ngày sinh.", tag: "Thần Số", href: "/than-so-hoc" },
  { Art: RabbitGlobe, photo: "/img/mascots/chiem-tinh.png", title: "Bản đồ sao cá nhân", desc: "Mặt Trời, Mặt Trăng, Cung Mọc và 10 hành tinh lúc bạn chào đời.", tag: "Chiêm Tinh", href: "/chiem-tinh" },
  { Art: StarSpirit, photo: "/img/mascots/hoi-ai.png", title: "Hỏi AI mọi điều", desc: "Văn khấn, tuổi hợp, ngày tốt, ý nghĩa giấc mơ… hỏi gì cũng được.", tag: "Hỏi đáp", href: "/hoi-dap" },
];

export default function ServiceRow() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={ref} className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-3 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
        {SERVICES.map(({ Art, photo, title, desc, tag, href }) => (
          <Link key={title} href={href}
            className="group flex w-[86%] shrink-0 snap-start gap-4 rounded-2xl border border-white/[0.07] bg-[#15161c]/90 p-3 transition duration-300 hover:-translate-y-1 hover:border-[#dcb56f]/40 hover:shadow-[0_12px_36px_rgba(0,0,0,.45)] sm:w-[48%] lg:w-[calc(33.333%-11px)]">
            <div className="h-[118px] w-[118px] shrink-0 overflow-hidden rounded-xl md:h-[132px] md:w-[132px]">
              <div className="h-full w-full transition duration-500 group-hover:scale-105"><Mascot photo={photo} Art={Art} /></div>
            </div>
            <div className="flex min-w-0 flex-col py-1">
              <div className="line-clamp-2 font-label text-[16px] font-semibold leading-snug text-white md:text-[17px]">
                {title.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="whitespace-nowrap">
                  {title.split(" ").slice(-1)}
                  <Icon name="verified" className="ml-1 align-[-3px] text-[17px] text-[#4ea3ff]" fill />
                </span>
              </div>
              <span className="mt-0.5 text-[12px] text-muted">By AetherAI</span>
              <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-on-surface-variant md:text-[14px]">{desc}</p>
              <span className="mt-2 w-fit rounded-full border border-[#dcb56f]/30 px-2.5 py-0.5 text-[11px] text-[#f3d9a4]">{tag}</span>
            </div>
          </Link>
        ))}
      </div>
      <button onClick={() => scroll(1)} aria-label="Xem thêm dịch vụ" className="absolute -right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#15161c] text-white shadow-lg transition hover:border-[#dcb56f]/60 md:flex">
        <Icon name="chevron_right" className="text-[22px]" />
      </button>
      <button onClick={() => scroll(-1)} aria-label="Quay lại" className="absolute -left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#15161c] text-white shadow-lg transition hover:border-[#dcb56f]/60 md:flex">
        <Icon name="chevron_left" className="text-[22px]" />
      </button>
    </div>
  );
}

/** Hiện hình vẽ SVG trước; nếu có ảnh trong public/img/mascots/ thì đổi sang ảnh khi ảnh tải xong. */
function Mascot({ photo, Art }: { photo: string; Art: () => JSX.Element }) {
  const [ok, setOk] = useState(false);
  return (
    <>
      {!ok && <Art />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt="" className={ok ? "h-full w-full object-cover" : "hidden"} onLoad={() => setOk(true)} />
    </>
  );
}
