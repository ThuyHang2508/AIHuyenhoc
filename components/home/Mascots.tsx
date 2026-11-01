"use client";
// Linh vật dễ thương cho từng dịch vụ (vẽ bằng SVG, phong cách phẳng trên nền đêm có sao).
import { useId } from "react";

const GOLD = "#f2cd7f";

function Scene({ from, to, children, seed = 1 }: { from: string; to: string; children: React.ReactNode; seed?: number }) {
  const id = useId().replace(/:/g, "");
  let v = seed * 7919;
  const r = () => ((v = (v * 9301 + 49297) % 233280) / 233280);
  const stars = Array.from({ length: 16 }, () => [r() * 200, r() * 120, r()]);
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`bg${id}`} cx="50%" cy="40%" r="75%">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </radialGradient>
        <radialGradient id={`glow${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffe6a8" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffe6a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#bg${id})`} />
      {stars.map(([x, y, s], i) =>
        s > 0.8 ? (
          <path key={i} d={`M${x} ${y - 4} L${x + 1.1} ${y - 1.1} L${x + 4} ${y} L${x + 1.1} ${y + 1.1} L${x} ${y + 4} L${x - 1.1} ${y + 1.1} L${x - 4} ${y} L${x - 1.1} ${y - 1.1} Z`} fill="#fff3cf" />
        ) : (
          <circle key={i} cx={x} cy={y} r={0.6 + s} fill="#fff" opacity={0.3 + s * 0.6} />
        ),
      )}
      <ellipse cx="100" cy="120" rx="80" ry="70" fill={`url(#glow${id})`} />
      {children}
    </svg>
  );
}

/** Mắt to long lanh */
const Eye = ({ x, y, r = 7, iris = "#1b1426" }: { x: number; y: number; r?: number; iris?: string }) => (
  <g>
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.15} fill={iris} />
    <circle cx={x + r * 0.32} cy={y - r * 0.38} r={r * 0.36} fill="#fff" />
    <circle cx={x - r * 0.35} cy={y + r * 0.35} r={r * 0.16} fill="#fff" opacity=".85" />
  </g>
);
const Blush = ({ x, y }: { x: number; y: number }) => <ellipse cx={x} cy={y} rx="6" ry="3.2" fill="#ff8fb0" opacity=".55" />;

/** Mèo đen trùm áo choàng ôm lá Tarot */
export function CatTarot() {
  return (
    <Scene from="#5a2fa0" to="#160a33" seed={3}>
      <ellipse cx="100" cy="150" rx="70" ry="16" fill="none" stroke={GOLD} strokeWidth="1.4" opacity=".7" transform="rotate(-8 100 150)" />
      {/* áo choàng */}
      <path d="M100 40 C 56 40, 40 90, 38 150 C 38 178, 162 178, 162 150 C 160 90, 144 40, 100 40 Z" fill="#4a2a8c" />
      <path d="M100 40 C 56 40, 40 90, 38 150" fill="none" stroke={GOLD} strokeWidth="2" />
      <path d="M100 40 C 144 40, 160 90, 162 150" fill="none" stroke={GOLD} strokeWidth="2" />
      {/* tai mèo nhô ra khỏi mũ */}
      <path d="M62 66 L58 30 L84 52 Z" fill="#4a2a8c" stroke={GOLD} strokeWidth="1.5" />
      <path d="M138 66 L142 30 L116 52 Z" fill="#4a2a8c" stroke={GOLD} strokeWidth="1.5" />
      {/* mặt mèo */}
      <ellipse cx="100" cy="98" rx="40" ry="35" fill="#16121f" />
      <Eye x={84} y={96} r={9} iris="#ffd36e" />
      <Eye x={116} y={96} r={9} iris="#ffd36e" />
      <circle cx="84" cy="96" r="3.5" fill="#16121f" /><circle cx="116" cy="96" r="3.5" fill="#16121f" />
      <circle cx="87" cy="92" r="2.4" fill="#fff" /><circle cx="119" cy="92" r="2.4" fill="#fff" />
      <path d="M97 110 L100 113 L103 110 Z" fill="#ff8fb0" />
      <path d="M94 116 q6 4 12 0" fill="none" stroke="#8f84a8" strokeWidth="1.4" strokeLinecap="round" />
      <Blush x={72} y={110} /><Blush x={128} y={110} />
      <path d="M100 44 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z" fill={GOLD} />
      {/* lá bài */}
      <rect x="80" y="128" width="40" height="52" rx="4" fill="#241556" stroke={GOLD} strokeWidth="2" />
      <path d="M107 145 a10 10 0 1 1 -10 -8 a8 8 0 1 0 10 8 z" fill={GOLD} />
      <circle cx="80" cy="140" r="7" fill="#16121f" /><circle cx="120" cy="140" r="7" fill="#16121f" />
    </Scene>
  );
}

