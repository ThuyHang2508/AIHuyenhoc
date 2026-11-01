"use client";
// Rút một lá + một thông điệp: mỗi lần chạm là một lá mới (ngẫu nhiên trong 78 lá).
import Link from "next/link";
import { useRef, useState } from "react";
import { requestAuth } from "@/lib/ai-settings";
import Icon from "@/components/Icon";
import { CardBack, CardFace } from "@/components/TarotCardView";
import { chime } from "@/lib/chime";
import { DECK, type TarotCard } from "@/lib/tarot";

const MESSAGES = [
  "Điều bạn đang trì hoãn chính là cánh cửa của hôm nay.",
  "Chậm lại một nhịp, câu trả lời sẽ tự hiện ra.",
  "Một lời tử tế hôm nay sẽ mở ra điều bạn chưa thấy.",
  "Buông bớt điều không còn phục vụ bạn để đón điều mới.",
  "Tin vào cảm giác đầu tiên, rồi kiểm chứng bằng một bước nhỏ.",
  "Giữ năng lượng cho điều quan trọng nhất, phần còn lại có thể đợi.",
  "Bạn không cần thấy cả con đường, chỉ cần bước tiếp theo.",
  "Điều bạn tìm kiếm cũng đang tìm kiếm bạn.",
  "Hãy nói điều bạn thật sự muốn — vũ trụ cần nghe rõ.",
  "Một kết thúc nhỏ đang dọn chỗ cho một khởi đầu lớn.",
  "Đừng so sánh chương đầu của mình với chương giữa của người khác.",
  "Sự kiên nhẫn hôm nay là món quà cho chính bạn ngày mai.",
  "Nghỉ ngơi cũng là một cách tiến về phía trước.",
  "Câu trả lời bạn cần nằm trong một cuộc trò chuyện thật lòng.",
  "Dám nhận điều tốt đẹp — bạn xứng đáng với nó.",
  "Hãy dọn một góc nhỏ, tâm trí sẽ nhẹ đi nhiều.",
  "Một cơ hội đang đến dưới hình dạng một lời mời bình thường.",
  "Ranh giới rõ ràng là cách yêu thương chính mình.",
  "Điều làm bạn sợ có khi là điều đáng làm nhất.",
  "Hôm nay hợp để học một điều mới, dù rất nhỏ.",
  "Đừng giữ lời khen trong lòng — hãy nói ra.",
  "Tiền bạc cần kế hoạch, tình cảm cần sự hiện diện.",
  "Bạn đã đi xa hơn mình tưởng. Hãy ghi nhận điều đó.",
  "Lắng nghe cơ thể: nó biết điều bạn đang lờ đi.",
  "Một quyết định dứt khoát sẽ giải phóng rất nhiều năng lượng.",
  "Hãy để một người giúp bạn — đó không phải là yếu đuối.",
  "Điều gì đến dễ dàng hôm nay, hãy đón nhận mà không nghi ngờ.",
  "Viết ra ba điều biết ơn, ngày của bạn sẽ khác đi.",
  "Đừng vội trả lời. Một đêm suy nghĩ sẽ cho bạn sự sáng suốt.",
  "Bạn mạnh mẽ nhất khi bạn là chính mình.",
  "Gieo một hạt nhỏ hôm nay, mùa sau sẽ thành cánh đồng.",
  "Có những cánh cửa phải đóng lại để bạn thấy cánh cửa đúng.",
  "Niềm vui nhỏ cũng là niềm vui. Hãy cho phép mình tận hưởng.",
  "Tha thứ không phải cho người khác, mà để bạn nhẹ lòng.",
  "Hãy hỏi thêm một câu trước khi kết luận.",
  "Năng lượng tốt đến từ những người khiến bạn được là mình.",
  "Một thói quen nhỏ lặp lại sẽ thay đổi cả năm của bạn.",
  "Đừng để nỗi lo của ngày mai lấy mất niềm vui của hôm nay.",
  "Trực giác của bạn đang nói nhỏ — hãy yên lặng để nghe.",
  "Mọi thứ đang diễn ra đúng lúc, kể cả khi bạn chưa thấy.",
];

