"use client";
// Trải cả bộ bài úp thành lưới trên bàn; chạm lá nào lá đó lật ngửa tại chỗ.
import { useEffect, useRef, useState } from "react";
import { CardBack } from "@/components/TarotCardView";

interface Props<T extends { id: string }> {
  cards: T[];
  count: number; // số lá cần chọn
  width: number;
  question: string;
  renderFace: (card: T) => React.ReactNode;
  onPick: () => void; // âm thanh
  onComplete: (picked: T[]) => void;
  renderBack?: () => React.ReactNode;
}

export default function CardGrid<T extends { id: string }>({ cards, count, width, question, renderFace, onPick, onComplete, renderBack }: Props<T>) {
  const [picked, setPicked] = useState<number[]>([]);
  const cols = width >= 1100 ? 13 : width >= 760 ? 9 : width >= 520 ? 7 : 6;
  const cardW = Math.max(40, Math.min(78, (Math.min(width, 1180) - 48 - (cols - 1) * 8) / cols));
  const done = picked.length >= count;
  // hiệu ứng chia bài: các lá bay ra từ chồng bài ở giữa bàn, lần lượt từng lá
  const GAP = 8;
  const cardH = cardW * 1.5;
  const rows = Math.ceil(cards.length / cols);
  const stagger = 40; // ms giữa hai lá
  const [dealing, setDealing] = useState(true);
  const [dealt, setDealt] = useState(0); // số lá đã rời khỏi chồng bài
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) { setDealt(cards.length); setDealing(false); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const n = Math.min(cards.length, Math.floor((t - start) / stagger) + 1);
      setDealt(n);
      if (n < cards.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const end = setTimeout(() => setDealing(false), cards.length * stagger + 650);
    return () => { cancelAnimationFrame(raf); clearTimeout(end); };
  }, [cards.length]);
  const left = cards.length - dealt;
  const complete = useRef(onComplete);
  complete.current = onComplete;

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => complete.current(picked.map((i) => cards[i])), 1600);
    return () => clearTimeout(t);
  }, [done, picked, cards]);

  const pick = (i: number) => {
    if (dealing || done || picked.includes(i)) return;
    setPicked((p) => [...p, i]);
    onPick();
  };

  return (
    <div className="flex flex-1 flex-col items-center px-3 pb-6">
      <p className="font-label text-[12px] font-semibold uppercase tracking-[0.25em] text-[#dcb56f]">Bàn trải {cards.length} lá</p>
      <h2 className="mt-2 text-center font-serif text-[28px] leading-tight text-[#f3d9a4] md:text-[38px]">
        {dealing ? (left > 0 ? `Đang chia bài… còn ${left} lá` : "Đã chia hết bài")  : done ? "Các lá đã lên tiếng…" : picked.length === 0 ? "Chọn lá bài theo trực giác" : "Tiếp tục lắng nghe…"}
      </h2>
      <p className="mt-1 max-w-xl text-center text-sm text-on-surface-variant">{question ? `“${question}”` : "Đừng suy nghĩ quá lâu — hãy chạm vào lá khiến bạn chú ý."}</p>
      <div className="mt-3 flex items-center gap-3 rounded-full border border-[#dcb56f]/30 bg-black/30 px-4 py-1.5 text-sm text-[#f3d9a4]">
        Đã chọn <b className="font-serif text-[18px]">{picked.length}/{count}</b>
      </div>

      <div className={`relative mt-2 grid max-h-[calc(100vh-230px)] gap-2 px-8 py-10 ${dealing ? "overflow-hidden" : "overflow-y-auto"}`} style={{ gridTemplateColumns: `repeat(${cols}, ${cardW}px)` }}>
        {dealing && left > 0 && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20" style={{ width: cardW, height: cardH, marginLeft: -cardW / 2, marginTop: -cardH / 2 }} aria-hidden>
            {Array.from({ length: Math.max(1, Math.ceil((left / cards.length) * 10)) }, (_, k) => k).map((k) => (
              <div key={k} className="absolute inset-0" style={{ transform: `translate(${-k * 1.2}px, ${-k * 1.6}px)` }}>
                {renderBack ? renderBack() : <CardBack />}
              </div>
            ))}
          </div>
        )}
        {cards.map((c, i) => {
          const order = picked.indexOf(i);
          const on = order >= 0;
          // vị trí lá so với tâm bàn → điểm xuất phát khi chia
          const col = i % cols, row = Math.floor(i / cols);
          const dx = (cols * (cardW + GAP)) / 2 - (col * (cardW + GAP) + cardW / 2);
          const dy = (rows * (cardH + GAP)) / 2 - (row * (cardH + GAP) + cardH / 2);
          return (
            <button
              key={c.id}
              onClick={() => pick(i)}
              disabled={on || done}
              aria-label={on ? `Lá thứ ${order + 1}` : `Lá úp số ${i + 1}`}
              className={`group relative [perspective:800px] focus-visible:outline-none ${done && !on ? "opacity-25" : ""} ${on ? "z-30" : ""} transition-opacity duration-700`}
              style={{ width: cardW, height: cardW * 1.5 }}
            >
              <div className="h-full w-full transition-transform duration-500 ease-out" style={{ transform: on ? `translateY(-4px) scale(${done ? 1.55 : 1.4})` : undefined }}>
              <div className="deal-in h-full w-full" style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, ["--rot" as string]: `${((i * 37) % 21) - 10}deg`, animationDelay: `${i * stagger}ms` }}>
              <div className={`flip-inner relative h-full w-full ${on ? "is-flipped" : ""}`}>
                <div className="flip-face transition duration-200 group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5">
                  <div className="h-full w-full rounded-[10px] transition-shadow group-hover:shadow-[0_0_18px_rgba(255,214,130,.6)] group-focus-visible:shadow-[0_0_18px_rgba(255,214,130,.6)]">
                    {renderBack ? renderBack() : <CardBack />}
                  </div>
                </div>
                <div className={`flip-face flip-back rounded-[10px] ${on ? "shadow-[0_0_30px_rgba(255,214,130,.55)]" : ""}`}>{renderFace(c)}</div>
              </div>
              </div>
              </div>
              {on && (
                <span className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#dcb56f] text-[11px] font-bold text-[#1a1408] shadow">{order + 1}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