/** Cáo nhỏ cầm quạt bài Tây */
export function FoxCards() {
  return (
    <Scene from="#7a1e3c" to="#1f0712" seed={5}>
      {/* quạt bài phía sau */}
      {[-30, -10, 10, 30].map((r, i) => (
        <g key={r} transform={`rotate(${r} 100 186)`}>
          <rect x="84" y="112" width="32" height="46" rx="4" fill="#fbf4e4" stroke={GOLD} strokeWidth="1.2" />
          <text x="100" y="140" fontSize="15" textAnchor="middle" fill={i % 2 ? "#1b1d2a" : "#c3253a"}>{["♥", "♠", "♦", "♣"][i]}&#xFE0E;</text>
        </g>
      ))}
      {/* thân */}
      <ellipse cx="100" cy="176" rx="40" ry="26" fill="#e8762c" />
      <ellipse cx="100" cy="182" rx="22" ry="16" fill="#fff1e2" />
      {/* tai */}
      <path d="M60 78 L54 36 L88 62 Z" fill="#e8762c" /><path d="M62 70 L60 48 L78 62 Z" fill="#3a1a12" />
      <path d="M140 78 L146 36 L112 62 Z" fill="#e8762c" /><path d="M138 70 L140 48 L122 62 Z" fill="#3a1a12" />
      {/* đầu */}
      <path d="M100 52 C 66 52, 52 76, 54 100 C 56 122, 80 138, 100 138 C 120 138, 144 122, 146 100 C 148 76, 134 52, 100 52 Z" fill="#f08a3c" />
      <path d="M54 100 C 64 108, 80 112, 100 138 C 120 112, 136 108, 146 100 C 140 126, 120 140, 100 140 C 80 140, 60 126, 54 100 Z" fill="#fff1e2" />
      {/* mắt cười */}
      <path d="M76 96 q8 -9 16 0" fill="none" stroke="#2a1410" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M108 96 q8 -9 16 0" fill="none" stroke="#2a1410" strokeWidth="3.2" strokeLinecap="round" />
      <ellipse cx="100" cy="114" rx="5" ry="3.6" fill="#2a1410" />
      <path d="M94 121 q6 5 12 0" fill="none" stroke="#2a1410" strokeWidth="1.6" strokeLinecap="round" />
      <Blush x={72} y={110} /><Blush x={128} y={110} />
      {/* tay cầm lá bài */}
      <rect x="112" y="142" width="26" height="36" rx="3" fill="#fbf4e4" stroke={GOLD} strokeWidth="1.3" transform="rotate(14 125 160)" />
      <text x="126" y="166" fontSize="13" textAnchor="middle" fill="#c3253a" transform="rotate(14 125 160)">A♥&#xFE0E;</text>
      <circle cx="116" cy="170" r="7" fill="#e8762c" />
    </Scene>
  );
}

