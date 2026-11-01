// Mặt trước lá bài Tây vẽ bằng SVG (không cần ảnh).
import { RANK_LABEL, SUIT_INFO, type PlayingCard } from "@/lib/playing-cards";

// vị trí các chất trên lá số 2–10 (khung 100 × 150)
const PIPS: Record<number, [number, number][]> = {
  2: [[50, 32], [50, 118]],
  3: [[50, 32], [50, 75], [50, 118]],
  4: [[32, 32], [68, 32], [32, 118], [68, 118]],
  5: [[32, 32], [68, 32], [50, 75], [32, 118], [68, 118]],
  6: [[32, 32], [68, 32], [32, 75], [68, 75], [32, 118], [68, 118]],
  7: [[32, 32], [68, 32], [50, 53], [32, 75], [68, 75], [32, 118], [68, 118]],
  8: [[32, 32], [68, 32], [50, 53], [32, 75], [68, 75], [50, 97], [32, 118], [68, 118]],
  9: [[32, 32], [68, 32], [32, 61], [68, 61], [50, 75], [32, 89], [68, 89], [32, 118], [68, 118]],
  10: [[32, 32], [68, 32], [50, 46], [32, 61], [68, 61], [32, 89], [68, 89], [50, 104], [32, 118], [68, 118]],
};

export default function PlayingCardFace({ card }: { card: PlayingCard }) {
  const s = SUIT_INFO[card.suit];
  const ink = s.red ? "#b3212f" : "#1b1d2a";
  const rank = RANK_LABEL[card.rank];
  const face = card.rank >= 11;
  const sym = s.symbol + "︎";
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[10px] border border-[#dcb56f]/60 bg-[#fbf6ea] shadow-[0_6px_20px_rgba(0,0,0,.45)]">
      <svg viewBox="0 0 100 150" className="h-full w-full" preserveAspectRatio="none" aria-label={card.vi}>
        <rect x="4" y="4" width="92" height="142" rx="6" fill="none" stroke="#c9a35a" strokeWidth=".7" />
        {/* góc */}
        {[0, 1].map((k) => (
          <g key={k} transform={k ? "rotate(180 50 75)" : undefined} fill={ink} fontFamily="Georgia, serif">
            <text x="11" y="19" fontSize="13" fontWeight="700" textAnchor="middle">{rank}</text>
            <text x="11" y="31" fontSize="11" textAnchor="middle">{sym}</text>
          </g>
        ))}
        {card.rank === 1 && (
          <g>
            <circle cx="50" cy="75" r="24" fill="none" stroke="#c9a35a" strokeWidth=".7" strokeDasharray="1.5 2" />
            <text x="50" y="88" fontSize="40" textAnchor="middle" fill={ink}>{sym}</text>
          </g>
        )}
        {PIPS[card.rank]?.map(([x, y], i) => (
          <text key={i} x={x} y={y + 6} fontSize="17" textAnchor="middle" fill={ink} transform={y > 80 ? `rotate(180 ${x} ${y})` : undefined}>{sym}</text>
        ))}
        {face && (
          <g>
            <rect x="22" y="26" width="56" height="98" rx="4" fill={s.red ? "#f7e3df" : "#e7e6ee"} stroke="#c9a35a" strokeWidth="1" />
            <path d="M37 54 L41 44 L46 51 L50 41 L54 51 L59 44 L63 54 Z" fill="#d6ad5c" stroke="#9b7a33" strokeWidth=".6" />
            <text x="50" y="92" fontSize="34" fontFamily="Georgia, serif" fontWeight="700" textAnchor="middle" fill={ink}>{rank}</text>
            <text x="50" y="114" fontSize="14" textAnchor="middle" fill={ink}>{sym}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

/** Mặt sau bài Tây kiểu cổ điển: viền trắng, nền đỏ đan ô li ti, hình thoi có mặt trời trắng ở giữa. */
export function PlayingCardBack({ className = "", glow = false }: { className?: string; glow?: boolean }) {
  const RED = "#c8323c";
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-[10px] bg-[#fdfbf7] ${glow ? "shadow-[0_0_24px_rgba(255,170,150,.55)]" : "shadow-[0_2px_8px_rgba(0,0,0,.35)]"} ${className}`}>
      <svg viewBox="0 0 100 150" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <pattern id="pcb-weave" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="4" fill={RED} />
            <path d="M0 2 H4 M2 0 V4" stroke="#fdfbf7" strokeWidth=".7" />
          </pattern>
        </defs>
        <rect x="7" y="7" width="86" height="136" rx="3" fill="url(#pcb-weave)" />
        <rect x="7" y="7" width="86" height="136" rx="3" fill="none" stroke={RED} strokeWidth="1.2" />
        <rect x="9.5" y="9.5" width="81" height="131" rx="2" fill="none" stroke="#fdfbf7" strokeWidth=".8" />
        {/* hình thoi giữa */}
        <path d="M50 46 L76 75 L50 104 L24 75 Z" fill={RED} stroke="#fdfbf7" strokeWidth="1.4" />
        <path d="M50 52 L70 75 L50 98 L30 75 Z" fill="none" stroke="#fdfbf7" strokeWidth=".6" />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2, r1 = 4, r2 = i % 2 ? 10 : 14;
          return <line key={i} x1={50 + r1 * Math.cos(a)} y1={75 + r1 * Math.sin(a)} x2={50 + r2 * Math.cos(a)} y2={75 + r2 * Math.sin(a)} stroke="#fdfbf7" strokeWidth=".9" strokeLinecap="round" />;
        })}
        <circle cx="50" cy="75" r="3.2" fill="#fdfbf7" />
        {[[50, 54], [50, 96], [32, 75], [68, 75]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.3" fill="#fdfbf7" />)}
      </svg>
    </div>
  );
}
