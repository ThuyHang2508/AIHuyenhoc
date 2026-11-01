"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "./Icon";

const QUICK = [
  "Sự nghiệp năm nay của tôi ra sao?",
  "Người ấy có thật lòng với tôi?",
  "Số chủ đạo 7 có ý nghĩa gì?",
  "Tháng này làm sao để giữ tiền?",
  "Tuổi nào hợp với tôi để cưới?",
  "Có nên chuyển việc năm nay?",
];
// câu mẫu tự đổi trong ô hỏi
const ROTATE = [
  "Tôi có nên chuyển việc trong năm nay không?",
  "Tuổi Ngọ hợp với tuổi nào để kết hôn?",
  "Cung Mọc Thiên Bình nói gì về tôi?",
  "Văn khấn mùng 1 cần chuẩn bị gì?",
  "Lá The Star trong tình yêu nghĩa là gì?",
];

export default function AskBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hint, setHint] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHint((h) => (h + 1) % ROTATE.length), 3200);
    return () => clearInterval(id);
  }, []);
  const go = (text: string) => text.trim() && router.push(`/hoi-dap?q=${encodeURIComponent(text.trim())}`);

  return (
    <div className="relative w-full max-w-3xl">
      <form
        onSubmit={(e) => { e.preventDefault(); go(q); }}
        className="rounded-3xl border border-[#dcb56f]/30 bg-black/40 p-4 text-left shadow-[0_0_60px_rgba(220,181,111,.12)] backdrop-blur transition focus-within:border-[#dcb56f]/70 md:p-5"
      >
        <div className="relative">
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(q); } }}
            rows={2}
            aria-label="Câu hỏi của bạn"
            className="peer w-full resize-none bg-transparent text-[16px] leading-7 text-on-surface outline-none"
          />
          {!q && (
            <span key={hint} className="ritual-fade pointer-events-none absolute left-0 top-0 text-[16px] leading-7 text-slate-500">
              {ROTATE[hint]}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-muted"><Icon name="auto_awesome" className="text-[15px] text-[#dcb56f]" /> AI trả lời theo Tử Vi, Thần Số, Tarot và Chiêm Tinh</span>
          <button aria-label="Gửi câu hỏi" className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#f0d398] to-[#c99a4b] text-[#1a1408] shadow-[0_0_24px_rgba(220,181,111,.45)] transition hover:scale-105">
            <Icon name="arrow_upward" className="text-[22px]" />
          </button>
        </div>
      </form>
      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-auto md:max-w-[760px] md:flex-wrap md:justify-center md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {QUICK.map((x) => (
          <button key={x} onClick={() => go(x)}
            className="group flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[12.5px] text-on-surface-variant/90 transition hover:border-[#dcb56f]/50 hover:bg-[#dcb56f]/[0.08] hover:text-[#f3d9a4]">
            <span className="text-[10px] text-[#dcb56f]/70 transition group-hover:text-[#f3d9a4]">✦</span>
            {x}
          </button>
        ))}
      </div>
    </div>
  );
}
