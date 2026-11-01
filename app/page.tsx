import Link from "next/link";
import Icon from "@/components/Icon";
import AskBox from "@/components/AskBox";
import DailyCard from "@/components/home/DailyCard";
import ToolEmblem from "@/components/home/ToolEmblem";
import ServiceRow from "@/components/home/ServiceRow";
import HelpSection from "@/components/home/HelpSection";
import { GameCards } from "@/components/home/GameCards";
import { listArticles } from "@/lib/articles";
import { getDaily } from "@/lib/daily";
import { IMG } from "@/lib/images";

export const revalidate = 1800;

// Hàng biểu tượng tròn dẫn vào từng môn
const TOOLS = [
  { href: "/tarot", icon: "tarot", label: "Tarot" },
  { href: "/bai-tay", icon: "baitay", label: "Bài Tây" },
  { href: "/tu-vi", icon: "tuvi", label: "Tử Vi" },
  { href: "/than-so-hoc", icon: "numerology", label: "Thần Số" },
  { href: "/chiem-tinh", icon: "astro", label: "Bản Đồ Sao" },
  { href: "/board-game", icon: "masoi", label: "Board Game" },
  { href: "/hoi-dap", icon: "ask", label: "Hỏi AI" },
] as { href: string; icon: string; label: string; soon?: boolean }[];

const ASSISTANTS = [
  { img: IMG.selene, name: "Selene Thần Nữ", role: "Tarot", desc: "Đọc 78 lá bài, tinh tế trong chuyện tình cảm và các lựa chọn khó.", href: "/tarot", cta: "Trải bài" },
  { img: IMG.laoSu, name: "Lão Sư Huyền Không", role: "Tử Vi Đẩu Số", desc: "Bình giải 12 cung, sao miếu hãm, đại vận và tiểu hạn theo phái Việt.", href: "/tu-vi", cta: "Lập lá số" },
  { img: IMG.maya, name: "Pythagoras AI", role: "Thần Số Học", desc: "Giải mã con số từ ngày sinh và họ tên, định hướng năm cá nhân.", href: "/than-so-hoc", cta: "Xem thần số" },
  { img: IMG.orion, name: "Orion", role: "Chiêm Tinh", desc: "Đọc bản đồ sao: Mặt Trời, Mặt Trăng, Cung Mọc và các góc chiếu.", href: "/chiem-tinh", cta: "Lập bản đồ sao" },
];

const HERO_CARDS = [
  { src: "/img/tarot/major-2.jpg", rot: -14, x: -118, y: 18, delay: "0s" },
  { src: "/img/tarot/major-10.jpg", rot: 0, x: 0, y: 0, delay: "-2s" },
  { src: "/img/tarot/major-18.jpg", rot: 14, x: 118, y: 18, delay: "-4s" },
];