/** Thầy đồ nhí cầm cuộn bát quái */
export function SageScroll() {
  return (
    <Scene from="#1d2f6b" to="#060a1c" seed={7}>
      {/* áo */}
      <path d="M52 200 C 54 150, 76 136, 100 136 C 124 136, 146 150, 148 200 Z" fill="#23315f" />
      <path d="M100 136 L84 200 M100 136 L116 200" stroke={GOLD} strokeWidth="1.6" />
      {/* đầu */}
      <circle cx="100" cy="92" r="40" fill="#f6d2b0" />
      <path d="M60 86 C 62 56, 86 46, 100 46 C 114 46, 138 56, 140 86 C 130 70, 112 64, 100 64 C 88 64, 70 70, 60 86 Z" fill="#2b1c18" />
      <circle cx="100" cy="44" r="11" fill="#2b1c18" />
      <rect x="92" y="36" width="16" height="4" rx="2" fill={GOLD} />
      <Eye x={86} y={94} r={6} />
      <Eye x={114} y={94} r={6} />
      <path d="M78 82 q8 -4 14 0 M108 82 q6 -4 14 0" stroke="#f4f0e6" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Blush x={74} y={106} /><Blush x={126} y={106} />
      {/* râu */}
      <path d="M86 112 C 90 120, 110 120, 114 112 C 116 128, 108 140, 100 146 C 92 140, 84 128, 86 112 Z" fill="#f4f0e6" />
      <path d="M96 112 q4 3 8 0" stroke="#c98a6a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* cuộn bát quái */}
      <rect x="62" y="150" width="76" height="42" rx="4" fill="#f3e2b8" stroke={GOLD} strokeWidth="1.6" />
      <rect x="56" y="148" width="8" height="46" rx="4" fill="#9b6a35" /><rect x="136" y="148" width="8" height="46" rx="4" fill="#9b6a35" />
      <circle cx="100" cy="171" r="13" fill="#fff" stroke="#1b1426" strokeWidth="1.2" />
      <path d="M100 158 a13 13 0 0 1 0 26 a6.5 6.5 0 0 1 0 -13 a6.5 6.5 0 0 0 0 -13 z" fill="#1b1426" />
      <circle cx="100" cy="164.5" r="2.2" fill="#1b1426" /><circle cx="100" cy="177.5" r="2.2" fill="#fff" />
      {[0, 1, 2, 3].map((k) => <path key={k} d={`M${70 + (k > 1 ? 50 : 0)} ${158 + (k % 2) * 16} h10`} stroke="#6b4a2a" strokeWidth="2.2" />)}
    </Scene>
  );
}

/** Cú mèo đeo kính với các con số */
export function OwlNumbers() {
  return (
    <Scene from="#126067" to="#03191c" seed={9}>
      {["7", "3", "9", "1", "5"].map((n, i) => (
        <text key={i} x={[34, 168, 44, 160, 100][i]} y={[54, 60, 132, 128, 30][i]} fontSize={[20, 16, 14, 18, 15][i]} fontFamily="Georgia, serif" textAnchor="middle" fill={GOLD} opacity=".85">{n}</text>
      ))}
      {/* thân */}
      <ellipse cx="100" cy="132" rx="52" ry="58" fill="#7b5236" />
      <ellipse cx="100" cy="146" rx="32" ry="38" fill="#e9cfa4" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <path key={`${r}${c}`} d={`M${86 + c * 14 - (r % 2) * 7} ${128 + r * 12} q5 5 10 0`} fill="none" stroke="#b98d5e" strokeWidth="1.4" />))}
      {/* tai lông */}
      <path d="M58 86 L54 58 L78 76 Z M142 86 L146 58 L122 76 Z" fill="#7b5236" />
      {/* kính + mắt */}
      <circle cx="80" cy="100" r="19" fill="#fff8e8" stroke={GOLD} strokeWidth="3" />
      <circle cx="120" cy="100" r="19" fill="#fff8e8" stroke={GOLD} strokeWidth="3" />
      <path d="M99 100 h2" stroke={GOLD} strokeWidth="3" />
      <Eye x={80} y={101} r={8} />
      <Eye x={120} y={101} r={8} />
      <path d="M95 114 L100 124 L105 114 Z" fill="#f2a33a" />
      {/* cánh ôm sách */}
      <path d="M52 120 C 40 140, 50 170, 72 176 L80 150 Z" fill="#6a452c" />
      <path d="M148 120 C 160 140, 150 170, 128 176 L120 150 Z" fill="#6a452c" />
      <rect x="72" y="156" width="56" height="34" rx="3" fill="#2c6f6b" stroke={GOLD} strokeWidth="1.6" />
      <path d="M100 156 v34" stroke={GOLD} strokeWidth="1.2" />
      <text x="86" y="179" fontSize="13" fontFamily="Georgia, serif" textAnchor="middle" fill={GOLD}>2</text>
      <text x="114" y="179" fontSize="13" fontFamily="Georgia, serif" textAnchor="middle" fill={GOLD}>11</text>
    </Scene>
  );
}

