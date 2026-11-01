import { cardImage, ROMAN, suitLabel, type TarotCard } from "@/lib/tarot";

const SUIT_SYMBOL: Record<string, string> = { wands: "⚚", cups: "♆", swords: "⚔", pentacles: "⛤" };

export function CardBack({ className = "", glow = false }: { className?: string; glow?: boolean }) {
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-[10px] border border-[#d9b46a]/50 bg-[radial-gradient(ellipse_at_50%_40%,#1d2147_0%,#0d1024_70%)] ${glow ? "shadow-[0_0_24px_rgba(255,214,130,.45)]" : ""} ${className}`}>
      <svg viewBox="0 0 100 165" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
        <rect x="4" y="4" width="92" height="157" rx="6" fill="none" stroke="#d9b46a" strokeOpacity=".55" strokeWidth=".8" />
        <rect x="7.5" y="7.5" width="85" height="150" rx="4" fill="none" stroke="#d9b46a" strokeOpacity=".25" strokeWidth=".6" />
      </svg>
      <svg viewBox="0 0 100 100" className="absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2" aria-hidden>
        <defs>
          <radialGradient id="cb-glow"><stop offset="0" stopColor="#ffe3a3" stopOpacity=".55" /><stop offset="1" stopColor="#ffe3a3" stopOpacity="0" /></radialGradient>
        </defs>
        <circle cx="50" cy="50" r="34" fill="url(#cb-glow)" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#d9b46a" strokeOpacity=".45" strokeWidth=".7" strokeDasharray="1.5 2.5" />
        <path d="M50 18 L54.5 45.5 L82 50 L54.5 54.5 L50 82 L45.5 54.5 L18 50 L45.5 45.5 Z" fill="#f2cf85" />
        <path d="M50 32 L52 48 L68 50 L52 52 L50 68 L48 52 L32 50 L48 48 Z" fill="#fff4d6" opacity=".9" transform="rotate(45 50 50)" />
        <path d="M24 22 a8 8 0 1 0 8 -8 a6.5 6.5 0 1 1 -8 8 z" fill="#d9b46a" opacity=".8" />
      </svg>
      {[["8%", "6%"], ["86%", "6%"], ["8%", "90%"], ["86%", "90%"]].map(([l, t], i) => (
        <span key={i} className="absolute text-[8px] text-[#d9b46a]/70" style={{ left: l, top: t }}>✦</span>
      ))}
    </div>
  );
}

export function CardFace({ card, reversed }: { card: TarotCard; reversed: boolean }) {
  const art = cardImage(card);
  const major = card.suit === "major";
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-emerald/40 bg-gradient-to-b from-[#0f1d19] to-[#070b0a] shadow-glow">
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art} alt={`${card.name}${reversed ? " (ngược)" : ""}`} className={`h-full w-full object-cover ${reversed ? "rotate-180" : ""}`} />
      ) : (
        <div className={`flex h-full w-full flex-col items-center justify-between p-3 text-center ${reversed ? "rotate-180" : ""}`}>
          <div className="absolute inset-1.5 rounded-lg border border-emerald/20" />
          <div className="font-serif text-[15px] tracking-widest text-emerald-mist">{major ? ROMAN[card.number] : card.number <= 10 ? card.number : ""}</div>
          <div className="relative flex flex-1 items-center justify-center">
            <div className="absolute h-20 w-20 rounded-full bg-primary-container/10 blur-xl" />
            <span className="relative text-[44px] leading-none text-primary-container drop-shadow-[0_0_10px_rgba(0,255,135,.6)]">{major ? card.glyph : SUIT_SYMBOL[card.suit]}</span>
          </div>
          <div className="relative">
            <div className="font-serif text-[15px] leading-tight text-primary">{card.vi}</div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-muted">{card.name}</div>
          </div>
        </div>
      )}
      {art && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 text-center">
          <div className="font-serif text-[14px] text-primary">{card.vi}{reversed && <span className="text-[11px] text-error-soft"> · ngược</span>}</div>
        </div>
      )}
      <span className="sr-only">{suitLabel(card.suit)}</span>
    </div>
  );
}
