// Huy hiệu tròn nét vàng cho từng môn ở trang chủ.
const G = "#e6c27e";

const ICONS: Record<string, JSX.Element> = {
  tarot: (
    <g fill="none" stroke={G} strokeWidth="1.6" strokeLinejoin="round">
      <rect x="11" y="12" width="16" height="25" rx="2" transform="rotate(-14 19 24)" opacity=".55" />
      <rect x="21" y="11" width="16" height="25" rx="2" transform="rotate(8 29 23)" fill="#141a33" />
      <path d="M29 17.5 L30.6 22 L35 23.5 L30.6 25 L29 29.5 L27.4 25 L23 23.5 L27.4 22 Z" fill={G} stroke="none" transform="rotate(8 29 23)" />
    </g>
  ),
  tuvi: (
    <g fill="none" stroke={G} strokeWidth="1.5">
      <rect x="9" y="9" width="30" height="30" rx="2" />
      <path d="M16.5 9 V16.5 H9 M31.5 9 V16.5 H39 M16.5 39 V31.5 H9 M31.5 39 V31.5 H39 M24 9 V16.5 M24 31.5 V39 M9 24 H16.5 M31.5 24 H39" />
      <rect x="16.5" y="16.5" width="15" height="15" opacity=".5" />
      <path d="M24 19.5 L25.3 22.7 L28.5 24 L25.3 25.3 L24 28.5 L22.7 25.3 L19.5 24 L22.7 22.7 Z" fill={G} stroke="none" />
    </g>
  ),
  numerology: (
    <g fill={G} stroke="none">
      {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => {
        const on = [0, 2, 4, 5, 7].includes(r * 3 + c);
        return <circle key={`${r}${c}`} cx={14 + c * 10} cy={14 + r * 10} r={on ? 3.4 : 2.6} fill={on ? G : "none"} stroke={G} strokeWidth="1.3" />;
      }))}
      <path d="M14 14 L24 24 L34 34" stroke={G} strokeWidth="1" strokeDasharray="1.5 2" fill="none" opacity=".7" />
    </g>
  ),
  astro: (
    <g fill="none" stroke={G} strokeWidth="1.4">
      <circle cx="24" cy="24" r="15" />
      <circle cx="24" cy="24" r="10" opacity=".6" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <line key={i} x1={24 + 10 * Math.cos(a)} y1={24 + 10 * Math.sin(a)} x2={24 + 15 * Math.cos(a)} y2={24 + 15 * Math.sin(a)} />;
      })}
      <circle cx="24" cy="24" r="3.2" fill={G} stroke="none" />
      <circle cx="24" cy="24" r="5.5" strokeDasharray="1 1.8" />
    </g>
  ),
  ask: (
    <g fill="none" stroke={G} strokeWidth="1.5">
      <circle cx="24" cy="21" r="11" />
      <path d="M17 18 a8 8 0 0 1 6 -5" opacity=".7" />
      <path d="M24 16 L25.1 19.9 L29 21 L25.1 22.1 L24 26 L22.9 22.1 L19 21 L22.9 19.9 Z" fill={G} stroke="none" />
      <path d="M16 36 H32 L29.5 31.5 H18.5 Z" fill="#141a33" />
      <path d="M14 39 H34" />
    </g>
  ),
  baitay: (
    <g strokeLinejoin="round">
      <rect x="10" y="12" width="17" height="25" rx="2.5" transform="rotate(-12 18.5 24.5)" fill="#141a33" stroke={G} strokeWidth="1.5" />
      <text x="18" y="29" fontSize="11" textAnchor="middle" fill={G} transform="rotate(-12 18.5 24.5)">♠&#xFE0E;</text>
      <rect x="21" y="11" width="17" height="25" rx="2.5" transform="rotate(10 29.5 23.5)" fill="#141a33" stroke={G} strokeWidth="1.5" />
      <text x="29.5" y="28" fontSize="11" textAnchor="middle" fill="#f08a96" transform="rotate(10 29.5 23.5)">♥&#xFE0E;</text>
    </g>
  ),
  masoi: (
    <g fill="none" stroke={G} strokeWidth="1.5" strokeLinejoin="round">
      <path d="M34 11 a11 11 0 1 0 3 17 a8.5 8.5 0 1 1 -3 -17 z" fill={G} stroke="none" opacity=".85" />
      <path d="M10 38 L13 26 L17 30 L20 22 L25 28 L28 24 L31 38 Z" fill="#141a33" />
      <path d="M15 31 l2 1 M24 30 l2 1" strokeWidth="1.3" />
    </g>
  ),
  bazi: (
    <g fill="none" stroke={G} strokeWidth="1.5">
      {[12, 20, 28, 36].map((x) => <rect key={x} x={x - 2.5} y="13" width="5" height="22" rx="1" />)}
      <path d="M8 13 H40 M8 35 H40" />
    </g>
  ),
  iching: (
    <g fill="none" stroke={G} strokeWidth="3.2" strokeLinecap="round">
      <path d="M12 15 H36" /><path d="M12 24 H21 M27 24 H36" /><path d="M12 33 H36" />
    </g>
  ),
};

export default function ToolEmblem({ icon, soon = false }: { icon: string; soon?: boolean }) {
  return (
    <span className={`relative flex h-[86px] w-[86px] items-center justify-center rounded-full transition duration-500 md:h-[104px] md:w-[104px] ${soon ? "opacity-45 grayscale" : "group-hover:-translate-y-1 group-hover:shadow-[0_0_34px_rgba(230,194,126,.45)] group-focus-visible:shadow-[0_0_34px_rgba(230,194,126,.45)]"}`}
      style={{ background: "radial-gradient(circle at 50% 35%, #232a55 0%, #10142b 70%)" }}>
      {/* viền vàng kép + vòng chấm xoay khi rê chuột */}
      <span className="absolute inset-0 rounded-full border border-[#e6c27e]/70" />
      <span className="absolute inset-[5px] rounded-full border border-[#e6c27e]/25" />
      <span className="absolute inset-[10px] rounded-full border border-dashed border-[#e6c27e]/30 transition-transform duration-[2500ms] ease-linear group-hover:rotate-180" />
      {["left-1/2 top-0", "left-1/2 top-full", "left-0 top-1/2", "left-full top-1/2"].map((pos) => (
        <span key={pos} className={`absolute ${pos} h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#e6c27e]/80 bg-[#10142b]`} />
      ))}
      <svg viewBox="0 0 48 48" className="relative h-[52px] w-[52px] md:h-[62px] md:w-[62px]" aria-hidden>{ICONS[icon]}</svg>
    </span>
  );
}