/** Thỏ ngọc ôm quả cầu sao */
export function RabbitGlobe() {
  return (
    <Scene from="#33307e" to="#0a0a26" seed={11}>
      <path d="M160 32 a24 24 0 1 0 14 40 a19 19 0 1 1 -14 -40 z" fill="#fde9b0" opacity=".95" />
      {/* tai */}
      <ellipse cx="80" cy="56" rx="11" ry="34" fill="#fbf7ff" transform="rotate(-12 80 56)" />
      <ellipse cx="80" cy="58" rx="5" ry="24" fill="#ffc3d6" transform="rotate(-12 80 58)" />
      <ellipse cx="120" cy="56" rx="11" ry="34" fill="#fbf7ff" transform="rotate(12 120 56)" />
      <ellipse cx="120" cy="58" rx="5" ry="24" fill="#ffc3d6" transform="rotate(12 120 58)" />
      {/* đầu + thân */}
      <ellipse cx="100" cy="172" rx="46" ry="34" fill="#fbf7ff" />
      <circle cx="100" cy="112" r="36" fill="#fbf7ff" />
      <Eye x={86} y={110} r={7} />
      <Eye x={114} y={110} r={7} />
      <path d="M97 122 L100 125 L103 122 Z" fill="#ff8fb0" />
      <path d="M94 128 q3 3 6 0 q3 3 6 0" fill="none" stroke="#9b8fb4" strokeWidth="1.4" strokeLinecap="round" />
      <Blush x={76} y={122} /><Blush x={124} y={122} />
      {/* quả cầu sao */}
      <circle cx="100" cy="168" r="24" fill="#1f2d6e" stroke={GOLD} strokeWidth="2" />
      <ellipse cx="100" cy="168" rx="24" ry="8" fill="none" stroke={GOLD} strokeWidth="1" opacity=".8" />
      <ellipse cx="100" cy="168" rx="9" ry="24" fill="none" stroke={GOLD} strokeWidth="1" opacity=".8" />
      <path d="M100 158 l2.4 5.6 6 .6 -4.6 4 1.4 6 -5.2 -3.2 -5.2 3.2 1.4 -6 -4.6 -4 6 -.6 z" fill={GOLD} />
      <circle cx="76" cy="168" r="8" fill="#fbf7ff" /><circle cx="124" cy="168" r="8" fill="#fbf7ff" />
    </Scene>
  );
}

/** Tinh linh ngôi sao ôm quả cầu pha lê */
export function StarSpirit() {
  return (
    <Scene from="#1b4a9a" to="#06122e" seed={13}>
      {/* thân ngôi sao mềm */}
      <path d="M100 30 C 108 62, 116 70, 150 74 C 124 92, 120 102, 130 136 C 106 118, 94 118, 70 136 C 80 102, 76 92, 50 74 C 84 70, 92 62, 100 30 Z" fill="#ffe08a" stroke="#ffd062" strokeWidth="2" strokeLinejoin="round" />
      <Eye x={88} y={86} r={6} iris="#2a2140" />
      <Eye x={112} y={86} r={6} iris="#2a2140" />
      <path d="M94 98 q6 5 12 0" fill="none" stroke="#2a2140" strokeWidth="2" strokeLinecap="round" />
      <Blush x={80} y={96} /><Blush x={120} y={96} />
      {/* quả cầu pha lê */}
      <circle cx="100" cy="150" r="28" fill="#8fd3ff" opacity=".35" stroke="#cdeeff" strokeWidth="2" />
      <path d="M84 140 a18 18 0 0 1 12 -12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      <path d="M100 140 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6 z" fill="#fff" />
      <path d="M78 176 h44 l-6 12 h-32 z" fill="#7a5a2a" stroke={GOLD} strokeWidth="1.4" />
      <circle cx="74" cy="148" r="7" fill="#ffe08a" /><circle cx="126" cy="148" r="7" fill="#ffe08a" />
    </Scene>
  );
}
