export default function Ring({ value, size = 96, stroke = 7, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke="#00ff87" strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ filter: "drop-shadow(0 0 6px rgba(0,255,135,.5))" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-serif text-[24px] text-primary">{label ?? `${value}%`}</div>
    </div>
  );
}
