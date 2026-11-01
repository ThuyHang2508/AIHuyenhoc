import Link from "next/link";
import { IMG } from "@/lib/images";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG.logo} alt="AetherAI" className="h-9 w-9 rounded-lg border border-emerald/30 bg-glass object-cover" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[22px] text-primary">AetherAI</span>
        <span className="font-label text-label-sm uppercase text-secondary">Huyền Học &amp; Vận Mệnh</span>
      </span>
    </Link>
  );
}
