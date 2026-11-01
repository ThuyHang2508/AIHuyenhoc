"use client";
// Thật hay Uống: chọn chủ đề → rút từng lá câu hỏi. Cả nhóm ngồi chung, tự đặt luật.
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { LEVELS, QUESTIONS, type Level } from "@/lib/thuy/questions";

type Topic = Level | "random";
type Card = { level: Level; text: string };
const TOPICS: Topic[] = ["random", "quen", "than", "yeu", "sau"];
const RANDOM = { name: "Ngẫu nhiên", icon: "🎲", desc: "Trộn tất cả chủ đề", color: "#ffd36b" };
const info = (t: Topic) => (t === "random" ? RANDOM : LEVELS[t]);

function shuffled(topic: Topic): Card[] {
  const levels = topic === "random" ? (Object.keys(QUESTIONS) as Level[]) : [topic];
  const cards = levels.flatMap((level) => QUESTIONS[level].map((text) => ({ level, text })));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function ThuyClient() {
  const [topic, setTopic] = useState<Topic>("random");
  const [deck, setDeck] = useState<Card[]>([]);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const touch = useRef<number | null>(null);

  // nhớ chủ đề đang chơi khi tải lại trang
  useEffect(() => {
    let t: Topic = "random";
    try { const s = localStorage.getItem("thuy-topic") as Topic | null; if (s && TOPICS.includes(s)) t = s; } catch { /* bỏ qua */ }
    setTopic(t);
    setDeck(shuffled(t));
    setI(0);
  }, []);

  const choose = (t: Topic) => {
    setTopic(t);
    setDeck(shuffled(t));
    setI(0);
    setDir(1);
    try { localStorage.setItem("thuy-topic", t); } catch { /* bỏ qua */ }
  };
  const next = useCallback(() => {
    setDir(1);
    setI((x) => {
      if (x + 1 < deck.length) return x + 1;
      setDeck(shuffled(topic)); // hết bộ thì xáo lại từ đầu
      return 0;
    });
  }, [deck.length, topic]);
  const prev = useCallback(() => { setDir(-1); setI((x) => Math.max(0, x - 1)); }, []);
  const reshuffle = () => { setDeck(shuffled(topic)); setI(0); setDir(1); };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [next, prev]);

  const card = deck[i];
  const L = card ? LEVELS[card.level] : null;
  const total = useMemo(() => deck.length, [deck]);

  return (
    <div className="relative -mt-20 min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,#4a1636_0%,#1a0b1e_45%,#07060c_100%)] pt-20">
      <div className="ritual-stars opacity-50" />
      <div className="relative mx-auto flex max-w-[760px] flex-col items-center px-4 py-6 md:py-10">
        <p className="font-label text-[12px] font-semibold uppercase tracking-[0.25em] text-[#ff9ec4]">
          <Link href="/board-game" className="hover:underline">← Board game</Link> · Party game
        </p>
        <h1 className="mt-2 text-center font-serif text-[38px] leading-tight text-white md:text-[52px]">Thật <span className="text-[#ff9ec4]">hay</span> Uống 🍻</h1>
        <p className="mt-2 max-w-md text-center text-sm text-[#e9d6e2]">Lần lượt rút một lá. Trả lời thật lòng — hoặc nâng ly. Luật chơi do cả nhóm tự đặt!</p>

        {/* chủ đề */}
        <div className="-mx-4 mt-6 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:w-full sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {TOPICS.map((t) => {
            const on = t === topic;
            const x = info(t);
            return (
              <button key={t} onClick={() => choose(t)} aria-pressed={on}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition ${on ? "bg-white/10 text-white" : "border-white/10 text-white/70 hover:text-white"}`}
                style={{ borderColor: on ? x.color : undefined }}>
                <span>{x.icon}</span>{x.name}
              </button>
            );
          })}
        </div>

        {/* lá câu hỏi */}
        {card && L && (
          <button
            key={`${topic}-${i}-${card.text}`}
            onClick={next}
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touch.current === null) return;
              const dx = e.changedTouches[0].clientX - touch.current;
              touch.current = null;
              if (dx > 50) { e.preventDefault(); prev(); }
            }}
            aria-label="Chạm để rút câu tiếp theo"
            className={`${dir > 0 ? "thuy-in-right" : "thuy-in-left"} relative mt-6 flex aspect-[3/4] w-full max-w-[460px] flex-col items-center justify-between overflow-hidden rounded-[32px] border-2 p-7 text-center shadow-[0_24px_70px_rgba(0,0,0,.55)] sm:aspect-[4/3.6] md:p-10`}
            style={{ borderColor: L.color, background: `radial-gradient(ellipse at 50% 0%, ${L.color}40, #160a1c 70%)` }}
          >
            <div className="flex w-full items-center justify-between font-label text-[12px] uppercase tracking-[0.2em]" style={{ color: L.color }}>
              <span>{L.icon} {L.name}</span>
              <span className="text-white/50">{i + 1}/{total}</span>
            </div>
            <p className="font-serif text-[27px] leading-[36px] text-white md:text-[34px] md:leading-[44px]">{card.text}</p>
            <div className="flex w-full items-center justify-center gap-3 text-[13px] text-white/60">
              <span className="rounded-full bg-white/10 px-3 py-1">🗣️ Nói thật</span>
              <span>hay</span>
              <span className="rounded-full bg-[#ffb36b]/20 px-3 py-1 text-[#ffd2a6]">🍺 Uống</span>
            </div>
          </button>
        )}

        <div className="mt-6 flex w-full max-w-[460px] items-center gap-3">
          <button onClick={prev} disabled={i === 0} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 text-white disabled:opacity-30" aria-label="Câu trước">
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <button onClick={next} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff6fa8] to-[#ffb36b] font-label text-[15px] font-bold uppercase tracking-wider text-[#2a0716] shadow-[0_0_30px_rgba(255,111,168,.4)] transition active:scale-[.98]">
            Câu tiếp <Icon name="arrow_forward" className="text-[20px]" />
          </button>
          <button onClick={reshuffle} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 text-white" aria-label="Xáo lại bộ câu hỏi" title="Xáo lại">
            <Icon name="shuffle" className="text-[20px]" />
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-white/50">Chạm vào lá bài hoặc bấm “Câu tiếp” · vuốt phải để xem lại câu trước</p>

        <p className="mt-10 max-w-md text-center text-xs leading-5 text-white/40">
          Gợi ý luật: không muốn trả lời thì uống một ngụm. Không uống được rượu bia? Thay bằng nước ngọt, trà hoặc một hình phạt vui. Uống có trách nhiệm, không lái xe sau khi uống.
        </p>
      </div>
    </div>
  );
}
