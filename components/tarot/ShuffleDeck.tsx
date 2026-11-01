"use client";
// Bước xào bài kiểu dân gian: nam xào 7 lần (bảy vía), nữ xào 9 lần (chín vía).
import { useEffect, useState } from "react";

const PASS_MS = 650; // thời gian một lần xào

export default function ShuffleDeck({ renderBack, question, onPass, onDone }: {
  renderBack: () => React.ReactNode;
  question: string;
  onPass?: () => void; // âm thanh mỗi lần xào
  onDone: (times: number) => void;
}) {
  const [times, setTimes] = useState(0); // tổng số lần cần xào (0 = chưa chọn)
  const [pass, setPass] = useState(0); // đã xào được bao nhiêu lần

  useEffect(() => {
    if (!times) return;
    if (pass >= times) {
      const t = setTimeout(() => onDone(times), 600);
      return () => clearTimeout(t);
    }
    onPass?.();
    const t = setTimeout(() => setPass((p) => p + 1), PASS_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [times, pass]);

  const busy = times > 0;
  const Card = ({ cls = "", style }: { cls?: string; style?: React.CSSProperties }) => (
    <div className={`absolute inset-0 ${cls}`} style={style}>{renderBack()}</div>
  );

  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="font-label text-[12px] font-semibold uppercase tracking-[0.3em] text-[#dcb56f] md:text-[13px]">Xào bài</p>
      <h2 className="mt-2 font-serif text-[30px] leading-tight text-[#f3d9a4] md:text-[40px]">
        {!busy ? "Gửi điều bạn băn khoăn vào bộ bài" : pass < times ? `Bộ bài đang lắng nghe bạn… ${pass + 1}/${times}` : "Bộ bài đã sẵn sàng"}
      </h2>
      {question && <p className="mt-1.5 max-w-xl text-[15px] italic text-on-surface-variant md:text-[17px]">“{question}”</p>}

      {/* bộ bài: hai nửa tách ra rồi xào trộn vào nhau */}
      <div className="relative my-8 h-[184px] w-[120px] md:my-10 md:h-[214px] md:w-[140px]" aria-hidden>
        {[0, 1, 2, 3].map((k) => <Card key={`b${k}`} style={{ transform: `translate(${-k * 1.2}px, ${k * 1.6}px)` }} />)}
        <div key={`L${pass}`} className={`absolute inset-0 ${busy && pass < times ? "shuf-left" : ""}`}>
          {[0, 1, 2].map((k) => <Card key={k} style={{ transform: `translate(${-k}px, ${-k * 1.4}px)` }} />)}
        </div>
        <div key={`R${pass}`} className={`absolute inset-0 ${busy && pass < times ? "shuf-right" : ""}`}>
          {[0, 1, 2].map((k) => <Card key={k} style={{ transform: `translate(${-k}px, ${-4 - k * 1.4}px)` }} />)}
        </div>
        {busy && pass < times && [0, 1, 2, 3, 4, 5].map((k) => (
          <Card key={`r${pass}-${k}`} cls="shuf-riffle" style={{ ["--from" as string]: `${k % 2 ? 90 : -90}px`, animationDelay: `${300 + k * 45}ms`, zIndex: 5 + k }} />
        ))}
      </div>

      {!busy ? (
        <>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setTimes(7)} className="btn-gold !px-8 !py-3.5 !text-[14px] md:!px-10 md:!py-4 md:!text-[15px]">Nam · xào 7 lần</button>
            <button onClick={() => setTimes(9)} className="btn-gold !px-8 !py-3.5 !text-[14px] md:!px-10 md:!py-4 md:!text-[15px]">Nữ · xào 9 lần</button>
          </div>
          <p className="mt-4 text-[13px] text-muted md:whitespace-nowrap md:text-[14px]">Theo lệ dân gian: nam bảy vía xào 7 lần, nữ chín vía xào 9 lần.</p>
        </>
      ) : (
        <div className="flex gap-1.5" aria-label={`Đã xào ${pass} trên ${times} lần`}>
          {Array.from({ length: times }, (_, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-full transition ${i < pass ? "bg-[#dcb56f]" : "bg-white/15"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
