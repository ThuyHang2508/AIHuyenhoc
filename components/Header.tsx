"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AiSettingsButton } from "./AiSettings";
import Icon from "./Icon";
import Logo from "./Logo";

export const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/than-so-hoc", label: "Thần Số Học" },
  { href: "/tarot", label: "Trải Bài Tarot" },
  { href: "/bai-tay", label: "Bài Tây" },
  { href: "/tu-vi", label: "Lá Số Tử Vi" },
  { href: "/chiem-tinh", label: "Bản Đồ Sao" },
  { href: "/board-game", label: "Board Game" },
];

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const ask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/hoi-dap?q=${encodeURIComponent(q.trim())}`);
    setQ("");
    setOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.04] bg-void/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between gap-4 px-5 md:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => {
              const on = n.href === "/" ? path === "/" : path.startsWith(n.href) || (n.href === "/board-game" && path.startsWith("/ma-soi"));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-lg px-3 py-2 font-label text-label-md transition ${
                    on ? "bg-surface-container-high text-primary-container" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <form onSubmit={ask} className="hidden flex-1 justify-end md:flex">
          <label className="flex w-full max-w-sm items-center gap-2 rounded-full border border-white/[0.07] bg-abyss px-4 py-2.5 focus-within:border-emerald">
            <Icon name="auto_awesome" className="text-[18px] text-emerald-mist" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Hỏi về vận mệnh, tình duyên, số mệnh…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
            <button aria-label="Hỏi" className="text-on-surface-variant hover:text-primary-container">
              <Icon name="search" className="text-[18px]" />
            </button>
          </label>
        </form>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block"><AiSettingsButton /></span>
          <span className="sm:hidden"><AiSettingsButton compact /></span>
          <button className="lg:hidden" aria-label="Mở menu" onClick={() => setOpen((v) => !v)}>
            <Icon name={open ? "close" : "menu"} className="text-[28px] text-on-surface" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/[0.05] bg-void/95 px-5 pb-5 lg:hidden">
          <nav className="flex flex-col py-2">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="border-b border-white/[0.04] py-3 font-label text-label-lg text-on-surface">
                {n.label}
              </Link>
            ))}
          </nav>
          <form onSubmit={ask} className="mt-2 flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Hỏi AI về vận mệnh…" className="field" />
            <button className="btn-neon px-4">
              <Icon name="send" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
