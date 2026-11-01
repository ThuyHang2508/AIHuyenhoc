import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.05] bg-void">
      <div className="mx-auto grid max-w-[1400px] gap-6 px-5 py-10 md:grid-cols-3 md:items-center md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-[22px] text-primary">AetherAI</span>
            <span className="chip">Huyền bí học</span>
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted">Khai phá tiềm thức và thiên mệnh qua trí tuệ nhân tạo.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-label text-label-md text-on-surface-variant">
          <Link href="/than-so-hoc" className="hover:text-primary-container">Thần Số Học</Link>
          <Link href="/tarot" className="hover:text-primary-container">Tarot</Link>
          <Link href="/bai-tay" className="hover:text-primary-container">Bài Tây</Link>
          <Link href="/tu-vi" className="hover:text-primary-container">Tử Vi</Link>
          <Link href="/chiem-tinh" className="hover:text-primary-container">Bản Đồ Sao</Link>
          <Link href="/board-game" className="hover:text-primary-container">Board Game</Link>
          <Link href="/dieu-khoan" className="hover:text-primary-container">Điều khoản &amp; miễn trừ</Link>
        </nav>
        <p className="text-sm text-muted md:text-right">
          © {new Date().getFullYear()} AetherAI. Nội dung mang tính tham khảo, giải trí — không thay thế tư vấn chuyên môn.
        </p>
      </div>
    </footer>
  );
}
