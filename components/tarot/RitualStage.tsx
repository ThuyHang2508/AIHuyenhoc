"use client";
// Chế độ nghi thức toàn màn hình: xáo bài → hít thở → bốc bài từ quạt bài → lật từng lá.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { CardBack, CardFace } from "@/components/TarotCardView";
import CardGrid from "@/components/tarot/CardGrid";
import CardRibbon from "@/components/tarot/CardRibbon";
import ShuffleDeck from "@/components/tarot/ShuffleDeck";
import { chime } from "@/lib/chime";
import { coin, type TarotCard } from "@/lib/tarot";

type Phase = "shuffle" | "breathe" | "draw" | "reveal";
const FAN_SIZE = 24; // số lá trên dải bài

/** Bất kỳ bộ bài nào (Tarot, bài Tây…) — chỉ cần id và tên tiếng Việt. */
type BaseCard = { id: string; vi: string };
type Drawn<T> = { card: T; reversed: boolean };

interface Props<T extends BaseCard> {
  deck: T[]; // đã xáo
  positions: readonly string[];
  topicLabel: string;
  question: string;
  allowReversed: boolean;
  sound: boolean;
  onSoundChange: (v: boolean) => void;
  onDone: (drawn: Drawn<T>[]) => void;
  onExit: () => void;
  /** mặt trước lá bài; mặc định là lá Tarot */
  renderFace?: (card: T, reversed: boolean) => React.ReactNode;
  /** "ribbon": dải bài chạy rồi lật ở ô vị trí (Tarot) · "grid": trải cả bộ thành lưới, lật tại chỗ (bài Tây) */
  layout?: "ribbon" | "grid";
  /** mặt sau lá bài; mặc định là mặt sau Tarot */
  renderBack?: (glow?: boolean) => React.ReactNode;
  /** bước xào bài kiểu dân gian (nam 7 / nữ 9 lần) thay cho hoạt cảnh xáo + hít thở */
  shuffleChoice?: boolean;
}

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function RitualStage<T extends BaseCard>({ deck, positions, topicLabel, question, allowReversed, sound, onSoundChange, onDone, onExit, renderFace, layout = "ribbon", renderBack, shuffleChoice = false }: Props<T>) {
  const Back = ({ glow = false }: { glow?: boolean }) => <>{renderBack ? renderBack(glow) : <CardBack glow={glow} />}</>;
  const [phase, setPhase] = useState<Phase>("shuffle");
  const [picked, setPicked] = useState<{ fanIndex: number; drawn: Drawn<T>; from: { dx: number; dy: number; rot: number } }[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [width, setWidth] = useState(1200);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fan = deck.slice(0, FAN_SIZE);
  const n = positions.length;
  const play = useCallback((k: Parameters<typeof chime>[0]) => sound && chime(k), [sound]);

  // khóa cuộn trang + phím Esc
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onExit();
    window.addEventListener("keydown", esc);
    const rs = () => setWidth(window.innerWidth);
    rs();
    window.addEventListener("resize", rs);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", esc); window.removeEventListener("resize", rs); };
  }, [onExit]);

  useEffect(() => {
    if (phase !== "shuffle" || shuffleChoice) return;
    play("shuffle");
    const t = setTimeout(() => setPhase("breathe"), reduceMotion() ? 300 : 2900);
    return () => clearTimeout(t);
  }, [phase, play]);

  const pickedSet = useMemo(() => new Set(picked.map((p) => p.fanIndex)), [picked]);
  const slotW = Math.max(44, Math.min(n > 10 ? 60 : n > 5 ? 78 : 112, (width - 48) / Math.min(n, n > 10 ? 7 : 5) - 12));

  const pick = (i: number, fromEl: DOMRect, rot: number) => {
    if (phase !== "draw" || picked.length >= n || picked.some((p) => p.fanIndex === i)) return;
    const k = picked.length;
    const toEl = slotRefs.current[k]?.getBoundingClientRect();
    const from = toEl ? { dx: fromEl.left + fromEl.width / 2 - (toEl.left + toEl.width / 2), dy: fromEl.top + fromEl.height / 2 - (toEl.top + toEl.height / 2), rot } : { dx: 0, dy: 0, rot: 0 };
    const drawn: Drawn<T> = { card: fan[i], reversed: allowReversed ? coin() : false };
    const next = [...picked, { fanIndex: i, drawn, from }];
    setPicked(next);
    play("pick");
    if (next.length === n) setTimeout(() => { setFlipped(Array(n).fill(false)); setPhase("reveal"); }, 900);
  };

  const flip = (k: number) => {
    if (flipped[k]) return;
    setFlipped((f) => f.map((v, j) => (j === k ? true : v)));
    play("flip");
  };
  const flipAll = () => {
    flipped.forEach((v, k) => !v && setTimeout(() => flip(k), k * 450));
  };
  const allFlipped = flipped.length === n && flipped.every(Boolean);

  return (
    <div className="ritual-bg fixed inset-0 z-[80] flex flex-col overflow-hidden text-on-surface" role="dialog" aria-modal="true" aria-label="Nghi thức trải bài Tarot">
      <div className="ritual-stars" />
      <Sigil />

      {/* thanh trên */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 md:px-8">
        <div className="min-w-0">
          <div className="label-sm text-[#e8c987]">{topicLabel} · {n} lá</div>
          {question && <div className="truncate text-sm italic text-on-surface-variant">“{question}”</div>}
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-white/10 p-2 text-on-surface-variant hover:text-[#e8c987]" onClick={() => onSoundChange(!sound)} aria-label={sound ? "Tắt âm thanh" : "Bật âm thanh"} title={sound ? "Tắt âm thanh" : "Bật âm thanh"}>
            <Icon name={sound ? "volume_up" : "volume_off"} className="text-[18px]" />
          </button>
          <button className="rounded-full border border-white/10 p-2 text-on-surface-variant hover:text-[#e8c987]" onClick={onExit} aria-label="Thoát nghi thức" title="Thoát (Esc)">
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      </div>

      {phase === "shuffle" && shuffleChoice && (
        <ShuffleDeck renderBack={() => <Back />} question={question} onPass={() => play("pick")} onDone={() => setPhase("draw")} />
      )}

      {phase === "shuffle" && !shuffleChoice && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
          <p className="ritual-fade mb-10 text-center text-on-surface-variant"><Icon name="dark_mode" className="mr-1 align-middle text-[16px] text-[#e8c987]" />Đang xáo bài… giữ ý nghĩ trong tâm.</p>
          <div className="relative" style={{ width: 120, height: 200 }}>
            {Array.from({ length: 9 }, (_, i) => {
              const a = (i / 9) * Math.PI * 2 + 0.4;
              const dist = 120 + (i % 3) * 45;
              return (
                <div key={i} className="shuffle-card absolute left-1/2 top-1/2" style={{ width: 110, height: 182, ["--x" as string]: `${Math.cos(a) * dist}px`, ["--y" as string]: `${Math.sin(a) * dist * 0.55}px`, ["--r" as string]: `${(i % 2 ? 1 : -1) * (12 + i * 3)}deg`, animationDelay: `${i * 0.04}s` }}>
                  <Back />
                </div>
              );
            })}
          </div>
          <button className="mt-14 text-xs text-muted hover:text-on-surface" onClick={() => setPhase("breathe")}>Bỏ qua</button>
        </div>
      )}

      {phase === "breathe" && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="relative flex h-64 w-64 items-center justify-center">
            <div className="breath-ring absolute inset-0 rounded-full border border-[#e8c987]/40 bg-[radial-gradient(circle,rgba(232,201,135,.18),transparent_65%)]" />
            <div className="breath-ring absolute inset-8 rounded-full border border-emerald/30" style={{ animationDelay: "-.6s" }} />
            <div className="deck-pulse relative" style={{ width: 92, height: 152 }}><Back glow /></div>
          </div>
          <div className="relative mt-8 h-7 w-full font-serif text-[22px] text-[#f3dca6]">
            <span className="breath-in absolute inset-x-0">Hít vào thật sâu…</span>
            <span className="breath-out absolute inset-x-0">Thở ra thật chậm…</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-on-surface-variant">Nghĩ về {question ? "câu hỏi của bạn" : `chủ đề ${topicLabel.toLowerCase()}`}. Khi thấy lòng đã lắng lại, hãy bắt đầu chọn bài.</p>
          <button className="btn-gold mt-8" onClick={() => setPhase("draw")}><Icon name="touch_app" className="text-[18px]" /> Tôi đã sẵn sàng</button>
        </div>
      )}

      {layout === "grid" && phase === "draw" && (
        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          <CardGrid
            cards={deck}
            count={n}
            width={width}
            question={question}
            renderFace={(c) => (renderFace ? renderFace(c, false) : <CardFace card={c as unknown as TarotCard} reversed={false} />)}
            onPick={() => play("flip")}
            onComplete={(cards) => onDone(cards.map((card) => ({ card, reversed: false })))}
            renderBack={renderBack ? () => renderBack(false) : undefined}
          />
        </div>
      )}

      {layout === "ribbon" && (phase === "draw" || phase === "reveal") && (
        <div className="relative z-10 flex flex-1 flex-col">
          {/* Ô đặt bài */}
          <div className={`flex flex-col items-center px-4 transition-all duration-700 ${phase === "reveal" ? "flex-1 justify-center" : "pt-2"}`}>
            {phase === "draw" ? (
              <div className="mb-4 text-center">
                <p className="font-label text-[12px] font-semibold uppercase tracking-[0.25em] text-[#dcb56f]">Hãy tập trung vào {question ? "câu hỏi" : "chủ đề"}</p>
                <h2 key={picked.length === 0 ? "a" : picked.length >= n - 1 ? "c" : "b"} className="ritual-fade mt-2 font-serif text-[30px] leading-tight text-[#f3d9a4] md:text-[42px]">
                  {picked.length === 0 ? "Một lá bài đang gọi bạn…" : picked.length >= n - 1 ? "Lá cuối cùng đang chờ bạn…" : "Lắng nghe lá tiếp theo…"}
                </h2>
                <div className="mt-2 flex items-center justify-center gap-2.5 font-serif text-[17px] text-on-surface-variant md:text-[19px]">
                  <span>Chọn</span>
                  <span key={n - picked.length} className="ritual-fade relative flex h-9 w-9 items-center justify-center rounded-full border border-[#dcb56f]/60 text-[#f3d9a4] shadow-[0_0_18px_rgba(220,181,111,.3)]">
                    {n - picked.length}
                    <span className="absolute -top-0.5 right-0.5 h-1 w-1 rounded-full bg-[#dcb56f]" />
                  </span>
                  <span>lá bài</span>
                </div>
              </div>
            ) : (
              <p className="mb-4 text-center text-sm text-on-surface-variant">{allFlipped ? "✦ Thông điệp đã hiện ra." : "✦ Chạm vào từng lá để lật."}</p>
            )}
            <div className="flex max-w-full flex-wrap justify-center gap-3">
              {positions.map((pos, k) => {
                const p = picked[k];
                const w = phase === "reveal" ? Math.max(slotW, Math.min(n > 10 ? 88 : n > 5 ? 96 : 170, (width - 48) / Math.min(n, width < 520 ? (n > 10 ? 4 : 3) : n > 10 ? 7 : 5) - 16)) : slotW;
                return (
                  <div key={pos} className="flex flex-col items-center transition-all duration-700" style={{ width: w }}>
                    <div className="mb-1.5 h-9 text-center leading-tight">
                      <div className="label-sm text-[#e8c987]">{pos}</div>
                      {phase === "reveal" && flipped[k] && p && (
                        <div className="ritual-fade text-[12px] text-on-surface">{p.drawn.card.vi}{p.drawn.reversed && <span className="text-error-soft"> · ngược</span>}</div>
                      )}
                    </div>
                    <div ref={(el) => { slotRefs.current[k] = el; }} className="relative w-full" style={{ height: w * 1.65 }}>
                      {!p ? (
                        <div className={`flex h-full w-full items-center justify-center rounded-[10px] border border-dashed ${k === picked.length ? "border-[#e8c987]/60 bg-[#e8c987]/[0.04]" : "border-white/15"} font-serif text-[20px] text-white/30`}>{k + 1}</div>
                      ) : (
                        <FlyIn from={p.from}>
                          <button className="relative h-full w-full [perspective:1000px]" onClick={() => phase === "reveal" && flip(k)} disabled={phase !== "reveal" || flipped[k]} aria-label={`Lật lá ở vị trí ${pos}`}>
                            {phase === "reveal" && flipped[k] && <span className="reveal-burst pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,226,150,.55),transparent_65%)]" />}
                            <div className={`flip-inner relative h-full w-full ${flipped[k] ? "is-flipped" : ""}`}>
                              <div className="flip-face"><CardBack glow={phase === "reveal" && !flipped[k]} /></div>
                              <div className="flip-face flip-back">{renderFace ? renderFace(p.drawn.card, p.drawn.reversed) : <CardFace card={p.drawn.card as unknown as TarotCard} reversed={p.drawn.reversed} />}</div>
                            </div>
                          </button>
                        </FlyIn>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {phase === "reveal" && (
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {!allFlipped && <button className="btn-ghost" onClick={flipAll}><Icon name="flip" className="text-[16px]" /> Lật tất cả</button>}
                {allFlipped && (
                  <button className="btn-gold ritual-fade" onClick={() => onDone(picked.map((p) => p.drawn))}>
                    <Icon name="auto_awesome" className="text-[18px]" /> Xem luận giải
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dải bài chạy */}
          {phase === "draw" && (
            <div className="mt-auto pb-6">
              <CardRibbon cards={fan} picked={pickedSet} disabled={picked.length >= n} width={width} onPick={pick} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Lá bài bay từ vị trí cũ (dx, dy, rot) về chỗ của nó. */
function FlyIn({ from, children }: { from: { dx: number; dy: number; rot: number }; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion()) return;
    el.style.transition = "none";
    el.style.transform = `translate(${from.dx}px, ${from.dy}px) rotate(${from.rot}deg) scale(.85)`;
    el.getBoundingClientRect();
    requestAnimationFrame(() => {
      el.style.transition = "transform .75s cubic-bezier(.2,.8,.2,1)";
      el.style.transform = "none";
    });
  }, [from]);
  return <div ref={ref} className="h-full w-full">{children}</div>;
}

/** Vòng hoa văn năng lượng xoay rất chậm phía sau. */
function Sigil() {
  return (
    <svg className="ritual-sigil pointer-events-none absolute left-1/2 top-1/2 -ml-[45vmin] -mt-[45vmin] h-[90vmin] w-[90vmin] opacity-[0.10]" viewBox="0 0 200 200" aria-hidden>
      <g fill="none" stroke="#e8c987" strokeWidth=".4">
        <circle cx="100" cy="100" r="96" />
        <circle cx="100" cy="100" r="80" strokeDasharray="2 3" />
        <circle cx="100" cy="100" r="52" />
        <path d="M100 20 L169 140 L31 140 Z" />
        <path d="M100 180 L31 60 L169 60 Z" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return <line key={i} x1={100 + 80 * Math.cos(a)} y1={100 + 80 * Math.sin(a)} x2={100 + 96 * Math.cos(a)} y2={100 + 96 * Math.sin(a)} />;
        })}
      </g>
    </svg>
  );
}
