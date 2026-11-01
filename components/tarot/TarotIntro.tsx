"use client";
// Màn mở đầu Tarot: chọn chủ đề bằng lá bài minh họa → hỏi điều băn khoăn → xáo bài. Không có "Bước 1/2".
import { useState } from "react";
import Icon from "@/components/Icon";
import TopicArt from "@/components/tarot/TopicArt";
import { SPREADS, TOPIC_SPREADS, TOPICS } from "@/lib/tarot";

const TOPIC_TITLE: Record<string, string> = { "tinh-duyen": "Tình Duyên", "su-nghiep": "Sự Nghiệp", "tai-chinh": "Tài Chính", "nang-luong": "Tuần Mới", "co-khong": "Có hay Không" };
const PLACEHOLDER: Record<string, string> = {
  "tinh-duyen": "VD: Người ấy thật lòng nghĩ gì về mình?",
  "su-nghiep": "VD: Mình có nên chuyển việc trong năm nay không?",
  "tai-chinh": "VD: Mình có nên đầu tư khoản tiền này lúc này không?",
  "nang-luong": "VD: Tuần này mình nên tập trung vào điều gì?",
  "co-khong": "VD: Mình có nên nhận lời mời hợp tác này không?",
};

interface Props {
  topic: string;
  onTopic: (id: string) => void;
  spreadId: string;
  onSpread: (id: string) => void;
  question: string;
  onQuestion: (q: string) => void;
  onStart: () => void;
  /** mở thẳng phần hỏi (khi vào từ đường dẫn có sẵn chủ đề) */
  initialAsk?: boolean;
}

export default function TarotIntro(p: Props) {
  const [view, setView] = useState<"topics" | "leaving" | "ask">(p.initialAsk ? "ask" : "topics");
  const spreads = (TOPIC_SPREADS[p.topic] ?? ["3"]).map((id) => SPREADS.find((s) => s.id === id)!).filter(Boolean);

  const choose = (id: string) => {
    p.onTopic(id);
    setView("leaving");
    setTimeout(() => setView("ask"), 480);
  };

  return (
    <div className="relative">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-3 flex items-center justify-center gap-3 text-[#dcb56f]">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#dcb56f]/70" />✦<span className="h-px w-12 bg-gradient-to-l from-transparent to-[#dcb56f]/70" />
        </div>
        <h1 className="font-serif text-[36px] leading-[42px] text-[#f3d9a4] md:text-[48px] md:leading-[54px]">Lắng nghe vũ trụ, hiểu rõ chính mình</h1>
        <p className="mx-auto mt-3 max-w-xl text-on-surface-variant">
          {view === "ask" ? "Giữ câu hỏi trong tâm, rồi để lá bài lên tiếng." : "Hôm nay, điều gì đang khiến bạn bận lòng?"}
        </p>
      </header>

      {view !== "ask" ? (
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-4 sm:gap-5">
          {TOPICS.map((t, i) => {
            const picked = view === "leaving" && p.topic === t.id;
            const fade = view === "leaving" && p.topic !== t.id;
            return (
              <button
                key={t.id}
                onClick={() => view === "topics" && choose(t.id)}
                aria-label={t.label}
                className={`topic-card group relative aspect-[2/3] w-[calc(50%-8px)] rounded-[16px] sm:w-[calc(33.333%-14px)] lg:w-[calc(20%-16px)] transition duration-500 focus-visible:outline-none ${fade ? "scale-90 opacity-0" : ""} ${picked ? "z-10 scale-105 shadow-[0_0_60px_rgba(220,181,111,.45)]" : "hover:-translate-y-2 hover:shadow-[0_18px_50px_rgba(220,181,111,.28)] focus-visible:-translate-y-2 focus-visible:shadow-[0_18px_50px_rgba(220,181,111,.35)]"}`}
                style={{ animationDelay: `${i * -1.4}s` }}
              >
                <TopicArt topic={t.id} seed={i + 3} />
                <span className="absolute inset-x-0 bottom-[7%] text-center font-serif text-[clamp(15px,1.8vw,21px)] uppercase tracking-[0.08em] text-[#f3d9a4]">{TOPIC_TITLE[t.id] ?? t.label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="ritual-fade mx-auto grid max-w-5xl items-start gap-8 md:grid-cols-[240px_1fr]">
          <div className="mx-auto w-44 md:w-full">
            <div className="relative aspect-[2/3] rounded-[16px] shadow-[0_0_50px_rgba(220,181,111,.3)]">
              <TopicArt topic={p.topic} seed={TOPICS.findIndex((t) => t.id === p.topic) + 3} />
              <span className="absolute inset-x-0 bottom-[7%] text-center font-serif text-[19px] uppercase tracking-[0.08em] text-[#f3d9a4]">{TOPIC_TITLE[p.topic]}</span>
            </div>
            <button className="mt-3 w-full text-center text-sm text-[#dcb56f] hover:underline" onClick={() => setView("topics")}>← Chọn chủ đề khác</button>
          </div>

          <div className="space-y-7">
            <div>
              <label htmlFor="tarot-q" className="font-serif text-[24px] text-[#f3d9a4]">Điều bạn đang băn khoăn</label>
              <p className="mb-2 text-sm text-muted">Viết thật lòng, càng cụ thể lá bài càng nói rõ. Có thể để trống để nhận thông điệp chung.</p>
              <textarea id="tarot-q" rows={2} maxLength={300} value={p.question} onChange={(e) => p.onQuestion(e.target.value)} placeholder={PLACEHOLDER[p.topic]}
                className="w-full resize-none rounded-xl border border-[#dcb56f]/25 bg-black/30 px-4 py-3 text-[15px] text-on-surface outline-none transition placeholder:text-slate-500 focus:border-[#dcb56f]/70" />
            </div>

            <div>
              <div className="mb-2 font-serif text-[20px] text-[#f3d9a4]">Cách trải bài</div>
              <div className="flex flex-wrap gap-2">
                {spreads.map((s) => {
                  const on = p.spreadId === s.id;
                  return (
                    <button key={s.id} onClick={() => p.onSpread(s.id)} aria-pressed={on} title={s.positions.join(" · ")}
                      className={`rounded-full border px-4 py-2 text-sm transition ${on ? "border-[#dcb56f] bg-[#dcb56f]/15 text-[#f3d9a4]" : "border-white/10 text-on-surface-variant hover:border-[#dcb56f]/50"}`}>
                      {s.name} <span className="ml-1 text-xs opacity-70">{s.positions.length} lá</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted">{SPREADS.find((s) => s.id === p.spreadId)?.positions.join(" · ")}</p>
            </div>

            <button onClick={p.onStart}
              className="btn-gold">
              <Icon name="auto_awesome" className="text-[20px]" /> Xáo bài
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
