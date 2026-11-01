export default function Icon({ name, className = "", fill = false }: { name: string; className?: string; fill?: boolean }) {
  return (
    <span aria-hidden className={`ms ${className}`} style={fill ? { fontVariationSettings: '"FILL" 1, "wght" 400' } : undefined}>
      {name}
    </span>
  );
}
