"use client";
// Tranh nét vàng trên nền xanh đêm cho 4 lá chủ đề (vẽ bằng SVG, không cần file ảnh).
import { useId } from "react";

const GOLD = "#dcb56f";
const GOLD_SOFT = "#f3d9a4";

/** Sao nhỏ bốn cánh */
const Spark = ({ x, y, s = 4, o = 0.9 }: { x: number; y: number; s?: number; o?: number }) => (
  <path d={`M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`} fill={GOLD_SOFT} opacity={o} />
);

/** Bụi sao: chấm + sao nhỏ, vị trí cố định theo hạt giống */
function Stardust({ seed }: { seed: number }) {
  const pts: [number, number, number][] = [];
  let v = seed * 9301 + 49297;
  const rnd = () => ((v = (v * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 26; i++) {
    const x = 22 + rnd() * 156, y = 26 + rnd() * 210;
    if (x > 52 && x < 148 && y > 62 && y < 210) continue; // chừa chỗ cho hình chính
    pts.push([x, y, rnd()]);
  }
  return (
    <g>
      {pts.map(([x, y, r], i) => (r > 0.78 ? <Spark key={i} x={x} y={y} s={2.6 + r * 2} o={0.85} /> : <circle key={i} cx={x} cy={y} r={0.6 + r * 1.1} fill={GOLD} opacity={0.35 + r * 0.5} />))}
    </g>
  );
}

/** Tia sáng chấm chấm tỏa quanh tâm */
const Rays = ({ cx, cy, r1, r2, n = 24, skip = [] as number[] }: { cx: number; cy: number; r1: number; r2: number; n?: number; skip?: number[] }) => (
  <g stroke={GOLD} strokeWidth={0.7} strokeLinecap="round" strokeDasharray="1 3.2" opacity={0.75}>
    {Array.from({ length: n }, (_, i) => {
      if (skip.includes(i)) return null;
      const a = (i / n) * Math.PI * 2;
      return <line key={i} x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)} />;
    })}
  </g>
);

function Love() {
  const id = useId().replace(/:/g, "");
  return (
    <g>
      <defs>
        <mask id={`m${id}`}>
          <rect width="200" height="300" fill="white" />
          <circle cx="118" cy="128" r="47" fill="black" />
        </mask>
      </defs>
      <Rays cx={100} cy={135} r1={70} r2={88} n={28} />
      <circle cx="100" cy="135" r="64" fill="none" stroke={GOLD} strokeWidth="0.6" strokeDasharray="2 3" opacity="0.6" />
      {/* trăng khuyết */}
      <circle cx="96" cy="135" r="56" fill={GOLD} mask={`url(#m${id})`} />
      <path d="M66 112 q4 -3 8 0 M64 124 q5 3 9 0" stroke="#151b36" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* trái tim */}
      <path d="M122 160 C 96 142, 98 116, 112 114 C 119 113, 122 119, 122 123 C 122 119, 125 113, 132 114 C 146 116, 148 142, 122 160 Z" fill="none" stroke={GOLD_SOFT} strokeWidth="1.6" />
      <path d="M122 150 C 106 139, 107 124, 115 123 C 119 123, 121 126, 122 129 C 123 126, 125 123, 129 123 C 137 124, 138 139, 122 150 Z" fill={GOLD} />
      <Spark x={122} y={104} s={6} />
      {/* cành hoa */}
      <path d="M70 218 C 85 200, 110 196, 132 206" fill="none" stroke={GOLD} strokeWidth="1" />
      {[[84, 205, -30], [98, 200, -10], [112, 199, 10], [124, 202, 30]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y - 5} rx="2.6" ry="6" fill={GOLD} opacity="0.85" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <circle cx="134" cy="206" r="4.5" fill="none" stroke={GOLD_SOFT} strokeWidth="1.2" />
      <circle cx="134" cy="206" r="1.6" fill={GOLD_SOFT} />
    </g>
  );
}