// Buổi trong ngày theo giờ Việt Nam
function buoi() {
  const h = Number(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh", hour: "numeric", hour12: false })) % 24;
  return h < 11 ? "Sáng" : h < 13 ? "Trưa" : h < 18 ? "Chiều" : "Tối";
}
const WISH: Record<string, string> = {
  Sáng: "Chúc bạn một buổi sáng nhẹ nhàng và nhiều năng lượng.",
  Trưa: "Chúc bạn có một buổi trưa thong thả, nạp lại sức cho nửa ngày còn lại.",
  Chiều: "Chúc bạn một buổi chiều trôi qua êm và gọn gàng.",
  Tối: "Chúc bạn một buổi tối bình yên và giấc ngủ thật sâu.",
};
const SUIT_ADVICE: Record<string, string> = {
  major: "Đây là một lá Ẩn Chính, điều nó nhắc có thể là một bài học lớn hơn chuyện thường ngày, nên hãy dành vài phút lặng lại với nó.",
  wands: "Năng lượng hành động đang lên, hãy bắt tay vào một việc nhỏ ngay bây giờ thay vì chờ đủ cảm hứng.",
  cups: "Hãy để ý cảm xúc của mình và người bên cạnh, một lời hỏi han đúng lúc sẽ có ý nghĩa hơn bạn nghĩ.",
  swords: "Đầu óc bạn đang cần sự rõ ràng, viết ra điều đang rối sẽ giúp bạn quyết định dễ hơn.",
  pentacles: "Hãy chăm chút những việc thực tế như tiền bạc, công việc, nếp sinh hoạt, từng bước nhỏ đều đáng giá.",
};
/** Thông điệp ghép sẵn (hiện ngay, dùng khi chưa có AI). */
function composed(c: TarotCard, reversed: boolean, b: string) {
  const meaning = (reversed ? c.reversed : c.upright).toLowerCase();
  const s1 = `${b} nay, lá ${c.vi}${reversed ? " ở chiều ngược" : ""} nhắc đến ${meaning}.`;
  const s2 = reversed ? "Năng lượng này đang bị chặn lại hoặc hướng vào bên trong, nên đừng ép mình phải bung sức; " + SUIT_ADVICE[c.suit].charAt(0).toLowerCase() + SUIT_ADVICE[c.suit].slice(1) : SUIT_ADVICE[c.suit];
  return `${s1} ${s2} ${WISH[b]}`;
}

const rand = (n: number) => {
  try {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % n;
  } catch {
    return Math.floor(Math.random() * n);
  }
};

export default function DailyCard({ solar, lunar }: { solar: string; lunar: string }) {
  const [card, setCard] = useState<TarotCard>(DECK[0]);
  const [msg, setMsg] = useState(MESSAGES[0]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  const [reversed, setReversed] = useState(false);
  const [text, setText] = useState("");
  const [writing, setWriting] = useState(false);
  const turn = useRef(0);

  // AI viết thông điệp riêng cho lá vừa rút; lỗi / chưa có key thì giữ thông điệp ghép sẵn
  const write = async (c: TarotCard, rev: boolean) => {
    const my = ++turn.current;
    const b = buoi();
    setText(composed(c, rev, b));
    setWriting(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: "daily",
          mini: true,
          context: `Lá: ${c.vi} (${c.name}), chiều ${rev ? "NGƯỢC" : "xuôi"}. Ý nghĩa: ${rev ? c.reversed : c.upright}. Buổi: ${b.toLowerCase()} nay.`,
          messages: [{ role: "user", content: "Viết thông điệp cho lá bài tôi vừa rút." }],
          ...requestAuth(),
        }),
      });
      if (!res.ok || res.status === 204 || !res.body) return;
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done || my !== turn.current) break;
        acc += dec.decode(value, { stream: true });
        if (acc.trim().length > 20) setText(acc.replace(/[*#_`]/g, "").trim());
      }
    } catch {
      /* giữ thông điệp ghép sẵn */
    } finally {
      if (my === turn.current) setWriting(false);
    }
  };

  const choose = (prev?: TarotCard) => {
    let c = DECK[rand(DECK.length)];
    while (prev && c.id === prev.id) c = DECK[rand(DECK.length)];
    const rev = rand(100) < 33;
    setCard(c);
    setReversed(rev);
    write(c, rev);
    setMsg((m) => {
      let next = MESSAGES[rand(MESSAGES.length)];
      while (next === m) next = MESSAGES[rand(MESSAGES.length)];
      return next;
    });
  };

  const draw = () => {
    if (busy) return;
    setBusy(true);
    if (open) {
      // úp lá lại, đổi lá khi đang úp, rồi lật lá mới
      setOpen(false);
      setTimeout(() => { choose(card); setOpen(true); chime("flip"); }, 650);
      setTimeout(() => setBusy(false), 1500);
    } else {
      choose();
      setTimeout(() => { setOpen(true); chime("flip"); }, 30);
      setTimeout(() => setBusy(false), 900);
    }
    setCount((n) => n + 1);
  };

  return (
    <div className="grid items-center gap-8 md:grid-cols-[220px_1fr] md:gap-12">
      <button onClick={draw} aria-label={open ? `${card.vi} — chạm để rút lá khác` : "Chạm để rút một lá bài"} className="group mx-auto w-[180px] md:w-[220px] [perspective:1000px]">
        <div className={`flip-inner relative aspect-[2/3.2] w-full ${open ? "is-flipped" : ""}`}>
          <div className="flip-face transition group-hover:-translate-y-1"><CardBack glow className="deck-pulse" /></div>
          <div className="flip-face flip-back"><CardFace card={card} reversed={reversed} /></div>
        </div>
      </button>
      <div className="text-center md:text-left">
        <div className="font-label text-[12px] font-semibold uppercase tracking-[0.25em] text-[#dcb56f]">Thông điệp dành cho bạn · {solar}</div>
        <div className="mt-1 text-xs text-muted">Âm lịch {lunar}</div>
        {open ? (
          <div key={card.id + String(reversed)} className="ritual-fade">
            <h3 className="mt-3 font-serif text-[34px] leading-tight text-[#f3d9a4]">{card.vi} <span className="text-[20px] text-on-surface-variant">· {card.name}</span></h3>
            <div className="mt-1 font-label text-[12px] uppercase tracking-[0.25em] text-[#dcb56f]/80">Chiều {reversed ? "ngược" : "xuôi"} · {reversed ? card.reversed : card.upright}</div>
            <p className="mt-4 max-w-xl text-[16px] leading-7 text-on-surface">
              {text}
              {writing && <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-[#dcb56f] align-middle" />}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <button onClick={draw} disabled={busy} className="btn-gold disabled:opacity-60"><Icon name="autorenew" className="text-[18px]" /> Rút lá khác</button>
              <Link href="/tarot" className="inline-flex items-center gap-1.5 rounded-full border border-[#dcb56f]/40 px-6 py-3 text-sm text-[#f3d9a4] transition hover:border-[#dcb56f]">Trải bài đầy đủ <Icon name="arrow_forward" className="text-[16px]" /></Link>
            </div>
            {count > 1 && <p className="mt-3 text-xs text-muted">Đã rút {count} lá · chạm vào lá bài để rút tiếp</p>}
          </div>
        ) : (
          <div>
            <h3 className="mt-3 font-serif text-[34px] leading-tight text-[#f3d9a4]">Vũ trụ đang gửi bạn điều gì?</h3>
            <p className="mt-2 text-on-surface-variant">Hít một hơi thật sâu, nghĩ về điều bạn đang bận lòng, rồi chạm vào lá bài.</p>
            <button onClick={draw} disabled={busy} className="btn-gold mt-6"><Icon name="touch_app" className="text-[18px]" /> Rút một lá</button>
          </div>
        )}
      </div>
    </div>
  );
}
