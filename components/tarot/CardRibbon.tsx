"use client";
// Dải bài chạy ngang vô tận, các lá xếp chồng như bộ bài thật: tự trôi, kéo/vuốt để lướt, người dùng tự chọn.
import { useEffect, useRef } from "react";
import { CardBack } from "@/components/TarotCardView";

interface Props {
  cards: { id: string }[];
  picked: Set<number>;
  disabled: boolean;
  width: number; // bề rộng màn hình, để tính cỡ lá
  onPick: (index: number, rect: DOMRect, rot: number) => void;
}

const SPEED = 72; // px mỗi giây
const tilt = (i: number) => (((i * 37) % 9) - 4) * 0.9; // nghiêng −3.6° … 3.6°
const lift = (i: number) => (((i * 53) % 7) - 3) * 5; // lệch dọc −15 … 15 px

export default function CardRibbon({ cards, picked, disabled, width, onPick }: Props) {
  const n = cards.length;
  const cardW = Math.round(Math.min(170, Math.max(92, width / 7.5)));
  const cardH = Math.round(cardW * 1.62);
  const overlap = Math.round(cardW * 0.4); // các lá chồng lên nhau 40%
  const unit = cardW - overlap;
  const loop = Math.max(1, n - picked.size) * unit; // bề rộng một vòng (lá đã rút được thu lại)

  const boxRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(loop * 0.3);
  const pausedUntil = useRef(0);
  const hover = useRef(false);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);

  // vòng lặp trôi
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!still && !hover.current && !drag.current && t > pausedUntil.current) offset.current += SPEED * dt;
      offset.current = ((offset.current % loop) + loop) % loop;
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${-offset.current}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loop]);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, start: offset.current, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6) d.moved = true;
    offset.current = d.start - dx;
  };
  const endDrag = () => {
    if (drag.current?.moved) pausedUntil.current = performance.now() + 1500;
    setTimeout(() => (drag.current = null), 0);
  };

  const pickEl = (i: number, el: HTMLElement | null) => {
    if (disabled || picked.has(i) || !el || drag.current?.moved) return;
    pausedUntil.current = performance.now() + 900;
    onPick(i, el.getBoundingClientRect(), tilt(i));
  };

  // bốc ngẫu nhiên một lá đang nằm trọn trong khung nhìn
  const intuition = () => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    const els = [...(trackRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? [])].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > cardW * 0.9 && r.left >= box.left + 4 && r.right <= box.right - 4 && !picked.has(Number(el.dataset.card));
    });
    const el = els[Math.floor(Math.random() * els.length)];
    if (el) pickEl(Number(el.dataset.card), el);
  };

  return (
    <div className="relative w-full">
      <div
        ref={boxRef}
        className="relative w-full cursor-grab touch-pan-y select-none overflow-hidden py-8 active:cursor-grabbing [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
        style={{ height: cardH + 70 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={() => { hover.current = false; endDrag(); }}
        onPointerEnter={() => (hover.current = true)}
        onWheel={(e) => { offset.current += e.deltaX || e.deltaY; pausedUntil.current = performance.now() + 1200; }}
      >
        <div ref={trackRef} className="absolute left-0 top-1/2 flex will-change-transform" style={{ marginTop: -cardH / 2 }}>
          {Array.from({ length: n * 2 }, (_, j) => {
            const i = j % n;
            const gone = picked.has(i);
            return (
              <button
                key={j}
                data-card={i}
                aria-label={`Lá bài úp số ${i + 1}`}
                tabIndex={j < n ? 0 : -1}
                disabled={gone || disabled}
                onClick={(e) => pickEl(i, e.currentTarget)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pickEl(i, e.currentTarget))}
                className={`ribbon-card group relative shrink-0 transition-[opacity,width,margin] duration-500 hover:z-20 focus-visible:z-20 focus-visible:outline-none ${gone ? "pointer-events-none opacity-0" : ""}`}
                style={{ width: gone ? 0 : cardW, marginRight: gone ? 0 : -overlap, height: cardH, animationDelay: `${(i % 7) * -0.6}s` }}
              >
                <div
                  className="h-full w-full transition-transform duration-300 group-hover:-translate-y-4 group-hover:scale-[1.04] group-focus-visible:-translate-y-4"
                  style={{ transform: `translateY(${lift(i)}px) rotate(${tilt(i)}deg)` }}
                >
                  <CardBack className="shadow-[-6px_0_18px_rgba(0,0,0,.55)] transition-shadow duration-300 group-hover:shadow-[0_0_30px_rgba(255,214,130,.6)] group-focus-visible:shadow-[0_0_30px_rgba(255,214,130,.6)]" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-1 flex justify-center">
        <button onClick={intuition} disabled={disabled} className="text-sm text-[#dcb56f]/80 underline-offset-4 transition hover:text-[#f3d9a4] hover:underline disabled:opacity-40">
          ✦ Để trực giác chọn giúp
        </button>
      </div>
    </div>
  );
}
