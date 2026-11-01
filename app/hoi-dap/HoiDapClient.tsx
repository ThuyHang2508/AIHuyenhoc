"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ChatPanel from "@/components/ChatPanel";
import Icon from "@/components/Icon";

export default function HoiDapClient() {
  const q = useSearchParams().get("q") ?? "";
  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 px-5 py-10 md:px-6 lg:grid-cols-[1fr_320px]">
      <div>
        <span className="chip mb-3">Oracle tổng hợp</span>
        <h1 className="mb-6 font-serif text-[36px] leading-10 text-primary md:text-headline-lg">Hỏi Đáp Huyền Học AI</h1>
        <ChatPanel
          agent="general"
          context=""
          title="Đối Thoại Với Oracle"
          sessionKey={q || "empty"}
          initialQuestion={q || undefined}
          suggestions={["Tử vi và thần số học khác nhau thế nào?", "Năm 2027 là năm con gì, mệnh gì?", "Làm sao biết giờ sinh âm lịch của mình?"]}
        />
      </div>
      <aside className="space-y-4 lg:pt-[92px]">
        <div className="panel">
          <h2 className="font-serif text-headline-sm text-primary">Muốn luận giải chính xác hơn?</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Câu trả lời ở đây là kiến thức chung. Để AI đọc riêng cho bạn, hãy dùng công cụ có ngày giờ sinh:</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/tu-vi" className="btn-ghost justify-start"><Icon name="grid_on" className="text-[16px]" /> Lập lá số Tử Vi</Link>
            <Link href="/than-so-hoc" className="btn-ghost justify-start"><Icon name="grid_view" className="text-[16px]" /> Tra Thần Số Học</Link>
            <Link href="/tarot" className="btn-ghost justify-start"><Icon name="style" className="text-[16px]" /> Trải bài Tarot</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