export default function Home() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const daily = getDaily(now);
  const articles = listArticles("than-so-hoc");

  return (
    <div className="ritual-bg relative -mt-20 overflow-hidden pt-20">
      <div className="ritual-stars" />
      <svg className="ritual-sigil pointer-events-none absolute left-1/2 top-[120px] -ml-[380px] h-[760px] w-[760px] opacity-[0.07]" viewBox="0 0 200 200" aria-hidden>
        <g fill="none" stroke="#e8c987" strokeWidth=".35">
          <circle cx="100" cy="100" r="96" /><circle cx="100" cy="100" r="84" strokeDasharray="2 3" /><circle cx="100" cy="100" r="60" />
          <path d="M100 16 L172 142 L28 142 Z" /><path d="M100 184 L28 58 L172 58 Z" />
          {Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return <line key={i} x1={100 + 84 * Math.cos(a)} y1={100 + 84 * Math.sin(a)} x2={100 + 96 * Math.cos(a)} y2={100 + 96 * Math.sin(a)} />; })}
        </g>
      </svg>

      <div className="relative mx-auto max-w-[1200px] px-5 md:px-6">
        {/* HERO */}
        <section className="flex flex-col items-center pb-14 pt-10 text-center md:pt-14">
          <div className="relative mb-4 h-[190px] w-[300px] origin-top scale-[0.82] sm:scale-100 md:mb-6 md:h-[230px] md:w-[360px]" aria-hidden>
            {HERO_CARDS.map((c, i) => (
              <div key={i} className="hero-card absolute left-1/2 top-0 w-[104px] md:w-[124px]" style={{ transform: `translateX(calc(-50% + ${c.x}px)) translateY(${c.y}px) rotate(${c.rot}deg)`, animationDelay: c.delay, zIndex: i === 1 ? 2 : 1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.src} alt="" className="w-full rounded-lg border border-[#dcb56f]/40 shadow-[0_18px_40px_rgba(0,0,0,.6),0_0_30px_rgba(220,181,111,.18)]" />
              </div>
            ))}
          </div>
          <h1 className="max-w-4xl font-serif text-[38px] leading-[46px] text-[#f3d9a4] md:text-[58px] md:leading-[66px]">
            Hỏi vũ trụ <em className="bg-gradient-to-r from-[#f0d398] via-[#ffe9b8] to-[#c99a4b] bg-clip-text not-italic text-transparent">mọi điều</em> bạn băn khoăn
          </h1>
          <p className="mb-8 mt-4 max-w-2xl text-[16px] leading-7 text-on-surface-variant md:text-[17px]">
            Tử Vi, Thần Số, Tarot và Chiêm Tinh — tính đúng theo cổ pháp, AI luận giải riêng cho bạn trong vài giây.
          </p>
          <AskBox />

          {/* Hàng biểu tượng các môn */}
          <nav className="mt-12 flex max-w-4xl flex-wrap justify-center gap-x-3 gap-y-7 md:gap-x-6" aria-label="Các môn">
            {TOOLS.map((t) => {
              const inner = (
                <>
                  <ToolEmblem icon={t.icon} soon={t.soon} />
                  <span className={`mt-3 font-serif text-[17px] md:text-[19px] ${t.soon ? "text-muted" : "text-[#f3d9a4] transition group-hover:text-white"}`}>{t.label}</span>
                  {t.soon && <span className="text-[10px] uppercase tracking-[0.15em] text-muted">Sắp có</span>}
                </>
              );
              return t.soon ? (
                <div key={t.label} className="hidden w-[88px] flex-col items-center sm:flex">{inner}</div>
              ) : (
                <Link key={t.label} href={t.href} className="group flex w-[100px] flex-col items-center focus-visible:outline-none md:w-[116px]">{inner}</Link>
              );
            })}
          </nav>
        </section>

        {/* LÁ BÀI CỦA NGÀY */}
        <section className="mx-auto max-w-4xl rounded-3xl border border-[#dcb56f]/15 bg-black/30 p-6 backdrop-blur md:p-10">
          <DailyCard solar={daily.solar} lunar={`${daily.lunar} · ngày ${daily.canChiNgay}`} />
        </section>

        {/* DỊCH VỤ NỔI BẬT */}
        <section className="pt-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-serif text-[30px] text-[#f3d9a4] md:text-[36px]">Dịch vụ nổi bật</h2>
            <span className="hidden text-sm text-muted sm:block">Vuốt để xem thêm →</span>
          </div>
          <ServiceRow />
        </section>

        {/* BOARD GAME */}
        <section className="pt-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="font-label text-[12px] font-semibold uppercase tracking-[0.25em] text-[#dcb56f]">Board game</p>
              <h2 className="font-serif text-[30px] text-[#f3d9a4] md:text-[36px]">Chơi cùng bạn bè</h2>
            </div>
            <Link href="/board-game" className="hidden text-sm text-[#dcb56f] hover:underline sm:block">Xem tất cả trò chơi →</Link>
          </div>
          <GameCards compact />
        </section>

        {/* AETHERAI GIÚP GÌ */}
        <HelpSection />

        {/* TRỢ LÝ */}
        <section className="py-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-serif text-[30px] text-[#f3d9a4] md:text-[36px]">Trợ lý dành cho bạn</h2>
            <Link href="/hoi-dap" className="hidden text-sm text-[#dcb56f] hover:underline sm:block">Hỏi tổng hợp →</Link>
          </div>
          <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0">
            {ASSISTANTS.map((a) => (
              <Link key={a.name} href={a.href} className="group flex w-[84%] shrink-0 snap-start gap-4 rounded-2xl border border-[#dcb56f]/15 bg-black/35 p-3 transition hover:border-[#dcb56f]/50 hover:shadow-[0_0_30px_rgba(220,181,111,.15)] sm:w-[60%] md:w-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.img} alt="" className="h-28 w-28 shrink-0 rounded-xl object-cover md:h-32 md:w-32" />
                <div className="flex min-w-0 flex-col py-1">
                  <div className="flex items-center gap-1.5 font-serif text-[21px] text-[#f3d9a4]">
                    {a.name} <Icon name="verified" className="text-[16px] text-[#dcb56f]" fill />
                  </div>
                  <div className="text-xs uppercase tracking-wider text-muted">{a.role}</div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-on-surface-variant">{a.desc}</p>
                  <span className="mt-auto pt-2 text-sm font-semibold text-[#dcb56f] group-hover:underline">{a.cta} →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CÓ THỂ BẠN QUAN TÂM */}
        {articles.length > 0 && (
          <section className="pb-16">
            <h2 className="mb-5 font-serif text-[28px] text-[#f3d9a4] md:text-[32px]">Có thể bạn quan tâm</h2>
            <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
              {articles.map((a) => (
                <Link key={a.slug} href={`/than-so-hoc/${a.slug}`} className="shrink-0 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-on-surface-variant transition hover:border-[#dcb56f]/60 hover:text-[#f3d9a4]">
                  {a.number ? `Ý nghĩa số chủ đạo ${a.number === 22 ? "22/4" : a.number === 33 ? "33/6" : a.number}` : a.title}
                </Link>
              ))}
              <Link href="/tarot" className="shrink-0 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-on-surface-variant transition hover:border-[#dcb56f]/60 hover:text-[#f3d9a4]">Người ấy nghĩ gì về tôi?</Link>
              <Link href="/chiem-tinh" className="shrink-0 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-on-surface-variant transition hover:border-[#dcb56f]/60 hover:text-[#f3d9a4]">Cung Mọc của tôi là gì?</Link>
              <Link href="/tu-vi" className="shrink-0 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-on-surface-variant transition hover:border-[#dcb56f]/60 hover:text-[#f3d9a4]">Vận hạn năm {now.getFullYear()}</Link>
            </div>
          </section>
        )}

        {/* VÌ SAO TIN ĐƯỢC */}
        <section className="grid gap-4 pb-16 md:grid-cols-3">
          {[
            { i: "calculate", t: "Tính đúng theo cổ pháp", d: "Âm lịch Việt Nam, an sao Tử Vi đối chiếu thư viện lasotuvi, vị trí hành tinh khớp Swiss Ephemeris." },
            { i: "psychology", t: "AI đọc đúng dữ liệu của bạn", d: "AI chỉ luận trên lá số, con số hay lá bài đã tính sẵn — không bịa thêm sao hay lá." },
            { i: "volunteer_activism", t: "Tham khảo, không phán định", d: "Không gieo sợ hãi, không bán bùa hay giải hạn. Quyết định luôn nằm trong tay bạn." },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-[#dcb56f]/15 bg-black/30 p-5">
              <Icon name={x.i} className="text-[26px] text-[#dcb56f]" />
              <h3 className="mt-2 font-serif text-[21px] text-[#f3d9a4]">{x.t}</h3>
              <p className="mt-1 text-sm text-on-surface-variant">{x.d}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