function Career() {
  return (
    <g>
      <Rays cx={100} cy={96} r1={34} r2={52} n={20} />
      {/* vòng nguyệt quế */}
      {[-1, 1].map((side) => (
        <g key={side} transform={side === 1 ? "translate(200 0) scale(-1 1)" : undefined}>
          <path d="M92 222 C 52 205, 44 150, 62 108" fill="none" stroke={GOLD} strokeWidth="1.1" />
          {[0, 1, 2, 3, 4, 5, 6].map((k) => {
            const t = k / 6;
            const x = 92 - 40 * Math.sin(t * 2.2) + 4 * t, y = 220 - 108 * t;
            return <ellipse key={k} cx={x - 6} cy={y} rx="3" ry="8" fill={GOLD} opacity="0.85" transform={`rotate(${-40 + t * 30} ${x - 6} ${y})`} />;
          })}
        </g>
      ))}
      {/* chìa khóa */}
      <circle cx="100" cy="96" r="25" fill="none" stroke={GOLD_SOFT} strokeWidth="2" />
      <circle cx="100" cy="96" r="19" fill="none" stroke={GOLD} strokeWidth="0.8" strokeDasharray="1.5 2" />
      <path d="M100 79 L104 92 L117 96 L104 100 L100 113 L96 100 L83 96 L96 92 Z" fill={GOLD} />
      <rect x="97.2" y="121" width="5.6" height="88" rx="2" fill={GOLD} />
      <rect x="92" y="128" width="16" height="4" rx="2" fill={GOLD_SOFT} />
      <rect x="92" y="136" width="16" height="2.5" rx="1.2" fill={GOLD} />
      <path d="M102.8 182 h14 v8 h-6 v6 h8 v8 h-16 Z" fill={GOLD} />
      <Spark x={100} y={60} s={5} />
    </g>
  );
}

function Moon({ cx, cy, r, phase, id }: { cx: number; cy: number; r: number; phase: number; id: string }) {
  // phase: 0 = trăng tròn; ±1 = lưỡi liềm mảnh (dấu = hướng)
  if (phase === 0) return <circle cx={cx} cy={cy} r={r} fill={GOLD} />;
  const off = (1.9 - Math.abs(phase) * 1.2) * r * Math.sign(phase);
  return (
    <g>
      <mask id={id}>
        <rect x={cx - r - 1} y={cy - r - 1} width={2 * r + 2} height={2 * r + 2} fill="white" />
        <circle cx={cx + off} cy={cy} r={r} fill="black" />
      </mask>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.6" />
      <circle cx={cx} cy={cy} r={r} fill={GOLD} mask={`url(#${id})`} />
    </g>
  );
}

function Week() {
  const id = useId().replace(/:/g, "");
  const phases = [1, 0.66, 0.33, 0, -0.33, -0.66, -1];
  return (
    <g>
      {phases.map((p, i) => {
        const a = Math.PI * (1.15 + (i / 6) * 0.7);
        return <Moon key={i} id={`w${id}${i}`} cx={100 + 70 * Math.cos(a)} cy={150 + 70 * Math.sin(a)} r={7.5} phase={p} />;
      })}
      <Rays cx={100} cy={150} r1={44} r2={56} n={24} skip={[]} />
      {/* mặt trời */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const long = i % 2 === 0;
        const r2 = long ? 40 : 32;
        const w = long ? 0.12 : 0.1;
        return (
          <path key={i} d={`M${100 + 22 * Math.cos(a - w)} ${150 + 22 * Math.sin(a - w)} L${100 + r2 * Math.cos(a)} ${150 + r2 * Math.sin(a)} L${100 + 22 * Math.cos(a + w)} ${150 + 22 * Math.sin(a + w)} Z`} fill={long ? GOLD : GOLD_SOFT} opacity={long ? 1 : 0.8} />
        );
      })}
      <circle cx="100" cy="150" r="20" fill="#151b36" stroke={GOLD} strokeWidth="1.6" />
      <circle cx="100" cy="150" r="14" fill="none" stroke={GOLD} strokeWidth="0.7" strokeDasharray="1 2" />
      <circle cx="100" cy="150" r="6.5" fill={GOLD_SOFT} />
      {/* đường chân trời */}
      <path d="M50 214 H150" stroke={GOLD} strokeWidth="0.8" />
      <path d="M62 222 H138" stroke={GOLD} strokeWidth="0.6" strokeDasharray="2 3" opacity="0.7" />
    </g>
  );
}

function Balance() {
  const id = useId().replace(/:/g, "");
  return (
    <g>
      <Rays cx={100} cy={78} r1={14} r2={30} n={16} />
      <path d="M100 66 L104 76 L114 78 L104 80 L100 90 L96 80 L86 78 L96 76 Z" fill={GOLD_SOFT} />
      <path d="M100 92 V206" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
      <path d="M84 214 h32 l6 8 h-44 Z" fill={GOLD} />
      <path d="M44 104 H156" stroke={GOLD_SOFT} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="100" cy="104" r="4" fill={GOLD} />
      {[-1, 1].map((s) => {
        const x = 100 + s * 52;
        return (
          <g key={s}>
            <path d={`M${x} 106 L${x - 18} 156 M${x} 106 L${x + 18} 156`} stroke={GOLD} strokeWidth="0.8" />
            <path d={`M${x - 24} 156 Q${x} 178 ${x + 24} 156 Z`} fill="#151b36" stroke={GOLD} strokeWidth="1.4" />
          </g>
        );
      })}
      {/* bên trái: mặt trời nhỏ (Có) — bên phải: trăng (Không) */}
      <circle cx="48" cy="146" r="6" fill={GOLD} />
      <Rays cx={48} cy={146} r1={8} r2={13} n={12} />
      <Moon cx={152} cy={146} r={7} phase={0.8} id={`b${id}`} />
      <Spark x={152} y={132} s={3} />
    </g>
  );
}

