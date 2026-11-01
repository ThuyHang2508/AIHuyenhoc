import Link from "next/link";

// Mục "AetherAI có thể giúp gì cho bạn?" — 4 thẻ khung vàng hoa văn cổ.
const ITEMS = [
  {
    title: "Hiểu rõ chính mình",
    points: ["Nhận ra tính cách, điểm mạnh và điều cần rèn qua Thần Số, Tử Vi", "Hiểu vì sao mình phản ứng như vậy trong những lúc khó", "Tìm ra giá trị và hướng đi hợp với con người thật của bạn"],
    cta: "Xem thần số",
    href: "/than-so-hoc",
  },
  {
    title: "Gỡ rối khi phân vân",
    points: ["Có thêm góc nhìn khi đứng giữa nhiều lựa chọn", "Thấy rõ điều bạn đang bỏ sót trước khi quyết định", "Câu hỏi Có / Không được trả lời rõ ràng, có lý do"],
    cta: "Trải bài Tarot",
    href: "/tarot",
  },
  {
    title: "Thấu hiểu các mối quan hệ",
    points: ["Hiểu cảm xúc của chính mình và của người ấy", "Nhận ra điều đang ngăn hai người đến gần nhau", "Biết nên vun đắp, chờ đợi hay buông nhẹ"],
    cta: "Người ấy nghĩ gì?",
    href: "/tarot?chu-de=tinh-duyen&trai=nguoi-ay",
  },
  {
    title: "Định hướng và lên kế hoạch",
    points: ["Biết năm nay, tháng này thuận cho việc gì", "Nhìn trước thử thách trong công việc, tài chính", "Chủ động chuẩn bị thay vì chờ mọi chuyện xảy đến"],
    cta: "Xem vận hạn năm",
    href: "/tu-vi",
  },
];

/** Góc hoa văn xoắn (xoay theo từng góc) */
const Corner = ({ cls }: { cls: string }) => (
  <svg viewBox="0 0 24 24" className={`absolute h-6 w-6 text-[#c9a15c] ${cls}`} aria-hidden>
    <path d="M2 22 V10 A8 8 0 0 1 10 2 H22" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6 22 V12 A6 6 0 0 1 12 6 H22" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".6" />
    <path d="M10 13 a3 3 0 1 1 3 -3" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);
const Diamond = ({ cls }: { cls: string }) => (
  <span className={`absolute h-2.5 w-2.5 rotate-45 border border-[#c9a15c] bg-[#0b0d14] ${cls}`} aria-hidden />
);

export default function HelpSection() {
  return (
    <section className="pt-16">
      <h2 className="mb-8 text-center font-serif text-[30px] text-[#f3d9a4] md:text-[40px]">AetherAI có thể giúp gì cho bạn?</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((it) => (
          <div key={it.title} className="group relative flex flex-col rounded-2xl border border-[#c9a15c]/70 bg-black/25 p-2.5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_36px_rgba(220,181,111,.18)]">
            <div className="relative flex flex-1 flex-col rounded-xl border border-[#c9a15c]/40 px-6 pb-6 pt-9">
              <Corner cls="-left-px -top-px" />
              <Corner cls="-right-px -top-px rotate-90" />
              <Corner cls="-bottom-px -right-px rotate-180" />
              <Corner cls="-bottom-px -left-px -rotate-90" />
              <Diamond cls="-top-[6px] left-1/2 -translate-x-1/2" />
              <Diamond cls="-bottom-[6px] left-1/2 -translate-x-1/2" />
              <Diamond cls="-left-[6px] top-1/2 -translate-y-1/2" />
              <Diamond cls="-right-[6px] top-1/2 -translate-y-1/2" />
              <h3 className="text-center font-serif text-[23px] leading-tight text-[#f3d9a4]">{it.title}</h3>
              <ul className="mt-5 space-y-3">
                {it.points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-[15px] leading-6 text-on-surface-variant">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rotate-45 bg-[#dcb56f]" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
              <Link href={it.href} className="mt-auto pt-6 text-center text-sm font-semibold text-[#dcb56f] transition hover:text-[#f3d9a4]">
                {it.cta} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
