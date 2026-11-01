import Link from "next/link";
import Icon from "@/components/Icon";

/** Tranh bìa Ma Sói: trăng tròn, đồi, sói hú, làng nhỏ (SVG). */
export function WolfArt() {
  return (
    <svg viewBox="0 0 400 240" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="ws-sky" cx="70%" cy="20%" r="90%"><stop offset="0" stopColor="#2b3a7a" /><stop offset="1" stopColor="#070a1c" /></radialGradient>
        <radialGradient id="ws-moon" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#fff6d8" /><stop offset=".7" stopColor="#f3d9a4" /><stop offset="1" stopColor="#f3d9a4" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="400" height="240" fill="url(#ws-sky)" />
      {[[30, 30], [80, 60], [140, 25], [200, 50], [250, 18], [370, 70], [60, 110], [180, 95]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 1 : 1.6} fill="#fff" opacity=".8" />)}
      <circle cx="285" cy="78" r="62" fill="url(#ws-moon)" opacity=".35" />
      <circle cx="285" cy="78" r="40" fill="#f6e2b0" />
      <circle cx="272" cy="70" r="6" fill="#e6cd94" /><circle cx="296" cy="90" r="4" fill="#e6cd94" />
      <path d="M0 190 Q90 150 180 172 T400 160 V240 H0 Z" fill="#141a3a" />
      <path d="M0 210 Q120 180 240 205 T400 198 V240 H0 Z" fill="#0b0f26" />
      {/* làng */}
      {[[40, 196], [70, 200], [100, 194]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-9" y="-10" width="18" height="12" fill="#0b0f26" />
          <path d="M-12 -10 L0 -20 L12 -10 Z" fill="#0b0f26" />
          <rect x="-3" y="-6" width="5" height="5" fill="#f3d9a4" opacity=".85" />
        </g>
      ))}
      {/* sói hú trên đỉnh đồi */}
      <path d="M268 164 l6 -22 l6 -6 l4 -14 l4 10 l8 2 l10 -8 l2 6 l-6 8 l4 10 l16 6 l6 12 l-62 0 z" fill="#05071a" />
      <path d="M292 128 l-4 -10 l4 3 z" fill="#05071a" />
    </svg>
  );
}

export function GameCards({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-5 ${compact ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}>
      <Link href="/ma-soi" className="group overflow-hidden rounded-3xl border border-[#dcb56f]/25 bg-black/40 transition duration-300 hover:-translate-y-1 hover:border-[#dcb56f]/60 hover:shadow-[0_18px_50px_rgba(0,0,0,.5)]">
        <div className="relative h-48 overflow-hidden md:h-56">
          <div className="h-full w-full transition duration-700 group-hover:scale-105"><WolfArt /></div>
          <span className="absolute left-4 top-4 rounded-full bg-[#dcb56f] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1a1408]">Chơi online</span>
        </div>
        <div className="p-5">
          <h3 className="font-serif text-[28px] text-[#f3d9a4]">Ma Sói</h3>
          <p className="mt-1 text-sm text-on-surface-variant">Ai là sói giữa làng? Tạo phòng, gửi mã cho bạn bè, mỗi người một điện thoại — web làm quản trò.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-muted">
            <span className="rounded-full border border-white/10 px-2.5 py-1">👥 4–16 người</span>
            <span className="rounded-full border border-white/10 px-2.5 py-1">⏱ 15–30 phút</span>
            <span className="rounded-full border border-white/10 px-2.5 py-1">🤖 Có người máy</span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 font-semibold text-[#dcb56f] group-hover:underline">Vào chơi <Icon name="arrow_forward" className="text-[18px]" /></span>
        </div>
      </Link>
      <Link href="/thuy" className="group overflow-hidden rounded-3xl border border-[#ff9ec4]/25 bg-black/40 transition duration-300 hover:-translate-y-1 hover:border-[#ff9ec4]/60 hover:shadow-[0_18px_50px_rgba(0,0,0,.5)]">
        <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_20%,#7a2457,#2a0c22_70%)] md:h-56">
          <div className="flex gap-3 transition duration-700 group-hover:scale-105">
            <span className="flex h-24 w-[68px] -rotate-12 items-center justify-center rounded-xl bg-white text-[30px] shadow-xl">🗣️</span>
            <span className="z-10 flex h-28 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6fa8] to-[#ffb36b] font-serif text-[22px] font-bold text-[#2a0716] shadow-2xl">hay</span>
            <span className="flex h-24 w-[68px] rotate-12 items-center justify-center rounded-xl bg-[#ffb36b] text-[30px] shadow-xl">🍻</span>
          </div>
          <span className="absolute left-4 top-4 rounded-full bg-[#ff9ec4] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#2a0716]">Mới</span>
        </div>
        <div className="p-5">
          <h3 className="font-serif text-[28px] text-white">Thật hay Uống</h3>
          <p className="mt-1 text-sm text-on-surface-variant">Rút từng lá câu hỏi — trả lời thật lòng hoặc nâng ly. 4 chủ đề, mỗi chủ đề 200 câu, cả nhóm chơi chung một máy.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-muted">
            <span className="rounded-full border border-white/10 px-2.5 py-1">📱 Chơi chung 1 máy</span>
            <span className="rounded-full border border-white/10 px-2.5 py-1">💬 800 câu hỏi</span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 font-semibold text-[#ff9ec4] group-hover:underline">Vào chơi <Icon name="arrow_forward" className="text-[18px]" /></span>
        </div>
      </Link>
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-black/20 p-8 text-center">
        <span className="text-[34px]">🎲</span>
        <h3 className="mt-2 font-serif text-[22px] text-[#f3d9a4]">Sắp có thêm trò mới</h3>
        <p className="mt-1 max-w-xs text-sm text-muted">Thêm nhiều trò chơi nhóm để tụ tập cùng bạn bè. Bạn muốn chơi trò gì tiếp theo?</p>
      </div>
    </div>
  );
}