function Wealth() {
  // đồng xu ngũ giác (bộ Tiền), cành lá sinh sôi và chồng xu
  const star = Array.from({ length: 5 }, (_, i) => {
    const t = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
    return `${100 + 24 * Math.cos(t)},${120 + 24 * Math.sin(t)}`;
  }).join(" ");
  return (
    <g>
      <Rays cx={100} cy={120} r1={46} r2={64} n={26} />
      {[-1, 1].map((side) => (
        <g key={side} transform={side === 1 ? "translate(200 0) scale(-1 1)" : undefined}>
          <path d="M70 186 C 54 170, 50 140, 58 104" fill="none" stroke={GOLD} strokeWidth="1" />
          {[0, 1, 2, 3, 4].map((k) => {
            const y = 176 - k * 16, x = 60 - Math.sin(k * 0.7) * 6 + (k === 0 ? 4 : 0);
            return <ellipse key={k} cx={x - 5} cy={y} rx="2.6" ry="7" fill={GOLD} opacity="0.85" transform={`rotate(${-35 + k * 6} ${x - 5} ${y})`} />;
          })}
          <circle cx="58" cy="100" r="2" fill={GOLD_SOFT} />
        </g>
      ))}
      <circle cx="100" cy="120" r="38" fill="#151b36" stroke={GOLD_SOFT} strokeWidth="2" />
      <circle cx="100" cy="120" r="32" fill="none" stroke={GOLD} strokeWidth="0.8" strokeDasharray="1.5 2.2" />
      <circle cx="100" cy="120" r="26" fill="none" stroke={GOLD} strokeWidth="1" />
      <polygon points={star} fill="none" stroke={GOLD_SOFT} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="100" cy="120" r="5" fill={GOLD} />
      {/* chồng xu */}
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <ellipse cx="100" cy={206 - k * 8} rx="22" ry="6" fill="#151b36" stroke={GOLD} strokeWidth="1.3" />
          <path d={`M78 ${206 - k * 8} v4 a22 6 0 0 0 44 0 v-4`} fill="none" stroke={GOLD} strokeWidth="1.3" />
        </g>
      ))}
      <ellipse cx="100" cy="190" rx="10" ry="2.6" fill="none" stroke={GOLD_SOFT} strokeWidth="0.8" />
      {[[70, 214], [132, 210], [140, 222]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="6" ry="2" fill={GOLD} opacity="0.75" />
      ))}
      <Spark x={100} y={74} s={6} />
      <Spark x={136} y={84} s={3} />
    </g>
  );
}

const ART = { "tinh-duyen": Love, "su-nghiep": Career, "tai-chinh": Wealth, "nang-luong": Week, "co-khong": Balance } as const;

export default function TopicArt({ topic, seed = 1 }: { topic: string; seed?: number }) {
  const Art = ART[topic as keyof typeof ART] ?? Week;
  return (
    <svg viewBox="0 0 200 300" className="h-full w-full" aria-hidden>
      <rect x="1" y="1" width="198" height="298" rx="14" fill="#151b36" />
      <rect x="9" y="9" width="182" height="282" rx="9" fill="none" stroke={GOLD} strokeWidth="0.9" opacity="0.8" />
      <rect x="13" y="13" width="174" height="274" rx="7" fill="none" stroke={GOLD} strokeWidth="0.5" opacity="0.45" />
      {[[13, 13, 0], [187, 13, 90], [187, 287, 180], [13, 287, 270]].map(([x, y, r], i) => (
        <path key={i} d="M0 14 A14 14 0 0 1 14 0" transform={`translate(${x} ${y}) rotate(${r})`} fill="none" stroke={GOLD} strokeWidth="0.9" opacity="0.8" />
      ))}
      {[[100, 9], [100, 291], [9, 150], [191, 150]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 4} L${x + 4} ${y} L${x} ${y + 4} L${x - 4} ${y} Z`} fill="#151b36" stroke={GOLD} strokeWidth="0.8" />
      ))}
      <Stardust seed={seed} />
      <Art />
    </svg>
  );
}
